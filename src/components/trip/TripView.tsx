'use client';

import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha, type Theme } from '@mui/material/styles';
import { Utensils } from 'lucide-react';
import type { TravelData, TravelActivity, DayPlan } from '@/types';
import { useDestinationInfo } from '@/hooks/useDestinationInfo';
import { DayPlanCard } from './DayPlanCard';
import { ActivityDetailDrawer } from './ActivityDetailDrawer';
import { TripContextBand } from './TripContextBand';
import { TripMapPanel, type MapFilter } from './TripMapPanel';
import { ExtendTripCta } from './ExtendTripCta';
import { RestaurantCard } from './RestaurantCard';
import { DestinationHero } from '../destinations/DestinationHero';
import { CityOverviewIntro, CityOverviewDetails } from '../destinations/CityOverview';
import { WeatherForecastStrip } from '../destinations/WeatherForecastStrip';
import { destinationSlug } from '@/lib/destinationSlug';

interface Props {
  travelData: TravelData;
  destination: string;
  photoMap?: Record<string, string>;
  toolbar?: React.ReactNode;
  onActiveDayChange?: (dayNumber: number | null) => void;
  searchId?: string;
  onAddDay?: (mode?: 'empty' | 'ai' | 'fill_unassigned') => void | Promise<void>;
}

