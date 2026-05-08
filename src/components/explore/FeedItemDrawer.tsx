'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Maximize2 } from 'lucide-react';
import type { FeedItem } from '@/hooks/useHomeFeed';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
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

  const topAction = fullscreenHref ? (
    <Button asChild variant="secondary" size="sm" iconLeft={<Maximize2 size={14} />}>
      <Link href={fullscreenHref} target="_blank" rel="noopener noreferrer" aria-label="Open full page">
        Open full page
      </Link>
    </Button>
  ) : undefined;

  return (
    <Sheet
      open={item !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      side="right"
      size="lg"
      topAction={topAction}
    >
      {detail ? <PlaceDetailContent detail={detail} city={city} layout="drawer" /> : null}
    </Sheet>
  );
}
