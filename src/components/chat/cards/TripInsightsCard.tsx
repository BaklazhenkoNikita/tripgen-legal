'use client';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import { AlertTriangle, Info, Stethoscope, Wand2 } from 'lucide-react';
import type { TripInsight } from '@/lib/chat/protocol';
import { CardShell, cardButtonSx } from './CardShell';

/** Trip check-up list. "Fix it" sends the insight's `fix_prompt` as a new
 *  user message. Shared by the `trip_insights` card and the empty state. */
export function TripInsightsList({
  insights,
  onFix,
  disabled,
}: {
  insights: TripInsight[];
  onFix?: (prompt: string) => void;
  disabled?: boolean;
}) {
  return (
    <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
      {insights.map((ins) => {
        const warn = ins.severity === 'warn';
        const Icon = warn ? AlertTriangle : Info;
        return (
          <Box
            component="li"
            key={ins.id}
            sx={(t) => ({
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.25,
              p: 1.25,
              borderRadius: 1.5,
              bgcolor: warn ? alpha(t.palette.warning.main, 0.08) : alpha(t.palette.info.main, 0.06),
            })}
          >
            <Box component="span" sx={{ display: 'inline-flex', pt: 0.25, color: warn ? 'warning.dark' : 'info.main' }}>
              <Icon size={16} aria-hidden />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box component="p" sx={{ m: 0, fontSize: 14, fontWeight: 600 }}>
                {ins.day_number ? `Day ${ins.day_number}: ` : ''}
                {ins.title}
              </Box>
              {ins.detail ? (
                <Box component="p" sx={{ m: 0, mt: 0.25, fontSize: 13, color: 'text.secondary' }}>
                  {ins.detail}
                </Box>
              ) : null}
            </Box>
            {ins.fix_prompt && onFix ? (
              <Box
                component="button"
                type="button"
                disabled={disabled}
                onClick={() => onFix(ins.fix_prompt!)}
                aria-label={`Fix it: ${ins.title}`}
                sx={(t) => ({
                  ...cardButtonSx(t),
                  flexShrink: 0,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  fontSize: 13,
                  px: 1.5,
                  '&:hover:not(:disabled)': { bgcolor: 'primary.dark' },
                })}
              >
                <Wand2 size={14} aria-hidden />
                Fix it
              </Box>
            ) : null}
          </Box>
        );
      })}
    </Box>
  );
}

export function TripInsightsCard({
  insights,
  onFix,
  disabled,
}: {
  insights: TripInsight[];
  onFix?: (prompt: string) => void;
  disabled?: boolean;
}) {
  if (!insights.length) {
    return (
      <CardShell icon={Stethoscope} eyebrow="Trip check-up">
        <Box component="p" sx={{ m: 0, fontSize: 14, color: 'text.secondary' }}>
          Nothing to fix — your plan looks balanced.
        </Box>
      </CardShell>
    );
  }
  return (
    <CardShell icon={Stethoscope} eyebrow="Trip check-up" title={`${insights.length} thing${insights.length === 1 ? '' : 's'} to look at`}>
      <TripInsightsList insights={insights} onFix={onFix} disabled={disabled} />
    </CardShell>
  );
}
