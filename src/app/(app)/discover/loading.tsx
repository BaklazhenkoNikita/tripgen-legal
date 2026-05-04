'use client';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';

export default function DiscoverLoading() {
  return (
    <Box sx={{ mx: 'auto', maxWidth: 896, px: { xs: 2, sm: 3 }, py: 5 }}>
      <Box
        sx={{
          height: 36,
          width: 240,
          mb: 1,
          borderRadius: 1,
          bgcolor: (t) => alpha(t.palette.text.primary, 0.08),
          animation: 'tgSkeletonPulse 1.6s ease-in-out infinite',
        }}
      />
      <Box
        sx={{
          height: 16,
          width: 360,
          mb: 4,
          borderRadius: 1,
          bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
          animation: 'tgSkeletonPulse 1.6s ease-in-out infinite',
          animationDelay: '80ms',
        }}
      />
      <Box
        sx={{
          height: 56,
          mb: 4,
          borderRadius: 999,
          bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
          animation: 'tgSkeletonPulse 1.6s ease-in-out infinite',
        }}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {[1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            sx={{
              height: 96,
              borderRadius: 2,
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