'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import { alpha, type Theme } from '@mui/material/styles';
import { Check, Copy, RotateCcw, ThumbsDown, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';
import type { FeedbackReason } from '@/lib/chat/protocol';
import { minTap } from '@/theme/standards';

const REASONS: Array<{ id: FeedbackReason; label: string }> = [
  { id: 'wrong_info', label: 'Wrong info' },
  { id: 'not_helpful', label: 'Not helpful' },
  { id: 'too_long', label: 'Too long' },
  { id: 'other', label: 'Other' },
];

const iconBtnSx = (active?: boolean) => (t: Theme) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: minTap,
  height: minTap,
  border: 0,
  borderRadius: 999,
  cursor: 'pointer',
  bgcolor: active ? alpha(t.palette.primary.main, 0.12) : 'transparent',
  color: active ? 'primary.main' : 'text.secondary',
  '&:hover:not(:disabled)': { bgcolor: 'action.hover', color: 'text.primary' },
  '&:focus-visible': { outline: `2px solid ${t.palette.primary.main}`, outlineOffset: 0 },
  '&:disabled': { opacity: 0.4, cursor: 'not-allowed' },
});

interface Props {
  text: string;
  onRetry?: () => void;
  /** Present only when the turn is server-owned (hello.server_history). */
  feedback?: {
    value?: 'up' | 'down';
    onRate: (rating: 'up' | 'down', reason?: FeedbackReason) => void;
  };
  disabled?: boolean;
}

/** Copy · Retry · 👍/👎 row under the last assistant turn. */
export function MessageActions({ text, onRetry, feedback, disabled }: Props) {
  const [copied, setCopied] = useState(false);
  const [picking, setPicking] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  };

  return (
    <Box sx={{ mt: 0.5, ml: -1.25 }}>
      <Box role="toolbar" aria-label="Message actions" sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
        {text ? (
          <Box component="button" type="button" onClick={copy} aria-label={copied ? 'Copied' : 'Copy message'} sx={iconBtnSx(copied)}>
            {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
          </Box>
        ) : null}
        {onRetry ? (
          <Box component="button" type="button" onClick={onRetry} disabled={disabled} aria-label="Regenerate response" sx={iconBtnSx()}>
            <RotateCcw size={16} aria-hidden />
          </Box>
        ) : null}
        {feedback ? (
          <>
            <Box
              component="button"
              type="button"
              aria-label="Good response"
              aria-pressed={feedback.value === 'up'}
              onClick={() => {
                setPicking(false);
                if (feedback.value !== 'up') feedback.onRate('up');
              }}
              sx={iconBtnSx(feedback.value === 'up')}
            >
              <ThumbsUp size={16} aria-hidden />
            </Box>
            <Box
              component="button"
              type="button"
              aria-label="Bad response"
              aria-pressed={feedback.value === 'down'}
              aria-expanded={picking}
              onClick={() => setPicking((v) => !v)}
              sx={iconBtnSx(feedback.value === 'down' || picking)}
            >
              <ThumbsDown size={16} aria-hidden />
            </Box>
          </>
        ) : null}
      </Box>
      {picking && feedback ? (
        <Box
          role="group"
          aria-label="What went wrong?"
          sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.75, pl: 1.25, pt: 0.5 }}
        >
          <Box component="span" sx={{ fontSize: 13, color: 'text.secondary', mr: 0.5 }}>
            What went wrong?
          </Box>
          {REASONS.map((r) => (
            <Box
              key={r.id}
              component="button"
              type="button"
              onClick={() => {
                setPicking(false);
                feedback.onRate('down', r.id);
              }}
              sx={(t) => ({
                minHeight: minTap,
                px: 1.5,
                borderRadius: 999,
                border: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
                color: 'text.primary',
                fontFamily: 'inherit',
                fontSize: 13,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
                '&:focus-visible': { outline: `2px solid ${t.palette.primary.main}`, outlineOffset: 2 },
              })}
            >
              {r.label}
            </Box>
          ))}
        </Box>
      ) : null}
    </Box>
  );
}
