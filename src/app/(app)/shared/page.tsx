'use client';

import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { useQueryClient } from '@tanstack/react-query';
import { useSharedWithMe } from '@/hooks/useCollab';
import { EmptyState } from '@/components/common/EmptyState';
import { SkeletonRow } from '@/components/common/SkeletonRow';
import { prefetchTripDetail } from '@/lib/query/prefetch';

/**
 * Trips that other users have shared with me. Backend returns a flat list
 * with role + last-update timestamp; we group by role for scanability.
 */
export default function SharedPage() {
  const { data, isLoading } = useSharedWithMe({ limit: 50 });
  const queryClient = useQueryClient();

  return (
    <Box sx={{ mx: 'auto', maxWidth: 896, px: { xs: 2, sm: 3 }, py: 4 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: 1.5 }}>
        <Typography component="h1" sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'text.primary' }}>
          Shared with me
        </Typography>
        {data ? (
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
            {data.trips.length} trip{data.trips.length === 1 ? '' : 's'}
          </Typography>
        ) : null}
      </Box>

      {isLoading ? (
        <Box sx={{ mt: 3 }}>
          <SkeletonRow count={3} heightClass="h-16" widthClass="w-full" />
        </Box>
      ) : !data || data.trips.length === 0 ? (
        <Box sx={{ mt: 4 }}>
          <EmptyState
            title="No shared trips yet"
            description="When someone shares a trip with you, it'll show up here."
          />
        </Box>
      ) : (
        <Box
          component="ul"
          sx={{
            mt: 3,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            listStyle: 'none',
            p: 0,
            m: 0,
            '& > li + li': {
              borderTop: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          {data.trips.map((trip) => (
            <Box component="li" key={trip.search_id}>
              <Box
                component={Link}
                href={`/trip/${trip.search_id}`}
                onMouseEnter={() => prefetchTripDetail(queryClient, trip.search_id)}
                onFocus={() => prefetchTripDetail(queryClient, trip.search_id)}
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                  px: 2,
                  py: 1.5,
                  textDecoration: 'none',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'text.primary',
                    }}
                  >
                    {trip.destination}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                    Updated {formatTimestamp(trip.updated_at)}
                  </Typography>
                </Box>
                <Box
                  component="span"
                  sx={{
                    borderRadius: 999,
                    px: 1,
                    py: 0.25,
                    fontSize: 11,
                    fontWeight: 500,
                    textTransform: 'capitalize',
                    ...(trip.role === 'editor'
                      ? {
                          bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                          color: 'primary.main',
                        }
                      : {
                          bgcolor: 'action.hover',
                          color: 'text.secondary',
                        }),
                  }}
                >
                  {trip.role}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

function formatTimestamp(ts: string): string {
  try {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return ts;
    const diffMs = Date.now() - d.getTime();
    const diffH = Math.round(diffMs / (1000 * 60 * 60));
    if (diffH < 1) return 'just now';
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.round(diffH / 24);
    if (diffD < 7) return `${diffD}d ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return ts;
  }
}
