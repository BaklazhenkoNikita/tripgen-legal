'use client';

import { useState } from 'react';
import { Map as MapIcon } from 'lucide-react';
import type { MapPinData } from '@/components/map/Map';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { HomeMap } from './HomeMap';
import Box from '@mui/material/Box';
import { tgShadow } from '@/theme/shadows';

interface Props {
  pins: MapPinData[];
  activePinId: string | null;
  onPinHover: (id: string | null) => void;
  onPinClick?: (id: string) => void;
}

/** Mobile-only floating button + bottom sheet wrapping the home map. */
export function MapSheet({ pins, activePinId, onPinHover, onPinClick }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Box
        sx={{
          pointerEvents: 'none',
          position: 'fixed',
          bottom: 80,
          right: 16,
          zIndex: 20,
          display: { xs: 'block', lg: 'none' },
        }}
      >
        <Box
          sx={{
            pointerEvents: 'auto',
            boxShadow: (t) => tgShadow(t, 'sheet'),
            borderRadius: 999,
          }}
        >
          <Button
            onClick={() => setOpen(true)}
            size="md"
            iconLeft={<MapIcon size={16} />}
          >
            Map · {pins.length}
          </Button>
        </Box>
      </Box>

      <Sheet open={open} onOpenChange={setOpen} side="bottom" title="Map">
        <Box sx={{ height: '70dvh', p: 1.5 }}>
          <HomeMap
            pins={pins}
            activePinId={activePinId}
            onPinHover={onPinHover}
            onPinClick={(id) => {
              onPinClick?.(id);
              setOpen(false);
            }}
          />
        </Box>
      </Sheet>
    </>
  );
}
