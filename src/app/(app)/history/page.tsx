'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronRight, Heart, MapPin, Sparkles, AlertTriangle, Plus } from 'lucide-react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { prefetchTripDetail } from '@/lib/query/prefetch';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Photo } from '@/components/ui/Photo';
import { Skeleton } from '@/components/ui/Skeleton';

interface TripRow {
  search_id: string;
  user_title?: string;
  destination?: string;
  is_favorite?: boolean;
  created_at?: string;
  parameters?: { destination?: string };
  result_summary?: {
    destination_display?: string;
    thumbnail_image_url?: string;
    date_range?: string;
    total_days?: number;
    total_activities?: number;
  };
}

export default function HistoryPage() {
  const { data: trips, isLoading, error } = useSearchHistory({ limit: 50 });
  const queryClient = useQueryClient();

  const grouped = useMemo(() => groupByMonth((trips ?? []) as TripRow[]), [trips]);

  return (
    <Box sx={{ mx: 'auto', maxWidth: 896, px: { xs: 2, sm: 3 }, py: 5 }}>
      <Box
        component="header"
        sx={{
          mb: 4,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Box>
          <Typography
            component="h1"
            sx={{
              fontSize: '2.25rem',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'text.primary',
            }}
          >
            My trips
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 14, color: 'text.secondary' }}>
            Itineraries you&apos;ve generated, kept, and refined.
          </Typography>
        </Box>
        <Button asChild iconLeft={<Plus className="size-4" />}>
          <Link href="/trip?new=1">New trip</Link>
        </Button>
      </Box>

      {isLoading ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: 2.5,
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} style={{ height: 268, width: '100%', borderRadius: 16, animationDelay: `${i * 0.08}s` }} />
          ))}
        </Box>
      ) : null}

      {error ? (
        <Box
          sx={(t) => ({
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: alpha(t.palette.error.main, 0.3),
            bgcolor: alpha(t.palette.error.main, 0.1),
            p: 2,
            fontSize: 14,
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {grouped.map(({ key, label, rows }) => (
            <Box component="section" key={key}>
              <Typography
                component="h2"
                sx={{
                  mb: 1.5,
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                  color: 'text.disabled',
                }}
              >
                {label} <Box component="span" sx={{ color: 'text.secondary' }}>· {rows.length}</Box>
              </Typography>
              <Box
                component="ul"
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: 2.5,
                  listStyle: 'none',
                  p: 0,
                  m: 0,
                }}
              >
                {rows.map((trip) => {
                  const summary = trip.result_summary;
                  const params = trip.parameters;
                  const displayName =
                    trip.user_title ??
                    summary?.destination_display ??
                    params?.destination ??
                    trip.destination ??
                    'Untitled trip';
                  const createdLabel = formatCreated(trip.created_at);

                  return (
                    <Box component="li" key={trip.search_id}>
                      <Box
                        component={Link}
                        href={`/trip/${trip.search_id}`}
                        onMouseEnter={() => prefetchTripDetail(queryClient, trip.search_id)}
                        onFocus={() => prefetchTripDetail(queryClient, trip.search_id)}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          height: '100%',
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          bgcolor: 'background.paper',
                          overflow: 'hidden',
                          textDecoration: 'none',
                          transition: 'all 200ms ease',
                          boxShadow: 'var(--tg-shadow-card)',
                          '&:hover': {
                            borderColor: 'text.disabled',
                            boxShadow: 'var(--tg-shadow-card-hover)',
                            transform: 'translateY(-2px)',
                          },
                          '&:hover .hero img.zoomable': { transform: 'scale(1.05)' },
                          '&:hover .chev': { transform: 'translateX(2px)', color: 'primary.main' },
                        }}
                      >
                        <Box className="hero" sx={{ position: 'relative' }}>
                          {summary?.thumbnail_image_url ? (
                            <Photo
                              src={summary.thumbnail_image_url}
                              alt={displayName}
                              aspect="16/9"
                              zoomOnHover
                              sizes="(max-width: 600px) 100vw, 440px"
                            />
                          ) : (
                            <Box
                              sx={{
                                display: 'flex',
                                aspectRatio: '16 / 9',
                                width: '100%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: (t) =>
                                  `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.16)}, ${alpha(t.palette.primary.main, 0.06)})`,
                                color: 'primary.main',
                              }}
                            >
                              <MapPin className="size-8" aria-hidden />
                            </Box>
                          )}
                          {trip.is_favorite ? (
                            <Box
                              aria-label="Favorite"
                              sx={{
                                position: 'absolute',
                                top: 10,
                                right: 10,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                bgcolor: (t) => alpha(t.palette.background.paper, 0.9),
                                backdropFilter: 'blur(6px)',
                                boxShadow: 'var(--tg-shadow-card)',
                              }}
                            >
                              <Box
                                component={Heart}
                                sx={{ width: 15, height: 15, color: 'primary.main', fill: 'currentColor' }}
                              />
                            </Box>
                          ) : null}
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 1, p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              component="h3"
                              sx={{
                                minWidth: 0,
                                flex: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontSize: 18,
                                fontWeight: 600,
                                letterSpacing: '-0.01em',
                                color: 'text.primary',
                              }}
                            >
                              {displayName}
                            </Typography>
                            <Box
                              component={ChevronRight}
                              className="chev"
                              aria-hidden
                              sx={{ width: 18, height: 18, flexShrink: 0, color: 'text.disabled', transition: 'all 200ms' }}
                            />
                          </Box>

                          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.75 }}>
                            {summary?.date_range ? (
                              <Badge tone="neutral" size="sm">{summary.date_range}</Badge>
                            ) : null}
                            {summary?.total_days ? (
                              <Badge tone="accent" size="sm">{summary.total_days} {summary.total_days === 1 ? 'day' : 'days'}</Badge>
                            ) : null}
                            {summary?.total_activities != null ? (
                              <Badge tone="neutral" size="sm">{summary.total_activities} activities</Badge>
                            ) : null}
                          </Box>

                          {createdLabel ? (
                            <Typography sx={{ mt: 'auto', pt: 0.5, fontSize: 12, color: 'text.disabled' }}>
                              Created {createdLabel}
                            </Typography>
                          ) : null}
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          ))}
        </Box>
      ) : null}
    </Box>
  );
}

function formatCreated(iso?: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

interface Group {
  key: string;
  label: string;
  rows: TripRow[];
}

function groupByMonth(rows: TripRow[]): Group[] {
  const map = new Map<string, Group>();
  for (const r of rows) {
    const date = r.created_at ? new Date(r.created_at) : null;
    const key = date && !Number.isNaN(date.getTime())
      ? `${date.getFullYear()}-${date.getMonth()}`
      : 'unknown';
    const label = date && !Number.isNaN(date.getTime())
      ? date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
      : 'Earlier';
    if (!map.has(key)) map.set(key, { key, label, rows: [] });
    map.get(key)!.rows.push(r);
  }
  return Array.from(map.values()).sort((a, b) => (a.key < b.key ? 1 : -1));
}
