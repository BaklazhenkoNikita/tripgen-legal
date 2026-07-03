'use client';

import Box from '@mui/material/Box';
import { skeletonPulseSx } from '@/components/ui/Skeleton';

export default function ExploreSlugLoading() {
  return (
    <Box sx={{ mx: 'auto', maxWidth: 1320, px: { xs: 2, sm: 3, lg: 4 }, py: 4 }}>
      <Box
        sx={{
          height: 280,
          mb: 4,
          borderRadius: 3,
          ...skeletonPulseSx(0.08),
        }}
      />
      <Box
        sx={{
          height: 36,
          width: 320,
          mb: 1.5,
          borderRadius: 1,
          ...skeletonPulseSx(0.08),
          animationDelay: '80ms',
        }}
      />
      <Box
        sx={{
          height: 16,
          width: 480,
          mb: 4,
          borderRadius: 1,
          ...skeletonPulseSx(0.06),
          animationDelay: '160ms',
        }}
      />
      {[1, 2].map((row) => (
        <Box key={row} sx={{ mb: 4 }}>
          <Box
            sx={{
              height: 20,
              width: 200,
              mb: 1.5,
              borderRadius: 1,
              ...skeletonPulseSx(0.08),
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
                  ...skeletonPulseSx(0.06),
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
