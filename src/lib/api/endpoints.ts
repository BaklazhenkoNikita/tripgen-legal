/**
 * Backend endpoint URLs.
 * Ported from `trip_gen_mobile/mobile/src/config/api.ts`.
 *
 * Function-style helpers for dynamic path params preserve Web's stronger typing
 * while mirroring the mobile endpoint surface 1:1.
 */

import { API_BASE_URL } from './baseUrl';

export const endpoints = {
  // --- Core generation + mutations ---
  travel: `${API_BASE_URL}/api/travel`,
  saveTrip: `${API_BASE_URL}/api/travel/save-trip`,
  createActivity: `${API_BASE_URL}/api/travel/create-activity`,

  // --- Search ---
  globalSearch: `${API_BASE_URL}/api/search`,
  searchSuggest: `${API_BASE_URL}/api/search/suggest`,
  activitiesList: `${API_BASE_URL}/api/activities/list`,
  activitiesSearch: `${API_BASE_URL}/api/activities/search`,

  // --- Activity details ---
  activityPhotosBatch: `${API_BASE_URL}/api/activity-photos/batch`,
  activityContext: `${API_BASE_URL}/api/activity-context`,
  activityDetail: (id: string) => `${API_BASE_URL}/api/activity/${encodeURIComponent(id)}`,
  deepContext: `${API_BASE_URL}/api/deep-context`,

  // --- Destinations ---
  destinationInfo: (city: string) => `${API_BASE_URL}/api/destinations/info/${encodeURIComponent(city)}`,
  destinationList: `${API_BASE_URL}/api/destinations/list`,
  destinationAutocomplete: `${API_BASE_URL}/api/destinations/autocomplete`,

  // --- Restaurants ---
  restaurantsList: `${API_BASE_URL}/api/restaurants/list`,

  // --- Weather ---
  weather: `${API_BASE_URL}/api/weather`,

  // --- Search history / trip detail ---
  searchHistory: `${API_BASE_URL}/api/search-history`,
  searchHistorySummary: `${API_BASE_URL}/api/search-history/summary`,
  searchHistoryVersions: `${API_BASE_URL}/api/search-history/versions`,
  searchHistoryById: (id: string) => `${API_BASE_URL}/api/search-history/${encodeURIComponent(id)}`,
  searchHistoryByTrace: (traceId: string) =>
    `${API_BASE_URL}/api/search-history/by-trace/${encodeURIComponent(traceId)}`,

  // --- Chat ---
  chats: `${API_BASE_URL}/api/chats`,
  chatById: (id: string) => `${API_BASE_URL}/api/chats/${encodeURIComponent(id)}`,
  chatMessages: (chatId: string) =>
    `${API_BASE_URL}/api/chats/${encodeURIComponent(chatId)}/messages`,
  smartChat: `${API_BASE_URL}/api/smart-chat`,
  chatSuggestions: `${API_BASE_URL}/api/chat/suggestions`,

  // --- Profiles ---
  profiles: `${API_BASE_URL}/api/profiles`,
  profileById: (userId: string) => `${API_BASE_URL}/api/profiles/${encodeURIComponent(userId)}`,
  // Backend route: POST /api/profiles/merge (body: { guest_id }).
  // (Previous value was `/api/travel/merge-profile`, which 404s — the route
  // lives on the profiles router, not travel.)
  mergeProfile: `${API_BASE_URL}/api/profiles/merge`,

  // --- Explore / feeds (v4) ---
  homeFeed: (city: string) => `${API_BASE_URL}/api/v4/home/${encodeURIComponent(city)}`,
  exploreFeed: (city: string) => `${API_BASE_URL}/api/v4/explore/${encodeURIComponent(city)}`,
  activitiesFeed: (city: string) =>
    `${API_BASE_URL}/api/v4/activities/${encodeURIComponent(city)}`,
  categoryCounts: (city: string) =>
    `${API_BASE_URL}/api/v4/category-counts/${encodeURIComponent(city)}`,
  generateMore: (city: string) =>
    `${API_BASE_URL}/api/v4/generate-more/${encodeURIComponent(city)}`,
  viatorFeed: (city: string) => `${API_BASE_URL}/api/v4/viator/${encodeURIComponent(city)}`,
  viatorSearch: `${API_BASE_URL}/api/v4/viator/search`,

  // --- Templates / public trips ---
  templates: `${API_BASE_URL}/api/templates`,
  templateFork: (templateId: string) =>
    `${API_BASE_URL}/api/templates/${encodeURIComponent(templateId)}/fork`,
  publicTemplate: (slug: string) =>
    `${API_BASE_URL}/api/trips/public/${encodeURIComponent(slug)}`,
  publicTemplateClone: (slug: string) =>
    `${API_BASE_URL}/api/trips/public/${encodeURIComponent(slug)}/clone`,
  publicTemplateVote: (slug: string) =>
    `${API_BASE_URL}/api/trips/public/${encodeURIComponent(slug)}/vote`,

  // --- Trip-level V1 AI actions ---
  tripSurprise: (id: string, day: number) =>
    `${API_BASE_URL}/api/trips/${encodeURIComponent(id)}/surprise/${day}`,
  tripReorganize: (id: string) =>
    `${API_BASE_URL}/api/trips/${encodeURIComponent(id)}/reorganize`,
  tripReorganizeDay: (id: string) =>
    `${API_BASE_URL}/api/trips/${encodeURIComponent(id)}/reorganize-day`,

  // --- V2 lightweight trip mutations (delta-based) ---
  v2AddActivity: `${API_BASE_URL}/api/travel/v2/add-activity`,
  v2DeleteActivity: `${API_BASE_URL}/api/travel/v2/delete-activity`,
  v2MoveActivity: `${API_BASE_URL}/api/travel/v2/move-activity`,
  v2ReorderActivities: `${API_BASE_URL}/api/travel/v2/reorder-activities`,
  v2AddDay: `${API_BASE_URL}/api/travel/v2/add-day`,
  v2AutofillDay: `${API_BASE_URL}/api/travel/v2/autofill-day`,
  v2DeleteDay: `${API_BASE_URL}/api/travel/v2/delete-day`,
  v2ReorderDays: `${API_BASE_URL}/api/travel/v2/reorder-days`,
  v2SyncState: `${API_BASE_URL}/api/travel/v2/sync-state`,
  v2EnrichTrip: `${API_BASE_URL}/api/travel/v2/enrich-trip`,

  // --- Sharing & collaboration ---
  tripInvite: (id: string) => `${API_BASE_URL}/api/trips/${encodeURIComponent(id)}/invite`,
  tripJoin: (token: string) => `${API_BASE_URL}/api/trips/join/${encodeURIComponent(token)}`,
  tripCollaborators: (id: string) =>
    `${API_BASE_URL}/api/trips/${encodeURIComponent(id)}/collaborators`,
  tripCollaboratorRole: (id: string, userId: string) =>
    `${API_BASE_URL}/api/trips/${encodeURIComponent(id)}/collaborators/${encodeURIComponent(userId)}/role`,
  tripLeave: (id: string) =>
    `${API_BASE_URL}/api/trips/${encodeURIComponent(id)}/collaborators/me`,
  tripVersion: (id: string) => `${API_BASE_URL}/api/trips/${encodeURIComponent(id)}/version`,
  sharedWithMe: `${API_BASE_URL}/api/trips/shared-with-me`,

  // --- Export (per-format paths; legacy `export` kept for backward compat) ---
  export: `${API_BASE_URL}/api/export`,
  exportPdf: (searchId: string) =>
    `${API_BASE_URL}/api/export/${encodeURIComponent(searchId)}/pdf`,
  exportGoogleCalendar: (searchId: string) =>
    `${API_BASE_URL}/api/export/${encodeURIComponent(searchId)}/google-calendar`,
  exportNotion: (searchId: string) =>
    `${API_BASE_URL}/api/export/${encodeURIComponent(searchId)}/notion`,
  exportHistory: (searchId: string) =>
    `${API_BASE_URL}/api/export/${encodeURIComponent(searchId)}/history`,

  // --- Discover (SSE streaming POST) ---
  discover: `${API_BASE_URL}/api/discover`,

  // --- Events (single-event enrich) ---
  eventEnrich: (eventId: string) =>
    `${API_BASE_URL}/api/events/${encodeURIComponent(eventId)}/enrich`,

  // --- Templates (city list + fork) ---
  cityTemplates: (city: string) =>
    `${API_BASE_URL}/api/templates/${encodeURIComponent(city)}`,

  // --- Shortlist / signals ---
  shortlist: `${API_BASE_URL}/api/shortlist`,
  signals: `${API_BASE_URL}/api/signals`,

  // --- Events ---
  eventsSearch: `${API_BASE_URL}/api/events/search`,

  // --- Credits / feature config ---
  credits: `${API_BASE_URL}/api/credits`,
  featureConfig: `${API_BASE_URL}/api/config`,

  // --- Push tokens (web push behind NEXT_PUBLIC_ENABLE_WEB_PUSH) ---
  pushToken: `${API_BASE_URL}/api/user/push-token`,

  // --- Dev/debug (backend gated to dev builds) ---
  debugResetRateLimits: `${API_BASE_URL}/api/debug/rate-limits/reset`,
  debugCurrentRateLimits: `${API_BASE_URL}/api/debug/rate-limits/current`,
  debugTogglePro: `${API_BASE_URL}/api/debug/pro-toggle`,
} as const;
