'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import { alpha } from '@mui/material/styles';
import { CheckCircle2, MoreHorizontal } from 'lucide-react';
import type { SingleSelectQuestion, InteractiveQuestion } from '@/types';

interface Props {
  question: SingleSelectQuestion | InteractiveQuestion;
  onAnswer: (questionId: string, payload: { optionId?: string; freeText?: string; label: string }) => void;
}

function isLegacy(q: SingleSelectQuestion | InteractiveQuestion): q is InteractiveQuestion {
  return (q as InteractiveQuestion).question !== undefined;
}

export function SingleSelectCard({ question, onAnswer }: Props) {
  const prompt = isLegacy(question) ? question.question : question.prompt;
  const allowFree = isLegacy(question) ? question.allowCustom : question.allowFreeText;
  const [showCustom, setShowCustom] = useState(false);
  const [custom, setCustom] = useState('');

  if (question.status === 'answered' || question.status === 'skipped') {
    const label = isLegacy(question)
      ? question.selectedAnswer
      : (question.options.find((o) => o.id === question.selectedId)?.label ?? question.selectedFreeText);
    const Icon = question.status === 'answered' ? CheckCircle2 : MoreHorizontal;
    const answered = question.status === 'answered';
    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          px: 1,
          py: 0.5,
          fontSize: 12,
          color: answered ? 'text.primary' : 'text.disabled',
          opacity: answered ? 1 : 0.6,
        }}
      >
        <Box
          component="span"
          sx={(t) => ({
            flexShrink: 0,
            display: 'inline-flex',
            color: answered ? t.palette.primary.main : 'inherit',
          })}
        >
          <Icon size={14} aria-hidden />
        </Box>
        <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {prompt}
          {label ? ` · ${label}` : ''}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        p: 1.75,
      }}
    >
      <Box component="p" sx={{ m: 0, fontSize: 14, fontWeight: 500, color: 'text.primary' }}>
        {prompt}
      </Box>
      <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {question.options.map((opt) => (
          <Box
            key={opt.id}
            component="button"
            type="button"
            onClick={() => onAnswer(question.questionId, { optionId: opt.id, label: opt.label })}
            sx={(t) => ({
              cursor: 'pointer',
              borderRadius: 999,
              border: 1,
              borderColor: alpha(t.palette.primary.main, 0.3),
              bgcolor: alpha(t.palette.primary.main, 0.12),
              px: 1.5,
              py: 0.75,
              fontSize: 12,
              fontWeight: 600,
              color: t.palette.primary.main,
              '&:hover': { bgcolor: t.palette.primary.main, color: t.palette.primary.contrastText },
            })}
          >
            {opt.label}
          </Box>
        ))}
        {allowFree ? (
          <Box
            component="button"
            type="button"
            onClick={() => setShowCustom((v) => !v)}
            sx={(t) => ({
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              borderRadius: 999,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'action.hover',
              px: 1.5,
              py: 0.75,
              fontSize: 12,
              fontWeight: 500,
              color: 'text.secondary',
              '&:hover': { bgcolor: t.palette.divider },
            })}
          >
            Other…
          </Box>
        ) : null}
      </Box>
      {showCustom && allowFree ? (
        <Box
          component="form"
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            const trimmed = custom.trim();
            if (!trimmed) return;
            onAnswer(question.questionId, { freeText: trimmed, label: trimmed });
            setCustom('');
            setShowCustom(false);
          }}
          sx={{ mt: 1.5, display: 'flex', gap: 1 }}
        >
          <InputBase
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Type your answer…"
            autoFocus
            sx={(t) => ({
              flex: 1,
              borderRadius: 1.5,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'action.hover',
              px: 1.5,
              py: 1,
              fontSize: 12,
              color: 'text.primary',
              '& input::placeholder': { color: t.palette.text.disabled, opacity: 1 },
              '&.Mui-focused': { borderColor: t.palette.primary.main },
            })}
          />
          <Box
            component="button"
            type="submit"
            disabled={!custom.trim()}
            sx={{
              cursor: 'pointer',
              border: 0,
              borderRadius: 1.5,
              bgcolor: 'primary.main',
              px: 1.5,
              py: 1,
              fontSize: 12,
              fontWeight: 600,
              color: 'primary.contrastText',
              '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
              '&:hover:not(:disabled)': { bgcolor: 'primary.dark' },
            }}
          >
            Send
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}
