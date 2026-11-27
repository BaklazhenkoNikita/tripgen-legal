'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import { ChevronLeft, Maximize2 } from 'lucide-react';
import { useChatDock } from '@/contexts';
import { Button } from '@/components/ui/Button';
import { ChatConversation, type ChatEntryContext } from './ChatConversation';
import { fullChatHref } from './dock/fullChatHref';

/**
 * The "Ask" view inside a place side panel: the same conversation the
 * floating chat uses, scoped to this place. Rendered in place of the place
 * details (no second overlay on top of the modal drawer).
 */
export function PlaceAskPanel({ context }: { context: ChatEntryContext }) {
  const { chatId, ensureChat, creating, error } = useChatDock();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void ensureChat();
  }, [ensureChat]);

  useEffect(() => {
    if (!chatId) return;
    const raf = requestAnimationFrame(() => {
      ref.current?.querySelector<HTMLTextAreaElement>('textarea')?.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, [chatId]);

  if (!chatId) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
          fontSize: '0.875rem',
          color: error ? 'error.main' : 'text.secondary',
        }}
      >
        {error ?? (creating ? 'Starting chat…' : 'Opening chat…')}
      </Box>
    );
  }
  return (
    <Box ref={ref} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ChatConversation key={chatId} chatId={chatId} embed context={context} />
    </Box>
  );
}

/** Header actions for a side panel in its Ask view. */
export function PlaceAskTopActions({
  placeName,
  context,
  onBack,
}: {
  placeName: string;
  context: ChatEntryContext;
  onBack: () => void;
}) {
  const { chatId } = useChatDock();
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
      <Button variant="ghost" size="sm" iconLeft={<ChevronLeft size={16} />} onClick={onBack}>
        <Box
          component="span"
          sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {placeName}
        </Box>
      </Button>
      {chatId ? (
        <Button asChild variant="secondary" size="sm" iconLeft={<Maximize2 size={14} />}>
          <Link href={fullChatHref(chatId, context)}>Open full chat</Link>
        </Button>
      ) : null}
    </Box>
  );
}
