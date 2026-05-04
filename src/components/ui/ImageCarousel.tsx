'use client';

import { useCallback, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Box from '@mui/material/Box';
import { Photo } from '@/components/ui/Photo';

type Aspect = '21/9' | '16/9' | '4/3';

interface ImageCarouselProps {
  images: Array<{ url: string }>;
  alt: string;
  aspect?: Aspect;
  sizes?: string;
  gradient?: boolean;
  priority?: boolean;
  onPhotoClick?: (index: number) => void;
}

const SWIPE_THRESHOLD = 40;

export function ImageCarousel({
  images,
  alt,
  aspect = '21/9',
  sizes,
  gradient,
  priority,
  onPhotoClick,
}: ImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const startX = useRef<number | null>(null);

  const total = images.length;
  const hasMany = total > 1;

  const goTo = useCallback(
    (i: number) => {
      if (total === 0) return;
      const wrapped = ((i % total) + total) % total;
      setIndex(wrapped);
    },
    [total],
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!hasMany) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
  };
  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current == null) return;
    const endX = e.changedTouches[0]?.clientX ?? startX.current;
    const delta = endX - startX.current;
    startX.current = null;
    if (!hasMany) return;
    if (delta > SWIPE_THRESHOLD) prev();
    else if (delta < -SWIPE_THRESHOLD) next();
  };
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  const current = images[index];
  const slide = (
    <Photo
      key={index}
      src={current?.url ?? null}
      alt={alt}
      aspect={aspect}
      gradient={gradient}
      sizes={sizes}
      priority={priority && index === 0}
    />
  );

  return (
    <Box
      className="tg-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label={alt}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      sx={{ position: 'relative', outline: 'none' }}
    >
      {onPhotoClick ? (
        <Box
          component="button"
          type="button"
          onClick={() => onPhotoClick(index)}
          aria-label="Open photo"
          sx={{
            display: 'block',
            width: '100%',
            cursor: 'zoom-in',
            border: 0,
            p: 0,
            background: 'transparent',
          }}
        >
          {slide}
        </Box>
      ) : (
        slide
      )}

      {hasMany ? (
        <>
          <Box
            component="button"
            type="button"
            onClick={(e) => { stop(e); prev(); }}
            aria-label="Previous photo"
            sx={navZoneSx('left')}
          >
            <ChevronLeft size={28} aria-hidden />
          </Box>
          <Box
            component="button"
            type="button"
            onClick={(e) => { stop(e); next(); }}
            aria-label="Next photo"
            sx={navZoneSx('right')}
          >
            <ChevronRight size={28} aria-hidden />
          </Box>
          <Box
            sx={{
              pointerEvents: 'none',
              position: 'absolute',
              right: 12,
              top: 12,
              borderRadius: 999,
              bgcolor: 'rgba(0,0,0,0.45)',
              color: '#fff',
              px: 1.25,
              py: 0.5,
              fontSize: 11,
              fontWeight: 500,
              backdropFilter: 'blur(4px)',
              zIndex: 3,
            }}
          >
            {index + 1} / {total}
          </Box>
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              bottom: 16,
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              zIndex: 3,
            }}
          >
            {images.map((_, i) => (
              <Box
                key={i}
                component="button"
                type="button"
                onClick={(e) => { stop(e); goTo(i); }}
                aria-label={`Go to photo ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
                sx={{
                  height: 6,
                  width: i === index ? 20 : 6,
                  borderRadius: 999,
                  border: 0,
                  bgcolor: i === index ? '#fff' : 'rgba(255,255,255,0.55)',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  p: 0,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.85)' },
                }}
              />
            ))}
          </Box>
        </>
      ) : null}
    </Box>
  );
}

function navZoneSx(side: 'left' | 'right') {
  const gradient =
    side === 'left'
      ? 'linear-gradient(90deg, rgba(0,0,0,0.45), rgba(0,0,0,0))'
      : 'linear-gradient(270deg, rgba(0,0,0,0.45), rgba(0,0,0,0))';
  return {
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    [side]: 0,
    width: '30%',
    border: 0,
    p: 0,
    m: 0,
    background: 'transparent',
    cursor: 'pointer',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: side === 'left' ? 'flex-start' : 'flex-end',
    pl: side === 'left' ? 1.5 : 0,
    pr: side === 'right' ? 1.5 : 0,
    zIndex: 2,
    outline: 'none',
    '& > svg': {
      opacity: 0,
      transition: 'opacity 0.2s ease',
      filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.55))',
    },
    '&:hover, &:focus-visible': {
      background: gradient,
    },
    '&:hover > svg, &:focus-visible > svg': { opacity: 1 },
  };
}
