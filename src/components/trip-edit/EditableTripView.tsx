'use client';

import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import { alpha, type Theme } from '@mui/material/styles';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { ChevronDown, Eye, Utensils } from 'lucide-react';
import type { TravelData, TravelActivity } from '@/types';
import { useTripMutations } from '@/hooks/useTripMutations';
import { useDestinationInfo } from '@/hooks/useDestinationInfo';
import { DragDropDay } from './DragDropDay';
import { DayTabs } from './DayTabs';
import { AddDayButton } from './AddDayButton';
import { AddActivityToDayPicker } from './AddActivityToDayPicker';
import { DeletedActivitiesSection } from './DeletedActivitiesSection';
import { ActivityDetailDrawer } from '../trip/ActivityDetailDrawer';
import { TripContextBand } from '../trip/TripContextBand';
import { TripMapPanel, type MapFilter } from '../trip/TripMapPanel';
import { ExtendTripCta } from '../trip/ExtendTripCta';
import { RestaurantCard } from '../trip/RestaurantCard';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { DestinationHero } from '../destinations/DestinationHero';
import { CityOverviewIntro, CityOverviewDetails } from '../destinations/CityOverview';
import { WeatherForecastStrip } from '../destinations/WeatherForecastStrip';
import { destinationSlug } from '@/lib/destinationSlug';

interface Props {
  /** Required for edit mode; optional on read-only surfaces with no mutation backend. */
  searchId?: string;
  tripData: TravelData;
  setTripData?: (
    updater: TravelData | ((prev: TravelData | null) => TravelData | null),
  ) => void;
  photoMap?: Record<string, string>;
  toolbar?: React.ReactNode;
  onActiveDayChange?: (dayNumber: number | null) => void;
  /**
   * When false, all edit affordances are hidden. If `viewerBanner` is also set,
   * a "you're viewing this trip" banner shows (collaborator/viewer context);
   * omit it for genuinely public read-only surfaces (e.g. community guides).
   */
  canEdit?: boolean;
  /** Show the collaborator view-only banner in place of the toolbar when !canEdit. */
  viewerBanner?: boolean;
  /** Optional handler for the "Ask for editor access" CTA (e.g. open CollaboratorsSheet). */
  onRequestEditAccess?: () => void;
}

const noopSetTripData: NonNullable<Props['setTripData']> = () => {};

