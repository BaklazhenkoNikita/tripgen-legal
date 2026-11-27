'use client';

import Box from '@mui/material/Box';
import { CONTAINER_WIDTHS } from '@/components/layout/Section';
import { skeletonPulseSx } from '@/components/ui/Skeleton';

export default function ExploreLoading() {
  return (
    <Box sx={{ width: '100%', mx: 'auto', maxWidth: CONTAINER_WIDTHS.wide, px: { xs: 2, sm: 3 }, py: 4 }}>
      <Box
        sx={{
          height: 40,
          width: 280,
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
      {[1, 2, 3].map((row) => (
        <Box key={row} sx={{ mb: 4 }}>
          <Box
            sx={{
              height: 20,
              width: 180,
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