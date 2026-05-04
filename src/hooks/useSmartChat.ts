'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createSSEStream } from '@/lib/api/sseClient';
import { getSessionId } from '@/lib/api/telemetry';
import { endpoints } from '@/lib/api/endpoints';
import type {
  ActionRequest,
  SmartChatMessage,
  SmartChatSSEEvent,
} from '@/types';

export type SmartChatStatus = 'idle' | 'streaming' | 'tool_running' | 'error';

interface UseSmartChatOptions {
  chatId: string;
  /** Seed with previously-fetched messages so the stream continues on top. */
  initialMessages?: SmartChatMessage[];
  tripContext?: { id?: string; destination?: string; dates?: string };
  city?: string;
}

interface SendOptions {
  /** When set, the backend correlates this turn to a pending question slot. */
  answersQuestionId?: string;
  /** When set, this is a confirmed action — sends `confirm_action` payload. */
  confirmAction?: { actionId: string; actionType: string; params: Record<string, unknown> };
  /** When true, do NOT push a visible user bubble (used for question answers). */
  silentUser?: boolean;
}

/** Web port of the mobile useSmartChat. Handles SSE token streaming, tool
 *  status (with inline bubble), action lifecycle (pending → confirmed →
 *  executed/failed), and the four question-card types. Dedupe by event_id. */
