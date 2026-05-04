'use client';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { alpha, type Theme } from '@mui/material/styles';
import { Clock, MapPin, Sparkles, Star } from 'lucide-react';
import type { TravelActivity } from '@/types';
import { getActivityImageUrl } from '@/hooks/useActivityPhotos';
import { Photo } from '@/components/ui/Photo';
import { Badge } from '@/components/ui/Badge';
import { tgShadow } from '@/theme/shadows';

interface Props {
  activity: TravelActivity;
  photoMap?: Record<string, string>;
  onClick?: () => void;
}

export function ActivityCard({ activity, photoMap, onClick }: Props) {
  const imageUrl = getActivityImageUrl(activity, photoMap);
  const primaryCategory = activity.category?.[0];
  const secondarySubtitle =
    activity.category && activity.category.length > 1
      ? activity.category.slice(0, 3).join(' · ')
      : null;
  const subtitle = secondarySubtitle ?? activity.time_of_visit ?? null;
  const subtitleIsTime = !secondarySubtitle && !!activity.time_of_visit;

  return (
    <ButtonBase
      type="button"
      onClick={onClick}
      sx={{
        position: 'relative',
        display: 'block',
        width: '100%',
        overflow: 'hidden',
        borderRadius: 2,
        textAlign: 'left',
        transition: 'all 0.2s ease',
        boxShadow: (t: Theme) => tgShadow(t, 'card'),
        '&:hover': {
          boxShadow: (t: Theme) => tgShadow(t, 'cardHover'),
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Photo
        src={imageUrl ?? null}
        alt={activity.name}
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
        <Badge tone="activity" size="sm" iconLeft={<MapPin size={12} />}>
          {primaryCategory ?? 'Activity'}
        </Badge>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
          {activity.must_see ? (
            <Badge tone="warning" size="sm" iconLeft={<Sparkles size={12} />}>
              Must
            </Badge>
          ) : null}
          {activity.duration ? (
            <Badge
              tone="neutral"
              size="sm"
              iconLeft={<Clock size={12} />}
              style={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {activity.duration}
            </Badge>
          ) : null}
        </Box>
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
            {activity.name}
          </Typography>
          {subtitle ? (
            <Typography
              sx={{
                mt: 0.25,
                fontSize: 12,
                color: (t) => alpha(t.palette.common.white, 0.88),
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 1,
                overflow: 'hidden',
                textTransform: subtitleIsTime ? 'capitalize' : 'none',
                textShadow: '0 1px 2px rgba(0,0,0,0.45)',
              }}
            >
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {typeof activity.rating === 'number' ? (
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
            <Star size={12} fill="#FF9500" stroke="#FF9500" aria-hidden />
            {activity.rating.toFixed(1)}
          </Box>
        ) : null}
      </Box>
    </ButtonBase>
  );
}
