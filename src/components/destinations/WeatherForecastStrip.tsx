'use client';

import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { ChevronLeft } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useWeather } from '@/hooks/useWeather';
import { ConditionIcon, conditionTone, toneColor } from './weatherIcon';

interface Props {
  location: string;
  startDate?: string;
  numDays?: number;
}

interface DailyReading {
  key: string;
  date: Date;
  conditionText: string;
  hi?: number;
  lo?: number;
  precip?: number;
  raw: Record<string, unknown>;
}

interface HourlyReading {
  key: string;
  date: Date;
  conditionText: string;
  temp?: number;
  precip?: number;
}

const VISIBLE_DAYS = 7;
const MIN_VISIBLE_DAYS = 5;
const FORECAST_WINDOW_DAYS = 14;

export function WeatherForecastStrip({ location, startDate, numDays }: Props) {
  const { data: weather } = useWeather(location || null);
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  const allDaily = useMemo(
    () => extractDaily(weather?.dailyForecasts),
    [weather?.dailyForecasts],
  );

  const tripWindow = useMemo(
    () => alignToTrip(allDaily, startDate, numDays),
    [allDaily, startDate, numDays],
  );

  const selectedDay = useMemo(
    () =>
      selectedDayKey
        ? tripWindow.readings.find((d) => d.key === selectedDayKey) ??
          allDaily.find((d) => isoDateKey(d.date) === selectedDayKey) ??
          null
        : null,
    [selectedDayKey, tripWindow.readings, allDaily],
  );

  const hourly = useMemo(
    () => extractHourlyForDay(selectedDay),
    [selectedDay],
  );

  const summary = useMemo(
    () => buildTodaySummary(weather, allDaily, tripWindow.readings),
    [weather, allDaily, tripWindow.readings],
  );

  if (allDaily.length === 0 && !location) return null;

  const drilledIn = selectedDay !== null;

  return (
    <Card
      elevation="flat"
      as="section"
      aria-label={`Weather forecast for ${location}`}
      style={{ overflow: 'visible', height: '100%' }}
    >
      <Box
        sx={{
          p: { xs: 1.25, md: 1.5 },
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 0.75,
            minHeight: 24,
          }}
        >
          {drilledIn ? (
            <>
              <ButtonBase
                onClick={() => setSelectedDayKey(null)}
                aria-label="Back to daily forecast"
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  color: 'text.secondary',
                  '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
                  '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: 2,
                  },
                }}
              >
                <ChevronLeft size={16} />
              </ButtonBase>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'text.primary',
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {formatFullDayLabel(selectedDay!.date)}
              </Typography>
            </>
          ) : (
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 500,
                color: 'text.secondary',
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              Weather in {location}
            </Typography>
          )}
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {tripWindow.outsideForecastWindow ? (
            <Typography sx={{ fontSize: 13, color: 'text.secondary', py: 1 }}>
              Forecast available closer to your trip.
            </Typography>
          ) : drilledIn ? (
            <HourlyRow readings={hourly} />
          ) : (
            <DailyGrid
              readings={tripWindow.readings}
              onSelect={(d) => setSelectedDayKey(d.key)}
            />
          )}
        </Box>

        {summary ? (
          <Typography
            sx={{
              mt: 0.75,
              pt: 0.75,
              borderTop: '1px solid',
              borderColor: 'divider',
              fontSize: 12,
              color: 'text.secondary',
            }}
          >
            {summary}
          </Typography>
        ) : null}
      </Box>
    </Card>
  );
}

// ---------- Subcomponents ----------

function DailyGrid({
  readings,
  onSelect,
}: {
  readings: DailyReading[];
  onSelect: (d: DailyReading) => void;
}) {
  if (readings.length === 0) {
    return (
      <Typography sx={{ fontSize: 13, color: 'text.secondary', py: 1 }}>
        No forecast data.
      </Typography>
    );
  }
  const todayKey = isoDateKey(new Date());
  return (
    <Box
      sx={{
        display: 'grid',
        gridAutoFlow: 'column',
        gridAutoColumns: 'minmax(64px, 1fr)',
        gap: 0.75,
        overflowX: 'auto',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {readings.map((d) => {
        const isToday = isoDateKey(d.date) === todayKey;
        const dayLabel = isToday ? 'Today' : formatDayLabel(d.date);
        return (
          <ButtonBase
            key={d.key}
            onClick={() => onSelect(d)}
            aria-label={`View hourly forecast for ${dayLabel}`}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.25,
              py: 0.75,
              px: 0.5,
              borderRadius: 1,
              cursor: 'pointer',
              bgcolor: isToday ? 'action.selected' : 'transparent',
              transition: 'background-color 0.15s, transform 0.15s',
              '&:hover': {
                bgcolor: 'action.hover',
                transform: 'translateY(-1px)',
              },
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: 2,
              },
            }}
          >
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'text.secondary',
                lineHeight: 1.2,
              }}
            >
              {dayLabel}
            </Typography>
            <Box sx={{ color: toneColor(conditionTone(d.conditionText)), display: 'inline-flex' }}>
              <ConditionIcon code={d.conditionText} size={22} strokeWidth={1.5} />
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                lineHeight: 1.15,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {d.hi != null ? (
                <Box sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }}>
                  {Math.round(d.hi)}°
                </Box>
              ) : null}
              {d.lo != null ? (
                <Box sx={{ fontSize: 11, fontWeight: 400, color: 'text.secondary' }}>
                  {Math.round(d.lo)}°
                </Box>
              ) : null}
            </Box>
            {d.precip != null && d.precip > 10 ? (
              <Typography sx={{ fontSize: 10, fontWeight: 500, color: 'info.main', lineHeight: 1 }}>
                {Math.round(d.precip)}%
              </Typography>
            ) : null}
          </ButtonBase>
        );
      })}
    </Box>
  );
}

