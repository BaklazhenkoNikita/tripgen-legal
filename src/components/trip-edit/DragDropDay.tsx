'use client';

import { Fragment } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { alpha, type Theme } from '@mui/material/styles';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  MoreHorizontal,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Droppable } from '@hello-pangea/dnd';
import type { DayPlan, TravelActivity } from '@/types';
import { ActivityDragItem } from './ActivityDragItem';
import { Button } from '@/components/ui/Button';
import {
  DropdownContent,
  DropdownItem,
  DropdownMenu,
  DropdownSeparator,
  DropdownTrigger,
} from '@/components/ui/DropdownMenu';
import { Eyebrow } from '@/components/layout/Eyebrow';
import { ConditionIcon } from '@/components/destinations/weatherIcon';
import { formatDayDate } from '@/lib/date';
import { formatTemps, type DayWeather } from '@/hooks/useTripWeather';
import { textScale } from '@/theme/standards';
import {
  bucketDayActivities,
  TIME_BUCKET_LABELS,
  type TimeBucket,
} from '@/lib/trip/timeOfDay';
import { getLatLng } from '@/lib/geo/coords';
import { estimateTransit } from '@/lib/geo/transitEstimate';

/** Full-width divider for a time-of-day group inside the day grid. */
function BucketHeader({ bucket }: { bucket: TimeBucket }) {
  return (
    <Box sx={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
      <Eyebrow tone="neutral" component="h3" sx={{ whiteSpace: 'nowrap' }}>
        {TIME_BUCKET_LABELS[bucket]}
      </Eyebrow>
      <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
    </Box>
  );
}

/** Day / Dining picks heading style (shared with EditableTripView). */
export const DAY_TITLE_SX = {
  fontSize: '1.5rem',
  fontWeight: 700,
  lineHeight: 1.25,
  letterSpacing: '-0.01em',
} as const;

/** Stop cards size to the column, not the viewport: 2-up when there's room. */
const STOP_GRID_COLUMNS = 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))';

interface Props {
  day: DayPlan;
  dayIndex: number;
  activities: TravelActivity[];
  photoMap?: Record<string, string>;
  onDeleteActivity?: (activityId: string, dayNumber: number) => void;
  onDeleteDay?: (dayNumber: number) => void;
  onAutofillDay?: (dayNumber: number) => void;
  /** Opens the "Suggest alternatives" (1 credit) confirmation for this day. */
  onSuggestAlternatives?: (dayNumber: number) => void;
  /** This day's forecast, when the trip is inside the forecast window. */
  weather?: DayWeather | null;
  onAddActivity?: (dayNumber: number) => void;
  onActivityClick?: (activity: TravelActivity) => void;
  /** Render as a static, non-draggable day (read-only trip surfaces). */
  readOnly?: boolean;
  /** Stop id currently highlighted by a hovered map pin (bidirectional sync). */
  hoveredActivityId?: string | null;
  /** Fires a stop id on card hover (null on leave) to highlight its pin. */
  onActivityHover?: (activityId: string | null) => void;
  /** Move this day earlier/later in the trip (Phase 3e). Omit to hide controls. */
  onMoveDay?: (dayNumber: number, direction: -1 | 1) => void;
  canMoveEarlier?: boolean;
  canMoveLater?: boolean;
}

