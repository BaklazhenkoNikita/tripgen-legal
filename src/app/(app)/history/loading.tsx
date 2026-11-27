'use client';

import Box from '@mui/material/Box';
import { skeletonPulseSx } from '@/components/ui/Skeleton';
import { PageContainer } from '@/components/layout/PageContainer';
import { HISTORY_PAGE_PY, TRIP_GRID_SX } from './tripGrid';

export default function HistoryLoading() {
  return (
    <PageContainer width="wide" sx={{ py: HISTORY_PAGE_PY }}>
      <Box
        sx={{
          mb: { xs: 4, md: 5 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 3,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ height: 40, width: 200, borderRadius: 1, ...skeletonPulseSx(0.08) }} />
          <Box
            sx={{ height: 16, width: 320, maxWidth: '70vw', borderRadius: 1, ...skeletonPulseSx(0.06), animationDelay: '80ms' }}
          />
        </Box>
        <Box sx={{ height: 40, width: 120, borderRadius: 999, ...skeletonPulseSx(0.08) }} />
      </Box>

      <Box sx={{ height: 14, width: 120, mb: 2, borderRadius: 1, ...skeletonPulseSx(0.06) }} />
      <Box sx={TRIP_GRID_SX}>
        {[1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            sx={{ aspectRatio: '1 / 1', borderRadius: 2, ...skeletonPulseSx(0.06), animationDelay: `${i * 80}ms` }}
          />
        ))}
      </Box>
    </PageContainer>
  );
}