export function useSmartChat(opts: UseSmartChatOptions) {
  const { chatId, initialMessages, tripContext, city } = opts;
  const { getToken } = useAuth();

  const [messages, setMessages] = useState<SmartChatMessage[]>(
    initialMessages ?? [],
  );
  const [status, setStatus] = useState<SmartChatStatus>('idle');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const assistantIdRef = useRef<string | null>(null);
  const seenEventIdsRef = useRef<Set<string>>(new Set());
  const confirmingActionIdRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, []);

  const resetMessages = useCallback((next: SmartChatMessage[]) => {
    setMessages(next);
    seenEventIdsRef.current = new Set();
  }, []);

  const stream = useCallback(
    async (
      content: string,
      sendOpts: SendOptions = {},
      visibleUserContent?: string,
    ) => {
      abortRef.current?.abort();

      const userId = `u-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const assistantId = `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      assistantIdRef.current = assistantId;

      setError(null);
      setMessages((prev) => {
        const next = [...prev];
        if (!sendOpts.silentUser && (visibleUserContent ?? content).trim()) {
          next.push({
            id: userId,
            role: 'user',
            content: (visibleUserContent ?? content).trim(),
            timestamp: new Date(),
            messageType: 'text',
          });
        }
        next.push({
          id: assistantId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          messageType: 'text',
        });
        return next;
      });
      setStatus('streaming');
      setActiveTool(null);

      const token = await getToken();
      const sessionId = getSessionId();

      const headers: Record<string, string> = { 'X-Session-Id': sessionId };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const body: Record<string, unknown> = {
        chat_id: chatId,
        message: content,
      };
      if (tripContext?.id) {
        body.trip_context = {
          id: tripContext.id,
          destination: tripContext.destination,
          dates: tripContext.dates,
        };
      }
      if (city) body.city = city;
      if (sendOpts.answersQuestionId) body.answers_question_id = sendOpts.answersQuestionId;
      if (sendOpts.confirmAction) {
        body.confirm_action = {
          action_id: sendOpts.confirmAction.actionId,
          action_type: sendOpts.confirmAction.actionType,
          params: sendOpts.confirmAction.params,
        };
      }

      abortRef.current = createSSEStream({
        url: endpoints.smartChat,
        body,
        headers,
        onEvent: (raw) => {
          const event = raw as unknown as SmartChatSSEEvent;
          // Dedupe — backend may resend on retry.
          if (event.event_id) {
            if (seenEventIdsRef.current.has(event.event_id)) return;
            seenEventIdsRef.current.add(event.event_id);
          }

          switch (event.type) {
            case 'chat_token': {
              const chunk = event.content ?? '';
              if (!chunk) break;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: m.content + chunk } : m,
                ),
              );
              break;
            }
            case 'tool_call': {
              setStatus('tool_running');
              setActiveTool(event.tool ?? null);
              if (event.tool === 'google_search') {
                const statusId = `tool-${event.call_id ?? event.tool}`;
                setMessages((prev) => {
                  if (prev.some((m) => m.id === statusId)) return prev;
                  return [
                    ...prev,
                    {
                      id: statusId,
                      role: 'assistant',
                      content: 'Searching the web…',
                      timestamp: new Date(),
                      messageType: 'tool_status',
                      toolName: event.tool,
                    },
                  ];
                });
              }
              break;
            }
            case 'tool_result': {
              setActiveTool(null);
              setStatus('streaming');
              if (event.tool === 'google_search') {
                const statusId = `tool-${event.call_id ?? event.tool}`;
                setMessages((prev) => prev.filter((m) => m.id !== statusId));
              }
              break;
            }
            case 'generation_progress': {
              const id = confirmingActionIdRef.current;
              if (id && event.message) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.messageType === 'action_request'
                    && m.actionRequest?.actionId === id
                    && m.actionRequest.status === 'confirmed'
                      ? {
                          ...m,
                          actionRequest: { ...m.actionRequest, description: event.message! },
                        }
                      : m,
                  ),
                );
              }
              if (event.step) setActiveTool(event.step);
              break;
            }
            case 'action_request': {
              const actionReq: ActionRequest = {
                actionId: event.action_id ?? '',
                actionType: event.action_type ?? 'unknown',
                params: event.params ?? {},
                description: event.description ?? '',
                status: 'pending',
              };
              const msgId = `action-${actionReq.actionId || event.event_id || Date.now()}`;
              setMessages((prev) => {
                if (prev.some((m) => m.id === msgId)) return prev;
                return [
                  ...prev,
                  {
                    id: msgId,
                    role: 'assistant',
                    content: actionReq.description,
                    timestamp: new Date(),
                    messageType: 'action_request',
                    actionRequest: actionReq,
                    eventId: event.event_id,
                    streamId: event.stream_id,
                    seq: event.seq,
                  },
                ];
              });
              break;
            }
            case 'action_executed': {
              setActiveTool(null);
              const isSuccess = event.success !== false;
              const id = event.action_id ?? confirmingActionIdRef.current;
              setMessages((prev) =>
                prev.map((m) => {
                  if (
                    m.messageType === 'action_request'
                    && m.actionRequest?.actionId === id
                    && m.actionRequest.status === 'confirmed'
                  ) {
                    return {
                      ...m,
                      actionRequest: {
                        ...m.actionRequest,
                        status: isSuccess ? 'executed' : 'failed',
                        result: event as unknown as Record<string, unknown>,
                      },
                    };
                  }
                  return m;
                }),
              );
              confirmingActionIdRef.current = null;
              setStatus('streaming');

              if (isSuccess && event.search_id && event.action_type === 'plan_trip') {
                const navId = `nav-trip-${event.search_id}`;
                setMessages((prev) => {
                  if (prev.some((m) => m.id === navId)) return prev;
                  return [
                    ...prev,
                    {
                      id: navId,
                      role: 'system',
                      content: 'View your trip',
                      timestamp: new Date(),
                      messageType: 'navigation',
                      navigation: {
                        screen: `/trip/${event.search_id}`,
                        navigationId: navId,
                      },
                    },
                  ];
                });
              }
              break;
            }
            case 'navigation': {
              const navId = event.navigation_id ?? `nav-${Date.now()}`;
              setMessages((prev) => {
                if (prev.some((m) => m.id === navId)) return prev;
                return [
                  ...prev,
                  {
                    id: navId,
                    role: 'system',
                    content: `Open ${event.screen ?? ''}`,
                    timestamp: new Date(),
                    messageType: 'navigation',
                    navigation: {
                      screen: event.screen ?? '',
                      params: event.params,
                      navigationId: navId,
                    },
                  },
                ];
              });
              break;
            }
            case 'interactive_question': {
              const qid = event.question_id ?? event.event_id ?? `iq-${Date.now()}`;
              const msgId = `iq-${qid}`;
              setMessages((prev) => {
                if (prev.some((m) => m.id === msgId)) return prev;
                return [
                  ...prev,
                  {
                    id: msgId,
                    role: 'assistant',
                    content: event.question ?? 'Pick one:',
                    timestamp: new Date(),
                    messageType: 'interactive_question',
                    interactiveQuestion: {
                      questionId: qid,
                      question: event.question ?? '',
                      options: event.options ?? [],
                      allowCustom: !!event.allow_custom,
                      status: 'pending',
                    },
                  },
                ];
              });
              break;
            }
            case 'single_select_question': {
              const qid = event.question_id ?? event.event_id ?? `ssq-${Date.now()}`;
              const msgId = `ssq-${qid}`;
              setMessages((prev) => {
                if (prev.some((m) => m.id === msgId)) return prev;
                return [
                  ...prev,
                  {
                    id: msgId,
                    role: 'assistant',
                    content: event.question ?? event.prompt ?? '',
                    timestamp: new Date(),
                    messageType: 'single_select_question',
                    singleSelectQuestion: {
                      questionId: qid,
                      prompt: event.question ?? event.prompt ?? '',
                      options: (event.options ?? []) as Array<{
                        id: string; label: string; description?: string; icon?: string;
                      }>,
                      allowFreeText: event.allow_free_text ?? false,
                      status: 'pending',
                    },
                  },
                ];
              });
              break;
            }
            case 'multi_select_question': {
              const qid = event.question_id ?? event.event_id ?? `msq-${Date.now()}`;
              const msgId = `msq-${qid}`;
              setMessages((prev) => {
                if (prev.some((m) => m.id === msgId)) return prev;
                return [
                  ...prev,
                  {
                    id: msgId,
                    role: 'assistant',
                    content: event.question ?? event.prompt ?? '',
                    timestamp: new Date(),
                    messageType: 'multi_select_question',
                    multiSelectQuestion: {
                      questionId: qid,
                      prompt: event.question ?? event.prompt ?? '',
                      options: (event.options ?? []) as Array<{
                        id: string; label: string; description?: string; icon?: string;
                      }>,
                      min: event.min ?? 0,
                      max: event.max ?? null,
                      allowFreeText: event.allow_free_text ?? false,
                      status: 'pending',
                    },
                  },
                ];
              });
              break;
            }
            case 'confirm_question': {
              const qid = event.question_id ?? event.event_id ?? `cq-${Date.now()}`;
              const msgId = `cq-${qid}`;
              setMessages((prev) => {
                if (prev.some((m) => m.id === msgId)) return prev;
                return [
                  ...prev,
                  {
                    id: msgId,
                    role: 'assistant',
                    content: event.prompt ?? event.question ?? '',
                    timestamp: new Date(),
                    messageType: 'confirm_question',
                    confirmQuestion: {
                      questionId: qid,
                      prompt: event.prompt ?? event.question ?? '',
                      confirmLabel: event.confirm_label,
                      cancelLabel: event.cancel_label,
                      destructive: event.destructive ?? false,
                      context: event.context,
                      status: 'pending',
                    },
                  },
                ];
              });
              break;
            }
            case 'done': {
              setStatus('idle');
              setActiveTool(null);
              break;
            }
            default:
              break;
          }
        },
        onError: (err) => {
          setStatus('error');
          setError(err.message);
        },
        onComplete: () => {
          setStatus((prev) => (prev === 'error' ? prev : 'idle'));
          setActiveTool(null);
        },
      });
    },
    [chatId, city, getToken, tripContext],
  );

  const send = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;
      await stream(trimmed);
    },
    [stream],
  );

  const confirmAction = useCallback(
    async (actionId: string) => {
      let target: ActionRequest | null = null;
      setMessages((prev) =>
        prev.map((m) => {
          if (
            m.messageType === 'action_request'
            && m.actionRequest?.actionId === actionId
            && m.actionRequest.status === 'pending'
          ) {
            target = m.actionRequest;
            return { ...m, actionRequest: { ...m.actionRequest, status: 'confirmed' } };
          }
          return m;
        }),
      );
      if (!target) return;
      confirmingActionIdRef.current = actionId;
      const captured: ActionRequest = target;
      await stream('', {
        confirmAction: {
          actionId,
          actionType: captured.actionType,
          params: captured.params,
        },
        silentUser: true,
      });
    },
    [stream],
  );

  const rejectAction = useCallback((actionId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.messageType === 'action_request' && m.actionRequest?.actionId === actionId
          ? { ...m, actionRequest: { ...m.actionRequest, status: 'rejected' } }
          : m,
      ),
    );
  }, []);

  const answerQuestion = useCallback(
    async (
      questionId: string,
      payload: { optionId?: string; freeText?: string; selectedIds?: string[]; label: string },
    ) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.messageType === 'interactive_question' && m.interactiveQuestion?.questionId === questionId) {
            return {
              ...m,
              interactiveQuestion: {
                ...m.interactiveQuestion,
                status: 'answered',
                selectedAnswer: payload.label,
              },
            };
          }
          if (m.messageType === 'single_select_question' && m.singleSelectQuestion?.questionId === questionId) {
            return {
              ...m,
              singleSelectQuestion: {
                ...m.singleSelectQuestion,
                status: 'answered',
                selectedId: payload.optionId,
                selectedFreeText: payload.freeText,
              },
            };
          }
          if (m.messageType === 'multi_select_question' && m.multiSelectQuestion?.questionId === questionId) {
            return {
              ...m,
              multiSelectQuestion: {
                ...m.multiSelectQuestion,
                status: 'answered',
                selectedIds: payload.selectedIds ?? [],
                selectedFreeText: payload.freeText,
              },
            };
          }
          return m;
        }),
      );
      await stream(payload.label, { answersQuestionId: questionId }, payload.label);
    },
    [stream],
  );

  const respondConfirm = useCallback(
    async (questionId: string, result: 'confirmed' | 'cancelled', label: string) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.messageType === 'confirm_question' && m.confirmQuestion?.questionId === questionId
            ? { ...m, confirmQuestion: { ...m.confirmQuestion, status: result } }
            : m,
        ),
      );
      const reply = result === 'confirmed' ? 'Yes, please proceed.' : 'No, cancel that.';
      await stream(reply, { answersQuestionId: questionId }, label);
    },
    [stream],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus('idle');
    setActiveTool(null);
  }, []);

  return {
    messages,
    status,
    activeTool,
    error,
    send,
    confirmAction,
    rejectAction,
    answerQuestion,
    respondConfirm,
    cancel,
    resetMessages,
  };
}
