import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  chatReducer,
  historyToTurns,
  initialChatState,
  selectStatus,
  turnText,
  type ChatEvent,
  type ChatState,
} from '../reducer';
import type { SmartChatFrame } from '../protocol';

const run = (events: ChatEvent[], from: ChatState = initialChatState) => events.reduce(chatReducer, from);
const frame = (f: SmartChatFrame): ChatEvent => ({ type: 'frame', frame: f });
const begin = (id = 'a1', content = 'hi'): ChatEvent => ({
  type: 'begin',
  assistantTurnId: id,
  now: 1,
  request: { content, clientMessageId: `c-${id}` },
  userTurn: { id: `u-${id}`, content },
});

test('streams tokens into one text part and finishes on done', () => {
  const s = run([
    begin(),
    frame({ type: 'hello', chat_id: 'c', turn_id: 't1', server_history: true }),
    frame({ type: 'chat_token', content: 'Hel' }),
    frame({ type: 'chat_token', content: 'lo' }),
    frame({ type: 'done' }),
  ]);
  const a = s.turns[1];
  assert.equal(s.turns.length, 2);
  assert.equal(turnText(a), 'Hello');
  assert.equal(a.turnId, 't1');
  assert.equal(a.serverHistory, true);
  assert.equal(a.status, 'done');
  assert.equal(selectStatus(s), 'idle');
});

test('dedupes frames by event_id', () => {
  const s = run([
    begin(),
    frame({ type: 'chat_token', content: 'x', event_id: 'e1' }),
    frame({ type: 'chat_token', content: 'x', event_id: 'e1' }),
  ]);
  assert.equal(turnText(s.turns[1]), 'x');
});

test('tool steps: labels, completion, and card ordering', () => {
  let s = run([
    begin(),
    frame({ type: 'tool_call', tool: 'get_weather', call_id: 'k1', label: 'Checking the weather' }),
  ]);
  assert.equal(selectStatus(s), 'tool_running');
  s = run(
    [
      frame({ type: 'tool_result', tool: 'get_weather', call_id: 'k1', status: 'completed' }),
      frame({ type: 'card', card_id: 'w1', kind: 'weather', schema_v: 1, data: { days: [] }, fallback_text: 'Sunny' }),
      frame({ type: 'chat_token', content: 'It is sunny.' }),
      frame({ type: 'done' }),
    ],
    s,
  );
  const a = s.turns[1];
  assert.deepEqual(a.steps.map((x) => [x.label, x.status]), [['Checking the weather', 'completed']]);
  assert.deepEqual(a.parts.map((p) => p.type), ['card', 'text']);
});

test('error frame marks turn retryable for retryable codes only', () => {
  const s1 = run([begin(), frame({ type: 'error', code: 'timeout', message: 'Took too long' })]);
  const e1 = s1.turns[1].parts.find((p) => p.type === 'error');
  assert.ok(e1 && e1.type === 'error' && e1.retryable);
  assert.equal(selectStatus(s1), 'error');
  assert.equal(s1.activeTurnId, null);

  const s2 = run([begin(), frame({ type: 'error', code: 'rate_limit', message: 'Limit' })]);
  const e2 = s2.turns[1].parts.find((p) => p.type === 'error');
  assert.ok(e2 && e2.type === 'error' && !e2.retryable);
});

test('action_executed resolves an earlier action_request with diff + undo', () => {
  let s = run([
    begin(),
    frame({ type: 'action_request', action_id: 'x1', action_type: 'apply_plan', description: 'Rebalance', preview: { summary: 'S' } }),
    frame({ type: 'done' }),
    { type: 'action_status', actionId: 'x1', status: 'confirmed' },
  ]);
  s = run(
    [
      { type: 'begin', assistantTurnId: 'a2', now: 2, request: { content: '', clientMessageId: 'c2' } },
      frame({
        type: 'action_executed',
        action_id: 'x1',
        action_type: 'apply_plan',
        success: true,
        message: 'Done',
        diff: { moved: [{ name: 'LX', from_day: 1, to_day: 3 }] },
        undo_token: 'tok',
        undo_expires_at: '2099-01-01T00:00:00Z',
      }),
      frame({ type: 'done' }),
    ],
    s,
  );
  const req = s.turns[1].parts[0];
  assert.ok(req.type === 'action_request');
  assert.equal(req.action.status, 'executed');
  assert.equal(req.result?.undoToken, 'tok');
  assert.equal(req.action.preview?.summary, 'S');
  // No standalone duplicate on the confirm turn.
  assert.equal(s.turns[2].parts.filter((p) => p.type === 'action_result').length, 0);

  s = chatReducer(s, { type: 'undo_status', actionId: 'x1', undo: { status: 'done' } });
  const after = s.turns[1].parts[0];
  assert.ok(after.type === 'action_request' && after.result?.undo?.status === 'done');
});

test('standalone action_executed (instant edit) becomes a result part', () => {
  const s = run([
    begin(),
    frame({ type: 'action_executed', action_id: 'y1', action_type: 'move_activity', success: true, message: 'Moved' }),
  ]);
  assert.equal(s.turns[1].parts[0].type, 'action_result');
});

test('transport error on a stream yields a retryable network error; 429 does not', () => {
  const s = run([begin(), { type: 'transport_error', message: 'fetch failed' }]);
  const e = s.turns[1].parts[0];
  assert.ok(e.type === 'error' && e.code === 'network' && e.retryable);
  const s429 = run([begin(), { type: 'transport_error', message: 'limit', status: 429 }]);
  const e429 = s429.turns[1].parts[0];
  assert.ok(e429.type === 'error' && e429.code === 'rate_limit' && !e429.retryable);
});

test('unknown frames are ignored and stale frames after done are dropped', () => {
  const s = run([
    begin(),
    frame({ type: 'some_future_frame' }),
    frame({ type: 'done' }),
    frame({ type: 'chat_token', content: 'late' }),
  ]);
  assert.equal(s.turns[1].parts.length, 0);
});

test('cancel removes an empty in-flight turn', () => {
  const s = run([begin(), { type: 'cancel' }]);
  assert.equal(s.turns.length, 1);
  assert.equal(s.activeTurnId, null);
});

test('queue enqueue/dequeue', () => {
  let s = chatReducer(initialChatState, { type: 'enqueue', item: { id: 'q1', content: 'next' } });
  assert.equal(s.queue.length, 1);
  s = chatReducer(s, { type: 'dequeue', id: 'q1' });
  assert.equal(s.queue.length, 0);
});

test('historyToTurns expands rich parts', () => {
  const turns = historyToTurns([
    { message_id: 'm1', chat_id: 'c', role: 'user', content: 'weather?', timestamp: '2026-01-01T00:00:00Z' },
    {
      message_id: 'm2',
      chat_id: 'c',
      role: 'assistant',
      content: 'fallback',
      timestamp: '2026-01-01T00:00:01Z',
      message_type: 'rich',
      metadata: {
        parts: [
          { type: 'card', card: { card_id: 'k', kind: 'weather', schema_v: 1, data_omitted: true, fallback_text: 'Sunny' } },
          { type: 'text', content: 'Sunny all week.' },
          { type: 'single_select_question', question: 'Which day?' },
          { type: 'action_executed', action_id: 'z', action_type: 'move', success: true, message: 'Moved' },
          { type: 'mystery' },
        ],
      },
    },
  ]);
  assert.equal(turns.length, 2);
  assert.deepEqual(turns[1].parts.map((p) => p.type), ['card', 'text', 'text', 'action_result']);
  const card = turns[1].parts[0];
  assert.ok(card.type === 'card' && card.card.data.data_omitted === true);
});
