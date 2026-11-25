'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { alpha } from '@mui/material/styles';
import { ArrowDown, ArrowUp, Calendar, MapPin, Menu, Square, X, type LucideIcon } from 'lucide-react';
import { useCity, useActiveTrip } from '@/contexts';
import { useChatMessages } from '@/hooks/useChats';
import { useSmartChat } from '@/hooks/useSmartChat';
import { useStickToBottom } from '@/hooks/useStickToBottom';
import { useChatEnabled } from '@/hooks/useFeatureConfig';
import { historyToTurns, type AnswerPayload } from '@/lib/chat/reducer';
import type { ChatRequestContext, FeedbackReason } from '@/lib/chat/protocol';
import { minTap } from '@/theme/standards';
import { useChatLayout } from './ChatLayoutContext';
import { writeLastChatId } from './lastChatStorage';
import { ChatMessage, QueuedBubble } from './ChatMessage';
import { ChatEmptyState } from './ChatEmptyState';
import { ChatRenderProvider } from './ChatRenderContext';
import { SuggestionChips } from './SuggestionChips';

/** What the user is looking at when they open chat ("Ask AI" entry points). */
export interface ChatEntryContext extends ChatRequestContext {
  /** Chip label for the trip, e.g. "Lisbon". */
  trip_label?: string;
}

interface Props {
  chatId: string;
  /** When true, lays out for an embedded surface (drawer/panel): fills its
   *  parent (h-full), drops the max-width clamp, and hides the back link. */
  embed?: boolean;
  /** Initial protocol-v2 context; each piece renders as a removable chip. */
  context?: ChatEntryContext;
}

type ChipKey = 'trip' | 'day' | 'entity';

const MAX_INPUT_LINES = 6;

/**
 * Reads `/chat?city=&prefill=&days=` (MCP "Continue in Periplo" links) once:
 * sets the focus city and drops the prefill into the composer — never
 * auto-sends. Isolated so `useSearchParams` sits under its own Suspense.
 */
