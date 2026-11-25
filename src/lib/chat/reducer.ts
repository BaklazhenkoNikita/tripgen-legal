/**
 * Smart-chat state machine — pure (events → state), no React / DOM imports.
 *
 * Model: a transcript is a list of turns; each turn owns ordered `parts`
 * (text / card / action / question / navigation / error) plus an agent
 * `steps` timeline. SSE frames from `/api/smart-chat` (protocol v2, v1
 * compatible) always apply to the single in-flight assistant turn, except
 * `action_executed`, which resolves the matching `action_request` wherever it
 * lives in the transcript (confirmations arrive on a later stream).
 *
 * Unit tests: src/lib/chat/__tests__/reducer.test.ts (`npm test`).
 */

import type {
  ActionRequest,
  ConfirmQuestion,
  InteractiveQuestion,
  MultiSelectQuestion,
  NavigationCommand,
  SingleSelectQuestion,
} from '@/types';
import {
  RETRYABLE_ERROR_CODES,
  type ActionResult,
  type BackendChatMessageV2,
  type ChatCard,
  type ChatRequestContext,
  type PlanPreview,
  type RichPart,
  type SmartChatFrame,
} from './protocol';

// ── Model ─────────────────────────────────────────────────────────────

export type ActionRequestV2 = ActionRequest & { preview?: PlanPreview };

export type ChatPart =
  | { type: 'text'; id: string; content: string }
  | { type: 'card'; id: string; card: ChatCard }
  | { type: 'action_request'; id: string; action: ActionRequestV2; result?: ActionResult }
  | { type: 'action_result'; id: string; result: ActionResult }
  | { type: 'navigation'; id: string; navigation: NavigationCommand; label: string }
  | { type: 'interactive_question'; id: string; question: InteractiveQuestion }
  | { type: 'single_select_question'; id: string; question: SingleSelectQuestion }
  | { type: 'multi_select_question'; id: string; question: MultiSelectQuestion }
  | { type: 'confirm_question'; id: string; question: ConfirmQuestion }
  | { type: 'error'; id: string; code: string; message: string; retryable: boolean };

export type StepStatus = 'running' | 'completed' | 'deferred' | 'failed';

export interface AgentStep {
  callId: string;
  tool: string;
  label: string;
  status: StepStatus;
}

export interface TurnRequest {
  content: string;
  clientMessageId: string;
  answersQuestionId?: string;
  confirmAction?: { actionId: string; actionType: string; params: Record<string, unknown> };
  context?: ChatRequestContext;
}

export interface ChatTurn {
  /** Local id (stable React key). */
  id: string;
  role: 'user' | 'assistant';
  parts: ChatPart[];
  /** epoch ms */
  timestamp: number;
  status: 'streaming' | 'done' | 'error';
  steps: AgentStep[];
  /** Server turn id from `hello` (feedback / resume). */
  turnId?: string;
  /** From `hello`: the server persisted this turn. Gates 👍/👎. */
  serverHistory?: boolean;
  /** Assistant turns: the request that produced it (Retry re-sends it). */
  request?: TurnRequest;
  /** Latest generation_progress message while a long action runs. */
  progress?: string;
  feedback?: 'up' | 'down';
  fromHistory?: boolean;
}

export interface QueuedSend {
  id: string;
  content: string;
}

export interface ChatState {
  turns: ChatTurn[];
  activeTurnId: string | null;
  seenEventIds: Record<string, true>;
  /** Server chat id echoed by `hello`. */
  chatId?: string;
  queue: QueuedSend[];
}

export type AnswerPayload = {
  optionId?: string;
  freeText?: string;
  selectedIds?: string[];
  label: string;
};

