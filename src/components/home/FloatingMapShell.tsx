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
}

interface Geom {
  top: number;
  left: number;
  width: number;
  height: number;
}

type Direction = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

const STORAGE_KEY = 'tg.exploreMap.geom';
const MIN_SIZE = 280;
const VIEWPORT_INSET = 8;
const DEFAULT_MARGIN = 24;

export function FloatingMapShell({
  pins,
  itemById,
  activePinId,
  onPinHover,
  onPinClick,
  visible,
  onClose,
}: Props) {
  const [geom, setGeom] = useState<Geom | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [previewItemId, setPreviewItemId] = useState<string | null>(null);
  const [focusPin, setFocusPin] = useState<{ lat: number; lng: number } | null>(null);
  const stashedGeom = useRef<Geom | null>(null);

  // Initialize geometry on mount (client-only).
  useEffect(() => {
    setGeom(initialGeom());
  }, []);

  // Persist geometry (only when not fullscreen — we don't want fullscreen
  // dimensions overwriting the user's resized layout).
  useEffect(() => {
    if (!geom || fullscreen) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(geom));
    } catch {
      /* swallow */
    }
  }, [geom, fullscreen]);

  // Re-clamp geometry on viewport resize.
  useEffect(() => {
    function onResize() {
      setGeom((prev) => {
        if (!prev) return prev;
        if (fullscreen) return fullscreenGeom();
        return clampGeom(prev);
      });
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [fullscreen]);

  // Escape exits fullscreen.
  useEffect(() => {
    if (!fullscreen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      const restored = stashedGeom.current;
      setFullscreen(false);
      setGeom(restored ? clampGeom(restored) : defaultGeom());
      setPreviewItemId(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen]);

  const toggleFullscreen = useCallback(() => {
    setFullscreen((prev) => {
      if (!prev) {
        stashedGeom.current = geom;
        setGeom(fullscreenGeom());
        return true;
      }
      const restored = stashedGeom.current ?? initialGeom();
      setGeom(clampGeom(restored));
      setPreviewItemId(null);
      return false;
    });
  }, [geom]);

  const startResize = useCallback(
    (dir: Direction) =>
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (fullscreen) return;
        if (!geom) return;
        e.preventDefault();
        e.stopPropagation();
        const target = e.currentTarget;
        const startX = e.clientX;
        const startY = e.clientY;
        const start: Geom = { ...geom };
        try {
          target.setPointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }

        const onMove = (ev: PointerEvent) => {
          const dx = ev.clientX - startX;
          const dy = ev.clientY - startY;
          setGeom(applyResize(start, dir, dx, dy));
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
    [fullscreen, geom],
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

  if (!visible || !geom) return null;

  return (
    <Box
      component="aside"
      aria-label="Map of visible items"
      sx={{
        position: 'fixed',
        top: geom.top,
        left: geom.left,
        width: geom.width,
        height: geom.height,
        zIndex: fullscreen ? 1300 : 15,
        display: { xs: 'none', lg: 'block' },
        borderRadius: fullscreen ? 4 : 3,
        boxShadow: (t) => tgShadow(t, 'sheet'),
        transition: fullscreen
          ? 'top 240ms ease, left 240ms ease, width 240ms ease, height 240ms ease, border-radius 240ms ease'
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
      />

      {!fullscreen ? (
        <>
          <ResizeEdge dir="n" onPointerDown={startResize('n')} />
          <ResizeEdge dir="s" onPointerDown={startResize('s')} />
          <ResizeEdge dir="e" onPointerDown={startResize('e')} />
          <ResizeEdge dir="w" onPointerDown={startResize('w')} />
          <ResizeCorner dir="nw" onPointerDown={startResize('nw')} />
          <ResizeCorner dir="ne" onPointerDown={startResize('ne')} />
          <ResizeCorner dir="sw" onPointerDown={startResize('sw')} />
          <ResizeCorner dir="se" onPointerDown={startResize('se')} />
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
  dir: 'n' | 's' | 'e' | 'w';
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
}) {
  const cursor =
    dir === 'n' || dir === 's' ? 'ns-resize' : 'ew-resize';
  const sx =
    dir === 'n'
      ? { top: -4, left: 12, right: 12, height: 10 }
      : dir === 's'
      ? { bottom: -4, left: 12, right: 12, height: 10 }
      : dir === 'e'
      ? { right: -4, top: 12, bottom: 12, width: 10 }
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
  dir,
  onPointerDown,
}: {
  dir: 'nw' | 'ne' | 'sw' | 'se';
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
}) {
  const cursor =
    dir === 'nw' || dir === 'se' ? 'nwse-resize' : 'nesw-resize';
  const cornerSx =
    dir === 'nw'
      ? { top: -6, left: -6 }
      : dir === 'ne'
      ? { top: -6, right: -6 }
      : dir === 'sw'
      ? { bottom: -6, left: -6 }
      : { bottom: -6, right: -6 };
  // Visual affordance position (a small dot inside the corner of the shell).
  const dotSx =
    dir === 'nw'
      ? { top: 6, left: 6 }
      : dir === 'ne'
      ? { top: 6, right: 6 }
      : dir === 'sw'
      ? { bottom: 6, left: 6 }
      : { bottom: 6, right: 6 };
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
          cursor,
          touchAction: 'none',
          ...cornerSx,
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
          ...dotSx,
        }}
      />
    </>
  );
}

function initialGeom(): Geom {
  if (typeof window === 'undefined') {
    return { top: 0, left: 0, width: MIN_SIZE, height: MIN_SIZE };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Geom>;
      if (
        typeof parsed.top === 'number' &&
        typeof parsed.left === 'number' &&
        typeof parsed.width === 'number' &&
        typeof parsed.height === 'number'
      ) {
        return clampGeom(parsed as Geom);
      }
    }
  } catch {
    /* ignore */
  }
  return defaultGeom();
}

function defaultGeom(): Geom {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.max(320, Math.min(480, Math.round(vw * 0.28)));
  const height = width;
  return {
    width,
    height,
    top: vh - height - DEFAULT_MARGIN,
    left: vw - width - DEFAULT_MARGIN,
  };
}

function fullscreenGeom(): Geom {
  if (typeof window === 'undefined') {
    return { top: 0, left: 0, width: MIN_SIZE, height: MIN_SIZE };
  }
  return {
    top: 16,
    left: 16,
    width: window.innerWidth - 32,
    height: window.innerHeight - 32,
  };
}

function clampGeom(g: Geom): Geom {
  if (typeof window === 'undefined') return g;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const maxW = Math.max(MIN_SIZE, vw - VIEWPORT_INSET * 2);
  const maxH = Math.max(MIN_SIZE, vh - VIEWPORT_INSET * 2);
  const width = Math.min(Math.max(MIN_SIZE, g.width), maxW);
  const height = Math.min(Math.max(MIN_SIZE, g.height), maxH);
  const left = Math.min(Math.max(VIEWPORT_INSET, g.left), vw - width - VIEWPORT_INSET);
  const top = Math.min(Math.max(VIEWPORT_INSET, g.top), vh - height - VIEWPORT_INSET);
  return { top, left, width, height };
}

function applyResize(start: Geom, dir: Direction, dx: number, dy: number): Geom {
  let { top, left, width, height } = start;

  if (dir.includes('e')) {
    width = start.width + dx;
  }
  if (dir.includes('w')) {
    width = start.width - dx;
    left = start.left + dx;
  }
  if (dir.includes('s')) {
    height = start.height + dy;
  }
  if (dir.includes('n')) {
    height = start.height - dy;
    top = start.top + dy;
  }

  // Enforce minimum size first, adjusting top/left when growing from N/W edges.
  if (width < MIN_SIZE) {
    if (dir.includes('w')) {
      left = start.left + (start.width - MIN_SIZE);
    }
    width = MIN_SIZE;
  }
  if (height < MIN_SIZE) {
    if (dir.includes('n')) {
      top = start.top + (start.height - MIN_SIZE);
    }
    height = MIN_SIZE;
  }

  return clampGeom({ top, left, width, height });
}
