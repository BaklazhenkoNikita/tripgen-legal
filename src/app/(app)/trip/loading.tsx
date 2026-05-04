'use client';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';

export default function TripLoading() {
  return (
    <Box sx={{ pt: { xs: 5, sm: 8 }, pb: { xs: 5, sm: 8 } }}>
      <Box sx={{ mx: 'auto', maxWidth: 1120, px: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            mx: 'auto',
            maxWidth: 768,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              height: 40,
              borderRadius: 1.5,
              bgcolor: (t) => alpha(t.palette.text.primary, 0.08),
              animation: 'tgSkeletonPulse 1.6s ease-in-out infinite',
            }}
          />
          <Box
            sx={{
              height: 220,
              borderRadius: 2,
              bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
              animation: 'tgSkeletonPulse 1.6s ease-in-out infinite',
              animationDelay: '80ms',
            }}
          />
          <Box
            sx={{
              height: 48,
              width: 200,
              borderRadius: 999,
              bgcolor: (t) => alpha(t.palette.text.primary, 0.08),
              animation: 'tgSkeletonPulse 1.6s ease-in-out infinite',
              animationDelay: '160ms',
            }}
          />
        </Box>
      </Box>
      <Box sx={{ mt: { xs: 5, sm: 7 }, mx: 'auto', maxWidth: 1320, px: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            mx: 'auto',
            mb: 2.5,
            height: 12,
            width: 220,
            borderRadius: 1,
            bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
            animation: 'tgSkeletonPulse 1.6s ease-in-out infinite',
          }}
        />
        <Box sx={{ display: 'flex', gap: 1.5, overflow: 'hidden' }}>
          {[1, 2, 3, 4].map((i) => (
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
    </Box>
  );
}