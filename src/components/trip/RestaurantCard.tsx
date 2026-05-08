'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha, type Theme } from '@mui/material/styles';
import { Utensils, Star } from 'lucide-react';
import type { Restaurant } from '@/types';
import { Photo } from '@/components/ui/Photo';
import { Badge } from '@/components/ui/Badge';
import { tgShadow } from '@/theme/shadows';
import { getRestaurantImageUrl } from '@/hooks/useActivityPhotos';

interface Props {
  restaurant: Restaurant;
  photoMap?: Record<string, string>;
}

export function RestaurantCard({ restaurant: r, photoMap }: Props) {
  const image = getRestaurantImageUrl(r, photoMap);
  const cuisines = r.cuisine_type?.length
    ? r.cuisine_type.slice(0, 3).join(' · ')
    : null;

  return (
    <Box
      component="article"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 2,
        transition: 'all 0.2s ease',
        boxShadow: (t: Theme) => tgShadow(t, 'card'),
        '&:hover': {
          boxShadow: (t: Theme) => tgShadow(t, 'cardHover'),
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Photo
        src={image}
        alt={r.name}
        aspect="3/2"
        zoomOnHover
        gradient
        sizes="(max-width: 640px) 100vw, 50vw"
      />
      <Box
        sx={{
          pointerEvents: 'none',
          position: 'absolute',
          insetInline: 12,
          top: 12,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Badge tone="restaurant" size="sm" iconLeft={<Utensils size={12} />}>
          Food
        </Badge>
        {r.price_range ? (
          <Badge
            tone="neutral"
            size="sm"
            style={{
              backgroundColor: 'rgb(var(--tg-palette-background-paperChannel) / 0.92)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {r.price_range}
          </Badge>
        ) : null}
      </Box>
      <Box
        sx={{
          pointerEvents: 'none',
          position: 'absolute',
          insetInline: 0,
          bottom: 0,
          px: 1.75,
          py: 1.5,
          color: 'common.white',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            component="h4"
            sx={{
              fontWeight: 600,
              lineHeight: 1.25,
              color: 'common.white',
              fontSize: 15,
              m: 0,
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 1,
              overflow: 'hidden',
              textShadow: '0 1px 2px rgba(0,0,0,0.45)',
            }}
          >
            {r.name}
          </Typography>
          {cuisines ? (
            <Typography
              sx={{
                mt: 0.25,
                fontSize: 12,
                color: (t) => alpha(t.palette.common.white, 0.88),
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 1,
                overflow: 'hidden',
                textShadow: '0 1px 2px rgba(0,0,0,0.45)',
              }}
            >
              {cuisines}
            </Typography>
          ) : null}
        </Box>
        {typeof r.rating === 'number' ? (
          <Box
            component="span"
            sx={{
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.25,
              fontSize: 12,
              fontWeight: 600,
              color: 'common.white',
              textShadow: '0 1px 2px rgba(0,0,0,0.45)',
            }}
          >
            <Box sx={{ color: 'warning.main', display: 'inline-flex' }}>
              <Star size={12} fill="currentColor" stroke="currentColor" aria-hidden />
            </Box>
            {r.rating.toFixed(1)}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
