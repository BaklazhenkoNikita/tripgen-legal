'use client';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { DestinationInfo } from '@/types';
import { ConditionIcon } from '@/components/destinations/weatherIcon';
import { formatTemps, type TripWeather } from '@/hooks/useTripWeather';
import { textScale } from '@/theme/standards';

interface Props {
  info?: DestinationInfo | null;
  isLoading?: boolean;
  /** Whether the expanded city details (CityOverviewDetails) are open. */
  open: boolean;
  onToggle: () => void;
  controlsId: string;
  weather: TripWeather;
}

/**
 * One borderless line under the trip banner: the city description (clamped
 * to a line, "More" expands it plus the full city details below) and a
 * weather chip. Replaces the description-card + mostly-empty weather-card row.
 */
export function TripAboutStrip({ info, isLoading, open, onToggle, controlsId, weather }: Props) {
  const description = info?.description?.trim();
  const chip = weatherChipText(weather);

  if (!description && !chip && !isLoading) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'stretch', md: open ? 'flex-start' : 'center' },
        gap: { xs: 1, md: 3 },
        // Reserve the row while the description loads so content below doesn't jump.
        minHeight: 44,
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'baseline', gap: 1 }}>
        {description ? (
          <>
            <Typography
              sx={{
                ...textScale.support,
                color: 'text.primary',
                m: 0,
                minWidth: 0,
                ...(open
                  ? {}
                  : { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }),
              }}
            >
              {description}
            </Typography>
            <ButtonBase
              onClick={onToggle}
              aria-expanded={open}
              aria-controls={controlsId}
              sx={{
                ...textScale.label,
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                minHeight: 44,
                px: 0.5,
                color: 'primary.main',
                borderRadius: 1,
                '&:hover': { color: 'primary.dark' },
              }}
            >
              {open ? 'Less' : 'More'}
              {open ? <ChevronUp size={14} aria-hidden /> : <ChevronDown size={14} aria-hidden />}
            </ButtonBase>
          </>
        ) : isLoading ? (
          <Box sx={{ height: 14, width: '60%', borderRadius: 1, bgcolor: 'action.hover' }} />
        ) : null}
      </Box>

      {chip ? (
        <Box
          sx={{
            ...textScale.label,
            fontWeight: 500,
            flexShrink: 0,
            alignSelf: { xs: 'flex-start', md: 'center' },
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            minHeight: 36,
            borderRadius: 999,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            color: 'text.secondary',
            whiteSpace: 'nowrap',
          }}
        >
          <Box component="span" sx={{ display: 'inline-flex', color: 'text.primary' }}>
            <ConditionIcon code={weather.today?.conditionText} size={16} />
          </Box>
          {chip}
        </Box>
      ) : null}
    </Box>
  );
}

function weatherChipText(weather: TripWeather): string | null {
  const today = weather.today;
  const temps = today ? formatTemps(today.hi, today.lo) : null;
  const now = [temps, today?.conditionText].filter(Boolean).join(' · ');
  if (!now) return null;
  return weather.outsideForecastWindow
    ? `${now} today · forecast closer to your trip`
    : `${now} today`;
}
