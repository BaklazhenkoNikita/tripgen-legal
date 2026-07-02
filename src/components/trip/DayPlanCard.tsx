'use client';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { alpha, type Theme } from '@mui/material/styles';
import { ChevronDown, MapPin } from 'lucide-react';
import type { DayPlan, TravelActivity } from '@/types';
import { ActivityCard } from './ActivityCard';
import { Badge } from '@/components/ui/Badge';

interface Props {
  day: DayPlan;
  dayIndex: number;
  activities: TravelActivity[];
  photoMap?: Record<string, string>;
  isActive: boolean;
  onSelect: () => void;
  onActivityClick?: (activity: TravelActivity) => void;
}

export function DayPlanCard({
  day,
  dayIndex,
  activities,
  photoMap,
  isActive,
  onSelect,
  onActivityClick,
}: Props) {
  const dayNumber = day.day_number ?? dayIndex + 1;

  return (
    <Box
      component="article"
      sx={{
        overflow: 'hidden',
        borderRadius: 3,
        border: '1px solid',
        bgcolor: 'background.paper',
        transition: 'all 0.2s ease',
        ...(isActive
          ? {
              borderColor: (t: Theme) => alpha(t.palette.primary.main, 0.5),
              boxShadow: (t: Theme) =>
                `0 6px 20px ${alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.4 : 0.12)}`,
            }
          : {
              borderColor: 'divider',
            }),
      }}
    >
      <ButtonBase
        type="button"
        onClick={onSelect}
        sx={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          gap: 2,
          px: 2.5,
          py: 2,
          textAlign: 'left',
          justifyContent: 'flex-start',
        }}
      >
        {/* Day number medallion */}
        <Box
          sx={{
            display: 'flex',
            flexShrink: 0,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 2,
            px: 1.5,
            py: 1,
            transition: 'background-color 0.2s ease, color 0.2s ease',
            ...(isActive
              ? { bgcolor: 'primary.main', color: 'primary.contrastText' }
              : {
                  bgcolor: (t: Theme) => alpha(t.palette.text.primary, 0.04),
                  color: 'text.primary',
                }),
          }}
        >
          <Box
            component="span"
            sx={{
              fontSize: '0.625rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              opacity: 0.8,
            }}
          >
            Day
          </Box>
          <Box
            component="span"
            sx={{ fontSize: '1.5rem', fontWeight: 600, lineHeight: 1 }}
          >
            {dayNumber}
          </Box>
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
            <Typography
              component="h3"
              sx={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: 'text.primary',
                m: 0,
              }}
            >
              {day.title ?? `Day ${dayNumber}`}
            </Typography>
            {day.city ? (
              <Badge tone="accent" size="sm" iconLeft={<MapPin size={12} />}>
                {day.city}
              </Badge>
            ) : null}
            {day.is_skeleton ? (
              <Badge tone="warning" size="sm">
                Draft
              </Badge>
            ) : null}
          </Box>
          <Box
            sx={{
              mt: 0.25,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              columnGap: 1,
              rowGap: 0.25,
              fontSize: '0.75rem',
              color: 'text.disabled',
            }}
          >
            {day.date ? <Box component="span">{day.date}</Box> : null}
            <Box component="span">
              {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            flexShrink: 0,
            display: 'inline-flex',
            color: isActive ? 'text.primary' : 'text.disabled',
            transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          <ChevronDown size={16} aria-hidden />
        </Box>
      </ButtonBase>

      {day.notes && !isActive ? (
        <Typography
          sx={{
            mx: 2.5,
            mb: 2,
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            overflow: 'hidden',
            borderRadius: 1.5,
            bgcolor: (t: Theme) => alpha(t.palette.text.primary, 0.04),
            px: 1.5,
            py: 1,
            fontSize: '0.75rem',
            color: 'text.secondary',
          }}
        >
          {day.notes}
        </Typography>
      ) : null}

      {isActive ? (
        <Box
          sx={{
            borderTop: (t: Theme) => `1px solid ${t.palette.divider}`,
            bgcolor: (t: Theme) => alpha(t.palette.text.primary, 0.02),
            px: 2.5,
            pb: 2.5,
            pt: 2,
          }}
        >
          {activities.length > 0 ? (
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                },
              }}
            >
              {activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  photoMap={photoMap}
                  onClick={() => onActivityClick?.(activity)}
                />
              ))}
            </Box>
          ) : (
            <Typography
              sx={{
                borderRadius: 1.5,
                border: '1px dashed',
                borderColor: 'divider',
                py: 3,
                textAlign: 'center',
                fontSize: '0.875rem',
                color: 'text.disabled',
              }}
            >
              No activities yet — try Surprise Day to autofill.
            </Typography>
          )}

          {day.notes ? (
            <Typography
              sx={{
                mt: 2,
                borderRadius: 1.5,
                bgcolor: 'background.paper',
                px: 1.5,
                py: 1.25,
                fontSize: '0.75rem',
                color: 'text.secondary',
              }}
            >
              {day.notes}
            </Typography>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
}
