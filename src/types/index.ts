/**
 * Core Periplo types — ported from `trip_gen_mobile/mobile/src/types/`.
 * Keep in sync with mobile. Run `npm run sync:types` to verify.
 */

export * from './chat';
export * from './city';
export * from './discovery';
export * from './events';
export * from './search';
export * from './shortlist';
export * from './smartChat';

/** Full trip state returned by the backend. */
export interface TravelData {
  destination: string;
  start_date?: string;
  end_date?: string;

  travel_plan?: DayPlan[];
  activities?: TravelActivity[];
  overflow_activities?: OverflowDayActivities[];
  deleted_activities?: TravelActivity[];

  restaurants?: Restaurant[];

  total_trip_days?: number;
  budget?: string;
  is_preliminary?: boolean;
  weather?: WeatherReport | null;

  /** IANA timezone for the destination (e.g. "Europe/Rome"). Used for export. */
  timezone_id?: string;
}

export interface DayPlan {
  _uid?: string;
  day_number?: number;
  date?: string;
  notes?: string;
  /** Server-set day title (e.g. "Vatican & Trastevere"). Optional — falls
   *  back to "Day N" in UI. */
  title?: string;
  city?: string;
  city_key?: string;
  is_skeleton?: boolean;
  activities: SimplifiedActivity[];
}

export interface SimplifiedActivity {
  id: string;
  name: string;
  time_of_visit?: string;
  is_preliminary?: boolean;
  category?: string[];
  from_database?: boolean;
  activity_id?: string;
}

export interface TravelActivity {
  id: string;
  name: string;
  description?: string;
  // Backend always emits image objects ({url, source, added_at, is_primary, ...}).
  // Consumers that do `typeof img === 'string'` still compile (branch narrows to never).
  images?: Array<{ url?: string | null }>;
  category?: string[];
  primary_categories?: string[];
  secondary_tags?: string[];
  vibe_tags?: string[];
  address?: string;
  duration?: string;
  cost?: string;
  time_of_visit?: string;
  best_time_to_visit?: string[];
  working_hours?: string;
  notes?: string;
  tips?: string;
  location_name?: string;
  main_attraction?: string;
  reason?: string;
  is_preliminary?: boolean;
  from_database?: boolean;
  activity_id?: string;
  day_number?: number;
  latitude?: number;
  longitude?: number;
  coordinates?: {
    lat?: number;
    lng?: number;
    latitude?: number;
    longitude?: number;
    lon?: number;
  };
  website_url?: string;
  rating?: number;
  visitor_count?: string;
  must_see?: boolean;
  energy_level?: string;
  historical_significance?: string;
  cultural_context?: string;
  visitor_experience?: string;
  insider_tips?: string[];
  interesting_facts?: string[];
  local_perspective?: string;
  seasonal_considerations?: string;
  /** Marks a TravelActivity synthesized from a recommended Restaurant
   *  (shown on the Food map as a non-itinerary suggestion). */
  recommended?: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  images?: Array<{ url?: string | null }>;
  cuisine_type?: string[];
  address?: string;
  price_range?: string;
  atmosphere?: string;
  working_hours?: string;
  signature_dishes?: string[];
  dietary_options?: string[];
  reservation_required?: boolean;
  contact?: string;
  tips?: string;
  reason?: string;
  city?: string;
  city_key?: string;
  coordinates?: { lat?: number; lng?: number };
  /** Aggregate rating (0–5). Optional — backend includes when available. */
  rating?: number;
}

export interface OverflowDayActivities {
  day_number: number;
  date?: string;
  city?: string;
  city_key?: string;
  activities: SimplifiedActivity[];
}

export interface DestinationInfo {
  name?: string;
  city?: string;
  country?: string;
  description?: string;
  history?: string;
  culture?: string;
  attractions?: string[];
  interesting_facts?: string[];
  bestTimeToVisit?: string;
  currency?: string;
  language?: string;
  timezone?: string;
  climate?: string;
  images?: Array<{ url: string; source?: string; width?: number; height?: number }>;
  safety_notes?: string[];
  packing_list?: string[];
}

export interface ReorganizedDayPlan {
  day_number: number;
  activity_ids: string[];
  reasoning: string;
}

export interface ReorganizeResult {
  search_id: string;
  reorganized_plan: ReorganizedDayPlan[];
  summary: string;
}

export interface ReorganizeDayResult {
  search_id: string;
  day_number: number;
  reordered_activity_ids: string[];
  reasoning: string;
  summary: string;
}

export interface WeatherReport {
  resolvedLocation?: { query: string };
  currentConditions?: Record<string, unknown> | null;
  dailyForecasts?: Array<Record<string, unknown>>;
  /** Convenience flat fields some backend variants emit alongside
   *  `currentConditions`. Either source is acceptable; UI checks both. */
  temperature?: number;
  condition?: string;
}

/** SSE event types from /api/travel */
export type SSEEventType =
  | 'route'
  // Emitted before any generation work — carries the trace_id used as the
  // stream-recovery key if the connection drops mid-generation.
  | 'generation_meta'
  | 'activities_preliminary'
  | 'activities_progress'
  | 'activities_complete'
  | 'coordinates_update'
  | 'destination_info'
  | 'restaurants_complete'
  | 'final_response'
  | 'modification_plan'
  | 'clarification_needed'
  | 'activities_added'
  | 'chat_response'
  | 'discovering'
  | 'suggestions'
  | 'error';

export interface SSEEvent {
  type: SSEEventType;
  phase?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  route?: string;
  question?: string;
  content?: string;
}
