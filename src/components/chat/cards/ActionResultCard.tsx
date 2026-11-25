'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, Minus, Pencil, Plus, Undo2 } from 'lucide-react';
import type { ActionDiff, ActionResult } from '@/lib/chat/protocol';
import { cardButtonSx } from './CardShell';
import { radii } from '@/theme/standards';

function useSecondsLeft(expiresAt?: string): number {
  const target = expiresAt ? Date.parse(expiresAt) : NaN;
  const calc = () => (Number.isNaN(target) ? 0 : Math.max(0, Math.ceil((target - Date.now()) / 1000)));
  const [left, setLeft] = useState(calc);
  useEffect(() => {
    if (Number.isNaN(target)) return;
    setLeft(calc());
    const id = window.setInterval(() => {
      const next = calc();
      setLeft(next);
      if (next <= 0) window.clearInterval(id);
    }, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return left;
}

function fmtCountdown(sec: number): string {
  if (sec >= 60) return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
  return `${sec}s`;
}

type Row = { key: string; icon: typeof Plus; tone: 'success' | 'error' | 'info' | 'warning'; text: string };

function diffRows(diff?: ActionDiff): Row[] {
  if (!diff) return [];
  const rows: Row[] = [];
  const day = (n?: number) => (typeof n === 'number' ? ` · Day ${n}` : '');
  diff.added?.forEach((a, i) => rows.push({ key: `a${i}`, icon: Plus, tone: 'success', text: `${a.name}${day(a.day_number)}` }));
  diff.removed?.forEach((r, i) => rows.push({ key: `r${i}`, icon: Minus, tone: 'error', text: `${r.name}${day(r.day_number)}` }));
  diff.moved?.forEach((m, i) =>
    rows.push({
      key: `m${i}`,
      icon: ArrowRight,
      tone: 'info',
      text: `${m.name}: Day ${m.from_day ?? '?'} → Day ${m.to_day ?? '?'}`,
    }),
  );
  diff.changed?.forEach((c, i) =>
    rows.push({
      key: `c${i}`,
      icon: Pencil,
      tone: 'warning',
      text: `${c.name}${day(c.day_number)}${c.field ? ` — ${c.field}${c.to ? ` → ${c.to}` : ''}` : ''}`,
    }),
  );
  return rows;
}

const DIFF_CAP = 8;

/** Result of an executed trip edit: status, compact diff, and a timed Undo. */
export function ActionResultCard({
  result,
  fallbackDescription,
  onUndo,
}: {
  result: ActionResult;
  fallbackDescription?: string;
  onUndo?: (actionId: string, token: string) => void;
}) {
  const secondsLeft = useSecondsLeft(result.undoExpiresAt);
  const [expanded, setExpanded] = useState(false);
  const rows = diffRows(result.diff);
  const shown = expanded ? rows : rows.slice(0, DIFF_CAP);
  const undo = result.undo;
  const canUndo =
    result.success && !!result.undoToken && secondsLeft > 0 && (!undo || undo.status === 'failed') && !!onUndo;
  const undone = undo?.status === 'done';
  const title = result.success
    ? undone
      ? 'Change undone'
      : result.message || fallbackDescription || 'Done'
    : result.message || result.error || 'That change failed';

  return (
    <Box
      role="status"
      sx={(t) => ({
        borderRadius: radii.card,
        border: 1,
        borderColor: 'divider',
        borderLeftWidth: 4,
        borderLeftColor: !result.success ? t.palette.error.main : undone ? t.palette.text.disabled : t.palette.success.main,
        bgcolor: 'background.paper',
        p: 1.75,
      })}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
        <Box
          component="span"
          sx={{ display: 'inline-flex', pt: 0.25, color: !result.success ? 'error.main' : undone ? 'text.disabled' : 'success.main' }}
        >
          {result.success ? <CheckCircle2 size={18} aria-hidden /> : <AlertCircle size={18} aria-hidden />}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            component="p"
            sx={{ m: 0, fontSize: 14, fontWeight: 600, textDecoration: undone ? 'line-through' : 'none', color: undone ? 'text.secondary' : 'text.primary' }}
          >
            {title}
          </Box>
          {undo?.message && undo.status !== 'pending' ? (
            <Box component="p" sx={{ m: 0, mt: 0.25, fontSize: 13, color: undo.status === 'failed' ? 'error.main' : 'text.secondary' }}>
              {undo.message}
            </Box>
          ) : null}
        </Box>
        {canUndo || undo?.status === 'pending' ? (
          <Box
            component="button"
            type="button"
            disabled={undo?.status === 'pending'}
            onClick={() => result.undoToken && onUndo?.(result.actionId, result.undoToken)}
            aria-label={`Undo this change (${secondsLeft} seconds left)`}
            sx={(t) => ({
              ...cardButtonSx(t),
              flexShrink: 0,
              fontSize: 13,
              px: 1.5,
              bgcolor: alpha(t.palette.primary.main, 0.1),
              color: 'primary.main',
              '&:hover:not(:disabled)': { bgcolor: alpha(t.palette.primary.main, 0.18) },
            })}
          >
            {undo?.status === 'pending' ? <Loader2 size={14} aria-hidden className="tg-spin" /> : <Undo2 size={14} aria-hidden />}
            Undo
            {undo?.status !== 'pending' ? (
              <Box component="span" aria-hidden sx={{ fontWeight: 500, fontVariantNumeric: 'tabular-nums', opacity: 0.75 }}>
                {fmtCountdown(secondsLeft)}
              </Box>
            ) : null}
          </Box>
        ) : null}
      </Box>

      {rows.length && !undone ? (
        <Box component="ul" aria-label="Changes" sx={{ listStyle: 'none', m: 0, mt: 1.25, p: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {shown.map((r) => {
            const Icon = r.icon;
            return (
              <Box component="li" key={r.key} sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 13 }}>
                <Box
                  component="span"
                  sx={(t) => ({
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 20,
                    height: 20,
                    borderRadius: 999,
                    flexShrink: 0,
                    bgcolor: alpha(t.palette[r.tone].main, 0.12),
                    color: t.palette[r.tone].main,
                  })}
                >
                  <Icon size={12} aria-hidden />
                </Box>
                <Box component="span" sx={{ minWidth: 0 }}>{r.text}</Box>
              </Box>
            );
          })}
          {rows.length > DIFF_CAP && !expanded ? (
            <Box component="li">
              <Box
                component="button"
                type="button"
                onClick={() => setExpanded(true)}
                sx={(t) => ({ ...cardButtonSx(t), px: 0, bgcolor: 'transparent', color: 'primary.main', fontSize: 13 })}
              >
                Show {rows.length - DIFF_CAP} more
              </Box>
            </Box>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
}
