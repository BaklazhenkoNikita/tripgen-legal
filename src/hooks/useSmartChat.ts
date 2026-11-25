'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createSSEStream } from '@/lib/api/sseClient';
import { api, ApiError } from '@/lib/api/client';
import { getSessionId } from '@/lib/api/telemetry';
import { endpoints } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';
import {
  CHAT_PROTOCOL_VERSION,
  type ChatRequestContext,
  type FeedbackReason,
  type BackendChatMessageV2,
  type SmartChatFrame,
  type TurnStatusResponse,
  type UndoResponse,
} from '@/lib/chat/protocol';
import {
  chatReducer,
  historyToTurns,
  initialChatState,
  selectStatus,
  turnText,
  type AnswerPayload,
  type ChatTurn,
  type TurnRequest,
} from '@/lib/chat/reducer';

export type SmartChatStatus = 'idle' | 'streaming' | 'tool_running' | 'error';

interface UseSmartChatOptions {
  chatId: string;
  activeTripId?: string;
  city?: string;
  /** Protocol-v2 `context` (what the user is looking at). */
  context?: ChatRequestContext;
}

interface StreamOptions {
  answersQuestionId?: string;
  confirmAction?: TurnRequest['confirmAction'];
  /** Don't push a visible user bubble (confirmations, retries). */
  silentUser?: boolean;
  /** Bubble text when it differs from the sent message. */
  visibleUserContent?: string;
  /** Reuse an idempotency key (retries). */
  clientMessageId?: string;
}

