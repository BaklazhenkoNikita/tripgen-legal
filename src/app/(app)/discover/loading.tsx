'use client';

import Box from '@mui/material/Box';
import { skeletonPulseSx } from '@/components/ui/Skeleton';

export default function DiscoverLoading() {
  return (
    <Box sx={{ mx: 'auto', maxWidth: 896, px: { xs: 2, sm: 3 }, py: 5 }}>
      <Box
        sx={{
          height: 36,
          width: 240,
          mb: 1,
          borderRadius: 1,
          ...skeletonPulseSx(0.08),
        }}
      />
      <Box
        sx={{
          height: 16,
          width: 360,
          mb: 4,
          borderRadius: 1,
          ...skeletonPulseSx(0.06),
          animationDelay: '80ms',
        }}
      />
      <Box
        sx={{
          height: 56,
          mb: 4,
          borderRadius: 999,
          ...skeletonPulseSx(0.06),
        }}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {[1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            sx={{
              height: 96,
              borderRadius: 2,
              ...skeletonPulseSx(0.06),
              animationDelay: `${i * 80}ms`,
            }}
          />
        ))}
      </Box>
    </Box>
  );
}