'use client';

import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { alpha, type Theme } from '@mui/material/styles';
import { ChevronDown, Trash2 } from 'lucide-react';
import type { DayPlan, TravelActivity } from '@/types';
import { ActivityCard } from '../trip/ActivityCard';

interface Props {
  deletedActivities: TravelActivity[];
  days: DayPlan[];
  photoMap?: Record<string, string>;
  onRestore: (activity: TravelActivity, dayNumber: number) => void;
  onActivityClick: (activity: TravelActivity) => void;
}

export function DeletedActivitiesSection({
  deletedActivities,
  days,
  photoMap,
  onRestore,
  onActivityClick,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  // Server may keep entries in `deleted_activities` even after we re-add
  // (no `restore` op exists server-side). Hide anything that's currently
  // referenced from a day so restored items don't reappear after refresh.
  const visible = useMemo(() => {
    const onPlan = new Set<string>();
    for (const day of days) {
      for (const a of day.activities) {
        if (a.id) onPlan.add(a.id);
        if (a.activity_id) onPlan.add(a.activity_id);
      }
    }
    return deletedActivities.filter((a) => {
      const ids = [a.id, a.activity_id].filter(Boolean) as string[];
      return ids.length === 0 || !ids.some((id) => onPlan.has(id));
    });
  }, [deletedActivities, days]);

  if (visible.length === 0) return null;

  return (
    <Box component="section">
      <ButtonBase
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        sx={{
          width: '100%',
          mb: isOpen ? 2 : 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          textAlign: 'left',
          borderRadius: 2,
          p: 1,
          mx: -1,
          '&:hover': {
            bgcolor: (t: Theme) => alpha(t.palette.text.primary, 0.04),
          },
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
            Recently removed
          </Typography>
          <Typography sx={{ mt: 0.25, fontSize: 14, color: 'text.secondary' }}>
            {visible.length} removed{' '}
            {visible.length === 1 ? 'activity' : 'activities'} — restore to a day to bring them back
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 40,
              width: 40,
              borderRadius: '50%',
              bgcolor: (t: Theme) => alpha(t.palette.text.secondary, 0.08),
              color: 'text.secondary',
            }}
          >
            <Trash2 size={20} aria-hidden />
          </Box>
          <Box
            sx={{
              display: 'inline-flex',
              color: isOpen ? 'text.primary' : 'text.disabled',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          >
            <ChevronDown size={18} aria-hidden />
          </Box>
        </Box>
      </ButtonBase>

      {isOpen ? (
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
          {visible.map((activity) => (
            <DeletedActivityCard
              key={activity.id}
              activity={activity}
              days={days}
              photoMap={photoMap}
              onRestore={onRestore}
              onActivityClick={onActivityClick}
            />
          ))}
        </Box>
      ) : null}
    </Box>
  );
}

interface CardProps {
  activity: TravelActivity;
  days: DayPlan[];
  photoMap?: Record<string, string>;
  onRestore: (activity: TravelActivity, dayNumber: number) => void;
  onActivityClick: (activity: TravelActivity) => void;
}

function DeletedActivityCard({
  activity,
  days,
  photoMap,
  onRestore,
  onActivityClick,
}: CardProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <ActivityCard
        activity={activity}
        photoMap={photoMap}
        onClick={() => onActivityClick(activity)}
      />
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 0.75,
          px: 0.5,
        }}
      >
        <Typography
          sx={{ fontSize: 12, fontWeight: 500, color: 'text.secondary', mr: 0.5 }}
        >
          Restore to
        </Typography>
        {days.map((day, i) => {
          const dayNumber = day.day_number ?? i + 1;
          return (
            <Chip
              key={day._uid ?? dayNumber}
              label={`Day ${dayNumber}`}
              size="small"
              clickable
              onClick={() => onRestore(activity, dayNumber)}
              sx={{ fontSize: 12 }}
            />
          );
        })}
      </Box>
    </Box>
  );
}
