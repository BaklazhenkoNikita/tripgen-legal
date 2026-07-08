'use client';

import { useState } from 'react';
import Image from 'next/image';
import Box from '@mui/material/Box';
import { Grid3x3 } from 'lucide-react';
import { ImageCarousel } from '@/components/ui/ImageCarousel';
import { Lightbox } from '@/components/ui/Lightbox';
import { tgShadow } from '@/theme/shadows';
import { isPreOptimizedImage } from '@/lib/imageSource';

interface Props {
  images: string[];
  alt: string;
}

/** Hero gallery for the fullscreen place page. Desktop: 1 large + 4 small
 *  mosaic, Airbnb-style. Mobile: single carousel. Both open the Lightbox.
 *  Empty / missing tiles show a soft gradient fill that matches the brand. */
export function PlaceGalleryMosaic({ images, alt }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const carouselImages = images.map((url) => ({ url }));
  const tiles = [0, 1, 2, 3, 4].map((i) => images[i] ?? null);

  return (
    <>
      {/* Mobile: carousel */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {images.length > 0 ? (
          <ImageCarousel
            images={carouselImages}
            alt={alt}
            aspect="4/3"
            sizes="100vw"
            priority
            onPhotoClick={(i) => setLightboxIndex(i)}
          />
        ) : (
          <Tile src={null} alt={alt} fillerHint />
        )}
      </Box>

      {/* Desktop: 1 + 4 mosaic */}
      <Box
        sx={{
          position: 'relative',
          display: { xs: 'none', md: 'grid' },
          gap: 1,
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: 'repeat(2, 1fr)',
          aspectRatio: '2 / 1',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Tile
          src={tiles[0]}
          alt={alt}
          priority
          sx={{ gridColumn: '1 / span 2', gridRow: '1 / span 2' }}
          onClick={() => images.length > 0 && setLightboxIndex(0)}
        />
        <Tile
          src={tiles[1]}
          alt={alt}
          sx={{ gridColumn: 3, gridRow: 1 }}
          onClick={() => tiles[1] && setLightboxIndex(1)}
        />
        <Tile
          src={tiles[2]}
          alt={alt}
          sx={{ gridColumn: 4, gridRow: 1 }}
          onClick={() => tiles[2] && setLightboxIndex(2)}
        />
        <Tile
          src={tiles[3]}
          alt={alt}
          sx={{ gridColumn: 3, gridRow: 2 }}
          onClick={() => tiles[3] && setLightboxIndex(3)}
        />
        <Tile
          src={tiles[4]}
          alt={alt}
          sx={{ gridColumn: 4, gridRow: 2 }}
          onClick={() => tiles[4] && setLightboxIndex(4)}
        />

        {images.length > 0 ? (
          <Box
            component="button"
            type="button"
            onClick={() => setLightboxIndex(0)}
            aria-label={`View all ${images.length} photos`}
            sx={{
              position: 'absolute',
              right: 16,
              bottom: 16,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.5,
              py: 1,
              fontSize: 13,
              fontWeight: 500,
              color: 'text.primary',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1.5,
              cursor: 'pointer',
              boxShadow: (t) => tgShadow(t, 'card'),
              transition: 'transform 150ms, box-shadow 150ms',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: (t) => tgShadow(t, 'cardHover'),
              },
            }}
          >
            <Grid3x3 size={16} aria-hidden />
            Show all {images.length} photos
          </Box>
        ) : null}
      </Box>

      <Lightbox
        images={carouselImages}
        alt={alt}
        initialIndex={lightboxIndex ?? 0}
        open={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
      />
    </>
  );
}

function Tile({
  src,
  alt,
  priority,
  sx,
  onClick,
  fillerHint,
}: {
  src: string | null;
  alt: string;
  priority?: boolean;
  sx?: import('@mui/material').BoxProps['sx'];
  onClick?: () => void;
  fillerHint?: boolean;
}) {
  const interactive = !!onClick && !!src;
  return (
    <Box
      component={interactive ? 'button' : 'div'}
      type={interactive ? 'button' : undefined}
      onClick={interactive ? onClick : undefined}
      aria-label={interactive ? 'Open photo' : undefined}
      sx={[
        {
          position: 'relative',
          overflow: 'hidden',
          bgcolor: 'action.hover',
          border: 0,
          p: 0,
          cursor: interactive ? 'zoom-in' : 'default',
          '&:hover img': interactive ? { transform: 'scale(1.02)' } : undefined,
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={priority}
          unoptimized={isPreOptimizedImage(src)}
          style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
        />
      ) : (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: fillerHint
              ? 'linear-gradient(135deg, var(--tg-palette-primary-main) 0%, var(--tg-palette-primary-light) 100%)'
              : 'linear-gradient(135deg, rgb(var(--tg-palette-primary-mainChannel) / 0.18) 0%, rgb(var(--tg-palette-primary-lightChannel) / 0.10) 100%)',
          }}
        />
      )}
    </Box>
  );
}