const HISTORY_TURNS = 12;
/** Resume after an unexpected disconnect: poll every 2s for up to 90s. */
const RESUME_POLL_MS = 2000;
const RESUME_MAX_MS = 90_000;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function newId(prefix: string) {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${rand}`;
}

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const body = err.body as Record<string, unknown> | string | null;
    if (typeof body === 'string' && body) return body;
    if (body && typeof body === 'object') {
      const detail = body.detail ?? body.message;
      if (typeof detail === 'string') return detail;
    }
  }
  return fallback;
}

/**
 * Smart-chat client (protocol v2, v1-compatible). All transcript state lives
 * in the pure reducer (`@/lib/chat/reducer`); this hook owns the side
 * effects: SSE transport, auth headers, queued sends, undo + feedback calls,
 * and trip-cache invalidation after edits.
 */
export function useSmartChat(opts: UseSmartChatOptions) {
  const { chatId, activeTripId, city, context } = opts;
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const [state, dispatch] = useReducer(chatReducer, initialChatState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const abortRef = useRef<AbortController | null>(null);
  /** Bumped on every new stream / cancel; stale callbacks compare against it. */
  const genRef = useRef(0);

  useEffect(() => {
    return () => {
      genRef.current += 1;
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, []);

  const resetTurns = useCallback((turns: ChatTurn[]) => {
    dispatch({ type: 'reset', turns });
  }, []);

  /**
   * Server-owned v2 turns keep running after the socket drops. Poll the
   * turn's status, then reload history once it completes; fall back to an
   * inline retryable error if it never does.
   */
  const resume = useCallback(
    async (gen: number, turnId: string, serverChatId: string) => {
      dispatch({ type: 'set_progress', message: 'Reconnecting…' });
      const started = Date.now();
      while (Date.now() - started < RESUME_MAX_MS) {
        await sleep(RESUME_POLL_MS);
        if (gen !== genRef.current) return;
        let res: TurnStatusResponse | null = null;
        try {
          res = await api.get<TurnStatusResponse>(endpoints.chatTurn(serverChatId, turnId));
        } catch {
          continue; // still offline — keep polling
        }
        if (gen !== genRef.current) return;
        if (res?.status === 'running') continue;
        if (res?.status === 'complete') {
          try {
            const page = await api.get<{ messages: BackendChatMessageV2[] }>(
              `${endpoints.chatMessages(serverChatId)}?limit=100&latest=true`,
            );
            if (gen !== genRef.current) return;
            dispatch({ type: 'reset', turns: historyToTurns(page.messages ?? []) });
            void queryClient.invalidateQueries({ queryKey: queryKeys.chats.messages(chatId) });
            return;
          } catch {
            break;
          }
        }
        break; // unknown
      }
      if (gen !== genRef.current) return;
      dispatch({ type: 'set_progress', message: undefined });
      dispatch({ type: 'transport_error', message: 'Connection lost.' });
    },
    [chatId, queryClient],
  );

  const stream = useCallback(
    async (content: string, sendOpts: StreamOptions = {}) => {
      genRef.current += 1;
      const gen = genRef.current;
      abortRef.current?.abort();
      abortRef.current = null;

      const assistantTurnId = newId('a');
      const request: TurnRequest = {
        content,
        clientMessageId: sendOpts.clientMessageId ?? newId('m'),
        answersQuestionId: sendOpts.answersQuestionId,
        confirmAction: sendOpts.confirmAction,
        context,
      };
      const visible = (sendOpts.visibleUserContent ?? content).trim();

      // Legacy history for chats the server doesn't own; ignored otherwise.
      const conversationHistory = stateRef.current.turns
        .slice(-HISTORY_TURNS)
        .map((t) => ({ role: t.role, content: turnText(t) }))
        .filter((m) => m.content);

      dispatch({
        type: 'begin',
        assistantTurnId,
        request,
        now: Date.now(),
        userTurn: sendOpts.silentUser || !visible ? undefined : { id: newId('u'), content: visible },
      });

      const token = await getToken();
      if (gen !== genRef.current) return;

      const headers: Record<string, string> = {
        'X-Session-Id': getSessionId(),
        'X-Chat-Protocol': String(CHAT_PROTOCOL_VERSION),
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const body: Record<string, unknown> = {
        message: content,
        protocol: CHAT_PROTOCOL_VERSION,
        chat_id: chatId,
        client_message_id: request.clientMessageId,
        conversation_history: conversationHistory,
      };
      if (activeTripId) body.active_trip_id = activeTripId;
      if (city) body.city = city;
      if (context && Object.keys(context).length) body.context = context;
      if (request.answersQuestionId) body.answers_question_id = request.answersQuestionId;
      if (request.confirmAction) {
        body.confirm_action = {
          action_id: request.confirmAction.actionId,
          action_type: request.confirmAction.actionType,
          params: request.confirmAction.params,
        };
      }

      // Per-stream facts for the resume decision.
      let serverTurnId: string | undefined;
      let serverChatId = chatId;
      let serverOwned = false;
      let sawTerminal = false;

      abortRef.current = createSSEStream({
        url: endpoints.smartChat,
        body,
        headers,
        onEvent: (raw) => {
          if (gen !== genRef.current) return;
          const frame = raw as unknown as SmartChatFrame;
          if (!frame || typeof frame.type !== 'string') return;
          if (frame.type === 'hello') {
            serverTurnId = frame.turn_id;
            serverChatId = frame.chat_id ?? chatId;
            serverOwned = frame.server_history === true;
          }
          if (frame.type === 'done' || frame.type === 'error') sawTerminal = true;
          dispatch({ type: 'frame', frame });

          // Side effects the reducer must not own.
          if (frame.type === 'action_executed' && frame.success !== false && frame.search_id) {
            void queryClient.invalidateQueries({ queryKey: queryKeys.trips.detail(frame.search_id) });
          }
          if (frame.type === 'done') {
            void queryClient.invalidateQueries({ queryKey: ['chats', 'list'] });
          }
        },
        onError: (err) => {
          if (gen !== genRef.current) return;
          const status = (err as Error & { status?: number }).status;
          const clientError = typeof status === 'number' && status >= 400 && status < 500;
          if (!clientError && !sawTerminal && serverOwned && serverTurnId) {
            void resume(gen, serverTurnId, serverChatId);
            return;
          }
          dispatch({ type: 'transport_error', message: err.message, status });
        },
        onComplete: () => {
          if (gen !== genRef.current) return;
          if (!sawTerminal && serverOwned && serverTurnId) {
            void resume(gen, serverTurnId, serverChatId);
            return;
          }
          dispatch({ type: 'complete' });
        },
      });
    },
    [activeTripId, chatId, city, context, getToken, queryClient, resume],
  );

  const status: SmartChatStatus = selectStatus(state);
  const busy = state.activeTurnId !== null;

  /** Send, or queue if a turn is still streaming (composer stays enabled). */
  const send = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;
      if (stateRef.current.activeTurnId) {
        dispatch({ type: 'enqueue', item: { id: newId('q'), content: trimmed } });
        return;
      }
      await stream(trimmed);
    },
    [stream],
  );

  // Drain the queue one message per finished turn.
  const nextQueued = state.queue[0];
  useEffect(() => {
    if (busy || !nextQueued) return;
    dispatch({ type: 'dequeue', id: nextQueued.id });
    void stream(nextQueued.content);
  }, [busy, nextQueued, stream]);

  const removeQueued = useCallback((id: string) => {
    dispatch({ type: 'dequeue', id });
  }, []);

  /** Re-send the request behind an assistant turn (error Retry or regenerate). */
  const retry = useCallback(
    async (turnLocalId: string) => {
      if (stateRef.current.activeTurnId) return;
      const turn = stateRef.current.turns.find((t) => t.id === turnLocalId);
      const req = turn?.request;
      if (!turn || !req) return;
      dispatch({ type: 'discard_turn', id: turnLocalId });
      if (req.confirmAction) {
        dispatch({ type: 'action_status', actionId: req.confirmAction.actionId, status: 'confirmed' });
      }
      await stream(req.content, {
        silentUser: true,
        answersQuestionId: req.answersQuestionId,
        confirmAction: req.confirmAction,
        clientMessageId: req.clientMessageId,
      });
    },
    [stream],
  );

  const confirmAction = useCallback(
    async (actionId: string) => {
      let target: { actionType: string; params: Record<string, unknown> } | null = null;
      for (const t of stateRef.current.turns) {
        for (const p of t.parts) {
          if (p.type === 'action_request' && p.action.actionId === actionId && p.action.status === 'pending') {
            target = { actionType: p.action.actionType, params: p.action.params };
          }
        }
      }
      if (!target) return;
      dispatch({ type: 'action_status', actionId, status: 'confirmed' });
      await stream('', {
        confirmAction: { actionId, actionType: target.actionType, params: target.params },
        silentUser: true,
      });
    },
    [stream],
  );

  const rejectAction = useCallback((actionId: string) => {
    dispatch({ type: 'action_status', actionId, status: 'rejected' });
  }, []);

  const answerQuestion = useCallback(
    async (questionId: string, payload: AnswerPayload) => {
      dispatch({ type: 'answer_question', questionId, payload });
      await stream(payload.label, { answersQuestionId: questionId });
    },
    [stream],
  );

  const respondConfirm = useCallback(
    async (questionId: string, result: 'confirmed' | 'cancelled', label: string) => {
      dispatch({ type: 'confirm_question', questionId, result });
      const reply = result === 'confirmed' ? 'Yes, please proceed.' : 'No, cancel that.';
      await stream(reply, { answersQuestionId: questionId, visibleUserContent: label });
    },
    [stream],
  );

  const undo = useCallback(
    async (actionId: string, undoToken: string) => {
      dispatch({ type: 'undo_status', actionId, undo: { status: 'pending' } });
      try {
        const res = await api.post<UndoResponse>(endpoints.smartChatUndo, { undo_token: undoToken });
        if (res?.success === false) {
          dispatch({
            type: 'undo_status',
            actionId,
            undo: { status: 'failed', message: res.message || "Couldn't undo that change." },
          });
          return;
        }
        dispatch({ type: 'undo_status', actionId, undo: { status: 'done', message: res?.message || 'Change undone.' } });
        if (res?.search_id) {
          void queryClient.invalidateQueries({ queryKey: queryKeys.trips.detail(res.search_id) });
        }
      } catch (err) {
        const status = err instanceof ApiError ? err.status : undefined;
        const message =
          status === 409
            ? errorMessage(err, 'Your trip changed since this edit, so it can no longer be undone.')
            : status === 410
              ? errorMessage(err, 'This change can no longer be undone.')
              : errorMessage(err, "Couldn't undo that change. Try again.");
        dispatch({ type: 'undo_status', actionId, undo: { status: 'failed', message } });
      }
    },
    [queryClient],
  );

  const sendFeedback = useCallback(
    async (turnLocalId: string, rating: 'up' | 'down', reason?: FeedbackReason) => {
      const turn = stateRef.current.turns.find((t) => t.id === turnLocalId);
      if (!turn?.turnId) return;
      const prev = turn.feedback;
      dispatch({ type: 'feedback', id: turnLocalId, rating });
      try {
        await api.post(endpoints.chatTurnFeedback(stateRef.current.chatId ?? chatId, turn.turnId), {
          rating,
          ...(reason ? { reason } : {}),
        });
        if (reason || rating === 'up') toast.success('Thanks for the feedback');
      } catch {
        dispatch({ type: 'feedback', id: turnLocalId, rating: prev });
        toast.error("Couldn't send feedback");
      }
    },
    [chatId],
  );

  /** Stop the in-flight turn. v2 turns run detached server-side, so closing
   *  the socket isn't enough — also ask the server to cancel. */
  const cancel = useCallback(() => {
    const active = stateRef.current.turns.find((t) => t.id === stateRef.current.activeTurnId);
    genRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    dispatch({ type: 'cancel' });
    if (active?.turnId) {
      void api.post(endpoints.smartChatCancel, { turn_id: active.turnId }).catch(() => undefined);
    }
  }, []);

  return useMemo(
    () => ({
      turns: state.turns,
      queue: state.queue,
      status,
      busy,
      send,
      retry,
      confirmAction,
      rejectAction,
      answerQuestion,
      respondConfirm,
      undo,
      sendFeedback,
      removeQueued,
      cancel,
      resetTurns,
    }),
    [
      state.turns,
      state.queue,
      status,
      busy,
      send,
      retry,
      confirmAction,
      rejectAction,
      answerQuestion,
      respondConfirm,
      undo,
      sendFeedback,
      removeQueued,
      cancel,
      resetTurns,
    ],
  );
}