export type ChatEvent =
  | { type: 'reset'; turns: ChatTurn[] }
  | {
      type: 'begin';
      assistantTurnId: string;
      request: TurnRequest;
      now: number;
      /** Omitted for silent sends (confirmations, retries). */
      userTurn?: { id: string; content: string };
    }
  | { type: 'frame'; frame: SmartChatFrame }
  | { type: 'transport_error'; message: string; status?: number }
  | { type: 'complete' }
  | { type: 'cancel' }
  | { type: 'discard_turn'; id: string }
  | { type: 'action_status'; actionId: string; status: 'confirmed' | 'rejected' }
  | { type: 'answer_question'; questionId: string; payload: AnswerPayload }
  | { type: 'confirm_question'; questionId: string; result: 'confirmed' | 'cancelled' }
  | { type: 'undo_status'; actionId: string; undo: NonNullable<ActionResult['undo']>; successMessage?: string }
  | { type: 'feedback'; id: string; rating: 'up' | 'down' | undefined }
  | { type: 'set_progress'; message: string | undefined }
  | { type: 'enqueue'; item: QueuedSend }
  | { type: 'dequeue'; id: string };

export const initialChatState: ChatState = {
  turns: [],
  activeTurnId: null,
  seenEventIds: {},
  queue: [],
};

// ── Helpers ───────────────────────────────────────────────────────────

const TOOL_LABELS: Record<string, string> = {
  google_search: 'Searching the web',
  web_search: 'Searching the web',
  get_weather: 'Checking the weather',
  get_trip_activities: 'Reading your itinerary',
  get_trip_restaurants: 'Looking at your restaurants',
  get_trip_cost_summary: 'Estimating costs',
  get_distances: 'Measuring distances',
  search_activities: 'Finding places',
  search_restaurants: 'Finding restaurants',
};

/** Human label for a tool when the server didn't send one (v1). */
export function toolLabel(tool: string | undefined, label?: string): string {
  if (label && label.trim()) return label.trim();
  if (!tool) return 'Working';
  if (TOOL_LABELS[tool]) return TOOL_LABELS[tool];
  const words = tool.replace(/[_-]+/g, ' ').trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : 'Working';
}

export function toChatCard(raw: Record<string, unknown>, fallbackId: string): ChatCard | null {
  const kind = typeof raw.kind === 'string' ? raw.kind : '';
  if (!kind) return null;
  const omitted = raw.data_omitted === true;
  const data =
    raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)
      ? (raw.data as Record<string, unknown>)
      : {};
  return {
    cardId: typeof raw.card_id === 'string' && raw.card_id ? raw.card_id : fallbackId,
    kind,
    schemaV: typeof raw.schema_v === 'number' ? raw.schema_v : 1,
    data: omitted ? { data_omitted: true } : data,
    fallbackText: typeof raw.fallback_text === 'string' ? raw.fallback_text : '',
    tool: typeof raw.tool === 'string' ? raw.tool : undefined,
  };
}

export function toActionResult(f: SmartChatFrame | Record<string, unknown>): ActionResult {
  const r = f as Record<string, unknown>;
  const str = (k: string) => (typeof r[k] === 'string' ? (r[k] as string) : undefined);
  return {
    actionId: str('action_id') ?? '',
    actionType: str('action_type') ?? 'unknown',
    success: r.success !== false,
    message: str('message') ?? '',
    error: str('error'),
    errorCode: str('error_code'),
    searchId: str('search_id'),
    diff: r.diff && typeof r.diff === 'object' ? (r.diff as ActionResult['diff']) : undefined,
    undoToken: str('undo_token'),
    undoExpiresAt: str('undo_expires_at'),
  };
}

function hasPart(turn: ChatTurn, id: string) {
  return turn.parts.some((p) => p.id === id);
}

function mapTurn(state: ChatState, id: string | null, fn: (t: ChatTurn) => ChatTurn): ChatState {
  if (!id) return state;
  let changed = false;
  const turns = state.turns.map((t) => {
    if (t.id !== id) return t;
    const next = fn(t);
    if (next !== t) changed = true;
    return next;
  });
  return changed ? { ...state, turns } : state;
}

function mapParts(state: ChatState, fn: (p: ChatPart) => ChatPart): ChatState {
  let changed = false;
  const turns = state.turns.map((t) => {
    let turnChanged = false;
    const parts = t.parts.map((p) => {
      const next = fn(p);
      if (next !== p) turnChanged = true;
      return next;
    });
    if (!turnChanged) return t;
    changed = true;
    return { ...t, parts };
  });
  return changed ? { ...state, turns } : state;
}

