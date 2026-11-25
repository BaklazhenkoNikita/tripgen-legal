'use client';

/**
 * Compact protocol-v2 cards: weather, day_plan, trip_summary, cost_summary,
 * route, sources, booking_links. Data shapes: `@/lib/chat/protocol`.
 */

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import {
  BedDouble,
  Calendar,
  Cloud,
  CloudDrizzle,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  ExternalLink,
  Footprints,
  Globe,
  Map as MapIcon,
  MapPin,
  Plane,
  Route as RouteIcon,
  Smartphone,
  Sun,
  Ticket,
  Utensils,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { Photo } from '@/components/ui/Photo';
import type {
  BookingLink,
  DayPlanItem,
  RouteLeg,
  SourceItem,
  WeatherDay,
} from '@/lib/chat/protocol';
import { radii, minTap } from '@/theme/standards';
import { CardFooterLink, CardShell, StatChip } from './CardShell';

// ── weather ───────────────────────────────────────────────────────────

function weatherIcon(condition?: string): LucideIcon {
  const c = (condition || '').toLowerCase();
  if (c.includes('thunder')) return CloudLightning;
  if (c.includes('snow')) return CloudSnow;
  if (c.includes('drizzle')) return CloudDrizzle;
  if (c.includes('rain') || c.includes('shower')) return CloudRain;
  if (c.includes('partly')) return CloudSun;
  if (c.includes('cloud') || c.includes('overcast') || c.includes('fog')) return Cloud;
  if (c.includes('clear') || c.includes('sun')) return Sun;
  return CloudSun;
}

function weekday(date: string): string {
  const d = new Date(`${date}T12:00:00`);
  if (Number.isNaN(d.getTime())) return date.slice(5);
  return d.toLocaleDateString(undefined, { weekday: 'short' });
}

const round = (n?: number) => (typeof n === 'number' ? Math.round(n) : undefined);

export function WeatherCard({
  location,
  current,
  days,
}: {
  location: string;
  current?: { temp_c?: number; condition?: string; condition_text?: string } | null;
  days: WeatherDay[];
}) {
  const today = days[0];
  const temp = round(current?.temp_c) ?? round(today?.t_max_c);
  const text = current?.condition_text || today?.condition_text || today?.condition;
  const HeroIcon = weatherIcon(current?.condition || today?.condition);
  const rainy = days.filter((d) => (d.precip_pct ?? 0) >= 50).length;

  return (
    <CardShell icon={CloudSun} eyebrow={`Weather · ${location}`}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box component="span" sx={{ display: 'inline-flex', color: 'warning.main' }}>
          <HeroIcon size={36} aria-hidden />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {temp !== undefined ? (
            <Box component="p" sx={{ m: 0, fontSize: 30, fontWeight: 600, lineHeight: 1.1 }}>
              {temp}°C
            </Box>
          ) : null}
          {text ? (
            <Box component="p" sx={{ m: 0, fontSize: 14, color: 'text.secondary' }}>
              {text}
            </Box>
          ) : null}
        </Box>
        {rainy > 0 ? <StatChip icon={CloudRain}>Rain {rainy === 1 ? '1 day' : `${rainy} days`}</StatChip> : null}
      </Box>
      <Box
        component="ul"
        sx={{
          listStyle: 'none',
          m: 0,
          mt: 1.5,
          p: 0,
          pt: 1.5,
          borderTop: 1,
          borderColor: 'divider',
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(days.length, 5)}, minmax(0, 1fr))`,
          gap: 0.5,
        }}
      >
        {days.slice(0, 5).map((d) => {
          const DayIcon = weatherIcon(d.condition);
          return (
            <Box
              component="li"
              key={d.date}
              aria-label={`${weekday(d.date)}: ${d.condition_text || d.condition || ''}, high ${round(d.t_max_c)}°, low ${round(d.t_min_c)}°, ${d.precip_pct ?? 0}% chance of rain`}
              sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25, fontSize: 12 }}
            >
              <Box component="span" sx={{ color: 'text.secondary' }}>{weekday(d.date)}</Box>
              <Box component="span" sx={{ display: 'inline-flex', color: 'text.secondary' }}>
                <DayIcon size={18} aria-hidden />
              </Box>
              <Box component="span" sx={{ fontWeight: 600, fontSize: 13 }}>{round(d.t_max_c)}°</Box>
              <Box component="span" sx={{ color: 'text.disabled' }}>{round(d.t_min_c)}°</Box>
              <Box component="span" sx={{ color: 'info.main', visibility: (d.precip_pct ?? 0) >= 30 ? 'visible' : 'hidden' }}>
                {d.precip_pct ?? 0}%
              </Box>
            </Box>
          );
        })}
      </Box>
    </CardShell>
  );
}

// ── day_plan ──────────────────────────────────────────────────────────

export function DayPlanCard({
  tripId,
  dayNumber,
  date,
  items,
}: {
  tripId: string;
  dayNumber?: number;
  date?: string;
  items: DayPlanItem[];
}) {
  const dateLabel = date
    ? new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
    : null;
  return (
    <CardShell
      icon={Calendar}
      eyebrow={`Day ${dayNumber ?? ''}`.trim()}
      title={dateLabel ?? undefined}
      footer={<CardFooterLink href={`/trip/${encodeURIComponent(tripId)}`} label={`Open Day ${dayNumber ?? ''}`.trim()} />}
    >
      <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {items.map((it, i) => (
          <Box component="li" key={it.activity_id ?? `${it.name}-${i}`} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box
              component="span"
              aria-hidden
              sx={(t) => ({
                flexShrink: 0,
                width: 24,
                height: 24,
                borderRadius: 999,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                bgcolor: alpha(t.palette.primary.main, 0.1),
                color: 'primary.main',
              })}
            >
              {i + 1}
            </Box>
            {it.photo_url ? (
              <Box sx={{ width: 44, flexShrink: 0 }}>
                <Photo src={it.photo_url} alt="" aspect="1/1" rounded="md" sizes="44px" />
              </Box>
            ) : null}
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Box component="p" sx={{ m: 0, fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {it.name}
              </Box>
              {[it.time, it.duration, it.category].filter(Boolean).length ? (
                <Box component="p" sx={{ m: 0, fontSize: 12, color: 'text.secondary' }}>
                  {[it.time, it.duration, it.category].filter(Boolean).join(' · ')}
                </Box>
              ) : null}
            </Box>
          </Box>
        ))}
      </Box>
    </CardShell>
  );
}

// ── trip_summary ──────────────────────────────────────────────────────

function fmtRange(start?: string, end?: string): string | null {
  if (!start) return null;
  const f = (s: string) => {
    const d = new Date(`${s}T12:00:00`);
    return Number.isNaN(d.getTime()) ? s : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };
  return end && end !== start ? `${f(start)} – ${f(end)}` : f(start);
}

export function TripSummaryCard({
  tripId,
  destination,
  startDate,
  endDate,
  dayCount,
  activityCount,
  restaurantCount,
  coverUrl,
}: {
  tripId: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  dayCount?: number;
  activityCount?: number;
  restaurantCount?: number;
  coverUrl?: string | null;
}) {
  const range = fmtRange(startDate, endDate);
  return (
    <CardShell padded={false} ariaLabel={`Trip to ${destination ?? ''}`} footer={<CardFooterLink href={`/trip/${encodeURIComponent(tripId)}`} label="Open trip" />}>
      {coverUrl ? <Photo src={coverUrl} alt="" aspect="21/9" gradient sizes="(max-width: 768px) 100vw, 640px" /> : null}
      <Box sx={{ px: 2, py: 1.75, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box>
          <Box component="p" sx={{ m: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'primary.main' }}>
            Your trip
          </Box>
          <Box component="h3" sx={{ m: 0, fontSize: '1.125rem', fontWeight: 600 }}>
            {destination}
          </Box>
          {range ? (
            <Box component="p" sx={{ m: 0, fontSize: 13, color: 'text.secondary' }}>
              {range}
            </Box>
          ) : null}
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {typeof dayCount === 'number' ? <StatChip icon={Calendar}>{dayCount} {dayCount === 1 ? 'day' : 'days'}</StatChip> : null}
          {typeof activityCount === 'number' ? <StatChip icon={MapPin}>{activityCount} places</StatChip> : null}
          {typeof restaurantCount === 'number' ? <StatChip icon={Utensils}>{restaurantCount} restaurants</StatChip> : null}
        </Box>
      </Box>
    </CardShell>
  );
}

// ── cost_summary ──────────────────────────────────────────────────────

const SYMBOLS: Record<string, string> = { EUR: '€', USD: '$', GBP: '£', JPY: '¥' };

export function formatMoney(amount: number | undefined, currency?: string | null): string {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return '—';
  const sym = currency ? (SYMBOLS[currency] ?? (currency.length === 1 ? currency : `${currency} `)) : '';
  return `${sym}${Math.round(amount).toLocaleString()}`;
}

export function CostSummaryCard({
  currency,
  total,
  perDay,
  byCategory,
  unpricedCount,
  confidence,
}: {
  currency?: string | null;
  total?: number;
  perDay: Array<{ day_number: number; amount: number }>;
  byCategory: Record<string, number>;
  unpricedCount?: number;
  confidence?: string;
}) {
  const max = Math.max(1, ...perDay.map((d) => d.amount || 0));
  const topCats = Object.entries(byCategory)
    .filter(([, v]) => typeof v === 'number')
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  return (
    <CardShell icon={Wallet} eyebrow="Estimated activity costs">
      <Box component="p" sx={{ m: 0, fontSize: 28, fontWeight: 600, lineHeight: 1.15 }}>
        {formatMoney(total, currency)}
      </Box>
      {perDay.length ? (
        <Box component="ul" sx={{ listStyle: 'none', m: 0, mt: 1.25, p: 0, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {perDay.map((d) => (
            <Box
              component="li"
              key={d.day_number}
              aria-label={`Day ${d.day_number}: ${formatMoney(d.amount, currency)}`}
              sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 12 }}
            >
              <Box component="span" sx={{ width: 44, color: 'text.secondary' }}>Day {d.day_number}</Box>
              <Box sx={{ flex: 1, height: 8, borderRadius: 999, bgcolor: 'action.hover', overflow: 'hidden' }}>
                <Box sx={{ height: '100%', borderRadius: 999, bgcolor: 'primary.main', width: `${Math.max(3, ((d.amount || 0) / max) * 100)}%` }} />
              </Box>
              <Box component="span" sx={{ width: 64, textAlign: 'right', fontWeight: 600 }}>{formatMoney(d.amount, currency)}</Box>
            </Box>
          ))}
        </Box>
      ) : null}
      {topCats.length ? (
        <Box component="p" sx={{ m: 0, mt: 1.25, fontSize: 13, color: 'text.secondary' }}>
          Most spend: {topCats.map(([c, v]) => `${c} ${formatMoney(v, currency)}`).join(' · ')}
        </Box>
      ) : null}
      <Box component="p" sx={{ m: 0, mt: 0.75, fontSize: 12, color: 'text.disabled' }}>
        Estimated from listed prices{unpricedCount ? ` · ${unpricedCount} without a price` : ''}
        {confidence ? ` · ${confidence} confidence` : ''}. Meals not included.
      </Box>
    </CardShell>
  );
}

// ── route ─────────────────────────────────────────────────────────────

export function RouteCard({
  dayNumber,
  legs,
  totalKm,
  straightLine,
}: {
  dayNumber?: number;
  legs: RouteLeg[];
  totalKm?: number;
  straightLine?: boolean;
}) {
  const totalMin = legs.reduce((s, l) => s + (l.walk_min ?? 0), 0);
  return (
    <CardShell
      icon={RouteIcon}
      eyebrow={dayNumber ? `Route · Day ${dayNumber}` : 'Route'}
      title={typeof totalKm === 'number' ? `${totalKm.toFixed(1)} km total${totalMin ? ` · ~${totalMin} min walking` : ''}` : undefined}
    >
      <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column' }}>
        {legs.map((l, i) => (
          <Box
            component="li"
            key={`${l.from}-${l.to}-${i}`}
            sx={{ display: 'flex', gap: 1.25, py: 0.75, borderTop: i ? 1 : 0, borderColor: 'divider', fontSize: 14 }}
          >
            <Box component="span" sx={{ display: 'inline-flex', pt: 0.25, color: l.walkable === false ? 'warning.main' : 'success.main' }}>
              {l.walkable === false ? <MapIcon size={16} aria-hidden /> : <Footprints size={16} aria-hidden />}
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Box component="p" sx={{ m: 0 }}>
                {l.from} <Box component="span" sx={{ color: 'text.disabled' }}>→</Box> {l.to}
              </Box>
              <Box component="p" sx={{ m: 0, fontSize: 12, color: 'text.secondary' }}>
                {[
                  typeof l.km === 'number' ? `${l.km.toFixed(1)} km` : null,
                  typeof l.walk_min === 'number' ? `${l.walk_min} min walk` : null,
                  l.walkable === false ? 'transit recommended' : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
      {straightLine ? (
        <Box component="p" sx={{ m: 0, mt: 0.75, fontSize: 12, color: 'text.disabled' }}>
          Straight-line distances — actual walking routes may be longer.
        </Box>
      ) : null}
    </CardShell>
  );
}

// ── sources ───────────────────────────────────────────────────────────

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function SourcesCard({ sources }: { sources: SourceItem[] }) {
  const safe = sources.filter((s) => /^https?:\/\//i.test(s.url));
  if (!safe.length) return null;
  return (
    <Box component="nav" aria-label="Sources" sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.75 }}>
      <Box component="span" sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', mr: 0.25 }}>
        Sources
      </Box>
      {safe.map((s, i) => (
        <Box
          key={`${s.url}-${i}`}
          component="a"
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          title={s.title || s.url}
          sx={(t) => ({
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            minHeight: 32,
            maxWidth: 220,
            px: 1.25,
            borderRadius: 999,
            border: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            fontSize: 12,
            color: 'text.primary',
            textDecoration: 'none',
            position: 'relative',
            '&::after': { content: '""', position: 'absolute', inset: '-6px 0' },
            '&:hover': { bgcolor: 'action.hover' },
            '&:focus-visible': { outline: `2px solid ${t.palette.primary.main}`, outlineOffset: 2 },
          })}
        >
          <Box component="span" sx={{ fontWeight: 700, color: 'text.secondary' }}>{i + 1}</Box>
          <Globe size={12} aria-hidden />
          <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {s.domain || hostOf(s.url)}
          </Box>
          <Box component="span" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
            {s.title ? `: ${s.title}` : ''} (opens in a new tab)
          </Box>
        </Box>
      ))}
    </Box>
  );
}

// ── booking_links ─────────────────────────────────────────────────────

const BOOKING_ICONS: Record<string, LucideIcon> = {
  hotel: BedDouble,
  flight: Plane,
  tour: Ticket,
  esim: Smartphone,
};

export function BookingLinksCard({ destination, items }: { destination?: string; items: BookingLink[] }) {
  const safe = items.filter((it) => /^https?:\/\//i.test(it.url));
  if (!safe.length) return null;
  return (
    <CardShell icon={Ticket} eyebrow={destination ? `Book for ${destination}` : 'Book your trip'}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
        {safe.map((it, i) => {
          const Icon = BOOKING_ICONS[it.kind ?? ''] ?? ExternalLink;
          return (
            <Box
              key={`${it.url}-${i}`}
              component="a"
              href={it.url}
              target="_blank"
              rel="noopener sponsored"
              sx={(t) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                minHeight: minTap,
                px: 1.5,
                borderRadius: radii.card,
                border: 1,
                borderColor: 'divider',
                color: 'text.primary',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
                '&:hover': { bgcolor: alpha(t.palette.primary.main, 0.06), borderColor: alpha(t.palette.primary.main, 0.4) },
                '&:focus-visible': { outline: `2px solid ${t.palette.primary.main}`, outlineOffset: 2 },
              })}
            >
              <Box component="span" sx={{ display: 'inline-flex', color: 'primary.main' }}>
                <Icon size={16} aria-hidden />
              </Box>
              <Box component="span" sx={{ flex: 1, minWidth: 0 }}>
                {it.label}
                {it.provider ? (
                  <Box component="span" sx={{ display: 'block', fontSize: 12, fontWeight: 400, color: 'text.secondary' }}>
                    {it.provider}
                  </Box>
                ) : null}
              </Box>
              <ExternalLink size={14} aria-hidden />
              <Box component="span" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
                (opens in a new tab)
              </Box>
            </Box>
          );
        })}
      </Box>
      <Box component="p" sx={{ m: 0, mt: 1, fontSize: 11, color: 'text.disabled' }}>
        Partner links — Periplo may earn a commission.
      </Box>
    </CardShell>
  );
}
