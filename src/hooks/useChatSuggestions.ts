'use client';

import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';

/**
 * Dynamic chat-suggestion chips. Backend looks at the active trip, the
 * city, and the last few messages to propose relevant prompts (e.g.
 * "Add a restaurant on day 3", "Shift this day to Rome"). Rate-limited by
 * `chat_suggestions` (1000/day both guest and auth).
 */
export interface ChatSuggestionsArgs {
  city?: string;
  active_trip_id?: string;
  last_messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface DynamicSuggestion {
  id: string;
  label: string;
  prompt: string;
  category?: string;
}

export interface ChatSuggestionsResponse {
  suggestions: DynamicSuggestion[];
}

export function useChatSuggestions() {
  return useMutation({
    mutationFn: async (args: ChatSuggestionsArgs): Promise<ChatSuggestionsResponse> => {
      return api.post<ChatSuggestionsResponse>(endpoints.chatSuggestions, args);
    },
  });
}
