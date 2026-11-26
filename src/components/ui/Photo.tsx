'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';
import { Image as ImageIcon, type LucideIcon } from 'lucide-react';
import Box from '@mui/material/Box';
import { isPreOptimizedImage } from '@/lib/imageSource';

type Aspect = '16/9' | '16/10' | '4/3' | '3/2' | '1/1' | '5/4' | '21/9';

export interface PhotoProps extends Omit<ImageProps, 'src' | 'alt' | 'width' | 'height' | 'fill'> {
  src: string | null | undefined;
  alt: string;
  aspect?: Aspect;
  rounded?: 'none' | 'sm' | 'md' | 'lg';
  /** Apply a soft bottom gradient over the image (good when overlaying text). */
  gradient?: boolean;
  /** Gradient intensity. 'strong' is a taller, darker scrim for white text sat
   *  directly on the image (e.g. map cards); default 'soft'. */
  gradientStrength?: 'soft' | 'strong';
  className?: string;
  /** Hover-zoom (used inside cards). */
  zoomOnHover?: boolean;
  /** Sizing hint for next/image (defaults are reasonable for cards). */
  sizes?: string;
  /** Icon on the no-photo placeholder (e.g. the item's category icon). */
  fallbackIcon?: LucideIcon;
}

const radiusMap = { none: 0, sm: 1, md: 1.5, lg: 2 } as const;

export function Photo({
  src,
  alt,
  aspect = '3/2',
  rounded = 'none',
  gradient,
  gradientStrength = 'soft',
  className,
  zoomOnHover,
  sizes = '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw',
  priority,
  fallbackIcon: FallbackIcon = ImageIcon,
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
          unoptimized={isPreOptimizedImage(src)}
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
          aria-hidden
          sx={(t) => ({
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // Deep warm neutral, not brand terracotta: reads as "no photo"
            // rather than an error, and keeps white overlay text legible.
            background: 'linear-gradient(135deg, #4A403A 0%, #6B5D54 100%)',
            ...t.applyStyles('dark', {
              background: 'linear-gradient(135deg, #2A2522 0%, #3A3330 100%)',
            }),
          })}
        >
          <Box sx={{ color: 'common.white', opacity: 0.5, display: 'inline-flex' }}>
            <FallbackIcon size={28} strokeWidth={1.5} aria-hidden />
          </Box>
        </Box>
      )}
      {gradient ? (
        <Box
          sx={(t) => {
            const strong = gradientStrength === 'strong';
            const dark = t.palette.mode === 'dark';
            const base = strong ? (dark ? 0.85 : 0.78) : dark ? 0.72 : 0.45;
            return {
              pointerEvents: 'none',
              position: 'absolute',
              insetInline: 0,
              bottom: 0,
              height: strong ? '68%' : '50%',
              background: strong
                ? `linear-gradient(to top, rgba(0,0,0,${base}), rgba(0,0,0,0.10) 52%, rgba(0,0,0,0) 78%)`
                : `linear-gradient(to top, rgba(0,0,0,${base}), rgba(0,0,0,0) 60%)`,
            };
          }}
        />
      ) : null}
    </Box>
  );
}
