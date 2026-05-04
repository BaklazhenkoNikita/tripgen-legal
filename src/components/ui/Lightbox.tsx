'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

interface LightboxProps {
  images: Array<{ url: string }>;
  alt: string;
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
}

export function Lightbox({ images, alt, initialIndex = 0, open, onClose }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (open) setIndex(Math.max(0, Math.min(initialIndex, images.length - 1)));
  }, [open, initialIndex, images.length]);

  const total = images.length;
  const next = useCallback(
    () => setIndex((i) => (i + 1) % Math.max(total, 1)),
    [total],
  );
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + Math.max(total, 1)) % Math.max(total, 1)),
    [total],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, next, prev]);

  if (total === 0) return null;
  const current = images[index];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      aria-label={alt}
      PaperProps={{
        sx: {
          bgcolor: 'rgba(0,0,0,0.92)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
      }}
    >
      <IconButton
        onClick={onClose}
        aria-label="Close"
        sx={{
          position: 'absolute',
          right: 16,
          top: 16,
          zIndex: 2,
          color: '#fff',
          bgcolor: 'rgba(255,255,255,0.10)',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.20)' },
        }}
      >
        <X size={20} aria-hidden />
      </IconButton>

      {total > 1 ? (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2,
            color: '#fff',
            bgcolor: 'rgba(255,255,255,0.10)',
            borderRadius: 999,
            px: 1.5,
            py: 0.5,
            fontSize: 12,
            fontWeight: 500,
            pointerEvents: 'none',
          }}
        >
          {index + 1} / {total}
        </Box>
      ) : null}

      {total > 1 ? (
        <>
          <Box
            component="button"
            type="button"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Previous photo"
            sx={navZoneSx('left')}
          >
            <ChevronLeft size={36} aria-hidden />
          </Box>
          <Box
            component="button"
            type="button"
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Next photo"
            sx={navZoneSx('right')}
          >
            <ChevronRight size={36} aria-hidden />
          </Box>
        </>
      ) : null}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <Box
        component="img"
        key={index}
        src={current?.url}
        alt={alt}
        sx={{ maxHeight: '90vh', maxWidth: '92vw', objectFit: 'contain' }}
        onClick={(e) => e.stopPropagation()}
      />
    </Dialog>
  );
}

function navZoneSx(side: 'left' | 'right') {
  const gradient =
    side === 'left'
      ? 'linear-gradient(90deg, rgba(0,0,0,0.55), rgba(0,0,0,0))'
      : 'linear-gradient(270deg, rgba(0,0,0,0.55), rgba(0,0,0,0))';
  return {
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    [side]: 0,
    width: '50%',
    border: 0,
    p: 0,
    m: 0,
    background: 'transparent',
    cursor: 'pointer',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: side === 'left' ? 'flex-start' : 'flex-end',
    pl: side === 'left' ? 3 : 0,
    pr: side === 'right' ? 3 : 0,
    zIndex: 1,
    outline: 'none',
    '& > svg': {
      opacity: 0,
      transition: 'opacity 0.2s ease',
      filter: 'drop-shadow(0 1px 6px rgba(0,0,0,0.6))',
    },
    '&:hover, &:focus-visible': {
      background: gradient,
    },
    '&:hover > svg, &:focus-visible > svg': { opacity: 1 },
  };
}