function pushPart(turn: ChatTurn, part: ChatPart): ChatTurn {
  if (hasPart(turn, part.id)) return turn;
  return { ...turn, parts: [...turn.parts, part] };
}

function appendText(turn: ChatTurn, chunk: string): ChatTurn {
  const last = turn.parts[turn.parts.length - 1];
  if (last && last.type === 'text') {
    const parts = turn.parts.slice(0, -1);
    parts.push({ ...last, content: last.content + chunk });
    return { ...turn, parts };
  }
  return {
    ...turn,
    parts: [...turn.parts, { type: 'text', id: `${turn.id}-t${turn.parts.length}`, content: chunk }],
  };
}

function finishSteps(steps: AgentStep[]): AgentStep[] {
  return steps.some((s) => s.status === 'running')
    ? steps.map((s) => (s.status === 'running' ? { ...s, status: 'completed' as const } : s))
    : steps;
}

function errorPart(turnId: string, code: string, message: string): ChatPart {
  return {
    type: 'error',
    id: `${turnId}-err`,
    code,
    message,
    retryable: RETRYABLE_ERROR_CODES.has(code),
  };
}

// ── Frame application ─────────────────────────────────────────────────

function applyFrame(state: ChatState, f: SmartChatFrame): ChatState {
  if (f.event_id) {
    if (state.seenEventIds[f.event_id]) return state;
    state = { ...state, seenEventIds: { ...state.seenEventIds, [f.event_id]: true } };
  }

  // action_executed resolves across the whole transcript.
  if (f.type === 'action_executed') return applyActionExecuted(state, f);

  // generation_progress also updates a confirmed action on an earlier turn.
  if (f.type === 'generation_progress' && f.message) {
    const msg = f.message;
    state = mapParts(state, (p) =>
      p.type === 'action_request' && p.action.status === 'confirmed'
        ? { ...p, action: { ...p.action, description: msg } }
        : p,
    );
    return mapTurn(state, state.activeTurnId, (t) => ({ ...t, progress: msg }));
  }

  const activeId = state.activeTurnId;
  if (!activeId) return state; // stale frame after cancel / done

  switch (f.type) {
    case 'hello':
      return {
        ...mapTurn(state, activeId, (t) => ({
          ...t,
          turnId: f.turn_id ?? t.turnId,
          serverHistory: f.server_history === true,
        })),
        chatId: f.chat_id ?? state.chatId,
      };

    case 'chat_token': {
      const chunk = f.content ?? '';
      if (!chunk) return state;
      return mapTurn(state, activeId, (t) => appendText(t, chunk));
    }

    case 'tool_call': {
      const callId = f.call_id ?? `${f.tool ?? 'tool'}-${f.seq ?? Date.now()}`;
      return mapTurn(state, activeId, (t) => {
        const existing = t.steps.find((s) => s.callId === callId);
        if (existing) {
          if (!f.label) return t;
          return {
            ...t,
            steps: t.steps.map((s) => (s.callId === callId ? { ...s, label: toolLabel(f.tool, f.label) } : s)),
          };
        }
        return {
          ...t,
          steps: [
            ...t.steps,
            { callId, tool: f.tool ?? '', label: toolLabel(f.tool, f.label), status: 'running' },
          ],
        };
      });
    }

    case 'tool_result': {
      const status: StepStatus =
        f.status === 'failed' ? 'failed' : f.status === 'deferred' ? 'deferred' : 'completed';
      return mapTurn(state, activeId, (t) => {
        let idx = f.call_id ? t.steps.findIndex((s) => s.callId === f.call_id) : -1;
        if (idx === -1) {
          // v1 servers may omit call_id — resolve the newest running call of that tool.
          for (let i = t.steps.length - 1; i >= 0; i--) {
            if (t.steps[i].status === 'running' && (!f.tool || t.steps[i].tool === f.tool)) {
              idx = i;
              break;
            }
          }
        }
        if (idx === -1) return t;
        const steps = t.steps.slice();
        steps[idx] = { ...steps[idx], status };
        return { ...t, steps };
      });
    }

    case 'card': {
      const card = toChatCard(f as unknown as Record<string, unknown>, `card-${f.seq ?? Date.now()}`);
      if (!card) return state;
      return mapTurn(state, activeId, (t) =>
        pushPart(t, { type: 'card', id: `card-${card.cardId}`, card }),
      );
    }

    case 'action_request': {
      const action: ActionRequestV2 = {
        actionId: f.action_id ?? '',
        actionType: f.action_type ?? 'unknown',
        params: f.params ?? {},
        description: f.description ?? '',
        status: 'pending',
        preview: f.preview,
      };
      const id = `action-${action.actionId || f.event_id || f.seq || Date.now()}`;
      return mapTurn(state, activeId, (t) => pushPart(t, { type: 'action_request', id, action }));
    }

    case 'navigation': {
      const id = f.navigation_id ?? `nav-${f.seq ?? Date.now()}`;
      const screen = f.screen ?? '';
      if (!screen) return state;
      return mapTurn(state, activeId, (t) =>
        pushPart(t, {
          type: 'navigation',
          id,
          label: 'Open',
          navigation: { screen, params: f.params, navigationId: id },
        }),
      );
    }

    case 'interactive_question': {
      const qid = f.question_id ?? f.event_id ?? `iq-${f.seq ?? Date.now()}`;
      return mapTurn(state, activeId, (t) =>
        pushPart(t, {
          type: 'interactive_question',
          id: `iq-${qid}`,
          question: {
            questionId: qid,
            question: f.question ?? '',
            options: (f.options ?? []).map((o) => ({ id: o.id, label: o.label })),
            allowCustom: !!f.allow_custom,
            status: 'pending',
          },
        }),
      );
    }

    case 'single_select_question': {
      const qid = f.question_id ?? f.event_id ?? `ssq-${f.seq ?? Date.now()}`;
      return mapTurn(state, activeId, (t) =>
        pushPart(t, {
          type: 'single_select_question',
          id: `ssq-${qid}`,
          question: {
            questionId: qid,
            prompt: f.question ?? f.prompt ?? '',
            options: f.options ?? [],
            allowFreeText: f.allow_free_text ?? false,
            status: 'pending',
          },
        }),
      );
    }

    case 'multi_select_question': {
      const qid = f.question_id ?? f.event_id ?? `msq-${f.seq ?? Date.now()}`;
      return mapTurn(state, activeId, (t) =>
        pushPart(t, {
          type: 'multi_select_question',
          id: `msq-${qid}`,
          question: {
            questionId: qid,
            prompt: f.question ?? f.prompt ?? '',
            options: f.options ?? [],
            min: f.min ?? 0,
            max: f.max ?? null,
            allowFreeText: f.allow_free_text ?? false,
            status: 'pending',
          },
        }),
      );
    }

    case 'confirm_question': {
      const qid = f.question_id ?? f.event_id ?? `cq-${f.seq ?? Date.now()}`;
      return mapTurn(state, activeId, (t) =>
        pushPart(t, {
          type: 'confirm_question',
          id: `cq-${qid}`,
          question: {
            questionId: qid,
            prompt: f.prompt ?? f.question ?? '',
            confirmLabel: f.confirm_label,
            cancelLabel: f.cancel_label,
            destructive: f.destructive ?? false,
            context: f.context,
            status: 'pending',
          },
        }),
      );
    }

    case 'error': {
      const code = f.code ?? 'ai_failure';
      const message = f.message ?? f.content ?? 'Something went wrong.';
      // A confirmed action that errors out must not spin forever.
      const cleared = mapParts(state, (p) =>
        p.type === 'action_request' && p.action.status === 'confirmed'
          ? { ...p, action: { ...p.action, status: 'failed' } }
          : p,
      );
      return {
        ...mapTurn(cleared, activeId, (t) => ({
          ...pushPart({ ...t, parts: t.parts.filter((p) => p.type !== 'error') }, errorPart(t.id, code, message)),
          status: 'error',
          steps: finishSteps(t.steps),
        })),
        activeTurnId: null,
      };
    }

    case 'done':
      return {
        ...mapTurn(state, activeId, (t) => ({
          ...t,
          status: t.status === 'error' ? 'error' : 'done',
          steps: finishSteps(t.steps),
          progress: undefined,
        })),
        activeTurnId: null,
      };

    default:
      // heartbeat, unknown future frames.
      return state;
  }
}

