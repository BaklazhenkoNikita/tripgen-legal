'use client';

import Box from '@mui/material/Box';
import {
  TRIP_QUICK_ACTIONS,
  getGeneralQuickActions,
  type QuickAction,
} from '@/lib/chat/quickActions';

interface Props {
  city?: string | null;
  hasActiveTrip?: boolean;
  onPick: (prompt: string) => void;
  disabled?: boolean;
  /** Explicit chip set (e.g. place questions) instead of trip/city ones. */
  actions?: QuickAction[];
  /** One scrollable row of smaller chips — above the composer. */
  compact?: boolean;
}

export function QuickActions({ city, hasActiveTrip = false, onPick, disabled, actions: explicit, compact }: Props) {
  const actions: QuickAction[] =
    explicit ?? (hasActiveTrip ? TRIP_QUICK_ACTIONS : getGeneralQuickActions(city ?? ''));

  return (
    <Box
      role={compact ? 'group' : undefined}
      aria-label={compact ? 'Suggested questions' : undefined}
      sx={
        compact
          ? {
              display: 'flex',
              gap: 0.75,
              overflowX: 'auto',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
              maxWidth: 940,
              mx: 'auto',
              width: '100%',
              px: 0.5,
            }
          : {
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              justifyContent: 'center',
              maxWidth: 940,
              mx: 'auto',
              px: 1,
            }
      }
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
            minHeight: 44,
            borderRadius: 999,
            border: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            flexShrink: 0,
            px: compact ? 1.5 : 2,
            fontSize: compact ? 14 : 16,
            lineHeight: 1,
            color: 'text.primary',
            whiteSpace: 'nowrap',
            transition: 'background-color 0.15s, border-color 0.15s',
            '&:hover:not(:disabled)': { bgcolor: 'action.hover' },
            '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
            '&:disabled': { opacity: 0.4, cursor: 'not-allowed' },
          }}
        >
          {a.label}
        </Box>
      ))}
    </Box>
  );
}
