'use client';

import { useMemo } from 'react';
import { useWeather } from '@/hooks/useWeather';
import {
  alignToTrip,
  extractDaily,
  isoDateKey,
  pickStringFrom,
} from '@/components/destinations/WeatherForecastStrip';

export interface DayWeather {
  conditionText: string;
  hi?: number;
  lo?: number;
}

export interface TripWeather {
  /** Daily forecast by local calendar date ("YYYY-MM-DD"). Look up a trip day by its `date`. */
  byDate: Map<string, DayWeather>;
  /** True when the trip starts beyond the forecast horizon (no trip day has data). */
  outsideForecastWindow: boolean;
  /** Today's reading at the destination (current-conditions text preferred). */
  today: DayWeather | null;
}

const EMPTY: TripWeather = { byDate: new Map(), outsideForecastWindow: false, today: null };

/**
 * Trip-aware weather, shared by the trip header chip and the per-day headers.
 * Same data and day-alignment rules as WeatherForecastStrip.
 */
export function useTripWeather(
  location: string | null | undefined,
  startDate: string | undefined,
  numDays: number | undefined,
): TripWeather {
  const { data: weather } = useWeather(location || null);

  return useMemo(() => {
    const daily = extractDaily(weather?.dailyForecasts);
    if (daily.length === 0) return EMPTY;

    const byDate = new Map<string, DayWeather>();
    for (const d of daily) {
      byDate.set(isoDateKey(d.date), { conditionText: d.conditionText, hi: d.hi, lo: d.lo });
    }

    const todayReading = byDate.get(isoDateKey(new Date())) ?? null;
    const currentText = pickStringFrom(
      (weather?.currentConditions ?? null) as Record<string, unknown> | null,
      ['conditionText', 'description', 'conditions'],
    );
    const today = todayReading
      ? { ...todayReading, conditionText: currentText ?? todayReading.conditionText }
      : currentText
        ? { conditionText: currentText }
        : null;

    const { outsideForecastWindow } = alignToTrip(daily, startDate, numDays);
    return { byDate, outsideForecastWindow, today };
  }, [weather, startDate, numDays]);
}

/** "22°/16°", or "20°" when only one value (or both equal) is known. */
export function formatTemps(hi?: number, lo?: number): string | null {
  const h = hi != null ? Math.round(hi) : null;
  const l = lo != null ? Math.round(lo) : null;
  if (h != null && l != null) return h === l ? `${h}°` : `${h}°/${l}°`;
  if (h != null) return `${h}°`;
  if (l != null) return `${l}°`;
  return null;
}
