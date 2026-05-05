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
  strokeWidth?: number;
}

export type ConditionTone = 'rain' | 'sun' | 'cloud' | 'storm' | 'snow';

export function ConditionIcon({ code, size = 16, strokeWidth = 1.75 }: ConditionIconProps) {
  const c = (code ?? '').toLowerCase();
  if (c.includes('thunder')) return <CloudLightning size={size} strokeWidth={strokeWidth} aria-hidden />;
  if (c.includes('snow')) return <Snowflake size={size} strokeWidth={strokeWidth} aria-hidden />;
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower'))
    return <CloudRain size={size} strokeWidth={strokeWidth} aria-hidden />;
  if (c.includes('fog') || c.includes('mist') || c.includes('haze'))
    return <CloudFog size={size} strokeWidth={strokeWidth} aria-hidden />;
  if (c.includes('cloud') || c.includes('overcast'))
    return <Cloud size={size} strokeWidth={strokeWidth} aria-hidden />;
  if (c.includes('clear') || c.includes('sun')) return <Sun size={size} strokeWidth={strokeWidth} aria-hidden />;
  return <CloudSun size={size} strokeWidth={strokeWidth} aria-hidden />;
}

export function conditionTone(code?: string): ConditionTone {
  const c = (code ?? '').toLowerCase();
  if (c.includes('thunder')) return 'storm';
  if (c.includes('snow')) return 'snow';
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) return 'rain';
  if (c.includes('clear') || c.includes('sun')) return 'sun';
  return 'cloud';
}

/** Theme-token colors so all icons share one visual language and adapt to dark mode.
 *  Pass the result to a wrapper Box's `color` prop; lucide icons inherit via `currentColor`. */
export function toneColor(tone: ConditionTone): string {
  switch (tone) {
    case 'rain':  return 'info.main';
    case 'sun':   return 'warning.main';
    case 'cloud': return 'text.secondary';
    case 'storm': return 'info.dark';
    case 'snow':  return 'info.light';
  }
}
