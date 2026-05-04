'use client';

import { useMemo } from 'react';
import type { TravelActivity } from '@/types';
import { Sheet } from '@/components/ui/Sheet';
import { travelActivityToFeedDetail } from '@/lib/feed/activityAdapter';
import { PlaceDetailContent } from '@/components/places/PlaceDetailContent';

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
    >
      {detail ? <PlaceDetailContent detail={detail} city={city} /> : null}
    </Sheet>
  );
}