function HourlyRow({ readings }: { readings: HourlyReading[] }) {
  if (readings.length === 0) {
    return (
      <Typography sx={{ fontSize: 13, color: 'text.secondary', py: 1 }}>
        No hourly data.
      </Typography>
    );
  }
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        overflowX: 'auto',
        scrollbarWidth: 'none',
        scrollSnapType: 'x mandatory',
        '&::-webkit-scrollbar': { display: 'none' },
        WebkitMaskImage: 'linear-gradient(to right, black 90%, transparent 100%)',
        maskImage: 'linear-gradient(to right, black 90%, transparent 100%)',
      }}
    >
      {readings.map((h, i) => {
        const isMidnight = h.date.getHours() === 0 && i > 0;
        return (
          <Box
            key={h.key}
            aria-label={`${formatHour(h.date)}: ${h.conditionText}`}
            sx={{
              flex: '0 0 auto',
              minWidth: 56,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
              py: 0.75,
              scrollSnapAlign: 'start',
            }}
          >
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 500,
                color: 'text.secondary',
                fontVariantNumeric: 'tabular-nums',
                whiteSpace: 'nowrap',
              }}
            >
              {formatHour(h.date)}
            </Typography>
            {isMidnight ? (
              <Typography sx={{ fontSize: 9, fontWeight: 600, color: 'text.disabled', lineHeight: 1 }}>
                {h.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </Typography>
            ) : null}
            <Box sx={{ color: toneColor(conditionTone(h.conditionText)), display: 'inline-flex' }}>
              <ConditionIcon code={h.conditionText} size={20} strokeWidth={1.5} />
            </Box>
            {h.temp != null ? (
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.primary', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                {Math.round(h.temp)}°
              </Typography>
            ) : null}
            {h.precip != null && h.precip > 10 ? (
              <Typography sx={{ fontSize: 10, fontWeight: 500, color: 'info.main', lineHeight: 1 }}>
                {Math.round(h.precip)}%
              </Typography>
            ) : null}
          </Box>
        );
      })}
    </Box>
  );
}

// ---------- Helpers ----------

function formatHour(date: Date): string {
  const h = date.getHours();
  const ampm = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 || 12;
  return `${h12} ${ampm}`;
}

function formatDayLabel(date: Date): string {
  const today = new Date();
  const todayKey = isoDateKey(today);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (isoDateKey(date) === todayKey) return 'Today';
  if (isoDateKey(date) === isoDateKey(tomorrow)) return 'Tomorrow';
  return date
    .toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })
    .toUpperCase();
}

function formatFullDayLabel(date: Date): string {
  const today = new Date();
  const todayKey = isoDateKey(today);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateText = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
  if (isoDateKey(date) === todayKey) return `Today · ${dateText}`;
  if (isoDateKey(date) === isoDateKey(tomorrow)) return `Tomorrow · ${dateText}`;
  const weekday = date.toLocaleDateString(undefined, { weekday: 'short' });
  return `${weekday} · ${dateText}`;
}

function isoDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function extractDaily(raw: Array<Record<string, unknown>> | undefined): DailyReading[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((d, i): DailyReading | null => {
      const dateStr = pickString(d, ['date', 'day', 'observedAt']);
      const date = dateStr ? new Date(dateStr) : null;
      if (!date || Number.isNaN(date.getTime())) return null;
      const conditionText = pickString(d, ['conditionText', 'description', 'conditions']) ?? '—';
      const hi = pickNumber(d, ['temperatureMaxC', 'temp_max_c', 'tempMaxC', 'high', 'high_c']);
      const lo = pickNumber(d, ['temperatureMinC', 'temp_min_c', 'tempMinC', 'low', 'low_c']);
      const precip = pickNumber(d, [
        'precipitationChance',
        'precip_chance',
        'precipChance',
        'pop',
      ]);
      return {
        key: dateStr ? isoDateKey(date) : `${i}`,
        date,
        conditionText,
        hi: hi ?? undefined,
        lo: lo ?? undefined,
        precip: precip ?? undefined,
        raw: d,
      };
    })
    .filter((d): d is DailyReading => d !== null);
}

