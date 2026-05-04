'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import { Maximize2 } from 'lucide-react';
import type { FeedItem } from '@/hooks/useHomeFeed';
import { Sheet } from '@/components/ui/Sheet';
import { normalizeFeedItem } from '@/lib/feed/itemAdapter';
import { destinationSlug } from '@/lib/destinationSlug';
import { placeSlugWithId } from '@/lib/placeSlug';
import { PlaceDetailContent } from '@/components/places/PlaceDetailContent';

interface Props {
  item: FeedItem | null;
  city: string | null;
  onClose: () => void;
}

export function FeedItemDrawer({ item, city, onClose }: Props) {
  const detail = useMemo(() => (item ? normalizeFeedItem(item) : null), [item]);

  const fullscreenHref = useMemo(() => {
    if (!detail || detail.isViator || !city) return null;
    const placeSlug = placeSlugWithId(detail.title, detail.id);
    const citySlug = destinationSlug(city);
    if (!placeSlug || !citySlug) return null;
    return `/explore/${citySlug}/${placeSlug}`;
  }, [detail, city]);

  return (
    <Sheet
      open={item !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      side="right"
      size="lg"
    >
      {detail ? (
        <Box sx={{ position: 'relative' }}>
          {fullscreenHref ? (
            <Box
              component={Link}
              href={fullscreenHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open full page"
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                zIndex: 3,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 32,
                width: 32,
                borderRadius: 999,
                bgcolor: (t) => alpha(t.palette.common.black, 0.45),
                color: 'common.white',
                backdropFilter: 'blur(4px)',
                textDecoration: 'none',
                transition: 'background-color 150ms',
                '&:hover': { bgcolor: (t) => alpha(t.palette.common.black, 0.6) },
              }}
            >
              <Maximize2 size={14} />
            </Box>
          ) : null}
          <PlaceDetailContent detail={detail} city={city} layout="drawer" />
        </Box>
      ) : null}
    </Sheet>
  );
}
