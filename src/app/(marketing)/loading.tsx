'use client';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';

export default function MarketingLoading() {
  return (
    <Box sx={{ mx: 'auto', maxWidth: 1280, px: { xs: 2, sm: 3 }, py: { xs: 6, sm: 7, md: 8 } }}>
      <Box
        sx={{
          height: 24,
          width: 180,
          mb: 3,
          borderRadius: 999,
          bgcolor: (t) => alpha(t.palette.text.primary, 0.08),
          animation: 'tgSkeletonPulse 1.6s ease-in-out infinite',
        }}
      />
      <Box
        sx={{
          height: 56,
          width: '70%',
          mb: 2,
          borderRadius: 1,
          bgcolor: (t) => alpha(t.palette.text.primary, 0.08),
          animation: 'tgSkeletonPulse 1.6s ease-in-out infinite',
          animationDelay: '60ms',
        }}
      />
      <Box
        sx={{
          height: 16,
          width: '50%',
          mb: 5,
          borderRadius: 1,
          bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
          animation: 'tgSkeletonPulse 1.6s ease-in-out infinite',
          animationDelay: '120ms',
        }}
      />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        {[1, 2, 3].map((i) => (
          <Box
            key={i}
            sx={{
              height: 220,
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
