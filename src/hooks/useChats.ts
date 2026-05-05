'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { getGuestId } from '@/lib/auth/guestId';
import { queryKeys } from '@/lib/query/keys';
import type { ChatSummary } from '@/types';

interface ChatListResponse {
  chats: ChatSummary[];
  total: number;
}

export function useChats(params?: { limit?: number; skip?: number; enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.chats.list({ limit: params?.limit, skip: params?.skip }),
    queryFn: async (): Promise<ChatSummary[]> => {
      const limit = params?.limit ?? 20;
      const skip = params?.skip ?? 0;
      const res = await api.get<ChatListResponse>(
        `${endpoints.chats}?limit=${limit}&skip=${skip}`,
      );
      return res.chats ?? [];
    },
    staleTime: 60 * 1000,
    enabled: params?.enabled ?? true,
  });
}

export interface ChatFull {
  chat_id: string;
  title: string;
  message_count: number;
  is_archived: boolean;
  is_pinned: boolean;
  active_trip_id?: string;
  last_activity_at?: string;
}

export interface BackendChatMessage {
  message_id: string;
  chat_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  message_type?: string;
  trip_context_id?: string;
}

interface ChatMessagesResponse {
  messages: BackendChatMessage[];
  total: number;
}

export function useChatMessages(chatId: string | null) {
  return useQuery({
    queryKey: queryKeys.chats.messages(chatId ?? ''),
    queryFn: async (): Promise<BackendChatMessage[]> => {
      if (!chatId) return [];
      const res = await api.get<ChatMessagesResponse>(
        `${endpoints.chatMessages(chatId)}?limit=100&skip=0`,
      );
      return res.messages ?? [];
    },
    enabled: !!chatId,
    staleTime: 30 * 1000,
  });
}

export function useCreateChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title?: string; initialTripId?: string }): Promise<ChatFull> => {
      return api.post<ChatFull>(endpoints.chats, {
        session_id: getGuestId(),
        title: input.title,
        initial_trip_id: input.initialTripId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.all });
    },
  });
}

/** GET a single chat's full metadata (title, pin/archive flags, trip ref). */
export function useChat(chatId: string | null) {
  return useQuery({
    queryKey: queryKeys.chats.detail(chatId ?? ''),
    queryFn: async (): Promise<ChatFull | null> => {
      if (!chatId) return null;
      return api.get<ChatFull>(endpoints.chatById(chatId));
    },
    enabled: !!chatId,
    staleTime: 60 * 1000,
  });
}

/** PATCH — rename, pin/unpin, archive/unarchive, swap active trip. */
export interface UpdateChatArgs {
  chatId: string;
  title?: string;
  is_archived?: boolean;
  is_pinned?: boolean;
  active_trip_id?: string | null;
}

export function useUpdateChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ chatId, ...patch }: UpdateChatArgs): Promise<ChatFull> => {
      return api.patch<ChatFull>(endpoints.chatById(chatId), patch);
    },
    onSuccess: (_data, { chatId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.detail(chatId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.all });
    },
  });
}

/** DELETE — soft archive on backend; removes from chat list. */
export function useDeleteChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (chatId: string) => {
      return api.delete<{ deleted: boolean }>(endpoints.chatById(chatId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.all });
    },
  });
}

/**
 * POST a message to a chat (non-SSE path — for tool-call results, replays,
 * or legacy non-streaming assistant messages). Live conversation still goes
 * through `/api/smart-chat` in `useSmartChat`.
 */
export interface PostMessageArgs {
  chatId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  message_type?: string;
  metadata?: Record<string, unknown>;
}

export function usePostChatMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ chatId, ...body }: PostMessageArgs): Promise<BackendChatMessage> => {
      return api.post<BackendChatMessage>(endpoints.chatMessages(chatId), body);
    },
    onSuccess: (_data, { chatId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.messages(chatId) });
    },
  });
}
