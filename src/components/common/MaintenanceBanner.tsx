'use client';

import { AlertTriangle } from 'lucide-react';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import { useFeatureConfig } from '@/hooks/useFeatureConfig';

export function MaintenanceBanner() {
  const { data } = useFeatureConfig();
  if (!data) return null;

  const message = data.maintenance_message;
  const allDown = data.disable_all_ai;
  const chatDown = data.disable_chat;
  const tripGenDown = data.disable_trip_generation;

  const activeText =
    message ??
    (allDown
      ? 'Periplo is temporarily unavailable while we investigate an issue.'
      : chatDown && tripGenDown
      ? 'Chat and trip generation are paused for maintenance.'
      : chatDown
      ? 'Chat is paused for maintenance.'
      : tripGenDown
      ? 'Trip generation is paused for maintenance.'
      : null);

  if (!activeText) return null;

  return (
    <Box
      role="status"
      sx={{
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        borderBottom: '1px solid',
        borderColor: (t) => alpha(t.palette.warning.main, 0.3),
        bgcolor: (t) => alpha(t.palette.warning.main, 0.14),
        px: 2,
        py: 1,
        textAlign: 'center',
        fontSize: 14,
        color: 'warning.main',
      }}
    >
      <AlertTriangle size={16} aria-hidden style={{ flexShrink: 0 }} />
      {activeText}
    </Box>
  );
}
