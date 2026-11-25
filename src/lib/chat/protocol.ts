/**
 * Smart-chat protocol v2 — web-owned types.
 *
 * Contract: trip_gen_mobile/docs/chat_protocol_v2.md (card data shapes:
 * tripgen_backend/agents/chat_cards.py). v2 is additive over v1, so the v1
 * frame fields in `@/types/smartChat` (auto-synced from mobile) still apply;
 * this module layers the v2 fields on top without editing the synced file.
 */

import type { SmartChatSSEEvent } from '@/types';

/** Highest card `schema_v` this client understands. Newer → fallback_text. */
export const CHAT_CARD_SCHEMA_V = 1;

export const CHAT_PROTOCOL_VERSION = 2;

export type ChatErrorCode =
  | 'timeout'
  | 'tool_failure'
  | 'ai_failure'
  | 'tool_loop'
  | 'rate_limit'
  | 'action_expired'
  | 'action_not_found'
  | 'client_loop_detected'
  /** Client-side: transport died (SSE retries exhausted). */
  | 'network';

/** Codes where re-sending the same request is expected to help. */
export const RETRYABLE_ERROR_CODES: ReadonlySet<string> = new Set([
  'timeout',
  'tool_failure',
  'ai_failure',
  'tool_loop',
  'network',
]);

export type CardKind =
  | 'place_list'
  | 'weather'
  | 'day_plan'
  | 'trip_summary'
  | 'cost_summary'
  | 'route'
  | 'sources'
  | 'trip_insights'
  | 'booking_links';

export interface ChatCard {
  cardId: string;
  /** Kept as string: unknown kinds must still round-trip to fallback_text. */
  kind: string;
  schemaV: number;
  data: Record<string, unknown>;
  fallbackText: string;
  tool?: string;
}

// ── Card data shapes (schema_v 1) ─────────────────────────────────────

export interface PlaceItem {
  entity_id?: string;
  entity_type?: 'activity' | 'restaurant';
  name: string;
  photo_url?: string | null;
  category?: string | null;
  lat?: number | null;
  lng?: number | null;
  price_label?: string | null;
  description_short?: string | null;
  address?: string | null;
  rating?: number | null;
  city?: string | null;
}

export interface WeatherDay {
  date: string;
  t_min_c?: number;
  t_max_c?: number;
  condition?: string;
  condition_text?: string;
  precip_pct?: number;
}

export interface DayPlanItem {
  activity_id?: string;
  name: string;
  time?: string | null;
  duration?: string | null;
  category?: string | null;
  photo_url?: string | null;
  lat?: number | null;
  lng?: number | null;
}

export interface RouteLeg {
  from: string;
  to: string;
  km?: number;
  walk_min?: number;
  walkable?: boolean;
}

export interface SourceItem {
  title?: string;
  url: string;
  domain?: string;
}

export interface TripInsight {
  id: string;
  kind?: string;
  severity?: 'warn' | 'info';
  day_number?: number | null;
  title: string;
  detail?: string;
  fix_prompt?: string | null;
}

export interface BookingLink {
  provider?: string;
  kind?: 'hotel' | 'flight' | 'tour' | 'esim' | string;
  label: string;
  url: string;
}

// ── Actions ───────────────────────────────────────────────────────────

export interface ActionDiff {
  added?: Array<{ name: string; day_number?: number }>;
  removed?: Array<{ name: string; day_number?: number }>;
  moved?: Array<{ name: string; from_day?: number; to_day?: number }>;
  changed?: Array<{ name: string; day_number?: number; field?: string; to?: string }>;
}

export interface PlanPreview {
  summary?: string;
  days?: Array<{ day_number: number; before?: string[]; after?: string[] }>;
}

export interface ActionResult {
  actionId: string;
  actionType: string;
  success: boolean;
  message: string;
  error?: string;
  errorCode?: string;
  searchId?: string;
  diff?: ActionDiff;
  undoToken?: string;
  /** ISO-8601 UTC. */
  undoExpiresAt?: string;
  undo?: { status: 'pending' | 'done' | 'failed'; message?: string };
}

// ── Request context ───────────────────────────────────────────────────

export interface ChatRequestContext {
  trip_id?: string;
  day_number?: number;
  entity_id?: string;
  entity_type?: string;
  entity_name?: string;
}

// ── Frames ────────────────────────────────────────────────────────────

/** v1 SSE event widened with v2 fields. `type` is `string` so unknown
 *  frames type-check and fall through to the reducer's default branch. */
export interface SmartChatFrame extends Omit<SmartChatSSEEvent, 'type' | 'error'> {
  type: string;
  // hello
  chat_id?: string;
  turn_id?: string;
  server_history?: boolean;
  // tool_call
  label?: string;
  // card
  card_id?: string;
  kind?: string;
  schema_v?: number;
  data?: Record<string, unknown>;
  data_omitted?: boolean;
  fallback_text?: string;
  actions?: unknown[];
  // action_request
  preview?: PlanPreview;
  // action_executed
  error?: string;
  error_code?: string;
  diff?: ActionDiff;
  undo_token?: string;
  undo_expires_at?: string;
  // error
  code?: string;
}

// ── History ───────────────────────────────────────────────────────────

export interface RichPart {
  type: string;
  [key: string]: unknown;
}

export interface BackendChatMessageV2 {
  message_id: string;
  chat_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  message_type?: string;
  trip_context_id?: string;
  metadata?: { parts?: RichPart[]; turn_id?: string; [key: string]: unknown } | null;
}

// ── REST shapes ───────────────────────────────────────────────────────

export type FeedbackReason = 'wrong_info' | 'not_helpful' | 'too_long' | 'other';

export interface UndoResponse {
  success: boolean;
  message?: string;
  search_id?: string;
}

export interface TurnStatusResponse {
  status: 'running' | 'complete' | 'unknown';
  message?: string;
}

export interface TripInsightsResponse {
  trip_id: string;
  insights: TripInsight[];
}

export type MemoryCategory =
  | 'diet'
  | 'mobility'
  | 'party'
  | 'pace'
  | 'budget'
  | 'likes'
  | 'dislikes'
  | 'home'
  | 'other';

export interface MemoryFact {
  id: string;
  fact: string;
  category: MemoryCategory | string;
  updated_at?: string;
}
