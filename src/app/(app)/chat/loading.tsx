'use client';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';

const bubbles: Array<{ side: 'left' | 'right'; width: number; height: number }> = [
  { side: 'left', width: 220, height: 56 },
  { side: 'right', width: 180, height: 40 },
  { side: 'left', width: 280, height: 80 },
  { side: 'right', width: 140, height: 40 },
  { side: 'left', width: 200, height: 56 },
];

export default function ChatLoading() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
      }}
    >
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          mx: 'auto',
          width: '100%',
          maxWidth: 760,
          px: { xs: 2, sm: 3 },
          py: 3,
        }}
      >
        {bubbles.map((b, i) => (
          <Box
            key={i}
            sx={{
              alignSelf: b.side === 'right' ? 'flex-end' : 'flex-start',
              width: b.width,
              maxWidth: '85%',
              height: b.height,
              borderRadius: 2,
              bgcolor: (t) =>
                alpha(
                  b.side === 'right' ? t.palette.primary.main : t.palette.text.primary,
                  b.side === 'right' ? 0.18 : 0.08,
                ),
              animation: 'tgSkeletonPulse 1.6s ease-in-out infinite',
              animationDelay: `${i * 90}ms`,
            }}
          />
        ))}
      </Box>
      <Box
        sx={{
          mx: 'auto',
          width: '100%',
          maxWidth: 760,
          px: { xs: 2, sm: 3 },
          pb: { xs: 2, sm: 3 },
        }}
      >
        <Box
          sx={{
            height: 52,
            borderRadius: 999,
            bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
            border: (t) => `1px solid ${t.palette.divider}`,
            animation: 'tgSkeletonPulse 1.8s ease-in-out infinite',
          }}
        />
      </Box>
    </Box>
  );
}