function applyActionExecuted(state: ChatState, f: SmartChatFrame): ChatState {
  const result = toActionResult(f);
  let matched = false;
  let next = mapParts(state, (p) => {
    if (matched || p.type !== 'action_request') return p;
    const idMatch = result.actionId
      ? p.action.actionId === result.actionId
      : p.action.status === 'confirmed';
    if (!idMatch || p.action.status === 'executed' || p.action.status === 'failed') return p;
    matched = true;
    return {
      ...p,
      action: {
        ...p.action,
        status: result.success ? 'executed' : 'failed',
        result: f as unknown as Record<string, unknown>,
      },
      result,
    };
  });

  const activeId = next.activeTurnId;
  if (!matched && activeId) {
    // Instant edit: no prior action_request → standalone result card.
    const id = `result-${result.actionId || f.event_id || f.seq || Date.now()}`;
    next = mapTurn(next, activeId, (t) => pushPart(t, { type: 'action_result', id, result }));
  }

  if (result.success && result.searchId && result.actionType === 'plan_trip' && activeId) {
    const navId = `nav-trip-${result.searchId}`;
    next = mapTurn(next, activeId, (t) =>
      pushPart(t, {
        type: 'navigation',
        id: navId,
        label: 'View your trip',
        navigation: { screen: `/trip/${result.searchId}`, navigationId: navId },
      }),
    );
  }
  return mapTurn(next, activeId, (t) => ({ ...t, progress: undefined }));
}

