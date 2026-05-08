'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import Box from '@mui/material/Box';

type Aspect = '16/9' | '16/10' | '4/3' | '3/2' | '1/1' | '5/4' | '21/9';

export interface PhotoProps extends Omit<ImageProps, 'src' | 'alt' | 'width' | 'height' | 'fill'> {
  src: string | null | undefined;
  alt: string;
  aspect?: Aspect;
  rounded?: 'none' | 'sm' | 'md' | 'lg';
  /** Apply a soft bottom gradient over the image (good when overlaying text). */
  gradient?: boolean;
  className?: string;
  /** Hover-zoom (used inside cards). */
  zoomOnHover?: boolean;
  /** Sizing hint for next/image (defaults are reasonable for cards). */
  sizes?: string;
}

const radiusMap = { none: 0, sm: 1, md: 1.5, lg: 2 } as const;

export function Photo({
  src,
  alt,
  aspect = '3/2',
  rounded = 'none',
  gradient,
  className,
  zoomOnHover,
  sizes = '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw',
  priority,
  ...rest
}: PhotoProps) {
  const [errored, setErrored] = useState(false);
  const showImage = !!src && !errored;
  const radius = radiusMap[rounded];

  return (
    <Box
      className={className}
      sx={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        bgcolor: 'action.hover',
        borderRadius: radius,
        aspectRatio: aspect,
        '&:hover img.zoomable': zoomOnHover
          ? { transform: 'scale(1.05)' }
          : undefined,
      }}
    >
      {showImage ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setErrored(true)}
          className={zoomOnHover ? 'zoomable' : undefined}
          style={{
            objectFit: 'cover',
            transition: zoomOnHover ? 'transform 0.5s ease' : undefined,
          }}
          {...rest}
        />
      ) : (
        <Box
          sx={(t) => ({
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            color: 'text.disabled',
            background:
              t.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${t.palette.primary.dark} 0%, ${t.palette.primary.main} 100%)`
                : `linear-gradient(135deg, ${t.palette.primary.main} 0%, ${t.palette.primary.light} 100%)`,
          })}
        >
          <Box sx={{ color: 'common.white', opacity: 0.85, display: 'inline-flex' }}>
            <ImageOff size={20} aria-hidden />
          </Box>
        </Box>
      )}
      {gradient ? (
        <Box
          sx={(t) => ({
            pointerEvents: 'none',
            position: 'absolute',
            insetInline: 0,
            bottom: 0,
            height: '50%',
            background:
              t.palette.mode === 'dark'
                ? 'linear-gradient(to top, rgba(0,0,0,0.72), rgba(0,0,0,0) 60%)'
                : 'linear-gradient(to top, rgba(0,0,0,0.45), rgba(0,0,0,0) 60%)',
          })}
        />
      ) : null}
    </Box>
  );
}
