'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Maximize2 } from 'lucide-react';
import type { FeedItem } from '@/hooks/useHomeFeed';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { normalizeFeedItem } from '@/lib/feed/itemAdapter';
import { destinationSlug } from '@/lib/destinationSlug';
import { placeSlugWithId } from '@/lib/placeSlug';
import { PlaceDetailContent } from '@/components/places/PlaceDetailContent';
import { PlaceAskPanel, PlaceAskTopActions } from '@/components/chat/PlaceAskPanel';
import type { ChatEntryContext } from '@/components/chat/ChatConversation';

interface Props {
  item: FeedItem | null;
  city: string | null;
  onClose: () => void;
}

export function FeedItemDrawer({ item, city, onClose }: Props) {
  const detail = useMemo(() => (item ? normalizeFeedItem(item) : null), [item]);
  const [view, setView] = useState<'place' | 'ask'>('place');
  // A different place (or closing) always reopens on its details.
  useEffect(() => setView('place'), [detail?.id]);

  // Viator tours aren't in the Periplo catalogue, so there's nothing to ask.
  const askContext = useMemo<ChatEntryContext | null>(
    () =>
      detail && !detail.isViator
        ? {
            entity_id: detail.id,
            entity_type: detail.saveEntityType === 'restaurant' ? 'restaurant' : 'activity',
            entity_name: detail.title,
          }
        : null,
    [detail],
  );

  const fullscreenHref = useMemo(() => {
    if (!detail || detail.isViator || !city) return null;
    const placeSlug = placeSlugWithId(detail.title, detail.id);
    const citySlug = destinationSlug(city);
    if (!placeSlug || !citySlug) return null;
    return `/explore/${citySlug}/${placeSlug}`;
  }, [detail, city]);

  const placeTopAction = fullscreenHref ? (
    <Button asChild variant="secondary" size="sm" iconLeft={<Maximize2 size={14} />}>
      <Link href={fullscreenHref} target="_blank" rel="noopener noreferrer" aria-label="Open full page">
        Open full page
      </Link>
    </Button>
  ) : undefined;
  const topAction =
    view === 'ask' && askContext && detail ? (
      <PlaceAskTopActions placeName={detail.title} context={askContext} onBack={() => setView('place')} />
    ) : (
      placeTopAction
    );

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
      {detail && view === 'ask' && askContext ? (
        <PlaceAskPanel context={askContext} />
      ) : detail ? (
        <PlaceDetailContent
          detail={detail}
          city={city}
          layout="drawer"
          onAsk={askContext ? () => setView('ask') : undefined}
        />
      ) : null}
    </Sheet>
  );
}
