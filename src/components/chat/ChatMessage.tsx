'use client';

import { memo } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { alpha } from '@mui/material/styles';
import { AlertCircle, ArrowRight, RotateCcw } from 'lucide-react';
import type { FeedbackReason } from '@/lib/chat/protocol';
import { stripEntityLinks } from '@/lib/chat/markdown';
import { navigationTarget } from '@/lib/chat/links';
import { turnText, type AnswerPayload, type ChatPart, type ChatTurn } from '@/lib/chat/reducer';
import { minTap, radii } from '@/theme/standards';
import { Markdown } from './Markdown';
import { AgentSteps } from './AgentSteps';
import { MessageActions } from './MessageActions';
import { ActionCard } from './cards/ActionCard';
import { ActionResultCard } from './cards/ActionResultCard';
import { ChatCardView } from './cards/ChatCardView';
import { SingleSelectCard } from './cards/SingleSelectCard';
import { MultiSelectCard } from './cards/MultiSelectCard';
import { ConfirmCard } from './cards/ConfirmCard';

export type { AnswerPayload };

export interface TurnHandlers {
  onAnswer?: (questionId: string, payload: AnswerPayload) => void;
  onConfirm?: (questionId: string, result: 'confirmed' | 'cancelled', label: string) => void;
  onAction?: (accept: boolean, actionId: string) => void;
  onUndo?: (actionId: string, token: string) => void;
  onRetry?: (turnId: string) => void;
  onFeedback?: (turnId: string, rating: 'up' | 'down', reason?: FeedbackReason) => void;
}

interface Props extends TurnHandlers {
  turn: ChatTurn;
  /** Last turn in the transcript — gets the message-actions row. */
  isLast: boolean;
  /** Another turn is streaming (disables Retry). */
  busy: boolean;
}

