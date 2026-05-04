/**
 * AUTO-GENERATED — do not edit by hand.
 * Source: trip_gen_mobile/mobile/src/types/chat.ts
 * Run `npm run sync:types` to refresh. CI fails on drift (`--check`).
 */

/**
 * Chat types — mirrored from frontend/src/types/chat.ts
 * Keep in sync with the web frontend.
 */

export interface Message {
  text: string;
  isUser: boolean;
  data?: any;
  isLoading?: boolean;
  phase?: string | null;
  isPreliminary?: boolean;
}

export interface ChatSummary {
  chat_id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  message_count: number;
  attached_trip_count: number;
  last_message_preview: string;
  last_message_timestamp?: string;
  thumbnail_url?: string;
  is_pinned: boolean;
  is_archived: boolean;
  has_unread: boolean;
  active_trip_destination?: string;
  active_trip_dates?: string;
}

export interface ContextSection {
  title: string;
  content: string;
  icon?: string; // Ionicons icon name
}

export interface ActivityDetails {
  name: string;
  description: string;
  summary: string;
  sections: ContextSection[];
  highlights: string[];
  tips: string[];
  address: string;
}

export interface ActivityPhoto {
  url: string;
  width: number;
  height: number;
  attributions: string[];
}
