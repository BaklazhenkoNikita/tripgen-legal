'use client';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha, type Theme } from '@mui/material/styles';
import { Clock, MapPin, Sparkles, Star, X } from 'lucide-react';
import { Draggable } from '@hello-pangea/dnd';
import type { TravelActivity } from '@/types';
import { getActivityImageUrl } from '@/hooks/useActivityPhotos';
import { Photo } from '@/components/ui/Photo';
import { Badge } from '@/components/ui/Badge';
import { tgShadow } from '@/theme/shadows';

interface Props {
  activity: TravelActivity;
  index: number;
  photoMap?: Record<string, string>;
  onDelete?: () => void;
  onClick?: () => void;
}

export function ActivityDragItem({ activity, index, photoMap, onDelete, onClick }: Props) {
  const imageUrl = getActivityImageUrl(activity, photoMap);
  const primaryCategory = activity.category?.[0];
  const secondarySubtitle =
    activity.category && activity.category.length > 1
      ? activity.category.slice(0, 3).join(' · ')
      : null;

  return (
    <Draggable draggableId={activity.id} index={index}>
      {(provided, snapshot) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          role="button"
          tabIndex={0}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            cursor: 'grab',
            userSelect: 'none',
            textAlign: 'left',
            transition: 'all 0.2s ease',
            '&:active': { cursor: 'grabbing' },
            '&:hover': {
              borderColor: (t: Theme) => alpha(t.palette.primary.main, 0.32),
              boxShadow: (t: Theme) => tgShadow(t, 'card'),
            },
            '&:hover .activity-delete': { opacity: 1 },
            ...(snapshot.isDragging
              ? {
                  boxShadow: (t: Theme) => tgShadow(t, 'cardHover'),
                  borderColor: (t: Theme) => alpha(t.palette.primary.main, 0.4),
                  outline: (t: Theme) => `2px solid ${alpha(t.palette.primary.main, 0.24)}`,
                  outlineOffset: 0,
                }
              : null),
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <Photo
              src={imageUrl ?? null}
              alt={activity.name}
              aspect="16/9"
              zoomOnHover
              sizes="(max-width: 640px) 100vw, 50vw"
            />
            <Box
              sx={{
                pointerEvents: 'none',
                position: 'absolute',
                insetInline: 8,
                top: 8,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Badge
                tone="activity"
                size="sm"
                iconLeft={<MapPin size={12} />}
              >
                {primaryCategory ?? 'Activity'}
              </Badge>
              {activity.duration ? (
                <Badge
                  tone="neutral"
                  size="sm"
                  iconLeft={<Clock size={12} />}
                  style={{
                    backgroundColor: 'rgb(var(--tg-palette-background-paperChannel) / 0.92)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  {activity.duration}
                </Badge>
              ) : null}
            </Box>

            {onDelete && (
              <IconButton
                className="activity-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                onMouseDown={(e) => e.stopPropagation()}
                title="Remove activity"
                size="small"
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  opacity: { xs: 1, md: 0 },
                  transition: 'opacity 0.15s ease, background-color 0.15s ease',
                  bgcolor: (t: Theme) => alpha(t.palette.common.white, 0.95),
                  backdropFilter: 'blur(8px)',
                  color: 'text.primary',
                  '&:hover': {
                    bgcolor: (t: Theme) => alpha(t.palette.error.main, 0.95),
                    color: (t: Theme) => t.palette.error.contrastText,
                  },
                }}
              >
                <X size={14} />
              </IconButton>
            )}
          </Box>

          <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', gap: 0.5, p: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Typography
                component="h4"
                sx={{
                  flex: 1,
                  fontWeight: 600,
                  lineHeight: 1.25,
                  color: 'text.primary',
                  fontSize: 14,
                  m: 0,
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 1,
                  overflow: 'hidden',
                }}
              >
                {activity.name}
              </Typography>
              <Box sx={{ display: 'flex', flexShrink: 0, alignItems: 'center', gap: 0.5 }}>
                {activity.must_see ? (
                  <Badge tone="warning" size="sm" iconLeft={<Sparkles size={12} />}>
                    Must
                  </Badge>
                ) : null}
                {typeof activity.rating === 'number' ? (
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.25,
                      fontSize: 12,
                      fontWeight: 500,
                      color: 'warning.main',
                    }}
                  >
                    <Star size={12} fill="currentColor" aria-hidden />
                    {activity.rating.toFixed(1)}
                  </Box>
                ) : null}
              </Box>
            </Box>
            {secondarySubtitle ? (
              <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                {secondarySubtitle}
              </Typography>
            ) : activity.time_of_visit ? (
              <Typography sx={{ fontSize: 11, color: 'text.disabled', textTransform: 'capitalize' }}>
                {activity.time_of_visit}
              </Typography>
            ) : null}
            {activity.description ? (
              <Typography
                sx={{
                  fontSize: 12,
                  color: 'text.secondary',
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2,
                  overflow: 'hidden',
                }}
              >
                {activity.description}
              </Typography>
            ) : null}
          </Box>
        </Box>
      )}
    </Draggable>
  );
}