// ── Reducer ───────────────────────────────────────────────────────────

export function chatReducer(state: ChatState, event: ChatEvent): ChatState {
  switch (event.type) {
    case 'reset':
      return { ...initialChatState, turns: event.turns, queue: state.queue };

    case 'begin': {
      // Close any turn still marked in-flight (hook aborted its stream).
      let turns = state.turns.map((t) =>
        t.status === 'streaming' ? { ...t, status: 'done' as const, steps: finishSteps(t.steps) } : t,
      );
      if (event.userTurn && event.userTurn.content.trim()) {
        turns = [
          ...turns,
          {
            id: event.userTurn.id,
            role: 'user',
            parts: [{ type: 'text', id: `${event.userTurn.id}-t0`, content: event.userTurn.content.trim() }],
            timestamp: event.now,
            status: 'done',
            steps: [],
          },
        ];
      }
      turns = [
        ...turns,
        {
          id: event.assistantTurnId,
          role: 'assistant',
          parts: [],
          timestamp: event.now,
          status: 'streaming',
          steps: [],
          request: event.request,
        },
      ];
      return { ...state, turns, activeTurnId: event.assistantTurnId };
    }

    case 'frame':
      return applyFrame(state, event.frame);

    case 'transport_error': {
      const activeId = state.activeTurnId;
      if (!activeId) return state;
      const code = event.status === 429 ? 'rate_limit' : event.status && event.status < 500 ? 'http' : 'network';
      const message =
        code === 'rate_limit'
          ? event.message || "You've hit today's chat limit."
          : code === 'network'
            ? "Couldn't reach Periplo. Check your connection and try again."
            : event.message || 'Something went wrong.';
      const cleared = mapParts(state, (p) =>
        p.type === 'action_request' && p.action.status === 'confirmed'
          ? { ...p, action: { ...p.action, status: 'failed' } }
          : p,
      );
      return {
        ...mapTurn(cleared, activeId, (t) => ({
          ...pushPart(t, errorPart(t.id, code, message)),
          status: 'error',
          steps: finishSteps(t.steps),
          progress: undefined,
        })),
        activeTurnId: null,
      };
    }

    case 'complete': {
      // Stream closed. If no `done` arrived, finalize what we have.
      const activeId = state.activeTurnId;
      if (!activeId) return state;
      const turn = state.turns.find((t) => t.id === activeId);
      if (turn && turn.parts.length === 0 && turn.steps.length === 0) {
        return {
          ...mapTurn(state, activeId, (t) => ({
            ...pushPart(t, errorPart(t.id, 'network', 'The response ended unexpectedly.')),
            status: 'error',
          })),
          activeTurnId: null,
        };
      }
      return {
        ...mapTurn(state, activeId, (t) => ({
          ...t,
          status: t.status === 'error' ? 'error' : 'done',
          steps: finishSteps(t.steps),
          progress: undefined,
        })),
        activeTurnId: null,
      };
    }

    case 'cancel': {
      const activeId = state.activeTurnId;
      if (!activeId) return state;
      const turn = state.turns.find((t) => t.id === activeId);
      if (turn && turn.parts.length === 0) {
        return { ...state, turns: state.turns.filter((t) => t.id !== activeId), activeTurnId: null };
      }
      return {
        ...mapTurn(state, activeId, (t) => ({ ...t, status: 'done', steps: finishSteps(t.steps), progress: undefined })),
        activeTurnId: null,
      };
    }

    case 'discard_turn':
      return {
        ...state,
        turns: state.turns.filter((t) => t.id !== event.id),
        activeTurnId: state.activeTurnId === event.id ? null : state.activeTurnId,
      };

    case 'action_status':
      return mapParts(state, (p) => {
        if (p.type !== 'action_request' || p.action.actionId !== event.actionId) return p;
        // Confirm is allowed from pending, or from failed when retrying.
        if (event.status === 'confirmed' && p.action.status !== 'pending' && p.action.status !== 'failed') return p;
        return { ...p, action: { ...p.action, status: event.status } };
      });

    case 'answer_question':
      return mapParts(state, (p) => {
        if (p.type === 'interactive_question' && p.question.questionId === event.questionId) {
          return { ...p, question: { ...p.question, status: 'answered', selectedAnswer: event.payload.label } };
        }
        if (p.type === 'single_select_question' && p.question.questionId === event.questionId) {
          return {
            ...p,
            question: {
              ...p.question,
              status: 'answered',
              selectedId: event.payload.optionId,
              selectedFreeText: event.payload.freeText,
            },
          };
        }
        if (p.type === 'multi_select_question' && p.question.questionId === event.questionId) {
          return {
            ...p,
            question: {
              ...p.question,
              status: 'answered',
              selectedIds: event.payload.selectedIds ?? [],
              selectedFreeText: event.payload.freeText,
            },
          };
        }
        return p;
      });

    case 'confirm_question':
      return mapParts(state, (p) =>
        p.type === 'confirm_question' && p.question.questionId === event.questionId
          ? { ...p, question: { ...p.question, status: event.result } }
          : p,
      );

    case 'undo_status':
      return mapParts(state, (p) => {
        if ((p.type === 'action_result' || p.type === 'action_request') && p.result?.actionId === event.actionId) {
          const result: ActionResult = {
            ...p.result,
            undo: event.undo,
          };
          return { ...p, result } as ChatPart;
        }
        return p;
      });

    case 'feedback':
      return mapTurn(state, event.id, (t) => ({ ...t, feedback: event.rating }));

    case 'set_progress':
      return mapTurn(state, state.activeTurnId, (t) => ({ ...t, progress: event.message }));

    case 'enqueue':
      return { ...state, queue: [...state.queue, event.item] };

    case 'dequeue':
      return { ...state, queue: state.queue.filter((q) => q.id !== event.id) };

    default:
      return state;
  }
}