export function EditableTripView({
  searchId = '',
  tripData,
  setTripData = noopSetTripData,
  photoMap,
  toolbar,
  onActiveDayChange,
  canEdit = true,
  viewerBanner = false,
  onRequestEditAccess,
}: Props) {
  const [selectedActivity, setSelectedActivity] = useState<TravelActivity | null>(null);
  const [mapFilter, setMapFilter] = useState<MapFilter>({ kind: 'all' });
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [hoveredActivityId, setHoveredActivityId] = useState<string | null>(null);
  const [pickerDayNumber, setPickerDayNumber] = useState<number | null>(null);
  const [dayPendingDelete, setDayPendingDelete] = useState<number | null>(null);
  const [diningExpanded, setDiningExpanded] = useState(true);
  const [recentlyAdded, setRecentlyAdded] = useState<{
    activity: TravelActivity;
    dayNumber: number;
  } | null>(null);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const overviewId = useId();

  const destination = tripData.destination;
  const { data: info, isLoading: infoLoading } = useDestinationInfo(destination || null);

  const mutations = useTripMutations({ searchId, tripData, setTripData });

  const days = useMemo(() => tripData.travel_plan ?? [], [tripData.travel_plan]);
  const activityPool = useMemo(() => tripData.activities ?? [], [tripData.activities]);
  const activityPoolMap = useMemo(() => {
    const map = new Map<string, TravelActivity>();
    for (const a of activityPool) {
      if (a.id) map.set(a.id, a);
      if (a.activity_id) map.set(a.activity_id, a);
    }
    return map;
  }, [activityPool]);

  const getActivitiesForDay = useCallback(
    (dayIndex: number): TravelActivity[] => {
      const day = days[dayIndex];
      if (!day) return [];
      return day.activities.map((s): TravelActivity => {
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
      });
    },
    [days, activityPoolMap],
  );

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!canEdit) return;
      const { source, destination, draggableId } = result;
      if (!destination) return;
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) {
        return;
      }

      const fromDayNumber = parseInt(source.droppableId.replace('day-', ''), 10);

      // Dropped onto a day tab → move to the end of that day. Lets cross-day
      // moves survive the switch to one-day-at-a-time tabs.
      if (destination.droppableId.startsWith('daytab-')) {
        const toDayNumber = parseInt(destination.droppableId.replace('daytab-', ''), 10);
        if (toDayNumber === fromDayNumber) return;
        const target = days.find((d) => d.day_number === toDayNumber);
        const endIndex = target?.activities.length ?? 0;
        mutations.moveActivity(draggableId, fromDayNumber, toDayNumber, endIndex);
        return;
      }

      const toDayNumber = parseInt(destination.droppableId.replace('day-', ''), 10);

      if (fromDayNumber === toDayNumber) {
        const day = days.find((d) => d.day_number === fromDayNumber);
        if (!day) return;
        const ids = day.activities.map((a) => a.id);
        const [removed] = ids.splice(source.index, 1);
        ids.splice(destination.index, 0, removed);
        mutations.reorderActivities(fromDayNumber, ids);
      } else {
        mutations.moveActivity(
          draggableId,
          fromDayNumber,
          toDayNumber,
          destination.index,
        );
      }
    },
    [canEdit, days, mutations],
  );

  // Activities in the trip pool that aren't placed on any day yet.
  const unassignedActivities = useMemo(() => {
    const placed = new Set<string>();
    for (const day of days) {
      for (const ref of day.activities) {
        if (ref.id) placed.add(ref.id);
        if (ref.activity_id) placed.add(ref.activity_id);
      }
    }
    return activityPool.filter((a) => {
      const id = a.activity_id ?? a.id;
      return id ? !placed.has(id) : true;
    });
  }, [activityPool, days]);

  const handleSelectFromTripPool = useCallback(
    (activity: TravelActivity) => {
      if (pickerDayNumber == null) return;
      mutations.attachActivityToDay(activity, pickerDayNumber);
    },
    [mutations, pickerDayNumber],
  );

  const handleSelectFromCity = useCallback(
    (activity: TravelActivity) => {
      if (pickerDayNumber == null) return;
      mutations.addActivity(activity, pickerDayNumber);
      setRecentlyAdded({ activity, dayNumber: pickerDayNumber });
    },
    [mutations, pickerDayNumber],
  );

  // Reorder whole days (Phase 3e). Swaps the target day with its neighbour and
  // persists via the existing reorderDays mutation; the active tab follows the
  // moved day so focus doesn't jump.
  const handleMoveDay = useCallback(
    (dayNumber: number, direction: -1 | 1) => {
      const order = days.map((d, i) => d.day_number ?? i + 1);
      const pos = order.indexOf(dayNumber);
      const target = pos + direction;
      if (pos < 0 || target < 0 || target >= order.length) return;
      [order[pos], order[target]] = [order[target], order[pos]];
      mutations.reorderDays(order);
      setActiveDayIndex(target);
    },
    [days, mutations],
  );

  // Remove a whole day. Opens a confirmation asking whether to redistribute the
  // day's activities onto other days or delete them outright — both the day-tab
  // trash affordance and the in-day header "Delete" route through here.
  const handleRequestDeleteDay = useCallback((dayNumber: number) => {
    setDayPendingDelete(dayNumber);
  }, []);

  const handleConfirmDeleteDay = useCallback(
    (mode: 'redistribute' | 'delete_all') => {
      if (dayPendingDelete != null) mutations.deleteDay(dayPendingDelete, mode);
      setDayPendingDelete(null);
    },
    [dayPendingDelete, mutations],
  );

  const handleUndoAdd = useCallback(() => {
    if (!recentlyAdded) return;
    const id = recentlyAdded.activity.activity_id ?? recentlyAdded.activity.id;
    mutations.deleteActivity(id, recentlyAdded.dayNumber);
    setRecentlyAdded(null);
  }, [recentlyAdded, mutations]);

  // Keep the active tab in range as days are added/removed.
  const safeDayIndex = Math.min(activeDayIndex, Math.max(days.length - 1, 0));
  useEffect(() => {
    if (safeDayIndex !== activeDayIndex) setActiveDayIndex(safeDayIndex);
  }, [safeDayIndex, activeDayIndex]);

  const activeDay = days[safeDayIndex];
  const activeDayNumber = activeDay?.day_number ?? null;

  // Report the focused day (drives Surprise-day / Suggest-alternatives target)
  // and sync the map to show that day's route.
  useEffect(() => {
    onActiveDayChange?.(activeDayNumber);
  }, [activeDayNumber, onActiveDayChange]);

  useEffect(() => {
    if (mapFilter.kind === 'restaurants') return;
    if (activeDayNumber == null) {
      if (mapFilter.kind !== 'all') setMapFilter({ kind: 'all' });
    } else if (mapFilter.kind !== 'day' || mapFilter.dayNumber !== activeDayNumber) {
      setMapFilter({ kind: 'day', dayNumber: activeDayNumber });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDayNumber]);

  const dayCounts = useMemo(() => days.map((d) => d.activities.length), [days]);

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
            startDate={tripData.start_date}
            endDate={tripData.end_date}
            durationDays={tripData.total_trip_days}
            budget={tripData.budget}
          />
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            md: 'minmax(0, 3fr) minmax(0, 2fr)',
          },
          alignItems: 'stretch',
          mt: 2.5,
        }}
      >
        <Box sx={{ minWidth: 0, display: 'flex', '& > *': { width: '100%' } }}>
          <CityOverviewIntro
            key={destination}
            city={destination}
            info={info}
            open={overviewOpen}
            onToggle={() => setOverviewOpen((v) => !v)}
            controlsId={overviewId}
            fill
          />
        </Box>

        <Box sx={{ minWidth: 0, display: 'flex', '& > *': { width: '100%' } }}>
          <WeatherForecastStrip
            location={destination}
            startDate={tripData.start_date}
            numDays={tripData.total_trip_days}
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

      {canEdit ? (
        toolbar
      ) : viewerBanner ? (
        <Box
          role="status"
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
            px: 2,
            py: 1.5,
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: (t: Theme) => alpha(t.palette.primary.main, 0.3),
            bgcolor: (t: Theme) => alpha(t.palette.primary.main, 0.06),
          }}
        >
          <Box
            component={Eye}
            aria-hidden
            sx={{ mt: 0.25, width: 16, height: 16, flexShrink: 0, color: 'primary.main' }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'text.primary' }}>
              You&apos;re viewing this trip
            </Typography>
            <Typography sx={{ mt: 0.25, fontSize: 13, color: 'text.secondary' }}>
              Ask the owner for editor access to make changes.
            </Typography>
          </Box>
          {onRequestEditAccess ? (
            <Button size="sm" variant="secondary" onClick={onRequestEditAccess}>
              See collaborators
            </Button>
          ) : null}
        </Box>
      ) : null}

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
          {canEdit ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <DayTabs
                  days={days}
                  activeIndex={safeDayIndex}
                  onSelect={setActiveDayIndex}
                  counts={dayCounts}
                  droppable
                  onDeleteDay={days.length > 1 ? handleRequestDeleteDay : undefined}
                />
                {activeDay ? (
                  <DragDropDay
                    key={activeDay.day_number ?? safeDayIndex}
                    day={activeDay}
                    dayIndex={safeDayIndex}
                    activities={getActivitiesForDay(safeDayIndex)}
                    photoMap={photoMap}
                    onDeleteActivity={mutations.deleteActivity}
                    onDeleteDay={days.length > 1 ? handleRequestDeleteDay : undefined}
                    onAutofillDay={mutations.autofillDay}
                    onAddActivity={setPickerDayNumber}
                    onActivityClick={setSelectedActivity}
                    hoveredActivityId={hoveredActivityId}
                    onActivityHover={setHoveredActivityId}
                    onMoveDay={days.length > 1 ? handleMoveDay : undefined}
                    canMoveEarlier={safeDayIndex > 0}
                    canMoveLater={safeDayIndex < days.length - 1}
                  />
                ) : null}
              </Box>
            </DragDropContext>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <DayTabs
                days={days}
                activeIndex={safeDayIndex}
                onSelect={setActiveDayIndex}
                counts={dayCounts}
              />
              {activeDay ? (
                <DragDropDay
                  key={activeDay.day_number ?? safeDayIndex}
                  day={activeDay}
                  dayIndex={safeDayIndex}
                  activities={getActivitiesForDay(safeDayIndex)}
                  photoMap={photoMap}
                  onActivityClick={setSelectedActivity}
                  hoveredActivityId={hoveredActivityId}
                  onActivityHover={setHoveredActivityId}
                  readOnly
                />
              ) : null}
            </Box>
          )}

          {canEdit ? (
            <Box>
              <AddDayButton onAddDay={mutations.addDay} />
            </Box>
          ) : null}

          {tripData.restaurants && tripData.restaurants.length > 0 ? (
            <Box component="section">
              <ButtonBase
                component="header"
                onClick={() => setDiningExpanded((v) => !v)}
                aria-expanded={diningExpanded}
                aria-controls="dining-picks-grid"
                sx={{
                  width: '100%',
                  mb: diningExpanded ? 2 : 0,
                  px: 0,
                  py: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                  borderRadius: 1.5,
                  transition: 'background-color 0.15s ease',
                  '&:hover': {
                    bgcolor: (t: Theme) => alpha(t.palette.text.primary, 0.04),
                  },
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
                  <Typography
                    sx={{ mt: 0.25, fontSize: 14, color: 'text.secondary' }}
                  >
                    {tripData.restaurants.length} hand-picked picks for your trip
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'text.secondary',
                      transition: 'transform 0.2s ease',
                      transform: diningExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  >
                    <ChevronDown size={20} aria-hidden />
                  </Box>
                </Box>
              </ButtonBase>
              {diningExpanded ? (
                <Box
                  id="dining-picks-grid"
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
                  {tripData.restaurants.map((r) => (
                    <RestaurantCard key={r.id} restaurant={r} photoMap={photoMap} />
                  ))}
                </Box>
              ) : null}
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

          {canEdit ? <ExtendTripCta onAddDay={mutations.addDay} /> : null}

          {canEdit ? (
            <DeletedActivitiesSection
              deletedActivities={tripData.deleted_activities ?? []}
              days={days}
              photoMap={photoMap}
              onRestore={mutations.restoreActivity}
              onActivityClick={setSelectedActivity}
            />
          ) : null}
        </Box>

        <Box
          component="aside"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            position: { md: 'sticky' },
            top: { md: 124 },
            alignSelf: { md: 'flex-start' },
            height: { md: 'calc(100vh - 148px)' },
          }}
        >
          <TripMapPanel
            days={days}
            activityPool={activityPool}
            restaurants={tripData.restaurants}
            filter={mapFilter}
            onFilterChange={setMapFilter}
            onActivityClick={(id) => {
              const a = activityPoolMap.get(id);
              if (a) setSelectedActivity(a);
            }}
            activePinId={hoveredActivityId}
            onActivityHover={setHoveredActivityId}
          />
        </Box>
      </Box>

      <ActivityDetailDrawer
        activity={selectedActivity}
        photoMap={photoMap}
        destination={destination}
        onClose={() => setSelectedActivity(null)}
      />

      <AddActivityToDayPicker
        destination={destination}
        legacyPool={unassignedActivities}
        excludeIds={new Set(activityPoolMap.keys())}
        dayNumber={pickerDayNumber}
        photoMap={photoMap}
        onClose={() => setPickerDayNumber(null)}
        onSelectFromTripPool={handleSelectFromTripPool}
        onSelectFromCity={handleSelectFromCity}
      />

      <Snackbar
        open={!!recentlyAdded}
        autoHideDuration={5000}
        onClose={() => setRecentlyAdded(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={
          recentlyAdded
            ? `Added ${recentlyAdded.activity.name} to Day ${recentlyAdded.dayNumber}`
            : ''
        }
        action={
          <Button size="sm" variant="ghost" onClick={handleUndoAdd}>
            Undo
          </Button>
        }
      />

      <Dialog
        open={dayPendingDelete != null}
        onOpenChange={(open) => {
          if (!open) setDayPendingDelete(null);
        }}
        title={dayPendingDelete != null ? `Remove Day ${dayPendingDelete}?` : 'Remove day'}
        description="Choose what happens to this day's activities. The remaining days are renumbered automatically."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDayPendingDelete(null)}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={() => handleConfirmDeleteDay('redistribute')}>
              Move activities to other days
            </Button>
            <Button variant="destructive" onClick={() => handleConfirmDeleteDay('delete_all')}>
              Delete day &amp; activities
            </Button>
          </>
        }
      >
        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
          <strong>Move activities to other days</strong> keeps this day&apos;s stops by spreading
          them across your remaining days. <strong>Delete day &amp; activities</strong> removes the
          day and its stops from the trip.
        </Typography>
      </Dialog>
    </Box>
  );
}
