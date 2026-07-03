'use client';

import { forwardRef, type KeyboardEvent, type MouseEvent } from 'react';
import { Heart, Star } from 'lucide-react';
import type { FeedItem } from '@/hooks/useHomeFeed';
import { useShortlistAdd, useShortlistRemove, useShortlistIds } from '@/hooks/useShortlist';
import { emitSignal } from '@/hooks/useSignals';
import type { EntityType } from '@/types';
import { Photo } from '@/components/ui/Photo';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { tgShadow } from '@/theme/shadows';
import { photoTextShadow, radii } from '@/theme/standards';

interface Props {
  item: FeedItem;
  onHover?: (id: string | null) => void;
  isActive?: boolean;
  onClick?: () => void;
  /** 'rail' = fixed 288px (horizontal scroll rows). 'grid' = fluid 100% (vertical grids). */
  variant?: 'rail' | 'grid';
}

function mapEntityType(t: FeedItem['entity_type']): EntityType | null {
  if (t === 'activity') return 'activity';
  if (t === 'restaurant') return 'restaurant';
  if (t === 'live_event') return 'live_event';
  return null;
}

export const FeedCard = forwardRef<HTMLDivElement, Props>(function FeedCard(
  { item, onHover, isActive, onClick, variant = 'rail' },
  ref,
) {
  const title = cardTitle(item);
  const imageUrl = firstImage(item);
  const meta = cardMetaParts(item);
  const id = cardId(item);
  const tone = entityTone(item.entity_type);

  const shortlistIds = useShortlistIds();
  const isSaved = shortlistIds.has(id);
  const addShortlist = useShortlistAdd();
  const removeShortlist = useShortlistRemove();
  const shortlistEntity = mapEntityType(item.entity_type);

  const toggleShortlist = (e: MouseEvent) => {
    e.stopPropagation();
    if (!shortlistEntity) return;
    if (isSaved) {
      removeShortlist.mutate(id);
      void emitSignal({ signal_type: 'dislike', entity_id: id, entity_type: shortlistEntity, screen: 'home' });
    } else {
      addShortlist.mutate({ entity_id: id, entity_type: shortlistEntity, city: item.item.city });
      void emitSignal({ signal_type: 'like', entity_id: id, entity_type: shortlistEntity, screen: 'home' });
    }
  };

  const eventDate = item.entity_type === 'live_event' && item.item.event_datetime
    ? formatEventDate(item.item.event_datetime as string)
    : null;

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const overlaySubtitle = composeOverlaySubtitle(item, eventDate, meta);

  return (
    <Box
      ref={ref}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : -1}
      onClick={onClick}
      onKeyDown={onKey}
      onMouseEnter={() => onHover?.(id)}
      onMouseLeave={() => onHover?.(null)}
      sx={{
        position: 'relative',
        display: 'block',
        width: variant === 'grid' ? '100%' : 288,
        flexShrink: variant === 'grid' ? 1 : 0,
        cursor: 'pointer',
        overflow: 'hidden',
        borderRadius: radii.card,
        textAlign: 'left',
        boxShadow: (t) =>
          isActive
            ? `0 0 0 2px ${t.palette.primary.main}, 0 6px 20px ${alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.32 : 0.16)}`
            : tgShadow(t, 'card'),
        transform: isActive ? 'scale(1.01)' : 'none',
        transition: 'transform 200ms, box-shadow 200ms',
        '&:hover': {
          boxShadow: (t) =>
            `0 6px 20px ${alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.32 : 0.16)}`,
          transform: isActive ? 'scale(1.01)' : 'translateY(-1px)',
        },
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: 2,
        },
      }}
    >
      <Photo
        src={imageUrl}
        alt={title}
        aspect="3/2"
        zoomOnHover
        gradient
        sizes={variant === 'grid' ? '(max-width: 600px) 100vw, 320px' : '288px'}
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
        {tone ? (
          <Box
            component="span"
            sx={{
              pointerEvents: 'auto',
              display: 'inline-flex',
              bgcolor: (t) => alpha(t.palette.background.paper, 0.95),
              borderRadius: 999,
              backdropFilter: 'blur(6px)',
            }}
          >
            <Badge tone={tone} size="sm">
              {entityLabel(item.entity_type)}
            </Badge>
          </Box>
        ) : (
          <Box component="span" />
        )}
        {shortlistEntity ? (
          <Tooltip content={isSaved ? 'Remove from saved' : 'Save'}>
            <IconButton
              aria-pressed={isSaved}
              aria-label={isSaved ? 'Remove from saved' : 'Save'}
              onClick={toggleShortlist}
              size="small"
              sx={{
                pointerEvents: 'auto',
                height: 32,
                width: 32,
                borderRadius: '50%',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: (t) => alpha(t.palette.background.paper, 0.95),
                backdropFilter: 'blur(6px)',
                boxShadow: (t) => tgShadow(t, 'card'),
                color: isSaved ? 'primary.main' : 'text.secondary',
                '&:hover': {
                  bgcolor: 'background.paper',
                  color: 'primary.main',
                },
              }}
            >
              <Heart
                size={16}
                aria-hidden
                fill={isSaved ? 'currentColor' : 'none'}
              />
            </IconButton>
          </Tooltip>
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
              fontSize: 15,
              fontWeight: 600,
              lineHeight: 1.25,
              color: 'common.white',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textShadow: photoTextShadow,
            }}
          >
            {title}
          </Typography>
          {overlaySubtitle ? (
            <Typography
              sx={{
                mt: 0.25,
                fontSize: 12,
                color: (t) => alpha(t.palette.common.white, 0.88),
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textShadow: photoTextShadow,
              }}
            >
              {overlaySubtitle}
            </Typography>
          ) : null}
        </Box>
        {typeof meta?.rating === 'number' ? (
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
              textShadow: photoTextShadow,
            }}
          >
            <Box sx={{ color: 'warning.main', display: 'inline-flex' }}>
              <Star size={12} fill="currentColor" stroke="currentColor" aria-hidden />
            </Box>
            {meta.rating.toFixed(1)}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
});

