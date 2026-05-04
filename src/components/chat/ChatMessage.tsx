'use client';

import Link from 'next/link';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { alpha } from '@mui/material/styles';
import { Loader2 } from 'lucide-react';
import type { SmartChatMessage } from '@/types';
import { Markdown } from './Markdown';
import { ActionCard } from './cards/ActionCard';
import { SingleSelectCard } from './cards/SingleSelectCard';
import { MultiSelectCard } from './cards/MultiSelectCard';
import { ConfirmCard } from './cards/ConfirmCard';

export interface AnswerPayload {
  optionId?: string;
  freeText?: string;
  selectedIds?: string[];
  /** Human-readable label persisted as the user-message content. */
  label: string;
}

interface Props {
  message: SmartChatMessage;
  onAnswer?: (questionId: string, payload: AnswerPayload) => void;
  onConfirm?: (questionId: string, result: 'confirmed' | 'cancelled', label: string) => void;
  onAction?: (accept: boolean, actionId: string) => void;
}

export function ChatMessage({ message, onAnswer, onConfirm, onAction }: Props) {
  // ── User ─────────────────────────────────────────────────────────────
  if (message.role === 'user') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Paper
          elevation={0}
          sx={{
            maxWidth: '85%',
            borderRadius: 2,
            borderTopRightRadius: 4,
            bgcolor: (t) => alpha(t.palette.primary.main, 0.10),
            color: 'text.primary',
            px: 2,
            py: 1.25,
            fontSize: 14,
          }}
        >
          <Box component="p" sx={{ m: 0, whiteSpace: 'pre-line' }}>
            {message.content}
          </Box>
        </Paper>
      </Box>
    );
  }

  // ── System (navigation / executed result / generic) ──────────────────
  if (message.role === 'system') {
    if (message.messageType === 'navigation' && message.navigation?.screen) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Box
            component={Link}
            href={message.navigation.screen}
            sx={(t) => ({
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              borderRadius: 999,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              px: 1.5,
              py: 0.75,
              fontSize: 12,
              fontWeight: 500,
              color: 'text.primary',
              textDecoration: 'none',
              '&:hover': { bgcolor: t.palette.action.hover },
            })}
          >
            Open {message.navigation.screen} →
          </Box>
        </Box>
      );
    }
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Box
          sx={{
            borderRadius: 999,
            bgcolor: 'action.hover',
            px: 1.5,
            py: 0.5,
            fontSize: 11,
            color: 'text.disabled',
          }}
        >
          {message.content}
        </Box>
      </Box>
    );
  }

  // ── Assistant ────────────────────────────────────────────────────────
  if (message.messageType === 'tool_status') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            borderRadius: 999,
            bgcolor: 'action.hover',
            px: 1.5,
            py: 0.75,
            fontSize: 11,
            fontWeight: 500,
            color: 'text.secondary',
          }}
        >
          <Loader2 size={12} aria-hidden style={{ animation: 'spin 1s linear infinite' }} />
          {message.content || (message.toolName ? `Using ${message.toolName}…` : 'Working…')}
        </Box>
      </Box>
    );
  }

  if (message.messageType === 'action_request' && message.actionRequest) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
        <Box sx={{ width: '100%', maxWidth: '92%' }}>
          <ActionCard
            action={message.actionRequest}
            onConfirm={(id) => onAction?.(true, id)}
            onReject={(id) => onAction?.(false, id)}
          />
        </Box>
      </Box>
    );
  }

  if (message.messageType === 'single_select_question' && message.singleSelectQuestion) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
        <Box sx={{ width: '100%', maxWidth: '92%' }}>
          <SingleSelectCard
            question={message.singleSelectQuestion}
            onAnswer={(id, payload) => onAnswer?.(id, payload)}
          />
        </Box>
      </Box>
    );
  }

  if (message.messageType === 'interactive_question' && message.interactiveQuestion) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
        <Box sx={{ width: '100%', maxWidth: '92%' }}>
          <SingleSelectCard
            question={message.interactiveQuestion}
            onAnswer={(id, payload) => onAnswer?.(id, payload)}
          />
        </Box>
      </Box>
    );
  }

  if (message.messageType === 'multi_select_question' && message.multiSelectQuestion) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
        <Box sx={{ width: '100%', maxWidth: '92%' }}>
          <MultiSelectCard
            question={message.multiSelectQuestion}
            onSubmit={(id, payload) => onAnswer?.(id, payload)}
          />
        </Box>
      </Box>
    );
  }

  if (message.messageType === 'confirm_question' && message.confirmQuestion) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
        <Box sx={{ width: '100%', maxWidth: '92%' }}>
          <ConfirmCard
            question={message.confirmQuestion}
            onAnswer={(id, result, label) => onConfirm?.(id, result, label)}
          />
        </Box>
      </Box>
    );
  }

  // Default: assistant text (markdown).
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
      <Paper
        elevation={0}
        sx={{
          maxWidth: '85%',
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          borderTopLeftRadius: 4,
          px: 2,
          py: 1.25,
          color: 'text.primary',
        }}
      >
        {message.content ? (
          <Markdown>{message.content}</Markdown>
        ) : (
          <Box
            component="span"
            sx={{
              display: 'inline-block',
              height: 8,
              width: 8,
              borderRadius: '50%',
              bgcolor: 'text.disabled',
              animation: 'pulse 1.4s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 0.4 },
                '50%': { opacity: 1 },
              },
            }}
          />
        )}
      </Paper>
    </Box>
  );
}