function UrlPrefill({ onPrefill }: { onPrefill: (text: string) => void }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { city, setCity } = useCity();
  const doneRef = useRef(false);

  useEffect(() => {
    if (doneRef.current) return;
    const qCity = params.get('city')?.trim();
    const prefill = params.get('prefill')?.trim();
    const daysRaw = Number(params.get('days'));
    const days = Number.isFinite(daysRaw) && daysRaw > 0 && daysRaw <= 30 ? Math.round(daysRaw) : null;
    if (!qCity && !prefill) return;
    doneRef.current = true;

    if (qCity && qCity !== city) setCity(qCity);
    let text = prefill ?? '';
    if (!text && qCity) text = days ? `Plan a ${days}-day trip to ${qCity}` : `What should I do in ${qCity}?`;
    else if (text && days && !/\bday/i.test(text)) text = `${text} (${days} days)`;
    if (text) onPrefill(text.slice(0, 2000));

    // Drop the one-shot params (keep utm_* for analytics) so a refresh doesn't re-prefill.
    const next = new URLSearchParams(params.toString());
    ['city', 'prefill', 'days'].forEach((k) => next.delete(k));
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [params, city, setCity, onPrefill, router, pathname]);

  return null;
}

function ContextChip({ icon: Icon, label, onRemove }: { icon: LucideIcon; label: string; onRemove: () => void }) {
  return (
    <Box
      component="span"
      sx={(t) => ({
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        pl: 1.25,
        borderRadius: 999,
        bgcolor: alpha(t.palette.primary.main, 0.08),
        border: 1,
        borderColor: alpha(t.palette.primary.main, 0.2),
        fontSize: 13,
        fontWeight: 500,
        color: 'text.primary',
        maxWidth: '100%',
      })}
    >
      <Box component="span" sx={{ display: 'inline-flex', color: 'primary.main' }}>
        <Icon size={13} aria-hidden />
      </Box>
      <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </Box>
      <Box
        component="button"
        type="button"
        onClick={onRemove}
        aria-label={`Remove context: ${label}`}
        sx={(t) => ({
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          border: 0,
          borderRadius: 999,
          bgcolor: 'transparent',
          color: 'text.secondary',
          cursor: 'pointer',
          position: 'relative',
          '&::after': { content: '""', position: 'absolute', inset: -6 },
          '&:hover': { color: 'text.primary', bgcolor: 'action.hover' },
          '&:focus-visible': { outline: `2px solid ${t.palette.primary.main}`, outlineOffset: 0 },
        })}
      >
        <X size={14} aria-hidden />
      </Box>
    </Box>
  );
}

export function ChatConversation({ chatId, embed = false, context: entryContext }: Props) {
  const { city } = useCity();
  const { activeTripId, activeTripSummary } = useActiveTrip();
  const { openHistory, isMobile, focusInputRequest } = useChatLayout();
  const chatEnabled = useChatEnabled();

  useEffect(() => {
    if (!embed) writeLastChatId(chatId);
  }, [chatId, embed]);

  // ── Context chips ──────────────────────────────────────────────────
  const [dismissed, setDismissed] = useState<ReadonlySet<ChipKey>>(() => new Set());
  const tripId = entryContext?.trip_id ?? activeTripId ?? undefined;
  const requestContext = useMemo<ChatRequestContext | undefined>(() => {
    const c: ChatRequestContext = {};
    if (tripId && !dismissed.has('trip')) c.trip_id = tripId;
    if (entryContext?.day_number && !dismissed.has('day')) c.day_number = entryContext.day_number;
    if ((entryContext?.entity_id || entryContext?.entity_name) && !dismissed.has('entity')) {
      if (entryContext.entity_id) c.entity_id = entryContext.entity_id;
      if (entryContext.entity_type) c.entity_type = entryContext.entity_type;
      if (entryContext.entity_name) c.entity_name = entryContext.entity_name;
    }
    return Object.keys(c).length ? c : undefined;
  }, [tripId, entryContext, dismissed]);
  const tripLabel =
    entryContext?.trip_label ??
    (activeTripSummary && activeTripSummary.id === tripId
      ? activeTripSummary.destinationDisplay || activeTripSummary.destination
      : undefined);
  const dismiss = (k: ChipKey) => setDismissed((prev) => new Set(prev).add(k));

  const {
    turns,
    queue,
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
  } = useSmartChat({
    chatId,
    activeTripId: requestContext?.trip_id,
    city: city ?? undefined,
    context: requestContext,
  });

  // ── History hydration (once) ───────────────────────────────────────
  const { data: historyRaw } = useChatMessages(chatId);
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current || !historyRaw) return;
    seededRef.current = true;
    if (busy || turns.length > 0) return; // user already started a turn
    const seed = historyToTurns(historyRaw);
    if (seed.length) resetTurns(seed);
  }, [historyRaw, busy, turns.length, resetTurns]);

  // ── Scroll ─────────────────────────────────────────────────────────
  const { scrollRef, contentRef, atBottom, jumpToLatest, stick } = useStickToBottom();

  // ── Composer ───────────────────────────────────────────────────────
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState('');

  const resizeInput = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 20;
    const max = lineHeight * MAX_INPUT_LINES + 16;
    el.style.height = Math.min(el.scrollHeight, max) + 'px';
  }, []);

  // Cmd/Ctrl+K from the chat layout asks us to focus the input.
  useEffect(() => {
    if (focusInputRequest > 0) inputRef.current?.focus();
  }, [focusInputRequest]);

  const onPrefill = useCallback(
    (text: string) => {
      setInput(text);
      requestAnimationFrame(() => {
        resizeInput();
        inputRef.current?.focus();
      });
    },
    [resizeInput],
  );

  const sendPrompt = useCallback(
    (prompt: string) => {
      if (!chatEnabled) return;
      stick();
      void send(prompt);
    },
    [chatEnabled, send, stick],
  );

  const submit = () => {
    if (!chatEnabled || !input.trim()) return;
    sendPrompt(input);
    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  // ── Stable turn handlers (ChatMessage is memoized) ─────────────────
  const onAction = useCallback(
    (accept: boolean, actionId: string) => {
      if (accept) void confirmAction(actionId);
      else rejectAction(actionId);
    },
    [confirmAction, rejectAction],
  );
  const onAnswer = useCallback(
    (questionId: string, payload: AnswerPayload) => void answerQuestion(questionId, payload),
    [answerQuestion],
  );
  const onConfirm = useCallback(
    (questionId: string, result: 'confirmed' | 'cancelled', label: string) =>
      void respondConfirm(questionId, result, label),
    [respondConfirm],
  );
  const onUndo = useCallback((actionId: string, token: string) => void undo(actionId, token), [undo]);
  const onRetry = useCallback(
    (turnId: string) => {
      stick();
      void retry(turnId);
    },
    [retry, stick],
  );
  const onFeedback = useCallback(
    (turnId: string, rating: 'up' | 'down', reason?: FeedbackReason) => void sendFeedback(turnId, rating, reason),
    [sendFeedback],
  );

  const renderCtx = useMemo(() => ({ city, sendPrompt, busy }), [city, sendPrompt, busy]);

  const hasTurns = turns.length > 0 || queue.length > 0;
  const showStop = busy && !input.trim();
  const sendDisabled = !chatEnabled || (!showStop && !input.trim());

  const chips: Array<{ key: ChipKey; icon: LucideIcon; label: string }> = [];
  if (requestContext?.trip_id) chips.push({ key: 'trip', icon: MapPin, label: tripLabel ? `Trip: ${tripLabel}` : 'This trip' });
  if (requestContext?.day_number) chips.push({ key: 'day', icon: Calendar, label: `Day ${requestContext.day_number}` });
  if (requestContext?.entity_name) chips.push({ key: 'entity', icon: MapPin, label: requestContext.entity_name });

  return (
    <ChatRenderProvider value={renderCtx}>
      {!embed ? (
        <Suspense fallback={null}>
          <UrlPrefill onPrefill={onPrefill} />
        </Suspense>
      ) : null}
      <Box
        className="tg-chat"
        sx={{
          display: 'flex',
          height: '100%',
          minHeight: 0,
          flexDirection: 'column',
          width: '100%',
          px: embed ? { xs: 2, sm: 2.5 } : { xs: 2, sm: 3 },
        }}
      >
        {!embed && isMobile ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
            <IconButton
              aria-label="Open chat history"
              onClick={openHistory}
              sx={{ color: 'text.secondary', width: minTap, height: minTap }}
            >
              <Menu size={18} aria-hidden />
            </IconButton>
          </Box>
        ) : null}

        <Box sx={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <Box
            ref={scrollRef}
            role="region"
            aria-label="Conversation"
            tabIndex={-1}
            sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', outline: 'none' }}
          >
            <Box
              ref={contentRef}
              sx={{
                maxWidth: 720,
                mx: 'auto',
                width: '100%',
                py: 2,
                minHeight: hasTurns ? undefined : '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: hasTurns ? 'flex-start' : 'center',
                gap: 2,
              }}
            >
              {hasTurns ? (
                <>
                  {turns.map((t, i) => (
                    <ChatMessage
                      key={t.id}
                      turn={t}
                      isLast={i === turns.length - 1}
                      busy={busy}
                      onAction={onAction}
                      onAnswer={onAnswer}
                      onConfirm={onConfirm}
                      onUndo={onUndo}
                      onRetry={onRetry}
                      onFeedback={onFeedback}
                    />
                  ))}
                  {queue.map((q) => (
                    <QueuedBubble key={q.id} text={q.content} onRemove={() => removeQueued(q.id)} />
                  ))}
                </>
              ) : (
                <ChatEmptyState
                  tripId={requestContext?.trip_id}
                  city={city}
                  onPick={sendPrompt}
                  disabled={!chatEnabled}
                />
              )}
            </Box>
          </Box>

          {/* One polite announcement per turn instead of every streamed token. */}
          <Box
            role="status"
            aria-live="polite"
            sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}
          >
            {busy ? 'Assistant is responding' : hasTurns ? 'Response ready' : ''}
          </Box>

          {!atBottom && hasTurns ? (
            <Box
              component="button"
              type="button"
              onClick={jumpToLatest}
              sx={(t) => ({
                position: 'absolute',
                bottom: 12,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                minHeight: minTap,
                px: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: 999,
                bgcolor: 'background.paper',
                color: 'text.primary',
                boxShadow: t.shadows[4],
                fontFamily: 'inherit',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                zIndex: 2,
                '&:hover': { bgcolor: 'action.hover' },
                '&:focus-visible': { outline: `2px solid ${t.palette.primary.main}`, outlineOffset: 2 },
              })}
            >
              <ArrowDown size={16} aria-hidden />
              Jump to latest
            </Box>
          ) : null}
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            flexShrink: 0,
            position: 'sticky',
            bottom: 0,
            zIndex: 1,
            bgcolor: 'background.default',
            pt: 1,
            pb: embed ? 2 : 'calc(44px + env(safe-area-inset-bottom))',
          }}
        >
          {!chatEnabled ? (
            <Box
              component="p"
              role="status"
              sx={(t) => ({
                m: 0,
                borderRadius: 1.5,
                border: 1,
                borderColor: alpha(t.palette.warning.main, 0.3),
                bgcolor: alpha(t.palette.warning.main, 0.1),
                px: 1.5,
                py: 0.75,
                fontSize: 14,
                color: t.palette.warning.dark,
                maxWidth: 720,
                mx: 'auto',
                width: '100%',
              })}
            >
              Chat is paused for maintenance. Try again shortly.
            </Box>
          ) : null}

          {hasTurns && !busy ? (
            <SuggestionChips
              city={city ?? undefined}
              activeTripId={requestContext?.trip_id}
              turns={turns}
              onPick={sendPrompt}
              disabled={busy || !chatEnabled}
            />
          ) : null}

          <Box
            component="form"
            onSubmit={(e: React.FormEvent) => {
              e.preventDefault();
              if (showStop) cancel();
              else submit();
            }}
            sx={{ width: '100%', maxWidth: 940, mx: 'auto' }}
          >
            {chips.length ? (
              <Box role="group" aria-label="Chat context" sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1, px: 0.5 }}>
                {chips.map((c) => (
                  <ContextChip key={c.key} icon={c.icon} label={c.label} onRemove={() => dismiss(c.key)} />
                ))}
              </Box>
            ) : null}
            <Box
              sx={(t) => ({
                display: 'flex',
                alignItems: 'flex-end',
                gap: 1.25,
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                borderRadius: 5,
                px: 2.5,
                py: embed ? 1.25 : 2,
                transition: 'border-color 0.15s, box-shadow 0.15s',
                '&:focus-within': {
                  borderColor: t.palette.primary.main,
                  boxShadow: `0 0 0 3px ${alpha(t.palette.primary.main, 0.18)}`,
                },
              })}
            >
              <Box
                component="textarea"
                ref={inputRef}
                rows={1}
                value={input}
                aria-label="Message"
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setInput(e.target.value);
                  resizeInput();
                }}
                onKeyDown={handleKeyDown}
                disabled={!chatEnabled}
                placeholder={
                  !chatEnabled
                    ? 'Chat paused'
                    : busy
                      ? 'Type your next message — it sends when this reply finishes'
                      : 'Ask anything about your trip…'
                }
                sx={(t) => ({
                  flex: 1,
                  border: 0,
                  outline: 'none',
                  resize: 'none',
                  bgcolor: 'transparent',
                  color: 'text.primary',
                  fontFamily: 'inherit',
                  fontSize: 17,
                  lineHeight: 1.5,
                  py: 1.25,
                  px: 0.5,
                  minHeight: embed ? '2.75em' : '3.25em',
                  maxHeight: `${MAX_INPUT_LINES * 1.5 + 1}em`,
                  overflowY: 'auto',
                  '&::placeholder': { color: t.palette.text.disabled, opacity: 1 },
                  '&:disabled': { opacity: 0.6, cursor: 'not-allowed' },
                })}
              />
              <IconButton
                type="submit"
                aria-label={showStop ? 'Stop generating' : busy ? 'Queue message' : 'Send message'}
                disabled={sendDisabled}
                sx={(t) => ({
                  flexShrink: 0,
                  width: 52,
                  height: 52,
                  borderRadius: 999,
                  bgcolor: showStop ? 'text.primary' : 'primary.main',
                  color: showStop ? 'background.paper' : 'primary.contrastText',
                  '&:hover:not(:disabled)': { bgcolor: showStop ? 'text.secondary' : 'primary.dark' },
                  '&:focus-visible': { outline: `2px solid ${t.palette.primary.main}`, outlineOffset: 2 },
                  '&.Mui-disabled': {
                    bgcolor: alpha(t.palette.primary.main, 0.4),
                    color: t.palette.primary.contrastText,
                    opacity: 0.3,
                    cursor: 'not-allowed',
                  },
                })}
              >
                {showStop ? <Square size={16} fill="currentColor" aria-hidden /> : <ArrowUp size={22} aria-hidden />}
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>
    </ChatRenderProvider>
  );
}
