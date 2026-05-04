'use client';

import dynamic from 'next/dynamic';
import { Layers, X } from 'lucide-react';
import type { MapPinData } from '@/components/map/Map';
import { Skeleton } from '@/components/ui/Skeleton';
import { CATEGORY_LABELS } from '@/lib/map/categoryColors';
import { tgShadow } from '@/theme/shadows';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';

const LeafletMap = dynamic(() => import('@/components/map/Map'), {
  ssr: false,
  loading: () => (
    <Skeleton style={{ height: '100%', width: '100%', borderRadius: 16 }} />
  ),
});

interface Props {
  pins: MapPinData[];
  activePinId: string | null;
  onPinHover: (id: string | null) => void;
  onPinClick?: (id: string) => void;
  onClose?: () => void;
  focusPin?: { lat: number; lng: number } | null;
  onFullscreenToggle?: () => void;
  fullscreen?: boolean;
}

// Legend keys map to t.palette.category.<key> at render time so the dot color
// auto-switches with the color scheme.
const LEGEND_KEYS = ['exploration', 'activity', 'live_event', 'restaurant', 'viator'] as const;

export function HomeMap({
  pins,
  activePinId,
  onPinHover,
  onPinClick,
  onClose,
  focusPin,
  onFullscreenToggle,
  fullscreen,
}: Props) {
  return (
    <Box
      sx={(t) => ({
        position: 'relative',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        borderRadius: 3,
        bgcolor: 'background.paper',
        boxShadow: tgShadow(t, 'cardHover'),
      })}
    >
      <LeafletMap
        pins={pins}
        activePinId={activePinId}
        onPinHover={onPinHover}
        onPinClick={onPinClick}
        focusPin={focusPin}
        onFullscreenToggle={onFullscreenToggle}
        fullscreen={fullscreen}
      />

      {onClose ? (
        <Box
          component="button"
          type="button"
          onClick={onClose}
          aria-label="Hide map"
          sx={(t) => ({
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 1000,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 999,
            bgcolor: alpha(t.palette.background.paper, 0.92),
            color: 'text.primary',
            boxShadow: tgShadow(t, 'mapOverlay'),
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            transition: 'background-color 150ms',
            '&:hover': { bgcolor: alpha(t.palette.background.paper, 1) },
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: 2,
            },
          })}
        >
          <X size={14} aria-hidden />
        </Box>
      ) : null}

      {pins.length > 0 ? (
        <Box
          sx={(t) => ({
            pointerEvents: 'none',
            position: 'absolute',
            // When the close X is shown it occupies left:12, top:12.
            // Slide the pill to the right of it; otherwise hug the corner.
            left: onClose ? 56 : 12,
            top: 12,
            zIndex: 1000,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            borderRadius: 999,
            bgcolor: alpha(t.palette.background.paper, 0.92),
            px: 1.5,
            py: 0.75,
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: 0.1,
            color: 'text.primary',
            boxShadow: tgShadow(t, 'mapOverlay'),
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          })}
        >
          <Layers size={12} aria-hidden />
          {pins.length} place{pins.length === 1 ? '' : 's'}
        </Box>
      ) : null}

      <Box
        sx={{
          pointerEvents: 'none',
          position: 'absolute',
          bottom: 12,
          left: 12,
          zIndex: 1000,
          display: { xs: 'none', sm: 'flex' },
          flexWrap: 'wrap',
          gap: 0.75,
          maxWidth: 'calc(100% - 80px)',
        }}
      >
        {LEGEND_KEYS.map((key) => (
          <Box
            key={key}
            component="span"
            sx={(t) => ({
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              borderRadius: 999,
              bgcolor: alpha(t.palette.background.paper, 0.92),
              px: 1,
              py: 0.5,
              fontSize: 10,
              fontWeight: 500,
              color: 'text.secondary',
              boxShadow: tgShadow(t, 'mapOverlaySmall'),
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            })}
          >
            <Box
              aria-hidden
              component="span"
              sx={(t) => ({
                display: 'inline-block',
                height: 7,
                width: 7,
                borderRadius: '50%',
                bgcolor: t.palette.category[key],
                boxShadow: `0 0 0 2px ${alpha(t.palette.background.paper, 0.85)}`,
              })}
            />
            {CATEGORY_LABELS[key]}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
