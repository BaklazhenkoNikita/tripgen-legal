'use client';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';

export default function ExploreLoading() {
  return (
    <Box sx={{ mx: 'auto', maxWidth: 1320, px: { xs: 2, sm: 3, lg: 4 }, py: 4 }}>
      <Box
        sx={{
          height: 40,
          width: 280,
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
      {[1, 2, 3].map((row) => (
        <Box key={row} sx={{ mb: 4 }}>
          <Box
            sx={{
              height: 20,
              width: 180,
              mb: 1.5,
              borderRadius: 1,
              bgcolor: (t) => alpha(t.palette.text.primary, 0.08),
              animation: 'tgSkeletonPulse 1.6s ease-in-out infinite',
            }}
          />
          <Box sx={{ display: 'flex', gap: 1.5, overflow: 'hidden' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Box
                key={i}
                sx={{
                  flexShrink: 0,
                  height: 224,
                  width: 288,
                  borderRadius: 2,
                  bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
                  animation: 'tgSkeletonPulse 1.6s ease-in-out infinite',
                  animationDelay: `${i * 80}ms`,
                }}
              />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}