// ── Selectors ─────────────────────────────────────────────────────────

export type ChatStatus = 'idle' | 'streaming' | 'tool_running' | 'error';

export function selectStatus(state: ChatState): ChatStatus {
  if (state.activeTurnId) {
    const t = state.turns.find((x) => x.id === state.activeTurnId);
    return t?.steps.some((s) => s.status === 'running') ? 'tool_running' : 'streaming';
  }
  const last = state.turns[state.turns.length - 1];
  return last?.role === 'assistant' && last.status === 'error' ? 'error' : 'idle';
}

/** Plain text of a turn (copy button, suggestion context, legacy history). */
export function turnText(turn: ChatTurn): string {
  return turn.parts
    .map((p) => (p.type === 'text' ? p.content : ''))
    .filter(Boolean)
    .join('\n\n')
    .trim();
}

/** The last assistant turn, if it is the final turn in the transcript. */
export function selectLastAssistantTurn(state: ChatState): ChatTurn | null {
  const last = state.turns[state.turns.length - 1];
  return last && last.role === 'assistant' ? last : null;
}

// ── History expansion ─────────────────────────────────────────────────

function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

/** Map one server `metadata.parts[]` entry to a renderable part. Interactive
 *  parts (action requests, questions) come back read-only: their live
 *  lifetime ended with the turn. */
