'use client';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import { AlertCircle, Check, CheckCircle2, HelpCircle, XCircle } from 'lucide-react';
import type { ConfirmQuestion } from '@/types';

interface Props {
  question: ConfirmQuestion;
  onAnswer: (questionId: string, result: 'confirmed' | 'cancelled', label: string) => void;
}

export function ConfirmCard({ question, onAnswer }: Props) {
  const Icon = question.destructive ? AlertCircle : HelpCircle;

  if (question.status === 'confirmed' || question.status === 'cancelled') {
    const StatusIcon = question.status === 'confirmed' ? CheckCircle2 : XCircle;
    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          px: 1,
          py: 0.5,
          fontSize: 12,
          color: question.status === 'confirmed' ? 'success.main' : 'text.disabled',
        }}
      >
        <StatusIcon size={14} aria-hidden style={{ flexShrink: 0 }} />
        <Box component="span" sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {question.status === 'confirmed' ? question.prompt : `Cancelled — ${question.prompt}`}
        </Box>
      </Box>
    );
  }

  const confirmLabel = question.confirmLabel ?? (question.destructive ? 'Confirm' : 'Yes');
  const cancelLabel = question.cancelLabel ?? 'Cancel';

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: 1,
        borderColor: 'divider',
        borderLeftWidth: 4,
        borderLeftColor: question.destructive ? 'error.main' : 'primary.main',
        bgcolor: 'background.paper',
        p: 1.75,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Box
          component="span"
          sx={(t) => ({
            display: 'inline-flex',
            width: 32,
            height: 32,
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 999,
            bgcolor: question.destructive
              ? alpha(t.palette.error.main, 0.12)
              : alpha(t.palette.primary.main, 0.12),
            color: question.destructive ? t.palette.error.main : t.palette.primary.main,
          })}
        >
          <Icon size={16} aria-hidden />
        </Box>
        <Box
          component="p"
          sx={{
            flex: 1,
            m: 0,
            fontSize: 14,
            fontWeight: 500,
            color: 'text.primary',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 3,
            overflow: 'hidden',
          }}
        >
          {question.prompt}
        </Box>
      </Box>
      <Box sx={{ mt: 1.5, display: 'flex', gap: 1 }}>
        <Box
          component="button"
          type="button"
          onClick={() => onAnswer(question.questionId, 'cancelled', cancelLabel)}
          sx={(t) => ({
            flex: 1,
            border: 0,
            cursor: 'pointer',
            borderRadius: 999,
            bgcolor: 'action.hover',
            px: 1.5,
            py: 1,
            fontSize: 12,
            fontWeight: 600,
            color: 'text.secondary',
            '&:hover': { bgcolor: t.palette.divider },
          })}
        >
          {cancelLabel}
        </Box>
        <Box
          component="button"
          type="button"
          onClick={() => onAnswer(question.questionId, 'confirmed', confirmLabel)}
          sx={(t) => ({
            flex: 1,
            border: 0,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.75,
            borderRadius: 999,
            px: 1.5,
            py: 1,
            fontSize: 12,
            fontWeight: 600,
            color: question.destructive
              ? t.palette.error.contrastText
              : t.palette.primary.contrastText,
            bgcolor: question.destructive ? t.palette.error.main : t.palette.primary.main,
            '&:hover': {
              bgcolor: question.destructive ? t.palette.error.dark : t.palette.primary.dark,
            },
          })}
        >
          <Check size={14} aria-hidden />
          {confirmLabel}
        </Box>
      </Box>
    </Box>
  );
}
