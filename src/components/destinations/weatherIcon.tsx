'use client';

import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Snowflake,
  Sun,
} from 'lucide-react';

interface ConditionIconProps {
  code?: string;
  size?: number;
}

/** Maps a free-text condition (`code`) to a lucide weather icon. Used by both
 *  the WeatherForecastStrip cells and the per-day conditions sheet. */
export function ConditionIcon({ code, size = 16 }: ConditionIconProps) {
  const c = (code ?? '').toLowerCase();
  if (c.includes('thunder')) return <CloudLightning size={size} aria-hidden />;
  if (c.includes('snow')) return <Snowflake size={size} aria-hidden />;
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower'))
    return <CloudRain size={size} aria-hidden />;
  if (c.includes('fog') || c.includes('mist') || c.includes('haze'))
    return <CloudFog size={size} aria-hidden />;
  if (c.includes('cloud') || c.includes('overcast'))
    return <Cloud size={size} aria-hidden />;
  if (c.includes('clear') || c.includes('sun')) return <Sun size={size} aria-hidden />;
  return <CloudSun size={size} aria-hidden />;
}

/** Picks a tone color based on condition. Used to color-code icons in cells. */
export function conditionTone(code?: string): 'rain' | 'sun' | 'cloud' | 'storm' | 'snow' {
  const c = (code ?? '').toLowerCase();
  if (c.includes('thunder')) return 'storm';
  if (c.includes('snow')) return 'snow';
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) return 'rain';
  if (c.includes('clear') || c.includes('sun')) return 'sun';
  return 'cloud';
}

export const TONE_COLOR: Record<ReturnType<typeof conditionTone>, string> = {
  rain: '#1D9E75',
  sun: '#BA7517',
  cloud: '#888780',
  storm: '#5B6CC1',
  snow: '#7FA9D6',
};
