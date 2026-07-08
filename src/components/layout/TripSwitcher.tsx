'use client';

import { memo, useMemo, useState } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import MuiMenu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { ChevronDown, MapPin, Plus, Map as MapIcon, Check } from 'lucide-react';
import { useActiveTripOptional } from '@/contexts/ActiveTripContext';
import { useSearchHistory, type SearchHistoryItem } from '@/hooks/useSearchHistory';
import { tgShadow } from '@/theme/shadows';

/** Short date range for a trip pill, e.g. "Jul 8–10" or "Jul 8 – Aug 2". */
function formatDateRange(item: SearchHistoryItem): string | null {
  const preset = item.result_summary?.date_range;
  if (preset) return preset;
  const start = item.start_date ? new Date(item.start_date) : null;
  const end = item.end_date ? new Date(item.end_date) : null;
  if (!start || Number.isNaN(start.getTime())) return null;
  const mon = (d: Date) => d.toLocaleDateString(undefined, { month: 'short' });
  if (!end || Number.isNaN(end.getTime())) {
    return `${mon(start)} ${start.getDate()}`;
  }
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${mon(start)} ${start.getDate()}–${end.getDate()}`;
  }
  return `${mon(start)} ${start.getDate()} – ${mon(end)} ${end.getDate()}`;
}

function tripLabel(item: SearchHistoryItem): string {
  return (
    item.user_title ||
    item.result_summary?.destination_display ||
    item.destination ||
    item.parameters?.destination ||
    'Trip'
  );
}

/**
 * Active-trip context switcher for the nav. Shows the current trip
 * ("Tokyo · Jul 8–10") and lets the user jump between recent trips, so the
 * whole product — and the contextual AI — stays anchored to one trip. Renders
 * nothing until there's an active trip the user has actually opened.
 */
export const TripSwitcher = memo(function TripSwitcher({
  onNavigate,
}: {
  onNavigate?: (href: string) => void;
}) {
  const theme = useTheme();
  const active = useActiveTripOptional();
  const activeTripId = active?.activeTripId ?? null;
  const { data: trips } = useSearchHistory({ limit: 8 });
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const open = Boolean(anchor);

  const current = useMemo(
    () => trips?.find((t) => t.search_id === activeTripId) ?? null,
    [trips, activeTripId],
  );

  // No active trip (or its summary hasn't loaded) → the plain "Plan a trip"
  // nav item covers the entry point; don't show an empty switcher.
  if (!activeTripId) return null;

  const label = current ? tripLabel(current) : 'Current trip';
  const dateRange = current ? formatDateRange(current) : null;

  const go = (href: string, tripId?: string) => {
    if (tripId) active?.setActiveTripId(tripId);
    onNavigate?.(href);
    setAnchor(null);
  };

  return (
    <>
      <Box
        component="button"
        type="button"
        onClick={(e) => setAnchor(e.currentTarget as HTMLElement)}
        aria-label={`Current trip: ${label}. Switch trip`}
        aria-haspopup="menu"
        aria-expanded={open}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          minHeight: 40,
          maxWidth: 260,
          borderRadius: 999,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          pl: 1.25,
          pr: 1,
          py: 0.5,
          cursor: 'pointer',
          transition: 'border-color 0.15s, background-color 0.15s',
          '&:hover': {
            borderColor: alpha(theme.palette.primary.main, 0.4),
            bgcolor: alpha(theme.palette.primary.main, 0.04),
          },
        }}
      >
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            color: 'primary.main',
            flexShrink: 0,
          }}
        >
          <MapPin size={15} aria-hidden />
        </Box>
        <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
          <Box
            component="span"
            sx={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'text.primary',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {label}
          </Box>
          {dateRange ? (
            <Box
              component="span"
              sx={{
                fontSize: '0.8rem',
                fontWeight: 500,
                color: 'text.secondary',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                display: { xs: 'none', lg: 'inline' },
              }}
            >
              · {dateRange}
            </Box>
          ) : null}
        </Box>
        <Box component="span" sx={{ display: 'inline-flex', color: 'text.secondary', flexShrink: 0 }}>
          <ChevronDown size={14} aria-hidden />
        </Box>
      </Box>

      <MuiMenu
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 260,
              maxWidth: 320,
              borderRadius: 1.5,
              border: (t) => `1px solid ${t.palette.divider}`,
              boxShadow: (t) => tgShadow(t, 'dropdown'),
              p: 0.5,
            },
          },
        }}
      >
        <Typography
          sx={{
            px: 1.5,
            py: 0.75,
            fontSize: '0.6875rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'text.disabled',
          }}
        >
          Your trips
        </Typography>
        {(trips ?? []).map((t) => {
          const isCurrent = t.search_id === activeTripId;
          const range = formatDateRange(t);
          return (
            <MenuItem
              key={t.search_id}
              component={Link}
              href={`/trip/${t.search_id}`}
              prefetch
              onClick={() => go(`/trip/${t.search_id}`, t.search_id)}
              sx={{ borderRadius: 1, py: 1, px: 1.5, gap: 1, alignItems: 'flex-start' }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: '0.9rem',
                    fontWeight: isCurrent ? 600 : 500,
                    color: 'text.primary',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {tripLabel(t)}
                </Typography>
                {range ? (
                  <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                    {range}
                  </Typography>
                ) : null}
              </Box>
              {isCurrent ? (
                <Box component="span" sx={{ mt: 0.25, color: 'primary.main', flexShrink: 0 }}>
                  <Check size={15} aria-hidden />
                </Box>
              ) : null}
            </MenuItem>
          );
        })}
        <Divider sx={{ my: 0.5 }} />
        <MenuItem
          component={Link}
          href="/trip?new=1"
          prefetch
          onClick={() => go('/trip?new=1')}
          sx={{ borderRadius: 1, py: 1, px: 1.5, gap: 1, fontSize: '0.9rem' }}
        >
          <Plus size={15} aria-hidden />
          New trip
        </MenuItem>
        <MenuItem
          component={Link}
          href="/history"
          prefetch
          onClick={() => go('/history')}
          sx={{ borderRadius: 1, py: 1, px: 1.5, gap: 1, fontSize: '0.9rem' }}
        >
          <MapIcon size={15} aria-hidden />
          All trips
        </MenuItem>
      </MuiMenu>
    </>
  );
});
