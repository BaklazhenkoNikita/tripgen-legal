'use client';

import Box from '@mui/material/Box';
import { alpha, type Theme } from '@mui/material/styles';
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  HelpCircle,
  ListOrdered,
  Loader2,
  Plane,
  PlusCircle,
  Trash2,
  XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ActionRequest } from '@/types';

interface Props {
  action: ActionRequest;
  onConfirm: (actionId: string) => void;
  onReject: (actionId: string) => void;
}

type Tone = 'accent' | 'success' | 'danger' | 'info';

const ACTION_ICONS: Record<string, LucideIcon> = {
  plan_trip: Plane,
  add_activities: PlusCircle,
  add_day: Calendar,
  delete_activity: Trash2,
  reorganize_activities: ListOrdered,
};

const ACTION_TONES: Record<string, Tone> = {
  plan_trip: 'accent',
  add_activities: 'success',
  add_day: 'success',
  delete_activity: 'danger',
  reorganize_activities: 'info',
};

const CONFIRMED_VERB: Record<string, string> = {
  plan_trip: 'Generating your trip',
  add_activities: 'Adding activities',
  add_day: 'Adding a new day',
  delete_activity: 'Removing activity',
  reorganize_activities: 'Moving activity',
  optimize_trip_order: 'Reorganizing your trip',
  delete_trip: 'Deleting trip',
};

function toneIconBg(tone: Tone) {
  return (t: Theme) => {
    switch (tone) {
      case 'accent':
        return { bgcolor: alpha(t.palette.primary.main, 0.12), color: t.palette.primary.main };
      case 'success':
        return { bgcolor: alpha(t.palette.success.main, 0.12), color: t.palette.success.main };
      case 'danger':
        return { bgcolor: alpha(t.palette.error.main, 0.12), color: t.palette.error.main };
      case 'info':
        return { bgcolor: alpha(t.palette.info.main, 0.12), color: t.palette.info.main };
    }
  };
}

function toneBorderColor(tone: Tone) {
  return (t: Theme) => {
    switch (tone) {
      case 'accent':
        return t.palette.primary.main;
      case 'success':
        return t.palette.success.main;
      case 'danger':
        return t.palette.error.main;
      case 'info':
        return t.palette.info.main;
    }
  };
}

function toneBtn(tone: Tone): { bg: string; hover: string } {
  switch (tone) {
    case 'accent':
      return { bg: 'primary.main', hover: 'primary.dark' };
    case 'success':
      return { bg: 'success.main', hover: 'success.dark' };
    case 'danger':
      return { bg: 'error.main', hover: 'error.dark' };
    case 'info':
      return { bg: 'info.main', hover: 'primary.main' };
  }
}

export function ActionCard({ action, onConfirm, onReject }: Props) {
  const Icon = ACTION_ICONS[action.actionType] ?? HelpCircle;
  const tone = ACTION_TONES[action.actionType] ?? 'accent';

  if (action.status === 'executed' || action.status === 'rejected' || action.status === 'failed') {
    const StatusIcon =
      action.status === 'executed' ? CheckCircle2 : action.status === 'failed' ? AlertCircle : XCircle;
    const color =
      action.status === 'executed' ? 'success.main' : action.status === 'failed' ? 'error.main' : 'text.disabled';
    return (
      <Box
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1, py: 0.5, fontSize: 12, color }}
      >
        <StatusIcon size={14} aria-hidden style={{ flexShrink: 0 }} />
        <Box component="span" sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {action.status === 'executed'
            ? action.description
            : action.status === 'failed'
              ? `Failed — ${action.description}`
              : `Cancelled — ${action.description}`}
        </Box>
      </Box>
    );
  }

  if (action.status === 'confirmed') {
    const verb = CONFIRMED_VERB[action.actionType] ?? 'Working on it';
    return (
      <Box
        sx={{
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
          borderLeftWidth: 4,
          borderLeftColor: toneBorderColor(tone),
          bgcolor: 'background.paper',
          p: 1.75,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Box
            component="span"
            sx={[
              {
                display: 'inline-flex',
                width: 32,
                height: 32,
                flexShrink: 0,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 999,
              },
              toneIconBg(tone),
            ]}
          >
            <Loader2 size={16} aria-hidden style={{ animation: 'spin 1s linear infinite' }} />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Box component="p" sx={{ m: 0, fontSize: 14, fontWeight: 600, color: 'text.primary' }}>
              {verb}…
            </Box>
            <Box
              component="p"
              sx={{
                m: 0,
                mt: 0.25,
                fontSize: 13,
                color: 'text.secondary',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2,
                overflow: 'hidden',
              }}
            >
              {action.description}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  // pending
  const btn = toneBtn(tone);
  return (
    <Box
      sx={{
        borderRadius: 2,
        border: 1,
        borderColor: 'divider',
        borderLeftWidth: 4,
        borderLeftColor: toneBorderColor(tone),
        bgcolor: 'background.paper',
        p: 1.75,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Box
          component="span"
          sx={[
            {
              display: 'inline-flex',
              width: 32,
              height: 32,
              flexShrink: 0,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 999,
            },
            toneIconBg(tone),
          ]}
        >
          <Icon size={16} aria-hidden />
        </Box>
        <Box
          component="p"
          sx={{
            flex: 1,
            m: 0,
            fontSize: 14,
            color: 'text.primary',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            overflow: 'hidden',
          }}
        >
          {action.description}
        </Box>
      </Box>
      <Box sx={{ mt: 1.5, display: 'flex', gap: 1 }}>
        <Box
          component="button"
          type="button"
          onClick={() => onReject(action.actionId)}
          sx={(t) => ({
            flex: 1,
            cursor: 'pointer',
            border: 0,
            borderRadius: 1.5,
            bgcolor: 'action.hover',
            px: 1.5,
            py: 1,
            fontSize: 12,
            fontWeight: 600,
            color: 'text.secondary',
            '&:hover': { bgcolor: t.palette.divider },
          })}
        >
          Cancel
        </Box>
        <Box
          component="button"
          type="button"
          onClick={() => onConfirm(action.actionId)}
          sx={{
            flex: 1,
            cursor: 'pointer',
            border: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.75,
            borderRadius: 1.5,
            px: 1.5,
            py: 1,
            fontSize: 12,
            fontWeight: 600,
            color: 'common.white',
            bgcolor: btn.bg,
            '&:hover': { bgcolor: btn.hover },
          }}
        >
          <Check size={14} aria-hidden />
          Confirm
        </Box>
      </Box>
    </Box>
  );
}
