export const queryKeys = {
  trips: {
    all: ['trips'] as const,
    detail: (searchId: string) => ['trips', 'detail', searchId] as const,
    history: (params?: { limit?: number; skip?: number }) =>
      ['trips', 'history', params] as const,
    summary: () => ['trips', 'summary'] as const,
    versions: (ids: string[]) => ['trips', 'versions', ids] as const,
    version: (searchId: string) => ['trips', 'version', searchId] as const,
    collaborators: (searchId: string) => ['trips', 'collaborators', searchId] as const,
    sharedWithMe: (params?: { limit?: number; skip?: number }) =>
      ['trips', 'sharedWithMe', params] as const,
    publicTemplate: (slug: string) => ['trips', 'publicTemplate', slug] as const,
  },
  weather: {
    all: ['weather'] as const,
    byLocation: (location: string) => ['weather', location] as const,
  },
  activities: {
    all: ['activities'] as const,
    photos: (activityId: string) => ['activities', 'photos', activityId] as const,
    photosBatch: (ids: string[]) => ['activities', 'photos-batch', ids] as const,
    context: (activityId: string) => ['activities', 'context', activityId] as const,
    search: (query: string) => ['activities', 'search', query] as const,
  },
  destinations: {
    all: ['destinations'] as const,
    info: (city: string) => ['destinations', 'info', city] as const,
    list: () => ['destinations', 'list'] as const,
  },
  feeds: {
    home: (city: string) => ['feeds', 'home', city] as const,
    explore: (city: string, params?: Record<string, unknown>) =>
      ['feeds', 'explore', city, params ?? {}] as const,
    activities: (city: string, params?: Record<string, unknown>) =>
      ['feeds', 'activities', city, params ?? {}] as const,
    viator: (city: string) => ['feeds', 'viator', city] as const,
    viatorSearch: (args: { q: string; city?: string; dates?: string; limit?: number }) =>
      ['feeds', 'viatorSearch', args] as const,
    categoryCounts: (city: string) => ['feeds', 'categoryCounts', city] as const,
  },
  search: {
    suggest: (query: string, city?: string) =>
      ['search', 'suggest', query, city ?? ''] as const,
  },
  chats: {
    all: ['chats'] as const,
    list: (params?: { limit?: number; skip?: number }) =>
      ['chats', 'list', params] as const,
    detail: (chatId: string) => ['chats', 'detail', chatId] as const,
    messages: (chatId: string) => ['chats', 'messages', chatId] as const,
  },
  profile: {
    current: () => ['profile', 'current'] as const,
    fingerprint: (userId: string) => ['profile', 'fingerprint', userId] as const,
  },
  shortlist: {
    all: ['shortlist'] as const,
  },
} as const;
