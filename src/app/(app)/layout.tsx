'use client';

import Box from '@mui/material/Box';
import { useClerkTokenInit } from '@/lib/auth/clerk';
import { MaintenanceBanner } from '@/components/common/MaintenanceBanner';
import { useGuestMerge } from '@/hooks/useGuestMerge';
import { useCityBootstrap } from '@/hooks/useCityBootstrap';
import { Navigation } from '@/components/layout/Navigation';
import { CitySwitcherBar } from '@/components/layout/CitySwitcherBar';
import { MobileDock } from '@/components/layout/MobileDock';

function AppBootstrap({ children }: { children: React.ReactNode }) {
  useGuestMerge();
  useCityBootstrap();
  return <>{children}</>;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  useClerkTokenInit();

  return (
    <AppBootstrap>
      <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', bgcolor: 'background.default' }}>
        <MaintenanceBanner />
        <Navigation />
        <CitySwitcherBar />
        <Box
          component="main"
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            pb: { xs: 10, md: 0 },
          }}
        >
          {children}
        </Box>
        <MobileDock />
      </Box>
    </AppBootstrap>
  );
}
