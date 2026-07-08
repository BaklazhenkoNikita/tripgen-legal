'use client';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import { alpha, type Theme } from '@mui/material/styles';
import { Droppable } from '@hello-pangea/dnd';
import { Trash2 } from 'lucide-react';
import type { DayPlan } from '@/types';

interface Props {
  days: DayPlan[];
  activeIndex: number;
  onSelect: (index: number) => void;
  /** Per-day activity counts for the tab subtitle. */
  counts: number[];
  /**
   * When true, each tab is a drop target: dragging a card onto a day tab
   * moves it to that day. Requires an enclosing DragDropContext.
   */
  droppable?: boolean;
  /**
   * When provided, each tab shows a trash affordance that requests removal of
   * that day. Omitted in read-only mode (no delete UI). The parent should only
   * pass this when more than one day exists so the last day can't be deleted.
   */
  onDeleteDay?: (dayNumber: number) => void;
}

/**
 * Horizontal day selector for the itinerary workspace. One day is focused at
 * a time (replacing the long all-days scroll). In edit mode each tab doubles
 * as a drop zone so cross-day moves survive the switch to tabs — drag a stop
 * onto "Day 3" to send it there.
 */
export function DayTabs({ days, activeIndex, onSelect, counts, droppable, onDeleteDay }: Props) {
  return (
    <Box
      role="tablist"
      aria-label="Trip days"
      sx={{
        display: 'flex',
        gap: 1,
        overflowX: 'auto',
        pb: 0.5,
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {days.map((day, i) => {
        const dayNumber = day.day_number ?? i + 1;
        const active = i === activeIndex;
        const count = counts[i] ?? 0;

        const tab = (isDropTarget: boolean, dropRef?: React.Ref<HTMLDivElement>, dropProps?: object) => (
          <Box
            ref={dropRef}
            {...(dropProps ?? {})}
            sx={{
              position: 'relative',
              // Reveal the delete affordance on hover/focus for non-active tabs;
              // the active tab keeps it always visible (see button sx below).
              '&:hover .day-tab-delete, &:focus-within .day-tab-delete': { opacity: 1 },
            }}
          >
            <ButtonBase
              role="tab"
              aria-selected={active}
              onClick={() => onSelect(i)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 0.25,
                minWidth: 92,
                minHeight: 56,
                flexShrink: 0,
                borderRadius: 2,
                border: '1px solid',
                borderColor: active ? 'primary.main' : 'divider',
                bgcolor: (t: Theme) =>
                  active
                    ? alpha(t.palette.primary.main, 0.1)
                    : isDropTarget
                      ? alpha(t.palette.route.main, 0.14)
                      : 'background.paper',
                px: 1.5,
                py: 1,
                textAlign: 'left',
                transition: 'border-color 0.15s, background-color 0.15s',
                outline: (t: Theme) =>
                  isDropTarget ? `2px dashed ${alpha(t.palette.route.main, 0.6)}` : 'none',
                outlineOffset: '-2px',
                '&:hover': {
                  borderColor: active ? 'primary.main' : 'text.disabled',
                },
              }}
            >
              <Box
                component="span"
                sx={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: active ? 'primary.main' : 'text.primary',
                }}
              >
                Day {dayNumber}
              </Box>
              <Box
                component="span"
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: 'text.secondary',
                  whiteSpace: 'nowrap',
                }}
              >
                {count} {count === 1 ? 'stop' : 'stops'}
              </Box>
            </ButtonBase>
            {onDeleteDay ? (
              <IconButton
                className="day-tab-delete"
                size="small"
                aria-label={`Remove day ${dayNumber}`}
                title="Remove day"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteDay(dayNumber);
                }}
                sx={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  width: 24,
                  height: 24,
                  color: 'text.secondary',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  opacity: active ? 1 : 0,
                  transition: 'opacity 0.15s, color 0.15s, background-color 0.15s',
                  '&:hover': {
                    color: 'error.main',
                    bgcolor: (t: Theme) => alpha(t.palette.error.main, 0.1),
                    borderColor: (t: Theme) => alpha(t.palette.error.main, 0.4),
                  },
                }}
              >
                <Trash2 size={13} aria-hidden />
              </IconButton>
            ) : null}
          </Box>
        );

        if (!droppable) {
          return <Box key={dayNumber}>{tab(false)}</Box>;
        }

        return (
          <Droppable key={dayNumber} droppableId={`daytab-${dayNumber}`} type="ACTIVITY">
            {(provided, snapshot) => (
              <Box ref={provided.innerRef} {...provided.droppableProps} sx={{ flexShrink: 0 }}>
                {tab(snapshot.isDraggingOver)}
                <Box sx={{ display: 'none' }}>{provided.placeholder}</Box>
              </Box>
            )}
          </Droppable>
        );
      })}
    </Box>
  );
}
