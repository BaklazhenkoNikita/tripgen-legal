'use client';

import { useMemo } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { alpha, type Theme } from '@mui/material/styles';
import type { DayPlan, TravelActivity, Restaurant } from '@/types';
import { TripMap } from './TripMap';
import { tgShadow } from '@/theme/shadows';

interface Props {
  days: DayPlan[];
  activityPool: TravelActivity[];
  restaurants?: Restaurant[];
  filter: MapFilter;
  onFilterChange: (filter: MapFilter) => void;
  onActivityClick?: (activityId: string) => void;
  /** Highlighted pin id (hovering the matching stop card). */
  activePinId?: string | null;
  /** Pin hover → highlight the matching card. */
  onActivityHover?: (activityId: string | null) => void;
}

export type MapFilter =
  | { kind: 'all' }
  | { kind: 'day'; dayNumber: number }
  | { kind: 'restaurants' };

export function TripMapPanel({
  days,
  activityPool,
  restaurants,
  filter,
  onFilterChange,
  onActivityClick,
  activePinId = null,
  onActivityHover,
}: Props) {
  const { displayDays, displayPool, activeDayNumber } = useMemo(() => {
    if (filter.kind === 'day') {
      return {
        displayDays: days.filter((d) => (d.day_number ?? 0) === filter.dayNumber),
        displayPool: activityPool,
        activeDayNumber: filter.dayNumber,
      };
    }
    if (filter.kind === 'restaurants') {
      const list = restaurants ?? [];
      const synthetic: TravelActivity[] = list
        .filter((r) => r.coordinates?.lat != null && r.coordinates?.lng != null)
        .map((r) => ({
          id: r.id,
          name: r.name,
          coordinates: { lat: r.coordinates?.lat, lng: r.coordinates?.lng },
        }));
      const fakeDay: DayPlan = {
        day_number: 0,
        activities: synthetic.map((s) => ({ id: s.id, name: s.name })),
      };
      return {
        displayDays: synthetic.length > 0 ? [fakeDay] : [],
        displayPool: synthetic,
        activeDayNumber: null,
      };
    }
    return { displayDays: days, displayPool: activityPool, activeDayNumber: null };
  }, [filter, days, activityPool, restaurants]);

  const buttons: Array<{ key: string; label: string; filter: MapFilter }> = [
    { key: 'all', label: 'All Days', filter: { kind: 'all' } },
    ...days.map((d, i) => {
      const n = d.day_number ?? i + 1;
      return {
        key: `day-${n}`,
        label: `Day ${n}`,
        filter: { kind: 'day' as const, dayNumber: n },
      };
    }),
  ];
  if ((restaurants?.length ?? 0) > 0) {
    buttons.push({ key: 'restaurants', label: 'Restaurants', filter: { kind: 'restaurants' } });
  }

  const isActive = (b: MapFilter): boolean => {
    if (b.kind !== filter.kind) return false;
    if (b.kind === 'day' && filter.kind === 'day') return b.dayNumber === filter.dayNumber;
    return true;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        flex: { md: 1 },
      }}
    >
      <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        {buttons.map((b) => {
          const active = isActive(b.filter);
          return (
            <ButtonBase
              key={b.key}
              type="button"
              onClick={() => onFilterChange(b.filter)}
              sx={{
                borderRadius: 999,
                px: 1.25,
                py: 0.5,
                fontSize: 11,
                fontWeight: 500,
                transition: 'all 0.2s ease',
                ...(active
                  ? {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      boxShadow: (t: Theme) => tgShadow(t, 'card'),
                    }
                  : {
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: (t: Theme) => alpha(t.palette.text.primary, 0.04),
                      color: 'text.secondary',
                      '&:hover': { color: 'text.primary' },
                    }),
              }}
            >
              {b.label}
            </ButtonBase>
          );
        })}
      </Box>
      <Box sx={{ flex: { md: 1 }, minHeight: 0, display: 'flex' }}>
        <TripMap
          days={displayDays}
          activityPool={displayPool}
          activeDayNumber={activeDayNumber}
          onActivityClick={onActivityClick}
          showRoute={filter.kind === 'day'}
          activePinId={activePinId}
          onActivityHover={onActivityHover}
        />
      </Box>
    </Box>
  );
}
