import type { TravelActivity } from '@/types';

/**
 * Time-of-day buckets for the itinerary workspace. These are a *display lens*
 * over a day's activities — the persisted source of truth is the activity
 * ORDER (via reorderActivities), not the bucket. Buckets are derived from each
 * activity's free-text `time_of_visit` while scanning the day in array order,
 * so section headers stay aligned with the drag index contract.
 */
export type TimeBucket = 'morning' | 'lunch' | 'afternoon' | 'dinner' | 'evening';

export const TIME_BUCKET_ORDER: readonly TimeBucket[] = [
  'morning',
  'lunch',
  'afternoon',
  'dinner',
  'evening',
];

export const TIME_BUCKET_LABELS: Record<TimeBucket, string> = {
  morning: 'Morning',
  lunch: 'Lunch',
  afternoon: 'Afternoon',
  dinner: 'Dinner',
  evening: 'Evening',
};

/** Classify a free-text time_of_visit into a bucket, or null if unrecognized. */
export function classifyTimeOfVisit(raw: string | undefined | null): TimeBucket | null {
  if (!raw) return null;
  const s = raw.toLowerCase();
  if (/\b(breakfast|morning|early|sunrise|am)\b/.test(s)) return 'morning';
  if (/\b(lunch|midday|noon)\b/.test(s)) return 'lunch';
  if (/\b(afternoon|midafternoon)\b/.test(s)) return 'afternoon';
  if (/\b(dinner|supper)\b/.test(s)) return 'dinner';
  if (/\b(evening|night|nightlife|sunset|pm)\b/.test(s)) return 'evening';
  return null;
}

export interface BucketedActivity {
  activity: TravelActivity;
  /** Global index within the day's ordered list (the drag index). */
  index: number;
  bucket: TimeBucket;
  /** True on the first activity of a new bucket run — render a header before it. */
  startsBucket: boolean;
}

/**
 * Walk a day's activities in their existing array order, assigning a bucket to
 * each. Unlabeled activities inherit the running bucket (default "morning") so
 * runs stay contiguous and monotonic — which keeps section headers aligned with
 * the flat drag index that reorderActivities expects. Returns items in the SAME
 * order as `activities`, annotated with where a header should render.
 */
export function bucketDayActivities(activities: TravelActivity[]): BucketedActivity[] {
  let running: TimeBucket = 'morning';
  let prev: TimeBucket | null = null;
  return activities.map((activity, index) => {
    const classified = classifyTimeOfVisit(activity.time_of_visit);
    if (classified) running = classified;
    const bucket = running;
    const startsBucket = bucket !== prev;
    prev = bucket;
    return { activity, index, bucket, startsBucket };
  });
}
