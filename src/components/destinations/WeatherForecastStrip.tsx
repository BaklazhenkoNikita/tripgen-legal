'use client';

import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha, type Theme } from '@mui/material/styles';
import { Droplets, Wind, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useWeather } from '@/hooks/useWeather';
import { ConditionIcon, conditionTone, TONE_COLOR } from './weatherIcon';

interface Props {
  location: string;
  /** Trip page: index of the day cell to highlight (0 = first trip day). */
  activeDayIndex?: number;
  /** "trip" shows up to 5 cells with active highlight; "explore" shows 4
   *  cells, no highlight, and hides on small mobile. */
  variant: 'trip' | 'explore';
}

interface HourReading {
  key: string;
  label: string;
  conditionText: string;
  temp?: number;
  precip?: number;
}

interface DailyReading {
  key: string;
  weekday: string;
  conditionText: string;
  hi?: number;
  lo?: number;
  precip?: number;
  humidity?: number;
  windKph?: number;
  hours: HourReading[];
}

export function WeatherForecastStrip({ location, activeDayIndex, variant }: Props) {
  const { data: weather } = useWeather(location || null);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const forecast = useMemo(
    () => extractForecast(weather?.dailyForecasts, variant === 'trip' ? 5 : 4),
    [weather?.dailyForecasts, variant],
  );

  // Clear stale expansion if forecast no longer contains the key (e.g. location change).
  useEffect(() => {
    if (expandedKey && !forecast.some((d) => d.key === expandedKey)) {
      setExpandedKey(null);
    }
  }, [forecast, expandedKey]);

  if (forecast.length === 0) return null;

  const activeIndex = variant === 'trip' ? (activeDayIndex ?? 0) : -1;
  const expanded = forecast.find((d) => d.key === expandedKey) ?? null;

  const onCellClick = (key: string) => {
    setExpandedKey((cur) => (cur === key ? null : key));
  };

  const opacityDuration = prefersReducedMotion ? 0 : 0.18;

  return (
    <Box
      component="section"
      aria-label={`Weather forecast for ${location}`}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && expandedKey) {
          e.stopPropagation();
          setExpandedKey(null);
        }
      }}
      sx={{
        display: variant === 'explore' ? { xs: 'none', sm: 'block' } : 'block',
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {expanded ? (
          <motion.div
            key={`detail-${expanded.key}`}
            role="region"
            aria-label={`Weather details for ${expanded.weekday}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: opacityDuration, ease: 'easeOut' }}
          >
            <PanelContent reading={expanded} onClose={() => setExpandedKey(null)} />
          </motion.div>
        ) : (
          <motion.div
            key="row"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: opacityDuration, ease: 'easeOut' }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'stretch',
                gap: 0.5,
                overflowX: 'auto',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
                py: 1,
                px: { xs: 0.5, sm: 0 },
              }}
            >
              {forecast.map((d, i) => {
                const tone = conditionTone(d.conditionText);
                const isActive = i === activeIndex;
                return (
                  <ButtonBase
                    key={d.key}
                    onClick={() => onCellClick(d.key)}
                    aria-label={`${d.weekday}: ${d.conditionText}`}
                    sx={{
                      flex: '1 0 auto',
                      minWidth: 84,
                      borderRadius: 2,
                      px: 1.25,
                      py: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.5,
                      bgcolor: isActive
                        ? (t: Theme) => alpha(t.palette.primary.main, 0.12)
                        : 'transparent',
                      border: '1px solid',
                      borderColor: isActive ? 'primary.main' : 'transparent',
                      transition: 'background-color 0.2s, border-color 0.2s',
                      '&:hover': {
                        bgcolor: (t: Theme) =>
                          isActive
                            ? alpha(t.palette.primary.main, 0.16)
                            : alpha(t.palette.text.primary, 0.04),
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 500,
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {d.weekday}
                    </Typography>
                    <Box sx={{ color: TONE_COLOR[tone], display: 'inline-flex' }}>
                      <ConditionIcon code={d.conditionText} size={20} />
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 0.5,
                        fontSize: 13,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {d.hi != null ? (
                        <Box component="span" sx={{ fontWeight: 500, color: 'text.primary' }}>
                          {Math.round(d.hi)}°
                        </Box>
                      ) : null}
                      {d.lo != null ? (
                        <Box component="span" sx={{ color: 'text.disabled' }}>
                          {Math.round(d.lo)}°
                        </Box>
                      ) : null}
                    </Box>
                  </ButtonBase>
                );
              })}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}

function PanelContent({
  reading,
  onClose,
}: {
  reading: DailyReading;
  onClose: () => void;
}) {
  const tone = conditionTone(reading.conditionText);
  return (
    <Box
      sx={{
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        bgcolor: (t: Theme) => alpha(t.palette.primary.main, 0.04),
        border: '1px solid',
        borderColor: (t: Theme) => alpha(t.palette.primary.main, 0.16),
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ color: TONE_COLOR[tone], display: 'inline-flex' }}>
          <ConditionIcon code={reading.conditionText} size={40} />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }}>
            {reading.weekday}
          </Typography>
          <Typography
            sx={{
              fontSize: 13,
              color: 'text.secondary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {reading.conditionText}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
          {reading.hi != null ? (
            <Typography sx={{ fontSize: 28, fontWeight: 600, color: 'text.primary' }}>
              {Math.round(reading.hi)}°
            </Typography>
          ) : null}
          {reading.lo != null ? (
            <Typography sx={{ fontSize: 16, color: 'text.secondary' }}>
              / {Math.round(reading.lo)}°
            </Typography>
          ) : null}
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          aria-label="Back to weekly forecast"
          sx={{ color: 'text.secondary', ml: 0.5 }}
        >
          <X size={18} aria-hidden />
        </IconButton>
      </Box>

      {reading.hours.length > 0 ? (
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            scrollSnapType: 'x proximity',
            mx: -0.5,
            px: 0.5,
          }}
        >
          {reading.hours.map((h) => {
            const hourTone = conditionTone(h.conditionText);
            return (
              <Box
                key={h.key}
                sx={{
                  flex: '0 0 auto',
                  minWidth: 64,
                  scrollSnapAlign: 'start',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.5,
                  py: 1,
                  px: 1,
                  borderRadius: 1.5,
                  bgcolor: (t: Theme) => alpha(t.palette.background.paper, 0.6),
                }}
              >
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: 'text.secondary',
                    letterSpacing: '0.02em',
                  }}
                >
                  {h.label}
                </Typography>
                <Box sx={{ color: TONE_COLOR[hourTone], display: 'inline-flex' }}>
                  <ConditionIcon code={h.conditionText} size={18} />
                </Box>
                {h.temp != null ? (
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: 'text.primary',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {Math.round(h.temp)}°
                  </Typography>
                ) : null}
                {h.precip != null && h.precip > 0 ? (
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: TONE_COLOR.rain,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {Math.round(h.precip)}%
                  </Typography>
                ) : null}
              </Box>
            );
          })}
        </Box>
      ) : null}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {reading.precip != null ? (
          <DetailRow
            icon={<Droplets size={16} aria-hidden />}
            label="Precipitation"
            value={`${Math.round(reading.precip)}%`}
          />
        ) : null}
        {reading.humidity != null ? (
          <DetailRow
            icon={<Droplets size={16} aria-hidden />}
            label="Humidity"
            value={`${Math.round(reading.humidity)}%`}
          />
        ) : null}
        {reading.windKph != null ? (
          <DetailRow
            icon={<Wind size={16} aria-hidden />}
            label="Wind"
            value={`${Math.round(reading.windKph)} km/h`}
          />
        ) : null}
      </Box>
    </Box>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontSize: 14 }}>
      <Box component="span" sx={{ color: 'text.disabled', display: 'inline-flex' }}>
        {icon}
      </Box>
      <Box component="span" sx={{ color: 'text.secondary', flex: 1 }}>
        {label}
      </Box>
      <Box component="span" sx={{ fontWeight: 500, color: 'text.primary' }}>
        {value}
      </Box>
    </Box>
  );
}

function extractForecast(
  raw: Array<Record<string, unknown>> | undefined,
  limit: number,
): DailyReading[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, limit).map((d, i) => {
    const dateStr = pickString(d, ['date', 'day', 'observedAt']);
    const date = dateStr ? new Date(dateStr) : null;
    const weekday =
      date && !Number.isNaN(date.getTime())
        ? date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })
        : `Day ${i + 1}`;
    const conditionText = pickString(d, ['conditionText', 'description', 'conditions']) ?? '—';
    const hi = pickNumber(d, ['temperatureMaxC', 'temp_max_c', 'tempMaxC', 'high', 'high_c']);
    const lo = pickNumber(d, ['temperatureMinC', 'temp_min_c', 'tempMinC', 'low', 'low_c']);
    const precip = pickNumber(d, ['precipitationChance', 'precip_chance', 'precip', 'pop']);
    const humidity = pickNumber(d, ['humidity', 'humidity_pct']);
    const windKph = pickNumber(d, ['windSpeedKph', 'wind_kph', 'windKph', 'wind']);
    const hoursRaw = pickArray(d, ['hours', 'hourly', 'hourlyForecasts', 'forecast_hourly']);
    const hours = extractHours(hoursRaw);
    return {
      key: dateStr ?? `${i}`,
      weekday,
      conditionText,
      hi: hi ?? undefined,
      lo: lo ?? undefined,
      precip: precip ?? undefined,
      humidity: humidity ?? undefined,
      windKph: windKph ?? undefined,
      hours,
    };
  });
}

function extractHours(raw: Array<Record<string, unknown>>): HourReading[] {
  return raw.map((h, i) => {
    const timeStr = pickString(h, ['time', 'timestamp', 'datetime', 'hour']);
    const date = timeStr ? new Date(timeStr) : null;
    const label =
      date && !Number.isNaN(date.getTime())
        ? date.toLocaleTimeString(undefined, { hour: 'numeric' })
        : timeStr ?? `${i}`;
    const conditionText =
      pickString(h, ['conditionText', 'description', 'conditions']) ?? '—';
    const temp = pickNumber(h, ['temperatureC', 'temp_c', 'tempC', 'temp']);
    const precip = pickNumber(h, ['precipitationChance', 'precip_chance', 'precip', 'pop']);
    return {
      key: timeStr ?? `${i}`,
      label,
      conditionText,
      temp: temp ?? undefined,
      precip: precip ?? undefined,
    };
  });
}

function pickNumber(obj: Record<string, unknown>, keys: string[]): number | null {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
    }
  }
  return null;
}

function pickString(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return null;
}

function pickArray(
  obj: Record<string, unknown>,
  keys: string[],
): Array<Record<string, unknown>> {
  for (const k of keys) {
    const v = obj[k];
    if (Array.isArray(v)) {
      return v.filter((x): x is Record<string, unknown> => typeof x === 'object' && x !== null);
    }
  }
  return [];
}
