'use client';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { alpha, type Theme } from '@mui/material/styles';
import { Droppable } from '@hello-pangea/dnd';
import type { DayPlan } from '@/types';
import { parseIsoDateLocal } from '@/lib/date';
import { minTap, textScale } from '@/theme/standards';

interface Props {
  days: DayPlan[];
  activeIndex: number;
  onSelect: (index: number) => void;
  /** Per-day activity counts. */
  counts: number[];
  /**
   * When true, each tab is a drop target: dragging a card onto a day tab
   * moves it to that day. Requires an enclosing DragDropContext.
   */
  droppable?: boolean;
}

/** "Mon 28" for the tab's date hint. */
function tabDate(iso?: string): string | null {
  const d = parseIsoDateLocal(iso);
  if (!d) return null;
  return `${d.toLocaleDateString('en-US', { weekday: 'short' })} ${d.getDate()}`;
}

/**
 * Compact day selector for the itinerary workspace: one pill per day
 * ("Day 2 · Tue 29 · 6"). In edit mode each pill doubles as a drop zone so
 * cross-day moves survive the switch to tabs — drag a stop onto "Day 3" to
 * send it there. Day delete/reorder live in the day header's ⋯ menu.
 */
export function DayTabs({ days, activeIndex, onSelect, counts, droppable }: Props) {
  return (
    <Box
      role="tablist"
      aria-label="Trip days"
      sx={{
        display: 'flex',
        gap: 1,
        minWidth: 0,
        overflowX: 'auto',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {days.map((day, i) => {
        const dayNumber = day.day_number ?? i + 1;
        const active = i === activeIndex;
        const count = counts[i] ?? 0;
        const date = tabDate(day.date);

        const tab = (isDropTarget: boolean) => (
          <ButtonBase
            role="tab"
            aria-selected={active}
            aria-label={`Day ${dayNumber}${date ? `, ${date}` : ''}, ${count} ${count === 1 ? 'stop' : 'stops'}`}
            onClick={() => onSelect(i)}
            sx={{
              ...textScale.label,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              minHeight: minTap,
              px: 2,
              flexShrink: 0,
              whiteSpace: 'nowrap',
              borderRadius: 999,
              border: '1px solid',
              borderColor: active ? 'primary.main' : 'divider',
              color: active ? 'primary.main' : 'text.primary',
              bgcolor: (t: Theme) =>
                active
                  ? alpha(t.palette.primary.main, 0.1)
                  : isDropTarget
                    ? alpha(t.palette.route.main, 0.14)
                    : 'background.paper',
              outline: (t: Theme) =>
                isDropTarget ? `2px dashed ${alpha(t.palette.route.main, 0.6)}` : 'none',
              outlineOffset: '-2px',
              transition: 'border-color 0.15s, background-color 0.15s',
              '&:hover': { borderColor: active ? 'primary.main' : 'text.disabled' },
            }}
          >
            <span>Day {dayNumber}</span>
            {date ? (
              <Box
                component="span"
                aria-hidden
                sx={{ display: { xs: 'none', lg: 'inline' }, fontWeight: 500, color: 'text.secondary' }}
              >
                {date}
              </Box>
            ) : null}
            <Box
              component="span"
              aria-hidden
              sx={{
                ...textScale.meta,
                minWidth: 20,
                height: 20,
                px: 0.75,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 999,
                bgcolor: (t: Theme) =>
                  active ? alpha(t.palette.primary.main, 0.16) : alpha(t.palette.text.primary, 0.06),
                color: active ? 'primary.main' : 'text.secondary',
              }}
            >
              {count}
            </Box>
          </ButtonBase>
        );

        if (!droppable) {
          return (
            <Box key={dayNumber} sx={{ flexShrink: 0 }}>
              {tab(false)}
            </Box>
          );
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
