'use client';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import { Sparkles } from 'lucide-react';
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
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        px: 1,
        py: 4,
        textAlign: 'center',
      }}
    >
      <Box
        component="span"
        sx={(t) => ({
          display: 'inline-flex',
          width: 40,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 999,
          bgcolor: alpha(t.palette.primary.main, 0.12),
          color: t.palette.primary.main,
        })}
      >
        <Sparkles size={20} aria-hidden />
      </Box>
      <Box>
        <Box component="p" sx={{ m: 0, fontSize: 16, fontWeight: 600, color: 'text.primary' }}>
          {hasActiveTrip ? 'How can I help with your trip?' : 'Ask me anything about travel'}
        </Box>
        <Box component="p" sx={{ m: 0, mt: 0.5, fontSize: 14, color: 'text.secondary' }}>
          {hasActiveTrip
            ? 'Pick a starter or just type a question.'
            : city
              ? `Quick starters for ${city}.`
              : 'Pick a city to unlock more suggestions.'}
        </Box>
      </Box>
      <Box
        sx={{
          display: 'grid',
          width: '100%',
          gap: 1,
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
        }}
      >
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <Box
              key={a.label}
              component="button"
              type="button"
              onClick={() => onPick(a.prompt)}
              disabled={disabled}
              sx={(t) => ({
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                borderRadius: 2,
                border: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
                px: 1.75,
                py: 1.5,
                textAlign: 'left',
                fontSize: 14,
                color: 'text.primary',
                transition: 'background-color 0.15s, border-color 0.15s',
                '&:hover': {
                  borderColor: t.palette.text.disabled,
                  bgcolor: 'action.hover',
                },
                '&:disabled': { opacity: 0.6, cursor: 'not-allowed' },
              })}
            >
              <Box
                component="span"
                sx={(t) => ({
                  display: 'inline-flex',
                  width: 32,
                  height: 32,
                  flexShrink: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1.5,
                  bgcolor: alpha(t.palette.primary.main, 0.12),
                  color: t.palette.primary.main,
                })}
              >
                <Icon size={16} aria-hidden />
              </Box>
              <Box
                component="span"
                sx={{
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {a.label}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