function alignToTrip(
  daily: DailyReading[],
  startDate: string | undefined,
  numDays: number | undefined,
): { readings: DailyReading[]; outsideForecastWindow: boolean } {
  if (daily.length === 0) {
    return { readings: [], outsideForecastWindow: false };
  }

  const start = startDate ? new Date(startDate) : null;
  const validStart = start && !Number.isNaN(start.getTime()) ? start : null;

  if (!validStart || !numDays || numDays < 1) {
    return { readings: daily.slice(0, VISIBLE_DAYS), outsideForecastWindow: false };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntilStart = Math.floor((validStart.getTime() - today.getTime()) / 86400000);

  const byKey = new Map(daily.map((d) => [isoDateKey(d.date), d]));

  const targetKeys: string[] = [];
  for (let i = 0; i < numDays; i++) {
    const d = new Date(validStart);
    d.setDate(d.getDate() + i);
    targetKeys.push(isoDateKey(d));
  }

  const matched = targetKeys
    .map((k) => byKey.get(k))
    .filter((d): d is DailyReading => d !== undefined);

  if (matched.length === 0 && daysUntilStart > FORECAST_WINDOW_DAYS) {
    return { readings: [], outsideForecastWindow: true };
  }

  if (matched.length === 0) {
    return { readings: daily.slice(0, VISIBLE_DAYS), outsideForecastWindow: false };
  }

  let readings = matched.slice(0, Math.min(numDays, daily.length));

  // Pad short trips out to MIN_VISIBLE_DAYS by appending consecutive days that
  // follow the trip window — gives the strip a stable footprint regardless of
  // trip length.
  if (readings.length < MIN_VISIBLE_DAYS) {
    const lastDate = readings[readings.length - 1].date;
    for (let i = 1; readings.length < MIN_VISIBLE_DAYS; i++) {
      const next = new Date(lastDate);
      next.setDate(next.getDate() + i);
      const nextDay = byKey.get(isoDateKey(next));
      if (!nextDay) break;
      readings.push(nextDay);
    }
  }

  return { readings, outsideForecastWindow: false };
}

function extractHourlyForDay(day: DailyReading | null): HourlyReading[] {
  if (!day) return [];
  const raw = day.raw.hourlyForecasts ?? day.raw.hourly ?? day.raw.hours;
  if (!Array.isArray(raw)) return [];

  return (raw as Array<Record<string, unknown>>)
    .map((h, i): HourlyReading | null => {
      const tsStr = pickString(h, ['timestamp', 'time', 'observedAt', 'date']);
      const date = tsStr ? new Date(tsStr) : null;
      if (!date || Number.isNaN(date.getTime())) return null;
      const conditionText = pickString(h, ['conditionText', 'description', 'conditions']) ?? '—';
      const temp = pickNumber(h, ['temperatureC', 'temp_c', 'tempC', 'temperature']);
      const precip = pickNumber(h, [
        'precipitationChance',
        'precip_chance',
        'precipChance',
        'pop',
      ]);
      return {
        key: tsStr ?? `${i}`,
        date,
        conditionText,
        temp: temp ?? undefined,
        precip: precip ?? undefined,
      };
    })
    .filter((h): h is HourlyReading => h !== null)
    .slice(0, 24);
}

function buildTodaySummary(
  weather: { currentConditions?: Record<string, unknown> | null } | null | undefined,
  allDaily: DailyReading[],
  tripReadings: DailyReading[],
): string | null {
  const cur = weather?.currentConditions ?? null;
  const todayKey = isoDateKey(new Date());
  const today =
    allDaily.find((d) => isoDateKey(d.date) === todayKey) ?? tripReadings[0] ?? null;

  const conditionText =
    pickStringFrom(cur, ['conditionText', 'description', 'conditions']) ??
    today?.conditionText ??
    null;
  const hi = today?.hi;
  const lo = today?.lo;

  if (!conditionText && hi == null && lo == null) return null;

  const parts: string[] = [];
  parts.push(today && isoDateKey(today.date) === todayKey ? 'Today' : 'Up next');
  const hiLo = hi != null && lo != null ? `${Math.round(hi)}°/${Math.round(lo)}°` : null;
  const tail = [conditionText, hiLo].filter((x): x is string => Boolean(x)).join(' · ');
  return tail ? `${parts[0]}: ${tail}` : null;
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

function pickStringFrom(
  obj: Record<string, unknown> | null | undefined,
  keys: string[],
): string | null {
  if (!obj) return null;
  return pickString(obj, keys);
}
