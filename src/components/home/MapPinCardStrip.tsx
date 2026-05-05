'use client';

import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ChevronRight } from 'lucide-react';
import { alpha } from '@mui/material/styles';
import type { FeedItem } from '@/hooks/useHomeFeed';
import { Photo } from '@/components/ui/Photo';
import { Badge } from '@/components/ui/Badge';
import { tgShadow } from '@/theme/shadows';
import { cardId } from './FeedCard';

interface Props {
  items: FeedItem[];
  previewItemId: string | null;
  activePinId: string | null;
  onCardClick: (id: string) => void;
  onCardHover: (id: string | null) => void;
}

const COMPACT_WIDTH = 320;
const PREVIEW_WIDTH = 480;

export function MapPinCardStrip({
  items,
  previewItemId,
  activePinId,
  onCardClick,
  onCardHover,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // When the preview card changes, scroll it into view.
  useEffect(() => {
    if (!previewItemId) return;
    const node = cardRefs.current.get(previewItemId);
    if (!node) return;
    node.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [previewItemId]);

  if (items.length === 0) return null;

  return (
    <Box
      ref={scrollerRef}
      sx={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 16,
        zIndex: 1100,
        display: 'flex',
        gap: 1.5,
        overflowX: 'auto',
        overflowY: 'hidden',
        px: 1,
        py: 1.25,
        scrollSnapType: 'x mandatory',
        scrollPaddingLeft: 16,
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
      onWheel={(e) => {
        // Translate vertical scroll into horizontal for trackpad users.
        if (e.deltaY !== 0 && e.deltaX === 0 && scrollerRef.current) {
          scrollerRef.current.scrollLeft += e.deltaY;
        }
      }}
    >
      {items.map((item) => {
        const id = cardId(item);
        const isPreview = previewItemId === id;
        const isActive = activePinId === id;
        return (
          <StripCard
            key={id}
            item={item}
            isPreview={isPreview}
            isActive={isActive}
            registerRef={(node) => {
              if (node) cardRefs.current.set(id, node);
              else cardRefs.current.delete(id);
            }}
            onClick={() => onCardClick(id)}
            onHover={onCardHover}
          />
        );
      })}
    </Box>
  );
}

interface CardProps {
  item: FeedItem;
  isPreview: boolean;
  isActive: boolean;
  registerRef: (node: HTMLDivElement | null) => void;
  onClick: () => void;
  onHover: (id: string | null) => void;
}

function StripCard({
  item,
  isPreview,
  isActive,
  registerRef,
  onClick,
  onHover,
}: CardProps) {
  const id = cardId(item);
  const title = cardTitle(item);
  const image = firstImage(item);
  const subtitle = cardSubtitle(item);
  const tone = entityTone(item.entity_type);
  const width = isPreview ? PREVIEW_WIDTH : COMPACT_WIDTH;

  return (
    <Box
      ref={registerRef}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      sx={{
        flexShrink: 0,
        scrollSnapAlign: 'center',
        position: 'relative',
        width,
        height: isPreview ? 270 : 190,
        cursor: 'pointer',
        overflow: 'hidden',
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: (t) =>
          isActive || isPreview
            ? `0 0 0 2px ${t.palette.primary.main}, 0 8px 24px ${alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.36 : 0.18)}`
            : tgShadow(t, 'card'),
        transform: isPreview ? 'translateY(-4px)' : 'none',
        transition:
          'width 220ms ease, height 220ms ease, transform 220ms ease, box-shadow 200ms ease',
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: 2,
        },
      }}
    >
      <Photo
        src={image}
        alt={title}
        aspect={isPreview ? '16/9' : '16/9'}
        gradient
        sizes={`${width}px`}
      />
      {tone ? (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
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
      ) : null}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          px: 1.5,
          py: 1.25,
          color: 'common.white',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.25,
        }}
      >
        <Typography
          component="h4"
          sx={{
            fontSize: isPreview ? 16 : 14,
            fontWeight: 600,
            lineHeight: 1.25,
            color: 'common.white',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          }}
        >
          {title}
        </Typography>
        {subtitle ? (
          <Typography
            sx={{
              fontSize: 12,
              color: (t) => alpha(t.palette.common.white, 0.88),
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            }}
          >
            {subtitle}
          </Typography>
        ) : null}
        {isPreview ? (
          <Box
            sx={{
              mt: 0.75,
              alignSelf: 'flex-start',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              borderRadius: 999,
              bgcolor: (t) => alpha(t.palette.background.paper, 0.92),
              color: 'text.primary',
              px: 1.25,
              py: 0.5,
              fontSize: 12,
              fontWeight: 500,
              backdropFilter: 'blur(6px)',
            }}
          >
            View details
            <ChevronRight size={12} aria-hidden />
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}

function cardTitle(item: FeedItem): string {
  return (
    (item.item.title as string | undefined) ??
    (item.item.name as string | undefined) ??
    'Untitled'
  );
}

function firstImage(item: FeedItem): string | null {
  const images = item.item.images as Array<{ url?: string | null }> | undefined;
  if (!images?.length) return null;
  return images[0]?.url ?? null;
}

function cardSubtitle(item: FeedItem): string | null {
  if (item.entity_type === 'restaurant') {
    const cuisines = item.item.cuisine_type as string[] | undefined;
    if (cuisines?.length) return cuisines.slice(0, 2).join(' · ');
  }
  if (item.entity_type === 'live_event') {
    const venue = item.item.venue as { name?: string } | undefined;
    if (venue?.name) return venue.name;
  }
  const cats = item.item.primary_categories as string[] | undefined;
  if (cats?.length) return cats[0];
  if (typeof item.item.category === 'string') return item.item.category as string;
  return null;
}

function entityTone(t: FeedItem['entity_type']) {
  switch (t) {
    case 'activity':
      return 'activity' as const;
    case 'restaurant':
      return 'restaurant' as const;
    case 'live_event':
      return 'event' as const;
    case 'exploration':
      return 'exploration' as const;
    case 'viator':
      return 'viator' as const;
    default:
      return null;
  }
}

function entityLabel(t: FeedItem['entity_type']): string {
  switch (t) {
    case 'activity':
      return 'Activity';
    case 'restaurant':
      return 'Food';
    case 'live_event':
      return 'Event';
    case 'exploration':
      return 'Spot';
    case 'viator':
      return 'Tour';
    default:
      return 'Item';
  }
}
