'use client';

import { use, useEffect, useMemo } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ChevronLeft } from 'lucide-react';
import { useCity } from '@/contexts';
import { destinationSlug, slugToCity } from '@/lib/destinationSlug';
import { extractPlaceId } from '@/lib/placeSlug';
import { useActivity } from '@/hooks/useActivity';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  normalizeFeedItem,
  type NormalizedFeedDetail,
} from '@/lib/feed/itemAdapter';
import type { FeedItem } from '@/hooks/useHomeFeed';
import type { TravelActivity } from '@/types';
import { PlaceDetailContent } from '@/components/places/PlaceDetailContent';

interface Props {
  params: Promise<{ slug: string; place: string }>;
}

/** Fullscreen place page: `/explore/[city]/[slug-id]`. The `[place]` segment
 *  is `slugify(name) + "-" + activityId` — slug is decorative, the trailing
 *  Mongo ObjectId is the lookup key. Reached via map-pin click on the
 *  Explore destination view, or from the "Open full page" button on the
 *  drawer for non-Viator items. */
export default function PlaceFullPage({ params }: Props) {
  const { slug, place } = use(params);
  const city = slugToCity(slug);
  const placeId = useMemo(() => extractPlaceId(place), [place]);
  const router = useRouter();
  const { city: activeCity, setCity } = useCity();

  useEffect(() => {
    if (city && activeCity !== city) setCity(city);
  }, [city, activeCity, setCity]);

  if (!placeId) notFound();

  const { data: activity, isLoading, isError } = useActivity(placeId);

  const detail = useMemo<NormalizedFeedDetail | null>(
    () => (activity ? normalizeFeedItem(activityToFeedItem(activity)) : null),
    [activity],
  );

  const cityHref = `/explore/${destinationSlug(city)}`;

  return (
    <Box
      sx={{
        position: 'relative',
        mx: 'auto',
        maxWidth: 1200,
        px: { xs: 2, sm: 3, lg: 4 },
        py: 3,
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Button
          variant="ghost"
          size="sm"
          iconLeft={<ChevronLeft size={16} />}
          onClick={() => router.push(cityHref)}
        >
          {city ? `Back to ${city}` : 'Back'}
        </Button>
      </Box>

      {isLoading ? (
        <PlaceDetailSkeleton />
      ) : isError || !detail ? (
        <NotFoundLite city={city} cityHref={cityHref} />
      ) : (
        <PlaceDetailContent detail={detail} city={city} layout="page" />
      )}
    </Box>
  );
}

/** Convert a TravelActivity (from `/api/activity/{id}`) into the loose
 *  FeedItem envelope expected by `normalizeFeedItem`. The normalizer
 *  reads scalar fields from `item.*`, so we just stuff matching keys in. */
function activityToFeedItem(activity: TravelActivity): FeedItem {
  const coords =
    activity.coordinates ??
    (activity.latitude != null && activity.longitude != null
      ? { lat: activity.latitude, lng: activity.longitude }
      : undefined);

  return {
    item: {
      _id: activity.id,
      name: activity.name,
      title: activity.name,
      description: activity.description,
      address: activity.address,
      images: activity.images,
      coordinates: coords,
      primary_categories: activity.primary_categories,
      category: activity.category?.[0],
      duration: activity.duration,
      cost: activity.cost,
      working_hours: activity.working_hours,
      rating: activity.rating,
      vibe_tags: activity.vibe_tags,
      secondary_tags: activity.secondary_tags,
      website_url: activity.website_url,
      insider_tips: activity.insider_tips,
      interesting_facts: activity.interesting_facts,
    },
    score: 0,
    entity_type: 'activity',
  };
}

function PlaceDetailSkeleton() {
  return (
    <Stack spacing={3}>
      <Skeleton
        variant="block"
        width="100%"
        style={{ aspectRatio: '2 / 1', height: 'auto' }}
      />
      <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
        <Skeleton variant="line" height={16} width="20%" />
        <Skeleton variant="line" height={36} width="70%" />
        <Skeleton variant="line" height={14} width="40%" />
        <Skeleton variant="line" height={14} width="100%" />
        <Skeleton variant="line" height={14} width="92%" />
        <Skeleton variant="line" height={14} width="85%" />
      </Stack>
    </Stack>
  );
}

function NotFoundLite({
  city,
  cityHref,
}: {
  city: string;
  cityHref: string;
}) {
  const router = useRouter();
  return (
    <Box sx={{ py: 8, textAlign: 'center' }}>
      <Typography
        component="h1"
        sx={{ fontSize: 24, fontWeight: 600, color: 'text.primary' }}
      >
        Place not found
      </Typography>
      <Typography sx={{ mt: 1, fontSize: 14, color: 'text.secondary' }}>
        We couldn&apos;t find this place. It may have been removed, or the link
        is incorrect.
      </Typography>
      <Box sx={{ mt: 3 }}>
        <Button variant="primary" size="md" onClick={() => router.push(cityHref)}>
          Back to {city || 'Explore'}
        </Button>
      </Box>
    </Box>
  );
}
