'use client';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha, type Theme } from '@mui/material/styles';
import { ArrowRight, Clock, Sparkles, Star, X } from 'lucide-react';
import { Draggable, type DraggableProvided } from '@hello-pangea/dnd';
import type { TravelActivity } from '@/types';
import { getActivityImageUrl } from '@/hooks/useActivityPhotos';
import { Photo } from '@/components/ui/Photo';
import { Badge } from '@/components/ui/Badge';
import { tgShadow } from '@/theme/shadows';
import { radii, textScale } from '@/theme/standards';

interface Props {
  activity: TravelActivity;
  index: number;
  photoMap?: Record<string, string>;
  onDelete?: () => void;
  onClick?: () => void;
  /** Render as a plain, non-draggable card (used on read-only trip surfaces). */
  readOnly?: boolean;
  /** 1-based stop order within the day — shown as a numbered medallion and
   *  matched to the numbered map marker. */
  stopNumber?: number;
  /** Estimated travel to the next stop, e.g. "5 min walk" (route-blue footer). */
  travelToNext?: string | null;
  /** Highlighted because its map pin is hovered (bidirectional sync). */
  highlighted?: boolean;
  /** Fires this card's activity id on hover (null on leave) to highlight its pin. */
  onHoverChange?: (activityId: string | null) => void;
}

export function ActivityDragItem({
  activity,
  index,
  photoMap,
  onDelete,
  onClick,
  readOnly = false,
  stopNumber,
  travelToNext,
  highlighted = false,
  onHoverChange,
}: Props) {
  const imageUrl = getActivityImageUrl(activity, photoMap);
  const primaryCategory = activity.category?.[0];
  const categoryLabel = primaryCategory ? humanizeCategory(primaryCategory) : null;
  // Body meta line: duration first (it left the photo so the delete button
  // no longer covers it), then the remaining categories / time of visit.
  const extraCategories = (activity.category ?? []).slice(1, 3).map(humanizeCategory);
  const metaParts = [
    activity.duration ?? null,
    ...(extraCategories.length > 0
      ? extraCategories
      : activity.time_of_visit
        ? [humanizeCategory(activity.time_of_visit)]
        : []),
  ].filter((x): x is string => Boolean(x));

  // Card body shared by the draggable and read-only variants. `dragProps`
  // carries the ref + drag handle bindings when draggable; `isDragging`
  // drives the lifted-card styling.
  const renderCard = (provided?: DraggableProvided, isDragging = false) => (
    <Box
      ref={provided?.innerRef}
      {...(provided?.draggableProps ?? {})}
      {...(provided?.dragHandleProps ?? {})}
      onClick={onClick}
      onMouseEnter={onHoverChange ? () => onHoverChange(activity.id) : undefined}
      onMouseLeave={onHoverChange ? () => onHoverChange(null) : undefined}
      role="button"
      tabIndex={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: radii.card,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        cursor: readOnly ? 'pointer' : 'grab',
        userSelect: 'none',
        textAlign: 'left',
        transition: 'all 0.2s ease',
        ...(readOnly ? null : { '&:active': { cursor: 'grabbing' } }),
        '&:hover': {
          borderColor: (t: Theme) => alpha(t.palette.primary.main, 0.32),
          boxShadow: (t: Theme) => tgShadow(t, 'card'),
        },
        '&:hover .activity-delete': { opacity: 1 },
        ...(highlighted
          ? {
              borderColor: (t: Theme) => alpha(t.palette.primary.main, 0.5),
              boxShadow: (t: Theme) => tgShadow(t, 'cardHover'),
            }
          : null),
        ...(isDragging
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
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                {stopNumber != null ? (
                  <Box
                    component="span"
                    aria-hidden
                    sx={{
                      ...textScale.meta,
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      flexShrink: 0,
                      color: 'primary.contrastText',
                      bgcolor: 'primary.main',
                      boxShadow: (t: Theme) => tgShadow(t, 'markerLabel'),
                    }}
                  >
                    {stopNumber}
                  </Box>
                ) : null}
                {categoryLabel ? (
                  <Box
                    component="span"
                    sx={{
                      ...textScale.meta,
                      fontWeight: 600,
                      px: 1,
                      height: 24,
                      display: 'inline-flex',
                      alignItems: 'center',
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      borderRadius: 999,
                      color: 'text.primary',
                      bgcolor: (t: Theme) => alpha(t.palette.background.paper, 0.92),
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    {categoryLabel}
                  </Box>
                ) : null}
              </Box>
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
                aria-label={`Remove ${activity.name}`}
                size="small"
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 32,
                  height: 32,
                  '&::after': { content: '""', position: 'absolute', inset: -6 },
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

          <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', gap: 0.5, p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Typography
                component="h4"
                sx={{
                  flex: 1,
                  fontSize: '1rem',
                  fontWeight: 600,
                  lineHeight: 1.3,
                  color: 'text.primary',
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
            {metaParts.length > 0 ? (
              <Typography
                component="div"
                sx={{
                  ...textScale.meta,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: 'text.secondary',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                {activity.duration ? <Clock size={12} aria-hidden style={{ flexShrink: 0 }} /> : null}
                <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {metaParts.join(' · ')}
                </Box>
              </Typography>
            ) : null}
            {activity.description ? (
              <Typography
                sx={{
                  ...textScale.label,
                  fontWeight: 400,
                  mt: 0.5,
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
          {travelToNext ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 2,
                py: 1,
                borderTop: '1px solid',
                borderColor: 'divider',
                ...textScale.meta,
                fontWeight: 600,
                color: (t: Theme) => t.palette.route.main,
              }}
            >
              <ArrowRight size={13} aria-hidden />
              <Box component="span">{travelToNext} to next stop</Box>
            </Box>
          ) : null}
        </Box>
  );

  if (readOnly) {
    return renderCard();
  }

  return (
    <Draggable draggableId={activity.id} index={index}>
      {(provided, snapshot) => renderCard(provided, snapshot.isDragging)}
    </Draggable>
  );
}

/** "street_food" / "hiking" → "Street food" / "Hiking". */
function humanizeCategory(raw: string): string {
  const text = raw.replace(/[_-]+/g, ' ').trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}