export function DragDropDay({
  day,
  dayIndex,
  activities,
  photoMap,
  onDeleteActivity,
  onDeleteDay,
  onAutofillDay,
  onSuggestAlternatives,
  weather = null,
  onAddActivity,
  onActivityClick,
  readOnly = false,
  hoveredActivityId = null,
  onActivityHover,
  onMoveDay,
  canMoveEarlier = false,
  canMoveLater = false,
}: Props) {
  const dayNumber = day.day_number ?? dayIndex + 1;
  const droppableId = `day-${dayNumber}`;
  const subtitleParts = [day.date ? formatDayDate(day.date) : null, day.city].filter(Boolean);
  const temps = weather ? formatTemps(weather.hi, weather.lo) : null;
  const hasAiActions = Boolean(onAutofillDay || onSuggestAlternatives);
  const hasDayMenu = Boolean(onMoveDay || onDeleteDay);
  const bucketed = bucketDayActivities(activities);

  // Straight-line travel estimate from each stop to the next (same day, in
  // order). Client-side approximation via haversine — good enough to flag long
  // hops; a routed upgrade can slot in later.
  const coordsList = activities.map((a) => getLatLng(a));
  const estimates = activities.map((_, i) => {
    const from = coordsList[i];
    const to = coordsList[i + 1];
    return from && to ? estimateTransit(from, to) : null;
  });
  const travelToNext = (i: number): string | null => estimates[i]?.label ?? null;

  // Day-level pacing warnings (Phase 3d) — flag packed days and heavy transit
  // so the plan stays realistic. Amber, non-blocking.
  const totalTravelMin = estimates.reduce((sum, e) => sum + (e?.durationMinutes ?? 0), 0);
  const warnings: string[] = [];
  if (activities.length >= 7) {
    warnings.push(`Packed day — ${activities.length} stops. Consider moving a couple to another day.`);
  }
  if (totalTravelMin >= 120) {
    warnings.push(`Heavy travel — about ${totalTravelMin} min between stops. Try "Optimize route".`);
  }

  return (
    <Box component="section">
      <Box
        component="header"
        sx={{
          mb: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography component="h2" sx={{ ...DAY_TITLE_SX, color: 'text.primary', m: 0 }}>
            Day {dayNumber}
          </Typography>
          {subtitleParts.length > 0 || temps ? (
            <Typography
              component="div"
              sx={{
                ...textScale.support,
                mt: 0.25,
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                columnGap: 1,
                color: 'text.secondary',
              }}
            >
              {subtitleParts.length > 0 ? <span>{subtitleParts.join(' · ')}</span> : null}
              {temps ? (
                <Box
                  component="span"
                  title={weather?.conditionText}
                  sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
                >
                  {subtitleParts.length > 0 ? <span aria-hidden>·</span> : null}
                  <ConditionIcon code={weather?.conditionText} size={15} />
                  {temps}
                </Box>
              ) : null}
            </Typography>
          ) : null}
        </Box>

        {hasAiActions || hasDayMenu ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            {hasAiActions ? (
              <DropdownMenu>
                <DropdownTrigger asChild>
                  <Button
                    variant="outline"
                    size="md"
                    iconLeft={<Sparkles size={16} />}
                    iconRight={<ChevronDown size={14} />}
                  >
                    AI
                  </Button>
                </DropdownTrigger>
                <DropdownContent>
                  {onAutofillDay ? (
                    <DropdownItem onSelect={() => onAutofillDay(dayNumber)}>
                      <MenuItemText
                        title="Fill open time"
                        caption="Add nearby picks to this day's gaps"
                      />
                    </DropdownItem>
                  ) : null}
                  {onSuggestAlternatives ? (
                    <DropdownItem onSelect={() => onSuggestAlternatives(dayNumber)}>
                      <MenuItemText
                        title="Suggest alternatives"
                        caption="Swap this day's stops for fresh picks · 1 credit"
                      />
                    </DropdownItem>
                  ) : null}
                </DropdownContent>
              </DropdownMenu>
            ) : null}
            {hasDayMenu ? (
              <DropdownMenu>
                <DropdownTrigger asChild>
                  <Button variant="outline" size="icon" aria-label={`Day ${dayNumber} options`} title="Day options">
                    <MoreHorizontal size={18} aria-hidden />
                  </Button>
                </DropdownTrigger>
                <DropdownContent>
                  {onMoveDay ? (
                    <DropdownItem disabled={!canMoveEarlier} onSelect={() => onMoveDay(dayNumber, -1)}>
                      <ArrowLeft size={16} aria-hidden /> Move day earlier
                    </DropdownItem>
                  ) : null}
                  {onMoveDay ? (
                    <DropdownItem disabled={!canMoveLater} onSelect={() => onMoveDay(dayNumber, 1)}>
                      <ArrowRight size={16} aria-hidden /> Move day later
                    </DropdownItem>
                  ) : null}
                  {onMoveDay && onDeleteDay ? <DropdownSeparator /> : null}
                  {onDeleteDay ? (
                    <DropdownItem onSelect={() => onDeleteDay(dayNumber)} sx={{ color: 'error.main' }}>
                      <Trash2 size={16} aria-hidden /> Delete day
                    </DropdownItem>
                  ) : null}
                </DropdownContent>
              </DropdownMenu>
            ) : null}
          </Box>
        ) : null}
      </Box>

      {warnings.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          {warnings.map((w) => (
            <Box
              key={w}
              role="note"
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
                px: 1.5,
                py: 1,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: (t: Theme) => alpha(t.palette.warning.main, 0.35),
                bgcolor: (t: Theme) => alpha(t.palette.warning.main, 0.1),
              }}
            >
              <Box
                component="span"
                sx={{ mt: '1px', flexShrink: 0, display: 'inline-flex', color: 'warning.main' }}
              >
                <AlertTriangle size={15} aria-hidden />
              </Box>
              <Typography sx={{ ...textScale.label, fontWeight: 500, color: 'text.primary' }}>{w}</Typography>
            </Box>
          ))}
        </Box>
      ) : null}

      {readOnly ? (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: STOP_GRID_COLUMNS,
            minHeight: 80,
          }}
        >
          {activities.length > 0 ? (
            bucketed.map(({ activity, index, bucket, startsBucket }) => (
              <Fragment key={activity.id}>
                {startsBucket ? <BucketHeader bucket={bucket} /> : null}
                <ActivityDragItem
                  activity={activity}
                  index={index}
                  photoMap={photoMap}
                  onClick={() => onActivityClick?.(activity)}
                  stopNumber={index + 1}
                  travelToNext={travelToNext(index)}
                  highlighted={hoveredActivityId === activity.id}
                  onHoverChange={onActivityHover}
                  readOnly
                />
              </Fragment>
            ))
          ) : (
            <Box
              sx={{
                gridColumn: '1 / -1',
                py: 4,
                textAlign: 'center',
                fontSize: 13,
                color: 'text.disabled',
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              No activities planned for this day
            </Box>
          )}
        </Box>
      ) : (
      <Droppable droppableId={droppableId} type="ACTIVITY">
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: STOP_GRID_COLUMNS,
              minHeight: 80,
              borderRadius: 2,
              p: snapshot.isDraggingOver ? 1 : 0,
              transition: 'background-color 0.2s ease, padding 0.2s ease',
              ...(snapshot.isDraggingOver
                ? {
                    bgcolor: (t: Theme) => alpha(t.palette.primary.main, 0.06),
                  }
                : null),
            }}
          >
            {bucketed.map(({ activity, index, bucket, startsBucket }) => (
              <Fragment key={activity.id}>
                {startsBucket ? <BucketHeader bucket={bucket} /> : null}
                <ActivityDragItem
                  activity={activity}
                  index={index}
                  photoMap={photoMap}
                  stopNumber={index + 1}
                  travelToNext={travelToNext(index)}
                  highlighted={hoveredActivityId === activity.id}
                  onHoverChange={onActivityHover}
                  onDelete={
                    onDeleteActivity
                      ? () => onDeleteActivity(activity.id, dayNumber)
                      : undefined
                  }
                  onClick={() => onActivityClick?.(activity)}
                />
              </Fragment>
            ))}
            {provided.placeholder}
            {onAddActivity && !snapshot.isDraggingOver ? (
              <ButtonBase
                type="button"
                onClick={() => onAddActivity(dayNumber)}
                aria-label={`Add activity to day ${dayNumber}`}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  minHeight: activities.length === 0 ? 140 : 190,
                  borderRadius: 2,
                  border: '1.5px dashed',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  color: 'text.secondary',
                  transition: 'border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease',
                  '&:hover': {
                    borderColor: (t: Theme) => alpha(t.palette.primary.main, 0.5),
                    bgcolor: (t: Theme) => alpha(t.palette.primary.main, 0.04),
                    color: 'primary.main',
                  },
                }}
              >
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 36,
                    width: 36,
                    borderRadius: '50%',
                    bgcolor: (t: Theme) => alpha(t.palette.primary.main, 0.1),
                    color: 'primary.main',
                  }}
                >
                  <Plus size={20} aria-hidden />
                </Box>
                <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                  Add activity
                </Typography>
              </ButtonBase>
            ) : null}
            {!onAddActivity && activities.length === 0 && !snapshot.isDraggingOver && (
              <Box
                sx={{
                  gridColumn: '1 / -1',
                  py: 4,
                  textAlign: 'center',
                  fontSize: 13,
                  color: 'text.disabled',
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                Drag stops here, or use Fill open time
              </Box>
            )}
          </Box>
        )}
      </Droppable>
      )}
    </Box>
  );
}

function MenuItemText({ title, caption }: { title: string; caption: string }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 220 }}>
      <Box component="span" sx={{ fontWeight: 500 }}>
        {title}
      </Box>
      <Box component="span" sx={{ ...textScale.meta, color: 'text.secondary' }}>
        {caption}
      </Box>
    </Box>
  );
}
