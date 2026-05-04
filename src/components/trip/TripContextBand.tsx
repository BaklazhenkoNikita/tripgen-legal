'use client';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { Calendar, Coins, Pencil } from 'lucide-react';

interface Props {
  startDate?: string;
  endDate?: string;
  durationDays?: number;
  budget?: string;
  /** Owner-only. Hidden when not provided. */
  onEdit?: () => void;
}

/** Trip-specific context (dates, budget, edit). Visually distinct from the
 *  destination facts in DestinationHero. */
export function TripContextBand({
  startDate,
  endDate,
  durationDays,
  budget,
  onEdit,
}: Props) {
  const dateRange = formatDateRange(startDate, endDate);
  const durationLabel = durationDays
    ? `${durationDays} ${durationDays === 1 ? 'day' : 'days'}`
    : null;

  if (!dateRange && !durationLabel && !budget && !onEdit) return null;

  return (
    <Box
      component="section"
      aria-label="Trip details"
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: { xs: 1.5, sm: 3 },
        py: 1.5,
        px: { xs: 2, sm: 3 },
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      {(dateRange || durationLabel) ? (
        <Slot icon={<Calendar size={14} aria-hidden />}>
          {dateRange ? (
            <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {dateRange}
            </Box>
          ) : null}
          {durationLabel ? (
            <Box component="span" sx={{ color: 'text.secondary' }}>
              {dateRange ? ' · ' : ''}
              {durationLabel}
            </Box>
          ) : null}
        </Slot>
      ) : null}

      {budget ? (
        <Slot icon={<Coins size={14} aria-hidden />}>
          <Box
            component="span"
            sx={{ fontWeight: 600, color: 'text.primary', textTransform: 'capitalize' }}
          >
            {budget}
          </Box>
          <Box component="span" sx={{ color: 'text.secondary' }}> budget</Box>
        </Slot>
      ) : null}

      {onEdit ? (
        <Box sx={{ ml: 'auto' }}>
          <ButtonBase
            onClick={onEdit}
            aria-label="Edit trip"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              fontSize: 13,
              color: 'text.secondary',
              textDecoration: { xs: 'none', sm: 'underline' },
              textUnderlineOffset: '3px',
              borderRadius: 999,
              px: { xs: 1, sm: 0 },
              py: { xs: 0.5, sm: 0 },
              border: { xs: '1px solid', sm: 'none' },
              borderColor: 'divider',
              '&:hover': { color: 'text.primary' },
            }}
          >
            <Pencil size={14} aria-hidden />
            <Box
              component="span"
              sx={{ display: { xs: 'none', sm: 'inline' } }}
            >
              Edit trip
            </Box>
          </ButtonBase>
        </Box>
      ) : null}
    </Box>
  );
}

function Slot({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        fontSize: 13,
        color: 'text.secondary',
      }}
    >
      <Box component="span" sx={{ display: 'inline-flex', color: 'text.disabled' }}>
        {icon}
      </Box>
      <Typography component="span" sx={{ fontSize: 13 }}>
        {children}
      </Typography>
    </Box>
  );
}

function formatDateRange(start?: string, end?: string): string | null {
  if (!start && !end) return null;
  const fmt = (s?: string) => {
    if (!s) return '';
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };
  const a = fmt(start);
  const b = fmt(end);
  if (a && b) return `${a} – ${b}`;
  return a || b || null;
}
