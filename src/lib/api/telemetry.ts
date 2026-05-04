import { getGuestId } from '@/lib/auth/guestId';

const REQUEST_ID_HEADER = 'X-Request-Id';
const FEATURE_HEADER = 'X-Feature-Name';
const PLATFORM_HEADER = 'X-Client-Platform';
const SESSION_HEADER = 'X-Session-Id';
const SOURCE_HEADER = 'X-TripGen-Source';

/**
 * Who triggered the request. `trip_load` and `city_search` tell the backend
 * this call is an internal fan-out (opening a saved trip, prefetching a
 * never-seen city); the backend routes these to an internal counter variant
 * with a much higher cap instead of the user-facing daily bucket. Default
 * (`user_click`) hits the normal counter and, for trip generation, consumes
 * a credit. Mirror of `trip_gen_mobile/mobile/src/services/requestTelemetry.ts`.
 */
export type RequestSource = 'user_click' | 'trip_load' | 'city_search';

export interface TelemetryOptions {
  /** Full URL or path of the request; used to infer X-Feature-Name. */
  url?: string;
  /** Override feature inference. */
  featureName?: string;
  /** Internal fan-out marker (see RequestSource). */
  internalSource?: RequestSource;
}

let requestCounter = 0;

export function createRequestId(): string {
  requestCounter += 1;
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `web-${timestamp}-${random}-${requestCounter}`;
}

/** Returns the persistent guest id used as `X-Session-Id`. */
export function getSessionId(): string {
  return getGuestId();
}

export function inferFeatureName(url?: string): string {
  if (!url) return 'unknown';
  const n = url.toLowerCase();
  if (n.includes('/api/travel')) return 'trip_generation';
  if (n.includes('/api/smart-chat')) return 'smart_chat';
  if (n.includes('/api/chats')) return 'chat';
  if (n.includes('/api/chat/')) return 'chat';
  if (n.includes('/api/city-feed')) return 'city_feed';
  if (n.includes('/api/v4/home') || n.includes('/api/v3/home')) return 'home_feed';
  if (n.includes('/api/v4/explore') || n.includes('/api/v3/explore')) return 'explore_feed';
  if (n.includes('/api/v4/activities') || n.includes('/api/v3/activities')) return 'activities_feed';
  if (n.includes('/api/v4/category-counts')) return 'home_feed';
  if (n.includes('/api/v4/generate-more')) return 'home_feed';
  if (n.includes('/api/v4/viator')) return 'viator';
  if (n.includes('/api/events')) return 'events';
  if (n.includes('/api/shortlist')) return 'shortlist';
  if (n.includes('/api/signals')) return 'signals';
  if (n.includes('/api/search-history')) return 'search_history';
  if (n.includes('/api/search')) return 'search';
  if (n.includes('/api/destinations')) return 'destination_info';
  if (n.includes('/api/activity')) return 'activity';
  if (n.includes('/api/weather')) return 'weather';
  if (n.includes('/api/credits')) return 'credits';
  if (n.includes('/api/profiles')) return 'profile';
  if (n.includes('/api/trips')) return 'trip_mutations';
  if (n.includes('/api/export')) return 'export';
  if (n.includes('/api/templates')) return 'templates';
  if (n.includes('/api/discover')) return 'discover';
  if (n.includes('/api/restaurants')) return 'restaurants';
  if (n.includes('/api/config')) return 'feature_config';
  return 'api';
}

export function getTelemetryHeaders(
  opts: TelemetryOptions = {},
): Record<string, string> {
  const headers: Record<string, string> = {
    [REQUEST_ID_HEADER]: createRequestId(),
    [SESSION_HEADER]: getGuestId(),
    [PLATFORM_HEADER]: 'web',
    [FEATURE_HEADER]: opts.featureName ?? inferFeatureName(opts.url),
  };
  if (opts.internalSource && opts.internalSource !== 'user_click') {
    headers[SOURCE_HEADER] = opts.internalSource;
  }
  return headers;
}