export function TripView({
  travelData,
  destination,
  photoMap,
  toolbar,
  onActiveDayChange,
  onAddDay,
}: Props) {
  const [activeDay, setActiveDay] = useState(0);
  const [selectedActivity, setSelectedActivity] = useState<TravelActivity | null>(null);
  const [mapFilter, setMapFilter] = useState<MapFilter>({ kind: 'all' });
  const [overviewOpen, setOverviewOpen] = useState(false);
  const overviewId = useId();

  const { data: info, isLoading: infoLoading } = useDestinationInfo(destination || null);

  const days = travelData.travel_plan ?? [];
  const activityPool = useMemo(() => travelData.activities ?? [], [travelData.activities]);

  const activityPoolMap = useMemo(() => {
    const map = new Map<string, TravelActivity>();
    for (const a of activityPool) {
      if (a.id) map.set(a.id, a);
      if (a.activity_id) map.set(a.activity_id, a);
    }
    return map;
  }, [activityPool]);

  const getActivitiesForDay = useCallback(
    (day: DayPlan): TravelActivity[] =>
      day.activities.map((s): TravelActivity => {
        const refId = s.id || s.activity_id || '';
        const pooled =
          activityPoolMap.get(s.id) ?? activityPoolMap.get(s.activity_id ?? '');
        if (pooled) {
          return pooled.id === refId ? pooled : { ...pooled, id: refId };
        }
        return {
          id: refId,
          name: s.name,
          category: s.category,
          time_of_visit: s.time_of_visit,
          activity_id: s.activity_id,
        };
      }),
    [activityPoolMap],
  );

  const currentDayNumber = days[activeDay]?.day_number ?? null;
  useEffect(() => {
    onActiveDayChange?.(currentDayNumber);
  }, [currentDayNumber, onActiveDayChange]);

  // Keep map filter in sync when the user expands a day card.
  useEffect(() => {
    if (mapFilter.kind === 'restaurants') return;
    if (currentDayNumber == null) {
      if (mapFilter.kind !== 'all') setMapFilter({ kind: 'all' });
    } else if (mapFilter.kind !== 'day' || mapFilter.dayNumber !== currentDayNumber) {
      setMapFilter({ kind: 'day', dayNumber: currentDayNumber });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDayNumber]);

  const exploreHref = `/explore/${destinationSlug(destination)}`;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ position: 'relative' }}>
        <DestinationHero
          city={destination}
          info={info}
          isLoading={infoLoading}
        />
        <Box
          sx={{
            position: 'absolute',
            top: { xs: 12, sm: 16 },
            right: { xs: 12, sm: 16 },
            zIndex: 3,
            maxWidth: 'calc(100% - 24px)',
          }}
        >
          <TripContextBand
            startDate={travelData.start_date}
            endDate={travelData.end_date}
            durationDays={travelData.total_trip_days}
            budget={travelData.budget}
          />
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            md: 'minmax(0, 7fr) minmax(0, 3fr)',
          },
          alignItems: 'start',
          mt: 2.5,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <CityOverviewIntro
            key={destination}
            city={destination}
            info={info}
            open={overviewOpen}
            onToggle={() => setOverviewOpen((v) => !v)}
            controlsId={overviewId}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <WeatherForecastStrip
            location={destination}
            startDate={travelData.start_date}
            numDays={travelData.total_trip_days}
          />
        </Box>
      </Box>

      <CityOverviewDetails
        key={`${destination}-details`}
        city={destination}
        info={info}
        open={overviewOpen}
        controlsId={overviewId}
      />

      {toolbar}

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            md: 'minmax(0, 1fr) 400px',
            lg: 'minmax(0, 1fr) 480px',
            xl: 'minmax(0, 1fr) 560px',
          },
        }}
      >
        <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {days.length > 0 ? (
            <Box component="section" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {days.map((day, i) => (
                <DayPlanCard
                  key={day.day_number ?? i}
                  day={day}
                  dayIndex={i}
                  activities={getActivitiesForDay(day)}
                  photoMap={photoMap}
                  isActive={activeDay === i}
                  onSelect={() => setActiveDay(activeDay === i ? -1 : i)}
                  onActivityClick={setSelectedActivity}
                />
              ))}
            </Box>
          ) : null}

          {travelData.restaurants && travelData.restaurants.length > 0 ? (
            <Box component="section">
              <Box
                component="header"
                sx={{
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography
                    component="h2"
                    sx={{
                      fontSize: { xs: 24, sm: 28 },
                      fontWeight: 600,
                      letterSpacing: '-0.01em',
                      color: 'text.primary',
                      m: 0,
                    }}
                  >
                    Dining picks
                  </Typography>
                  <Typography sx={{ mt: 0.25, fontSize: 14, color: 'text.secondary' }}>
                    {travelData.restaurants.length} hand-picked picks for your trip
                  </Typography>
                </Box>
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 40,
                    width: 40,
                    borderRadius: '50%',
                    bgcolor: (t: Theme) => alpha(t.palette.primary.main, 0.12),
                    color: 'primary.main',
                  }}
                >
                  <Utensils size={20} aria-hidden />
                </Box>
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    lg: 'repeat(3, minmax(0, 1fr))',
                  },
                }}
              >
                {travelData.restaurants.map((r) => (
                  <RestaurantCard key={r.id} restaurant={r} photoMap={photoMap} />
                ))}
              </Box>
            </Box>
          ) : null}

          <Typography
            sx={{
              pt: 1,
              textAlign: 'center',
              fontSize: 13,
              color: 'text.secondary',
            }}
          >
            <Box
              component={Link}
              href={exploreHref}
              sx={{
                fontWeight: 500,
                color: 'primary.main',
                textUnderlineOffset: '3px',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Explore more in {destination} →
            </Box>
          </Typography>

          <ExtendTripCta onAddDay={onAddDay} />
        </Box>

        <Box
          component="aside"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            position: { md: 'sticky' },
            top: { md: 16 },
            alignSelf: { md: 'flex-start' },
          }}
        >
          <TripMapPanel
            days={days}
            activityPool={activityPool}
            restaurants={travelData.restaurants}
            filter={mapFilter}
            onFilterChange={setMapFilter}
            onActivityClick={(id) => {
              const a = activityPoolMap.get(id);
              if (a) setSelectedActivity(a);
            }}
          />
        </Box>
      </Box>

      <ActivityDetailDrawer
        activity={selectedActivity}
        photoMap={photoMap}
        destination={destination}
        onClose={() => setSelectedActivity(null)}
      />
    </Box>
  );
}
