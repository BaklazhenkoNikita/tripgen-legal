'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import type { DayPlan, TravelActivity } from '@/types';
import type { MapPinData } from '@/components/map/Map';
import { Skeleton } from '@/components/ui/Skeleton';

const LeafletMap = dynamic(() => import('@/components/map/Map'), {
  ssr: false,
  loading: () => <Skeleton variant="block" height="100%" width="100%" style={{ borderRadius: 24 }} />,
});

interface Props {
  days: DayPlan[];
  activityPool: TravelActivity[];
  activeDayNumber: number | null;
  onActivityClick?: (activityId: string) => void;
  showRoute?: boolean;
}

function getCoord(a: TravelActivity): { lat: number; lng: number } | null {
  const lat = a.latitude ?? a.coordinates?.lat ?? a.coordinates?.latitude;
  const lng =
    a.longitude ??
    a.coordinates?.lng ??
    a.coordinates?.longitude ??
    a.coordinates?.lon;
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

export function TripMap({
  days,
  activityPool,
  activeDayNumber,
  onActivityClick,
  showRoute = true,
}: Props) {
  const pins: MapPinData[] = useMemo(() => {
    const poolById = new Map<string, TravelActivity>();
    for (const a of activityPool) {
      if (a.id) poolById.set(a.id, a);
      if (a.activity_id) poolById.set(a.activity_id, a);
    }

    const out: MapPinData[] = [];
    let n = 1;
    days.forEach((day, dayIdx) => {
      const dayNum = day.day_number ?? dayIdx + 1;
      const isActive = activeDayNumber != null && dayNum === activeDayNumber;
      for (const slot of day.activities) {
        const a =
          poolById.get(slot.id) ?? poolById.get(slot.activity_id ?? '');
        if (!a) continue;
        const coord = getCoord(a);
        if (!coord) continue;
        out.push({
          id: a.id ?? a.activity_id ?? `${dayIdx}-${n}`,
          lat: coord.lat,
          lng: coord.lng,
          title: a.name ?? 'Activity',
          dayIndex: dayIdx,
          number: n,
          selected: isActive,
        });
        n += 1;
      }
    });
    return out;
  }, [days, activityPool, activeDayNumber]);

  // Fly to the first activity once on initial load. Subsequent day-toggles
  // keep the existing fitBounds behavior — this fires exactly once per
  // mount, when pins first become non-empty.
  const [focusPin, setFocusPin] = useState<{ lat: number; lng: number } | null>(null);
  const didInitialFocus = useRef(false);
  useEffect(() => {
    if (didInitialFocus.current || pins.length === 0) return;
    didInitialFocus.current = true;
    const first = pins[0];
    setFocusPin({ lat: first.lat, lng: first.lng });
  }, [pins]);

  if (pins.length === 0) return null;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: { xs: 320, sm: 'calc(100vh - 160px)', md: '100%' },
        maxHeight: { sm: 720, md: 'none' },
        minHeight: { sm: 480, md: 0 },
        overflow: 'hidden',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'action.hover',
        boxShadow: (t) =>
          t.palette.mode === 'dark'
            ? '0 0 0 1px rgba(255,255,255,0.06), 0 12px 32px rgba(0,0,0,0.55)'
            : '0 1px 2px rgba(0,0,0,0.06), 0 12px 32px rgba(34,34,34,0.10)',
      }}
    >
      <LeafletMap
        pins={pins}
        activePinId={null}
        onPinClick={onActivityClick}
        connectByDay={showRoute}
        focusPin={focusPin}
      />
    </Box>
  );
}
