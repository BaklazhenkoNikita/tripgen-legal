'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronRight, Heart, Sparkles, AlertTriangle, Plus } from 'lucide-react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { useSearchHistory, type SearchHistoryItem } from '@/hooks/useSearchHistory';
import { useCityHeroFallback } from '@/hooks/useCityHeroFallback';
import { prefetchTripDetail } from '@/lib/query/prefetch';
import { displayDestination } from '@/lib/cities/normalizeCity';
import { formatDateRange, tripDayCount } from '@/lib/date';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Photo } from '@/components/ui/Photo';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Eyebrow } from '@/components/layout/Eyebrow';
import { radii, textScale } from '@/theme/standards';
import { HISTORY_PAGE_PY, TRIP_GRID_SX } from './tripGrid';

export default function HistoryPage() {
  const { data: trips, isLoading, error } = useSearchHistory({ limit: 50 });
  const queryClient = useQueryClient();

  const grouped = useMemo(() => groupByMonth(trips ?? []), [trips]);
  const needsFallbackArt = useMemo(
    () => (trips ?? []).some((t) => !t.thumbnail_image_url),
    [trips],
  );
  const fallbackHero = useCityHeroFallback(needsFallbackArt);

  return (
    <PageContainer width="wide" sx={{ py: HISTORY_PAGE_PY }}>
      <PageHeader
        title="My trips"
        subtitle="Itineraries you've generated, kept, and refined."
        actions={
          <Button asChild iconLeft={<Plus className="size-4" />}>
            <Link href="/trip?new=1">New trip</Link>
          </Button>
        }
        sx={{ mb: { xs: 4, md: 5 } }}
      />

      {isLoading ? (
        <Box sx={TRIP_GRID_SX}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton
              key={i}
              style={{ aspectRatio: '1 / 1', width: '100%', borderRadius: 16, animationDelay: `${i * 0.08}s` }}
            />
          ))}
        </Box>
      ) : null}

      {error ? (
        <Box
          sx={(t) => ({
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
            borderRadius: radii.card,
            border: '1px solid',
            borderColor: alpha(t.palette.error.main, 0.3),
            bgcolor: alpha(t.palette.error.main, 0.1),
            p: 2,
            ...textScale.label,
            fontWeight: 500,
            color: t.palette.error.dark,
          })}
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          Failed to load trips: {(error as Error).message}
        </Box>
      ) : null}

      {trips && trips.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="size-6" />}
          title="No trips yet"
          description="Create your first trip — pick a city, vibe, and we'll build the rest."
          action={
            <Button asChild iconLeft={<Sparkles className="size-4" />}>
              <Link href="/trip?new=1">Plan a trip</Link>
            </Button>
          }
        />
      ) : null}

      {trips && trips.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 4, md: 5 } }}>
          {grouped.map(({ key, label, rows }) => (
            <Box component="section" key={key} aria-labelledby={`trips-${key}`}>
              <Eyebrow tone="neutral" component="h2" sx={{ mb: 2 }}>
                <span id={`trips-${key}`}>{label}</span>
                <Box component="span" sx={{ fontWeight: 500 }}>
                  · {rows.length}
                </Box>
              </Eyebrow>
              <Box component="ul" sx={TRIP_GRID_SX}>
                {rows.map((trip) => (
                  <TripCard
                    key={trip.search_id}
                    trip={trip}
                    fallbackHero={fallbackHero}
                    onPrefetch={() => prefetchTripDetail(queryClient, trip.search_id)}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      ) : null}
    </PageContainer>
  );
}

function TripCard({
  trip,
  fallbackHero,
  onPrefetch,
}: {
  trip: SearchHistoryItem;
  fallbackHero: (city: string) => string | null;
  onPrefetch: () => void;
}) {
  const place = displayDestination(trip.destination);
  const title = trip.user_title || place.full || 'Untitled trip';
  const cover = trip.thumbnail_image_url || (place.city ? fallbackHero(place.city) : null);
  const dayCount = tripDayCount(trip.start_date, trip.end_date);
  const meta = [
    formatDateRange(trip.start_date, trip.end_date),
    dayCount ? `${dayCount} ${dayCount === 1 ? 'day' : 'days'}` : null,
    trip.activity_count ? `${trip.activity_count} ${trip.activity_count === 1 ? 'stop' : 'stops'}` : null,
  ].filter(Boolean);
  const createdLabel = formatCreated(trip.created_at);

  return (
    <Box component="li" sx={{ minWidth: 0 }}>
      <Box
        component={Link}
        href={`/trip/${trip.search_id}`}
        onMouseEnter={onPrefetch}
        onFocus={onPrefetch}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          borderRadius: radii.card,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          overflow: 'hidden',
          textDecoration: 'none',
          transition: 'box-shadow 200ms ease, transform 200ms ease, border-color 200ms ease',
          boxShadow: 'var(--tg-shadow-card)',
          '&:hover': {
            borderColor: 'text.disabled',
            boxShadow: 'var(--tg-shadow-card-hover)',
            transform: 'translateY(-2px)',
          },
          '&:hover .chev': { transform: 'translateX(2px)', color: 'primary.main' },
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <Photo
            src={cover}
            alt={title}
            aspect="3/2"
            zoomOnHover
            sizes="(max-width: 600px) 100vw, 320px"
          />
          {trip.is_favorite ? (
            <Box
              aria-label="Favorite"
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: (t) => alpha(t.palette.background.paper, 0.92),
                backdropFilter: 'blur(6px)',
                boxShadow: 'var(--tg-shadow-card)',
              }}
            >
              <Box component={Heart} sx={{ width: 16, height: 16, color: 'primary.main', fill: 'currentColor' }} />
            </Box>
          ) : null}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 0.5, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              component="h3"
              sx={{
                ...textScale.title,
                minWidth: 0,
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: 'text.primary',
                m: 0,
              }}
            >
              {title}
            </Typography>
            <Box
              component={ChevronRight}
              className="chev"
              aria-hidden
              sx={{ width: 18, height: 18, flexShrink: 0, color: 'text.disabled', transition: 'all 200ms' }}
            />
          </Box>

          {meta.length > 0 ? (
            <Typography sx={{ ...textScale.label, fontWeight: 500, color: 'text.secondary', m: 0 }}>
              {meta.join(' · ')}
            </Typography>
          ) : null}

          {createdLabel ? (
            <Typography sx={{ ...textScale.meta, mt: 'auto', pt: 1, color: 'text.secondary' }}>
              Created {createdLabel}
            </Typography>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}

function formatCreated(iso?: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

interface Group {
  key: string;
  label: string;
  rows: SearchHistoryItem[];
}

function groupByMonth(rows: SearchHistoryItem[]): Group[] {
  const map = new Map<string, Group>();
  for (const r of rows) {
    const date = r.created_at ? new Date(r.created_at) : null;
    const valid = date && !Number.isNaN(date.getTime());
    // Zero-padded month so "2026-10" sorts after "2026-09" (string compare).
    const key = valid ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` : '0000-00';
    const label = valid ? date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Earlier';
    if (!map.has(key)) map.set(key, { key, label, rows: [] });
    map.get(key)!.rows.push(r);
  }
  return Array.from(map.values()).sort((a, b) => (a.key < b.key ? 1 : -1));
}
