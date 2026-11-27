'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Maximize2 } from 'lucide-react';
import type { TravelActivity } from '@/types';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { travelActivityToFeedDetail } from '@/lib/feed/activityAdapter';
import { PlaceDetailContent } from '@/components/places/PlaceDetailContent';
import { destinationSlug } from '@/lib/destinationSlug';
import { placeSlugWithId } from '@/lib/placeSlug';
import { PlaceAskPanel, PlaceAskTopActions } from '@/components/chat/PlaceAskPanel';
import type { ChatEntryContext } from '@/components/chat/ChatConversation';

interface Props {
  activity: TravelActivity | null;
  photoMap?: Record<string, string>;
  destination?: string;
  /** Trip + day the activity belongs to — scopes "Ask Periplo". */
  tripId?: string;
  dayNumber?: number;
  onClose: () => void;
}

export function ActivityDetailDrawer({
  activity,
  photoMap,
  destination,
  tripId,
  dayNumber,
  onClose,
}: Props) {
  const detail = useMemo(
    () =>
      activity
        ? travelActivityToFeedDetail(activity, { destination, photoMap })
        : null,
    [activity, destination, photoMap],
  );

  const city = destination?.split(',')[0]?.trim() || null;
  const [view, setView] = useState<'place' | 'ask'>('place');
  const activityId = activity?.id || activity?.activity_id || '';
  useEffect(() => setView('place'), [activityId]);

  const askContext = useMemo<ChatEntryContext | null>(
    () =>
      activity && activityId
        ? {
            entity_id: activityId,
            entity_type: 'activity',
            entity_name: activity.name,
            ...(tripId ? { trip_id: tripId } : {}),
            ...(dayNumber ? { day_number: dayNumber } : {}),
          }
        : null,
    [activity, activityId, tripId, dayNumber],
  );

  const fullscreenHref = useMemo(() => {
    if (!activity || !city) return null;
    const id = activity.id || activity.activity_id || '';
    if (!id) return null;
    const placeSlug = placeSlugWithId(activity.name, id);
    const citySlug = destinationSlug(city);
    if (!placeSlug || !citySlug) return null;
    return `/explore/${citySlug}/${placeSlug}`;
  }, [activity, city]);

  const placeTopAction = fullscreenHref ? (
    <Button asChild variant="secondary" size="sm" iconLeft={<Maximize2 size={14} />}>
      <Link href={fullscreenHref} target="_blank" rel="noopener noreferrer" aria-label="Open full page">
        Open full page
      </Link>
    </Button>
  ) : undefined;
  const topAction =
    view === 'ask' && askContext && activity ? (
      <PlaceAskTopActions placeName={activity.name} context={askContext} onBack={() => setView('place')} />
    ) : (
      placeTopAction
    );

  return (
    <Sheet
      open={activity !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      side="right"
      size="lg"
      title={activity?.name ?? 'Activity details'}
      hideTitle
      topAction={topAction}
    >
      {detail && view === 'ask' && askContext ? (
        <PlaceAskPanel context={askContext} />
      ) : detail ? (
        <PlaceDetailContent
          detail={detail}
          city={city}
          onAsk={askContext ? () => setView('ask') : undefined}
        />
      ) : null}
    </Sheet>
  );
}
