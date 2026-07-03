'use client';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import { skeletonPulseSx } from '@/components/ui/Skeleton';

export default function ProfileLoading() {
  return (
    <Box sx={{ mx: 'auto', maxWidth: 768, px: { xs: 2, sm: 3 }, py: 5 }}>
      <Box
        sx={{
          height: 40,
          width: 160,
          mb: 3,
          borderRadius: 1,
          ...skeletonPulseSx(0.08),
        }}
      />
      <Box
        sx={{
          mb: 2,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2.5,
        }}
      >
        <Box
          sx={{
            height: 64,
            width: 64,
            borderRadius: 999,
            ...skeletonPulseSx(0.08),
          }}
        />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box
            sx={{
              height: 20,
              width: 160,
              borderRadius: 1,
              ...skeletonPulseSx(0.08),
              animationDelay: '80ms',
            }}
          />
          <Box
            sx={{
              height: 16,
              width: 220,
              borderRadius: 1,
              ...skeletonPulseSx(0.06),
              animationDelay: '160ms',
            }}
          />
        </Box>
      </Box>

      {[1, 2, 3].map((i) => (
        <Box
          key={i}
          sx={{
            mb: 2,
            height: 120,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: (t) => alpha(t.palette.text.primary, 0.04),
            animation: 'tgSkeletonPulse 1.6s ease-in-out infinite',
            animationDelay: `${i * 80}ms`,
          }}
        />
      ))}
    </Box>
  );
}