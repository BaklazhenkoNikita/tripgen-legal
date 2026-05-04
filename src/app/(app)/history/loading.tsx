'use client';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';

export default function HistoryLoading() {
  return (
    <Box sx={{ mx: 'auto', maxWidth: 896, px: { xs: 2, sm: 3 }, py: 5 }}>
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Box>
          <Box
            sx={{
              height: 40,
              width: 200,
              mb: 1,
              borderRadius: 1,
              bgcolor: (t) => alpha(t.palette.text.primary, 0.08),
              animation: 'tgSkeletonPulse 1.6s ease-in-out infinite',
            }}
          />
          <Box
            sx={{
              height: 16,
              width: 320,
              borderRadius: 1,
              bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
              animation: 'tgSkeletonPulse 1.6s ease-in-out infinite',
              animationDelay: '80ms',
            }}
          />
        </Box>
        <Box
          sx={{
            height: 40,
            width: 120,
            borderRadius: 999,
            bgcolor: (t) => alpha(t.palette.text.primary, 0.08),
            animation: 'tgSkeletonPulse 1.6s ease-in-out infinite',
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Box
            key={i}
            sx={{
              height: 96,
              borderRadius: 1.5,
              bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
              animation: 'tgSkeletonPulse 1.6s ease-in-out infinite',
              animationDelay: `${i * 80}ms`,
            }}
          />
        ))}
      </Box>
    </Box>
  );
}