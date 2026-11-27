import type { ChatRequestContext } from '@/lib/chat/protocol';

/** `/chat/{id}` carrying the place the user was asking about, so "Open full
 *  chat" keeps its context chip (read back by ChatConversation's UrlPrefill). */
export function fullChatHref(chatId: string, context?: ChatRequestContext | null): string {
  const params = new URLSearchParams();
  if (context?.entity_id && context.entity_name) {
    params.set('entity_id', context.entity_id);
    params.set('entity_name', context.entity_name);
    if (context.entity_type) params.set('entity_type', context.entity_type);
  }
  const qs = params.toString();
  return `/chat/${encodeURIComponent(chatId)}${qs ? `?${qs}` : ''}`;
}
