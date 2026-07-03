'use client';

import Box from '@mui/material/Box';
import { skeletonPulseSx } from '@/components/ui/Skeleton';

export default function TripDetailLoading() {
  return (
    <Box sx={{ mx: 'auto', maxWidth: 1152, px: { xs: 2, sm: 3 }, py: 3 }}>
      <Box sx={{ mb: 2, height: 16, width: 220 }}>
        <Box
          sx={{
            height: 14,
            width: '100%',
            borderRadius: 1,
            ...skeletonPulseSx(0.08),
          }}
        />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box
          sx={{
            height: 32,
            width: 240,
            borderRadius: 1,
            ...skeletonPulseSx(0.1),
          }}
        />
        <Box
          sx={{
            height: 16,
            width: 320,
            borderRadius: 1,
            ...skeletonPulseSx(0.06),
          }}
        />
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
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
    </Box>
  );
}