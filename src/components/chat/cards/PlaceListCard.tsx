'use client';

import Link from 'next/link';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import { MapPin, Star } from 'lucide-react';
import { Photo } from '@/components/ui/Photo';
import { entityHref } from '@/lib/chat/links';
import type { PlaceItem } from '@/lib/chat/protocol';
import { radii } from '@/theme/standards';
import { Eyebrow } from './CardShell';
import { AskPeriploIcon } from '../AskPeriploIcon';
import { useChatRender } from '../ChatRenderContext';

const CARD_W = 232;

function PlaceTile({ item, city }: { item: PlaceItem; city?: string | null }) {
  const { href, external } = entityHref(item.entity_type, item.entity_id, item.name, item.city || city);
  const { sendPrompt, busy } = useChatRender();
  // "Ask" follows up on this one place in the same conversation, scoped to it.
  const canAsk = Boolean(sendPrompt && item.entity_id);
  const meta = [
    item.price_label,
    typeof item.rating === 'number' && item.rating > 0 ? `${item.rating.toFixed(1)}★` : null,
  ].filter(Boolean);

  return (
    <Box
      component="li"
      sx={{ position: 'relative', flex: `0 0 ${CARD_W}px`, scrollSnapAlign: 'start', listStyle: 'none', display: 'flex' }}
    >
      {canAsk ? (
        <Box
          component="button"
          type="button"
          disabled={busy}
          onClick={() =>
            sendPrompt?.(`Tell me more about ${item.name}`, {
              entity_id: item.entity_id,
              entity_type: item.entity_type,
              entity_name: item.name,
            })
          }
          aria-label={`Ask Periplo about ${item.name}`}
          sx={(t) => ({
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            minHeight: 32,
            px: 1.25,
            border: 0,
            borderRadius: 999,
            bgcolor: alpha(t.palette.background.paper, 0.92),
            color: 'primary.main',
            boxShadow: t.shadows[2],
            fontFamily: 'inherit',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            // 44px hit area around the 32px pill.
            '&::after': { content: '""', position: 'absolute', inset: -6 },
            '&:hover:not(:disabled)': { bgcolor: t.palette.background.paper },
            '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
            '&:focus-visible': { outline: `2px solid ${t.palette.primary.main}`, outlineOffset: 2 },
          })}
        >
          <AskPeriploIcon size={14} aria-hidden />
          Ask
        </Box>
      ) : null}
      <Box
        component={external ? 'a' : Link}
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        aria-label={`${item.name}${item.category ? `, ${item.category}` : ''}${external ? ' (opens Google Maps)' : ''}`}
        sx={(t) => ({
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          borderRadius: radii.card,
          border: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          overflow: 'hidden',
          color: 'text.primary',
          textDecoration: 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          '&:hover': { borderColor: 'text.disabled', boxShadow: t.shadows[2] },
          '&:focus-visible': { outline: `2px solid ${t.palette.primary.main}`, outlineOffset: 2 },
        })}
      >
        <Photo src={item.photo_url} alt="" aspect="4/3" sizes={`${CARD_W}px`} zoomOnHover />
        <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1 }}>
          {item.category ? (
            <Box
              component="span"
              sx={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'primary.main',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.category}
            </Box>
          ) : null}
          <Box
            component="span"
            sx={{
              fontSize: 15,
              fontWeight: 600,
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
              overflow: 'hidden',
            }}
          >
            {item.name}
          </Box>
          {meta.length ? (
            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: 12, color: 'text.secondary' }}>
              {item.rating ? <Star size={12} aria-hidden /> : null}
              {meta.join(' · ')}
            </Box>
          ) : null}
          {item.description_short ? (
            <Box
              component="span"
              sx={{
                fontSize: 13,
                lineHeight: 1.45,
                color: 'text.secondary',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2,
                overflow: 'hidden',
              }}
            >
              {item.description_short}
            </Box>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}

export function PlaceListCard({
  title,
  items,
  truncated,
  city,
}: {
  title: string;
  items: PlaceItem[];
  truncated?: boolean;
  city?: string | null;
}) {
  return (
    <Box component="section" aria-label={title} sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1, mb: 1 }}>
        <Eyebrow icon={MapPin}>{title}</Eyebrow>
        <Box component="span" sx={{ fontSize: 12, color: 'text.secondary' }}>
          {items.length} {items.length === 1 ? 'place' : 'places'}
          {truncated ? '+' : ''}
        </Box>
      </Box>
      <Box
        component="ul"
        sx={{
          m: 0,
          p: 0,
          pb: 1,
          display: 'flex',
          gap: 1.5,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollPaddingInline: 2,
          overscrollBehaviorX: 'contain',
          // Room for the focus ring.
          px: 0.25,
          pt: 0.25,
        }}
      >
        {items.map((item, i) => (
          <PlaceTile key={item.entity_id ?? `${item.name}-${i}`} item={item} city={city} />
        ))}
      </Box>
    </Box>
  );
}
