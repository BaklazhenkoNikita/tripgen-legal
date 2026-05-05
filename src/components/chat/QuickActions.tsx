'use client';

import Box from '@mui/material/Box';
import {
  TRIP_QUICK_ACTIONS,
  getGeneralQuickActions,
  type QuickAction,
} from '@/lib/chat/quickActions';

interface Props {
  city?: string | null;
  hasActiveTrip: boolean;
  onPick: (prompt: string) => void;
  disabled?: boolean;
}

export function QuickActions({ city, hasActiveTrip, onPick, disabled }: Props) {
  const actions: QuickAction[] = hasActiveTrip
    ? TRIP_QUICK_ACTIONS
    : getGeneralQuickActions(city ?? '');

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        justifyContent: 'center',
        maxWidth: 940,
        mx: 'auto',
        px: 1,
      }}
    >
      {actions.map((a) => (
        <Box
          key={a.label}
          component="button"
          type="button"
          onClick={() => onPick(a.prompt)}
          disabled={disabled}
          sx={{
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            height: 38,
            borderRadius: 999,
            border: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            px: 2,
            fontSize: 16,
            lineHeight: 1,
            color: 'text.primary',
            whiteSpace: 'nowrap',
            transition: 'background-color 0.15s, border-color 0.15s',
            '&:hover:not(:disabled)': { bgcolor: 'action.hover' },
            '&:disabled': { opacity: 0.4, cursor: 'not-allowed' },
          }}
        >
          {a.label}
        </Box>
      ))}
    </Box>
  );
}
