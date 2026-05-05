'use client';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
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
        display: 'inline-flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: { xs: 1.25, sm: 2 },
        px: { xs: 1.25, sm: 1.75 },
        py: { xs: 0.75, sm: 1 },
        borderRadius: 999,
        bgcolor: (t) => alpha(t.palette.common.black, 0.42),
        backdropFilter: 'blur(10px)',
        border: '1px solid',
        borderColor: (t) => alpha(t.palette.common.white, 0.18),
        color: 'common.white',
        textShadow: '0 1px 4px rgba(0,0,0,0.45)',
      }}
    >
      {(dateRange || durationLabel) ? (
        <Slot icon={<Calendar size={14} aria-hidden />}>
          {dateRange ? (
            <Box component="span" sx={{ fontWeight: 600, color: 'inherit' }}>
              {dateRange}
            </Box>
          ) : null}
          {durationLabel ? (
            <Box component="span" sx={{ color: 'inherit', opacity: 0.78 }}>
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
            sx={{ fontWeight: 600, color: 'inherit', textTransform: 'capitalize' }}
          >
            {budget}
          </Box>
          <Box component="span" sx={{ color: 'inherit', opacity: 0.78 }}> budget</Box>
        </Slot>
      ) : null}

      {onEdit ? (
        <ButtonBase
          onClick={onEdit}
          aria-label="Edit trip"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            fontSize: 13,
            color: 'inherit',
            opacity: 0.85,
            borderRadius: 999,
            px: { xs: 1, sm: 1 },
            py: 0.5,
            border: '1px solid',
            borderColor: (t) => alpha(t.palette.common.white, 0.25),
            '&:hover': { opacity: 1 },
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
        color: 'inherit',
      }}
    >
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          color: (t) => alpha(t.palette.common.white, 0.7),
        }}
      >
        {icon}
      </Box>
      <Typography component="span" sx={{ fontSize: 13, color: 'inherit' }}>
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
