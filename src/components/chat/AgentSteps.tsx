'use client';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import { AlertCircle, Check, ChevronRight, Clock, Loader2 } from 'lucide-react';
import type { AgentStep } from '@/lib/chat/reducer';

interface Props {
  steps: AgentStep[];
  /** Turn still streaming — the timeline stays expanded. */
  running: boolean;
  /** generation_progress message for long actions. */
  progress?: string;
}

function StepIcon({ status }: { status: AgentStep['status'] }) {
  switch (status) {
    case 'running':
      return <Loader2 size={14} aria-hidden className="tg-spin" />;
    case 'failed':
      return <AlertCircle size={14} aria-hidden />;
    case 'deferred':
      return <Clock size={14} aria-hidden />;
    default:
      return <Check size={14} aria-hidden />;
  }
}

/**
 * The agent's tool timeline for one turn. While running it lists each step
 * with its human label ("Checking the weather"); once the turn completes it
 * collapses behind a native <details> summary ("Worked through 3 steps").
 */
export function AgentSteps({ steps, running, progress }: Props) {
  if (!steps.length && !progress) return null;
  const n = steps.length;
  const current = [...steps].reverse().find((s) => s.status === 'running');
  const summary = running
    ? progress || (current ? `${current.label}…` : 'Working…')
    : `Worked through ${n} ${n === 1 ? 'step' : 'steps'}`;

  return (
    <Box
      component="details"
      // Controlled-ish: force open while running; user toggles once done.
      open={running ? true : undefined}
      aria-live={running ? 'polite' : undefined}
      sx={(t) => ({
        mb: 1,
        fontSize: 13,
        color: 'text.secondary',
        '& > summary': {
          listStyle: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          minHeight: 32,
          px: 1,
          ml: -1,
          borderRadius: 1,
          cursor: running ? 'default' : 'pointer',
          userSelect: 'none',
          '&::-webkit-details-marker': { display: 'none' },
          '&:hover': running ? undefined : { bgcolor: 'action.hover' },
          '&:focus-visible': { outline: `2px solid ${t.palette.primary.main}`, outlineOffset: 2 },
        },
        '&[open] > summary .tg-steps-chevron': { transform: 'rotate(90deg)' },
      })}
      onClick={(e) => {
        // Don't let a click collapse the list while steps are still running.
        if (running && (e.target as HTMLElement).closest('summary')) e.preventDefault();
      }}
    >
      <summary>
        {running ? (
          <Box component="span" sx={{ display: 'inline-flex', color: 'primary.main' }}>
            <Loader2 size={14} aria-hidden className="tg-spin" />
          </Box>
        ) : (
          <Box
            component="span"
            className="tg-steps-chevron"
            sx={{ display: 'inline-flex', transition: 'transform 0.15s' }}
          >
            <ChevronRight size={14} aria-hidden />
          </Box>
        )}
        <span>{summary}</span>
      </summary>
      {n > 0 ? (
        <Box
          component="ol"
          sx={(t) => ({
            listStyle: 'none',
            m: 0,
            mt: 0.5,
            pl: 1.25,
            borderLeft: `2px solid ${alpha(t.palette.divider, 1)}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          })}
        >
          {steps.map((s) => (
            <Box
              component="li"
              key={s.callId}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                color:
                  s.status === 'failed'
                    ? 'error.main'
                    : s.status === 'running'
                      ? 'text.primary'
                      : 'text.secondary',
              }}
            >
              <Box
                component="span"
                sx={{
                  display: 'inline-flex',
                  color:
                    s.status === 'completed'
                      ? 'success.main'
                      : s.status === 'running'
                        ? 'primary.main'
                        : 'inherit',
                }}
              >
                <StepIcon status={s.status} />
              </Box>
              <span>
                {s.label}
                {s.status === 'failed' ? ' — failed' : s.status === 'deferred' ? ' — continuing in background' : ''}
              </span>
            </Box>
          ))}
        </Box>
      ) : null}
    </Box>
  );
}
