'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Maximize2 } from 'lucide-react';
import type { TravelActivity } from '@/types';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { travelActivityToFeedDetail } from '@/lib/feed/activityAdapter';
import { PlaceDetailContent } from '@/components/places/PlaceDetailContent';
import { destinationSlug } from '@/lib/destinationSlug';
import { placeSlugWithId } from '@/lib/placeSlug';

interface Props {
  activity: TravelActivity | null;
  photoMap?: Record<string, string>;
  destination?: string;
  onClose: () => void;
}

export function ActivityDetailDrawer({
  activity,
  photoMap,
  destination,
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

  const fullscreenHref = useMemo(() => {
    if (!activity || !city) return null;
    const id = activity.id || activity.activity_id || '';
    if (!id) return null;
    const placeSlug = placeSlugWithId(activity.name, id);
    const citySlug = destinationSlug(city);
    if (!placeSlug || !citySlug) return null;
    return `/explore/${citySlug}/${placeSlug}`;
  }, [activity, city]);

  const topAction = fullscreenHref ? (
    <Button asChild variant="secondary" size="sm" iconLeft={<Maximize2 size={14} />}>
      <Link href={fullscreenHref} target="_blank" rel="noopener noreferrer" aria-label="Open full page">
        Open full page
      </Link>
    </Button>
  ) : undefined;

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
      {detail ? <PlaceDetailContent detail={detail} city={city} /> : null}
    </Sheet>
  );
}