function composeOverlaySubtitle(
  item: FeedItem,
  eventDate: string | null,
  meta: MetaParts | null,
): string | null {
  if (item.entity_type === 'restaurant') {
    const cuisines = item.item.cuisine_type as string[] | undefined;
    if (cuisines?.length) return cuisines.slice(0, 3).join(' · ');
  }
  if (item.entity_type === 'live_event') {
    const venue = item.item.venue as { name?: string } | undefined;
    const parts: string[] = [];
    if (eventDate) parts.push(eventDate);
    if (venue?.name) parts.push(venue.name);
    if (parts.length) return parts.join(' · ');
  }
  const parts: string[] = [];
  if (meta?.duration) parts.push(meta.duration);
  if (meta?.cost) parts.push(meta.cost);
  return parts.length ? parts.join(' · ') : null;
}

export function cardId(item: FeedItem): string {
  const inner = item?.item;
  if (!inner) return `feed-item-${Math.random().toString(36).slice(2, 10)}`;
  return (
    (inner._id as string | undefined) ??
    (inner.name as string | undefined) ??
    JSON.stringify(inner).slice(0, 32)
  );
}

function cardTitle(item: FeedItem): string {
  return (
    (item.item.title as string | undefined) ??
    (item.item.name as string | undefined) ??
    'Untitled'
  );
}

interface MetaParts {
  duration?: string;
  cost?: string;
  rating?: number;
}

function cardMetaParts(item: FeedItem): MetaParts | null {
  const parts: MetaParts = {};
  if (item.item.duration) parts.duration = item.item.duration as string;
  if (item.item.cost) parts.cost = item.item.cost as string;
  else if (item.item.price_range) parts.cost = item.item.price_range as string;
  if (typeof item.item.rating === 'number') parts.rating = item.item.rating as number;
  return parts.duration || parts.cost || parts.rating !== undefined ? parts : null;
}

function firstImage(item: FeedItem): string | null {
  const images = item.item.images as Array<{ url?: string | null }> | undefined;
  if (!images?.length) return null;
  const url = images[0]?.url;
  return url ?? null;
}

function entityTone(t: FeedItem['entity_type']) {
  switch (t) {
    case 'activity': return 'activity' as const;
    case 'restaurant': return 'restaurant' as const;
    case 'live_event': return 'event' as const;
    case 'exploration': return 'exploration' as const;
    case 'viator': return 'viator' as const;
    default: return null;
  }
}

function entityLabel(t: FeedItem['entity_type']): string {
  switch (t) {
    case 'activity': return 'Activity';
    case 'restaurant': return 'Food';
    case 'live_event': return 'Event';
    case 'exploration': return 'Spot';
    case 'viator': return 'Tour';
    default: return 'Item';
  }
}

function formatEventDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}
