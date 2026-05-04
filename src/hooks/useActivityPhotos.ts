'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';
import type { Restaurant, TravelActivity } from '@/types';

interface BatchPhotoItem {
  activity_name: string;
  activity_id?: string;
  city: string;
}

interface BatchPhotoResponse {
  results: Record<
    string,
    {
      photos?: Array<{ url: string; width?: number; height?: number }>;
      error?: string;
    }
  >;
}

/**
 * Fetch photos for a list of activities and restaurants via the batch endpoint.
 * Restaurants are accepted because the backend resolver routes `rest-*` IDs
 * to the restaurants collection (and persists the lookup), so a single round
 * trip covers both kinds.
 */
export function useActivityPhotosBatch(
  activities: TravelActivity[],
  destination: string,
  restaurants: Restaurant[] = [],
) {
  const activityItems: BatchPhotoItem[] = activities
    .filter((a) => a.name)
    .slice(0, 25)
    .map((a) => ({
      activity_name: a.name,
      activity_id: a.activity_id ?? a.id,
      city: destination,
    }));

  const restaurantItems: BatchPhotoItem[] = restaurants
    .filter((r) => r.name)
    .slice(0, 10)
    .map((r) => ({
      activity_name: r.name,
      activity_id: r.id,
      city: destination,
    }));

  const items: BatchPhotoItem[] = [...activityItems, ...restaurantItems];

  const ids = items.map((i) => i.activity_id ?? i.activity_name);

  return useQuery({
    queryKey: queryKeys.activities.photosBatch(ids),
    queryFn: async (): Promise<Record<string, string>> => {
      if (!items.length) return {};
      const res = await api.post<BatchPhotoResponse>(
        endpoints.activityPhotosBatch,
        { items },
      );
      // Map activity_id/name → first photo URL
      const photoMap: Record<string, string> = {};
      if (res.results) {
        for (const [key, val] of Object.entries(res.results)) {
          const firstPhoto = val.photos?.[0]?.url;
          if (firstPhoto) photoMap[key] = firstPhoto;
        }
      }
      return photoMap;
    },
    enabled: items.length > 0,
    staleTime: 60 * 60 * 1000, // 1 hour (photos don't change)
  });
}

/** Extract the first image URL from a TravelActivity */
export function getActivityImageUrl(
  activity: TravelActivity,
  photoMap?: Record<string, string>,
): string | null {
  // Try photo map first
  if (photoMap) {
    const key = activity.activity_id ?? activity.id;
    if (photoMap[key]) return photoMap[key];
    if (photoMap[activity.name]) return photoMap[activity.name];
  }

  // Try activity's own images
  if (activity.images?.length) {
    const img = activity.images[0];
    if (typeof img === 'string') return img;
    if (img?.url) return img.url;
  }

  return null;
}

/** Extract the first image URL for a Restaurant, with photoMap fallback. */
export function getRestaurantImageUrl(
  restaurant: Restaurant,
  photoMap?: Record<string, string>,
): string | null {
  if (photoMap) {
    if (restaurant.id && photoMap[restaurant.id]) return photoMap[restaurant.id];
    if (photoMap[restaurant.name]) return photoMap[restaurant.name];
  }

  if (restaurant.images?.length) {
    const img = restaurant.images[0];
    if (img?.url) return img.url;
  }

  return null;
}
