'use client';

import { Fragment } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { alpha, type Theme } from '@mui/material/styles';
import { CalendarDays, Plus } from 'lucide-react';
import { Droppable } from '@hello-pangea/dnd';
import type { DayPlan, TravelActivity } from '@/types';
import { ActivityDragItem } from './ActivityDragItem';
import { Button } from '@/components/ui/Button';
import {
  bucketDayActivities,
  TIME_BUCKET_LABELS,
  type TimeBucket,
} from '@/lib/trip/timeOfDay';

/** Full-width section divider for a time-of-day group inside the day grid. */
function SectionHeader({ bucket }: { bucket: TimeBucket }) {
  return (
    <Box
      sx={{
        gridColumn: '1 / -1',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        mt: 0.5,
      }}
    >
      <Typography
        component="h3"
        sx={{
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'text.secondary',
          whiteSpace: 'nowrap',
        }}
      >
        {TIME_BUCKET_LABELS[bucket]}
      </Typography>
      <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
    </Box>
  );
}

interface Props {
  day: DayPlan;
  dayIndex: number;
  activities: TravelActivity[];
  photoMap?: Record<string, string>;
  onDeleteActivity?: (activityId: string, dayNumber: number) => void;
  onDeleteDay?: (dayNumber: number) => void;
  onAutofillDay?: (dayNumber: number) => void;
  onAddActivity?: (dayNumber: number) => void;
  onActivityClick?: (activity: TravelActivity) => void;
  /** Render as a static, non-draggable day (read-only trip surfaces). */
  readOnly?: boolean;
}

export function DragDropDay({
  day,
  dayIndex,
  activities,
  photoMap,
  onDeleteActivity,
  onDeleteDay,
  onAutofillDay,
  onAddActivity,
  onActivityClick,
  readOnly = false,
}: Props) {
  const dayNumber = day.day_number ?? dayIndex + 1;
  const droppableId = `day-${dayNumber}`;
  const subtitleParts = [day.date, day.city].filter(Boolean);
  const bucketed = bucketDayActivities(activities);

  const gridColumns = {
    xs: '1fr',
    sm: 'repeat(2, minmax(0, 1fr))',
  } as const;

  return (
    <Box component="section">
      <Box
        component="header"
        sx={{
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
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
            Day {dayNumber}
          </Typography>
          {subtitleParts.length > 0 && (
            <Typography sx={{ mt: 0.25, fontSize: 14, color: 'text.secondary' }}>
              {subtitleParts.join(' · ')}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {onAutofillDay && (
            <Button
              variant="subtle"
              size="xs"
              onClick={() => onAutofillDay(dayNumber)}
              title="Let AI fill this day's open time with nearby picks"
            >
              Fill open time
            </Button>
          )}
          {onDeleteDay && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onDeleteDay(dayNumber)}
              title="Delete day"
            >
              Delete
            </Button>
          )}
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
              flexShrink: 0,
            }}
          >
            <CalendarDays size={20} aria-hidden />
          </Box>
        </Box>
      </Box>

      {readOnly ? (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: gridColumns,
            minHeight: 80,
          }}
        >
          {activities.length > 0 ? (
            bucketed.map(({ activity, index, bucket, startsBucket }) => (
              <Fragment key={activity.id}>
                {startsBucket ? <SectionHeader bucket={bucket} /> : null}
                <ActivityDragItem
                  activity={activity}
                  index={index}
                  photoMap={photoMap}
                  onClick={() => onActivityClick?.(activity)}
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
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
              },
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
                {startsBucket ? <SectionHeader bucket={bucket} /> : null}
                <ActivityDragItem
                  activity={activity}
                  index={index}
                  photoMap={photoMap}
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