function UserBubble({ text, queued, onRemove }: { text: string; queued?: boolean; onRemove?: () => void }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
      <Paper
        elevation={0}
        sx={{
          maxWidth: '85%',
          borderRadius: radii.card,
          borderTopRightRadius: 4,
          bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
          color: 'text.primary',
          px: 2,
          py: 1.25,
          fontSize: 15,
          opacity: queued ? 0.6 : 1,
          border: queued ? '1px dashed' : 0,
          borderColor: 'divider',
        }}
      >
        <Box component="p" sx={{ m: 0, whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}>
          {text}
        </Box>
      </Paper>
      {queued ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 12, color: 'text.secondary' }}>
          <span>Queued — sends when the reply finishes</span>
          {onRemove ? (
            <Box
              component="button"
              type="button"
              onClick={onRemove}
              sx={(t) => ({
                minHeight: minTap,
                px: 1,
                border: 0,
                bgcolor: 'transparent',
                color: 'primary.main',
                fontFamily: 'inherit',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                '&:focus-visible': { outline: `2px solid ${t.palette.primary.main}`, outlineOffset: 2 },
              })}
            >
              Remove
            </Box>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
}

export function QueuedBubble({ text, onRemove }: { text: string; onRemove: () => void }) {
  return <UserBubble text={text} queued onRemove={onRemove} />;
}

function ErrorNotice({ part, onRetry, busy }: { part: Extract<ChatPart, { type: 'error' }>; onRetry?: () => void; busy: boolean }) {
  return (
    <Box
      role="alert"
      sx={(t) => ({
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1,
        px: 1.5,
        py: 1,
        borderRadius: radii.card,
        border: 1,
        borderColor: alpha(t.palette.error.main, 0.3),
        bgcolor: alpha(t.palette.error.main, 0.06),
        fontSize: 14,
        color: t.palette.mode === 'dark' ? t.palette.error.light : t.palette.error.dark,
      })}
    >
      <AlertCircle size={16} aria-hidden style={{ flexShrink: 0 }} />
      <Box component="span" sx={{ flex: 1, minWidth: 160 }}>
        {part.message}
      </Box>
      {part.retryable && onRetry ? (
        <Box
          component="button"
          type="button"
          onClick={onRetry}
          disabled={busy}
          sx={(t) => ({
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            minHeight: minTap,
            px: 1.75,
            border: 0,
            borderRadius: 999,
            bgcolor: 'background.paper',
            color: 'text.primary',
            fontFamily: 'inherit',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: `inset 0 0 0 1px ${t.palette.divider}`,
            '&:hover:not(:disabled)': { bgcolor: 'action.hover' },
            '&:focus-visible': { outline: `2px solid ${t.palette.primary.main}`, outlineOffset: 2 },
            '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
          })}
        >
          <RotateCcw size={14} aria-hidden />
          Retry
        </Box>
      ) : null}
    </Box>
  );
}

function TypingDots() {
  return (
    <Box component="span" role="status" aria-label="Assistant is typing" sx={{ display: 'inline-flex', gap: 0.5, py: 0.75 }}>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          component="span"
          sx={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            bgcolor: 'text.disabled',
            animation: 'tgDotPulse 1.4s ease-in-out infinite',
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </Box>
  );
}

function PartView({
  part,
  isLastText,
  streaming,
  handlers,
  busy,
  turn,
}: {
  part: ChatPart;
  isLastText: boolean;
  streaming: boolean;
  handlers: TurnHandlers;
  busy: boolean;
  turn: ChatTurn;
}) {
  switch (part.type) {
    case 'text':
      return <Markdown streaming={streaming && isLastText}>{part.content}</Markdown>;
    case 'card':
      return <ChatCardView card={part.card} />;
    case 'action_request':
      if (part.result && (part.action.status === 'executed' || part.action.status === 'failed')) {
        return <ActionResultCard result={part.result} fallbackDescription={part.action.description} onUndo={handlers.onUndo} />;
      }
      return (
        <ActionCard
          action={part.action}
          onConfirm={(id) => handlers.onAction?.(true, id)}
          onReject={(id) => handlers.onAction?.(false, id)}
        />
      );
    case 'action_result':
      return <ActionResultCard result={part.result} onUndo={handlers.onUndo} />;
    case 'navigation': {
      const target = navigationTarget(part.navigation.screen, part.navigation.params);
      if (!target) return null;
      return (
        <Box
          component={Link}
          href={target.href}
          sx={(t) => ({
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            minHeight: minTap,
            borderRadius: 999,
            border: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            px: 2,
            fontSize: 14,
            fontWeight: 600,
            color: 'primary.main',
            textDecoration: 'none',
            '&:hover': { bgcolor: t.palette.action.hover },
            '&:focus-visible': { outline: `2px solid ${t.palette.primary.main}`, outlineOffset: 2 },
          })}
        >
          {part.label && part.label !== 'Open' ? part.label : target.label}
          <ArrowRight size={15} aria-hidden />
        </Box>
      );
    }
    case 'single_select_question':
      return <SingleSelectCard question={part.question} onAnswer={(id, p) => handlers.onAnswer?.(id, p)} />;
    case 'interactive_question':
      return <SingleSelectCard question={part.question} onAnswer={(id, p) => handlers.onAnswer?.(id, p)} />;
    case 'multi_select_question':
      return <MultiSelectCard question={part.question} onSubmit={(id, p) => handlers.onAnswer?.(id, p)} />;
    case 'confirm_question':
      return <ConfirmCard question={part.question} onAnswer={(id, r, l) => handlers.onConfirm?.(id, r, l)} />;
    case 'error':
      return (
        <ErrorNotice
          part={part}
          busy={busy}
          onRetry={turn.request && handlers.onRetry ? () => handlers.onRetry?.(turn.id) : undefined}
        />
      );
    default:
      return null;
  }
}

/** One transcript turn: user bubble, or assistant steps + ordered parts. */
export const ChatMessage = memo(function ChatMessage({ turn, isLast, busy, ...handlers }: Props) {
  if (turn.role === 'user') {
    return <UserBubble text={turnText(turn)} />;
  }

  const streaming = turn.status === 'streaming';
  let lastTextIdx = -1;
  turn.parts.forEach((p, i) => {
    if (p.type === 'text') lastTextIdx = i;
  });
  const text = stripEntityLinks(turnText(turn));
  const showActions = isLast && turn.status === 'done' && turn.parts.length > 0;
  const canFeedback = showActions && turn.serverHistory === true && !!turn.turnId && !!handlers.onFeedback;

  return (
    <Box component="article" aria-label="Assistant message" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', maxWidth: '100%' }}>
      <AgentSteps steps={turn.steps} running={streaming} progress={streaming ? turn.progress : undefined} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {turn.parts.map((part, i) => (
          <Box key={part.id} sx={{ minWidth: 0 }}>
            <PartView
              part={part}
              isLastText={i === lastTextIdx && i === turn.parts.length - 1}
              streaming={streaming}
              handlers={handlers}
              busy={busy}
              turn={turn}
            />
          </Box>
        ))}
        {streaming && turn.parts.length === 0 && turn.steps.length === 0 ? <TypingDots /> : null}
      </Box>
      {showActions ? (
        <MessageActions
          text={text}
          disabled={busy}
          onRetry={turn.request && handlers.onRetry ? () => handlers.onRetry?.(turn.id) : undefined}
          feedback={
            canFeedback
              ? { value: turn.feedback, onRate: (rating, reason) => handlers.onFeedback?.(turn.id, rating, reason) }
              : undefined
          }
        />
      ) : null}
    </Box>
  );
});