export function richPartToChatPart(part: RichPart, id: string): ChatPart | null {
  switch (part.type) {
    case 'text': {
      const content = str(part.content);
      return content && content.trim() ? { type: 'text', id, content } : null;
    }
    case 'card': {
      const raw = part.card && typeof part.card === 'object' ? (part.card as Record<string, unknown>) : null;
      const card = raw ? toChatCard(raw, id) : null;
      return card ? { type: 'card', id, card } : null;
    }
    case 'navigation': {
      const screen = str(part.screen);
      if (!screen) return null;
      return {
        type: 'navigation',
        id,
        label: 'Open',
        navigation: {
          screen,
          params: (part.params as Record<string, unknown>) ?? undefined,
          navigationId: str(part.navigation_id) ?? id,
        },
      };
    }
    case 'action_request': {
      const description = str(part.description);
      return description ? { type: 'text', id, content: description } : null;
    }
    case 'action_executed': {
      const result = toActionResult(part);
      // Undo from history is allowed only while the window is still open;
      // the card itself hides the button once `undoExpiresAt` passes.
      return { type: 'action_result', id, result };
    }
    case 'interactive_question':
    case 'single_select_question':
    case 'multi_select_question':
    case 'confirm_question': {
      const prompt = str(part.question) ?? str(part.prompt);
      return prompt ? { type: 'text', id, content: prompt } : null;
    }
    case 'error': {
      const message = str(part.message);
      if (!message) return null;
      return { type: 'error', id, code: str(part.code) ?? 'ai_failure', message, retryable: false };
    }
    default:
      return null;
  }
}

/** Server history (oldest-first) → turns. `rich` assistant messages expand
 *  their `metadata.parts`; everything else becomes a single text part. */
export function historyToTurns(messages: BackendChatMessageV2[]): ChatTurn[] {
  const turns: ChatTurn[] = [];
  for (const m of messages) {
    if (m.role === 'system') continue;
    const ts = Date.parse(m.timestamp);
    const base: ChatTurn = {
      id: m.message_id,
      role: m.role === 'user' ? 'user' : 'assistant',
      parts: [],
      timestamp: Number.isNaN(ts) ? 0 : ts,
      status: 'done',
      steps: [],
      fromHistory: true,
      turnId: str(m.metadata?.turn_id),
      // Only the server writes `rich` turns, so they're always feedback-able.
      serverHistory: m.message_type === 'rich',
    };
    const rich = m.message_type === 'rich' && Array.isArray(m.metadata?.parts) ? m.metadata!.parts! : null;
    if (rich && rich.length) {
      rich.forEach((p, i) => {
        const part = p && typeof p === 'object' ? richPartToChatPart(p, `${m.message_id}-${i}`) : null;
        if (part) base.parts.push(part);
      });
    }
    if (!base.parts.length && m.content && m.content.trim()) {
      base.parts.push({ type: 'text', id: `${m.message_id}-t0`, content: m.content });
    }
    if (base.parts.length) turns.push(base);
  }
  return turns;
}
