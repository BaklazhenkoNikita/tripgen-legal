'use client';

import type { FeedItem } from '@/hooks/useHomeFeed';
import { useViatorFeed } from '@/hooks/useViatorFeed';
import { FeedRow } from './FeedRow';
import { cardId } from './FeedCard';

interface Props {
  city: string | null | undefined;
  activeItemId: string | null;
  onHoverItem: (id: string | null) => void;
  onCardClick?: (item: FeedItem) => void;
  /** Forwarded to FeedRow. Defaults to true so the home feed keeps its quiet
   *  layout when Viator has no items; the destination view passes false to
   *  always render the row + empty state. */
  hideWhenEmpty?: boolean;
  /** Optional set of card ids to drop before rendering — used by the
   *  destination view to avoid duplicating tours that were already mixed
   *  into the For You row. */
  excludeIds?: Set<string>;
}

/** Viator bookable-tours row. Separate from the main home feed because the
 *  data source is its own endpoint (and much slower to warm), so we scope
 *  the loading state to this row only. */
export function ViatorRow({
  city,
  activeItemId,
  onHoverItem,
  onCardClick,
  hideWhenEmpty,
  excludeIds,
}: Props) {
  const { data, isLoading, isError } = useViatorFeed(city);
  const all = (data?.viator_activities ?? []) as FeedItem[];
  const items =
    excludeIds && excludeIds.size > 0 ? all.filter((it) => !excludeIds.has(cardId(it))) : all;

  return (
    <FeedRow
      title="Bookable tours"
      items={items}
      isLoading={isLoading}
      activeItemId={activeItemId}
      onHoverItem={onHoverItem}
      emptyTitle={isError ? "Couldn't load tours" : 'No bookable tours yet'}
      emptyDescription={
        isError
          ? 'Viator is unavailable right now — please try again in a moment.'
          : 'Check back in a few minutes — we surface these as Viator results arrive.'
      }
      onCardClick={onCardClick}
      hideWhenEmpty={hideWhenEmpty}
    />
  );
}
