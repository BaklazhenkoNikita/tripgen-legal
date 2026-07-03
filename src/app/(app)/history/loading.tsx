'use client';

import Box from '@mui/material/Box';
import { skeletonPulseSx } from '@/components/ui/Skeleton';

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
              ...skeletonPulseSx(0.08),
            }}
          />
          <Box
            sx={{
              height: 16,
              width: 320,
              borderRadius: 1,
              ...skeletonPulseSx(0.06),
              animationDelay: '80ms',
            }}
          />
        </Box>
        <Box
          sx={{
            height: 40,
            width: 120,
            borderRadius: 999,
            ...skeletonPulseSx(0.08),
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
              ...skeletonPulseSx(0.06),
              animationDelay: `${i * 80}ms`,
            }}
          />
        ))}
      </Box>
    </Box>
  );
}