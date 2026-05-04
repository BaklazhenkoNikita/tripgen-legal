'use client';

import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import { alpha } from '@mui/material/styles';
import { Check, CheckCircle2, MoreHorizontal } from 'lucide-react';
import type { MultiSelectQuestion } from '@/types';

interface Props {
  question: MultiSelectQuestion;
  onSubmit: (
    questionId: string,
    payload: { selectedIds: string[]; freeText?: string; label: string },
  ) => void;
}

export function MultiSelectCard({ question, onSubmit }: Props) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(question.selectedIds ?? []),
  );
  const [free, setFree] = useState(question.selectedFreeText ?? '');

  const min = question.min || 0;
  const max = question.max ?? Infinity;
  const picked = useMemo(() => Array.from(selected), [selected]);
  const total = picked.length + (free.trim() ? 1 : 0);
  const canSubmit = total >= min && total <= max;

  if (question.status === 'answered' || question.status === 'skipped') {
    const labels = (question.selectedIds ?? [])
      .map((id) => question.options.find((o) => o.id === id)?.label ?? id)
      .concat(question.selectedFreeText ? [question.selectedFreeText] : [])
      .join(', ');
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
          {question.prompt}
          {labels ? ` · ${labels}` : ''}
        </Box>
      </Box>
    );
  }

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size + (free.trim() ? 1 : 0) < max) {
        next.add(id);
      }
      return next;
    });
  };

  const submit = () => {
    if (!canSubmit) return;
    const labels = picked
      .map((id) => question.options.find((o) => o.id === id)?.label ?? id)
      .concat(free.trim() ? [free.trim()] : [])
      .join(', ');
    onSubmit(question.questionId, {
      selectedIds: picked,
      freeText: free.trim() || undefined,
      label: labels,
    });
  };

  let hint: string | null = null;
  if (min > 0 && question.max && min === question.max) hint = `Pick exactly ${min}`;
  else if (min > 0 && question.max) hint = `Pick ${min}–${question.max}`;
  else if (min > 0) hint = `Pick at least ${min}`;
  else if (question.max) hint = `Pick up to ${question.max}`;

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
        {question.prompt}
      </Box>
      {hint ? (
        <Box
          component="p"
          sx={{
            m: 0,
            mt: 0.25,
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'text.disabled',
          }}
        >
          {hint}
        </Box>
      ) : null}

      <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {question.options.map((opt) => {
          const isPicked = selected.has(opt.id);
          return (
            <Box
              key={opt.id}
              component="button"
              type="button"
              onClick={() => toggle(opt.id)}
              sx={(t) => ({
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                borderRadius: 999,
                border: 1,
                px: 1.5,
                py: 0.75,
                fontSize: 12,
                fontWeight: 600,
                transition: 'background-color 0.15s, color 0.15s',
                ...(isPicked
                  ? {
                      borderColor: t.palette.primary.main,
                      bgcolor: t.palette.primary.main,
                      color: t.palette.primary.contrastText,
                    }
                  : {
                      borderColor: alpha(t.palette.primary.main, 0.3),
                      bgcolor: alpha(t.palette.primary.main, 0.12),
                      color: t.palette.primary.main,
                      '&:hover': { bgcolor: alpha(t.palette.primary.main, 0.18) },
                    }),
              })}
            >
              {isPicked ? <Check size={12} aria-hidden /> : null}
              {opt.label}
            </Box>
          );
        })}
      </Box>

      {question.allowFreeText ? (
        <InputBase
          value={free}
          onChange={(e) => setFree(e.target.value)}
          placeholder="Or type something…"
          sx={(t) => ({
            mt: 1.5,
            width: '100%',
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
      ) : null}

      <Box
        component="button"
        type="button"
        onClick={submit}
        disabled={!canSubmit}
        sx={{
          mt: 1.5,
          width: '100%',
          cursor: 'pointer',
          border: 0,
          borderRadius: 999,
          bgcolor: 'primary.main',
          px: 1.5,
          py: 1,
          fontSize: 12,
          fontWeight: 600,
          color: 'primary.contrastText',
          '&:hover:not(:disabled)': { bgcolor: 'primary.dark' },
          '&:disabled': {
            cursor: 'not-allowed',
            bgcolor: 'action.hover',
            color: 'text.disabled',
          },
        }}
      >
        Submit{total > 0 ? ` (${total})` : ''}
      </Box>
    </Box>
  );
}
