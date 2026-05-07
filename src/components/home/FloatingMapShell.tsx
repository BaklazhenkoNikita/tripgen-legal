'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import type { MapPinData } from '@/components/map/Map';
import type { FeedItem } from '@/hooks/useHomeFeed';
import { tgShadow } from '@/theme/shadows';
import { HomeMap } from './HomeMap';
import { MapPinCardStrip } from './MapPinCardStrip';

interface Props {
  pins: MapPinData[];
  itemById: Map<string, FeedItem>;
  activePinId: string | null;
  onPinHover: (id: string | null) => void;
  onPinClick: (id: string) => void;
  visible: boolean;
  onClose: () => void;
  clusterThreshold?: number;
}

interface Size {
  width: number;
  height: number;
}

type Direction = 'n' | 'w' | 'nw';

const STORAGE_KEY = 'tg.exploreMap.geom';
const MIN_SIZE = 280;
const VIEWPORT_INSET = 8;
const DEFAULT_MARGIN = 24;
const FULLSCREEN_INSET = 16;

export function FloatingMapShell({
  pins,
  itemById,
  activePinId,
  onPinHover,
  onPinClick,
  visible,
  onClose,
  clusterThreshold,
}: Props) {
  const [size, setSize] = useState<Size | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [previewItemId, setPreviewItemId] = useState<string | null>(null);
  const [focusPin, setFocusPin] = useState<{ lat: number; lng: number } | null>(null);
  const stashedSize = useRef<Size | null>(null);

  // Initialize size on mount (client-only).
  useEffect(() => {
    setSize(initialSize());
  }, []);

  // Persist size whenever it changes (fullscreen reuses the stashed size, so
  // we never overwrite the user's preferred dimensions while fullscreen).
  useEffect(() => {
    if (!size || fullscreen) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(size));
    } catch {
      /* swallow */
    }
  }, [size, fullscreen]);

  // Re-clamp size on viewport resize. The bottom-right anchor is handled by
  // CSS, so no position math is needed here.
  useEffect(() => {
    function onResize() {
      setSize((prev) => (prev ? clampSize(prev) : prev));
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Escape exits fullscreen.
  useEffect(() => {
    if (!fullscreen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      const restored = stashedSize.current;
      setFullscreen(false);
      setSize(restored ? clampSize(restored) : defaultSize());
      setPreviewItemId(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen]);

  const toggleFullscreen = useCallback(() => {
    setFullscreen((prev) => {
      if (!prev) {
        stashedSize.current = size;
        return true;
      }
      const restored = stashedSize.current ?? initialSize();
      setSize(clampSize(restored));
      setPreviewItemId(null);
      return false;
    });
  }, [size]);

  const startResize = useCallback(
    (dir: Direction) =>
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (fullscreen) return;
        if (!size) return;
        e.preventDefault();
        e.stopPropagation();
        const target = e.currentTarget;
        const startX = e.clientX;
        const startY = e.clientY;
        const start: Size = { ...size };
        try {
          target.setPointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }

        const onMove = (ev: PointerEvent) => {
          const dx = ev.clientX - startX;
          const dy = ev.clientY - startY;
          setSize(applyResize(start, dir, dx, dy));
        };
        const onUp = (ev: PointerEvent) => {
          try {
            target.releasePointerCapture(ev.pointerId);
          } catch {
            /* ignore */
          }
          target.removeEventListener('pointermove', onMove);
          target.removeEventListener('pointerup', onUp);
          target.removeEventListener('pointercancel', onUp);
        };
        target.addEventListener('pointermove', onMove);
        target.addEventListener('pointerup', onUp);
        target.addEventListener('pointercancel', onUp);
      },
    [fullscreen, size],
  );

  const handleCardClick = useCallback(
    (id: string) => {
      if (previewItemId === id) {
        onPinClick(id);
        return;
      }
      const item = itemById.get(id);
      if (!item) return;
      const pin = pins.find((p) => p.id === id);
      if (!pin) return;
      setPreviewItemId(id);
      setFocusPin({ lat: pin.lat, lng: pin.lng });
      onPinHover(id);
    },
    [previewItemId, itemById, pins, onPinClick, onPinHover],
  );

  const handlePinClickInternal = useCallback(
    (id: string) => {
      if (!fullscreen) {
        onPinClick(id);
        return;
      }
      // In fullscreen, pin clicks follow the same preview-then-detail pattern
      // as the strip cards.
      handleCardClick(id);
    },
    [fullscreen, onPinClick, handleCardClick],
  );

  const stripItems = useMemo(() => {
    const out: FeedItem[] = [];
    for (const pin of pins) {
      const item = itemById.get(pin.id);
      if (item) out.push(item);
    }
    return out;
  }, [pins, itemById]);

  if (!visible || !size) return null;

  const positionSx = fullscreen
    ? {
        top: FULLSCREEN_INSET,
        left: FULLSCREEN_INSET,
        right: FULLSCREEN_INSET,
        bottom: FULLSCREEN_INSET,
      }
    : {
        right: DEFAULT_MARGIN,
        bottom: DEFAULT_MARGIN,
        width: size.width,
        height: size.height,
      };

  return (
    <Box
      component="aside"
      aria-label="Map of visible items"
      sx={{
        position: 'fixed',
        ...positionSx,
        zIndex: fullscreen ? 1300 : 15,
        display: { xs: 'none', lg: 'block' },
        borderRadius: fullscreen ? 4 : 3,
        boxShadow: (t) => tgShadow(t, 'sheet'),
        transition: fullscreen
          ? 'top 240ms ease, left 240ms ease, right 240ms ease, bottom 240ms ease, width 240ms ease, height 240ms ease, border-radius 240ms ease'
          : undefined,
        '& .tg-resize-corner-affordance': {
          opacity: 0,
          transition: 'opacity 160ms ease',
        },
        '&:hover .tg-resize-corner-affordance': {
          opacity: 0.55,
        },
      }}
    >
      <HomeMap
        pins={pins}
        activePinId={activePinId}
        onPinHover={onPinHover}
        onPinClick={handlePinClickInternal}
        onClose={fullscreen ? undefined : onClose}
        focusPin={focusPin}
        onFullscreenToggle={toggleFullscreen}
        fullscreen={fullscreen}
        clusterThreshold={clusterThreshold}
      />

      {!fullscreen ? (
        <>
          <ResizeEdge dir="n" onPointerDown={startResize('n')} />
          <ResizeEdge dir="w" onPointerDown={startResize('w')} />
          <ResizeCorner onPointerDown={startResize('nw')} />
        </>
      ) : null}

      {fullscreen ? (
        <MapPinCardStrip
          items={stripItems}
          previewItemId={previewItemId}
          activePinId={activePinId}
          onCardClick={handleCardClick}
          onCardHover={onPinHover}
        />
      ) : null}
    </Box>
  );
}

function ResizeEdge({
  dir,
  onPointerDown,
}: {
  dir: 'n' | 'w';
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
}) {
  const cursor = dir === 'n' ? 'ns-resize' : 'ew-resize';
  const sx =
    dir === 'n'
      ? { top: -4, left: 12, right: 12, height: 10 }
      : { left: -4, top: 12, bottom: 12, width: 10 };
  return (
    <Box
      onPointerDown={onPointerDown}
      aria-hidden
      sx={{
        position: 'absolute',
        zIndex: 1200,
        cursor,
        touchAction: 'none',
        ...sx,
      }}
    />
  );
}

function ResizeCorner({
  onPointerDown,
}: {
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
}) {
  return (
    <>
      <Box
        onPointerDown={onPointerDown}
        aria-hidden
        sx={{
          position: 'absolute',
          width: 18,
          height: 18,
          zIndex: 1201,
          cursor: 'nwse-resize',
          touchAction: 'none',
          top: -6,
          left: -6,
        }}
      />
      <Box
        className="tg-resize-corner-affordance"
        aria-hidden
        sx={{
          pointerEvents: 'none',
          position: 'absolute',
          width: 8,
          height: 8,
          borderRadius: 999,
          zIndex: 1100,
          bgcolor: (t) => alpha(t.palette.text.primary, 0.35),
          top: 6,
          left: 6,
        }}
      />
    </>
  );
}

function initialSize(): Size {
  if (typeof window === 'undefined') {
    return { width: MIN_SIZE, height: MIN_SIZE };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Size>;
      if (typeof parsed.width === 'number' && typeof parsed.height === 'number') {
        return clampSize({ width: parsed.width, height: parsed.height });
      }
    }
  } catch {
    /* ignore */
  }
  return defaultSize();
}

function defaultSize(): Size {
  const vw = window.innerWidth;
  const width = Math.max(416, Math.min(624, Math.round(vw * 0.364)));
  return { width, height: width };
}

function clampSize(s: Size): Size {
  if (typeof window === 'undefined') return s;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const maxW = Math.max(MIN_SIZE, vw - VIEWPORT_INSET * 2);
  const maxH = Math.max(MIN_SIZE, vh - VIEWPORT_INSET * 2);
  return {
    width: Math.min(Math.max(MIN_SIZE, s.width), maxW),
    height: Math.min(Math.max(MIN_SIZE, s.height), maxH),
  };
}

function applyResize(start: Size, dir: Direction, dx: number, dy: number): Size {
  let { width, height } = start;
  if (dir.includes('w')) width = start.width - dx;
  if (dir.includes('n')) height = start.height - dy;
  return clampSize({ width, height });
}
