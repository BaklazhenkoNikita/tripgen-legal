'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import { ExternalLink, Sparkles } from 'lucide-react';
import { Sheet } from '@/components/ui/Sheet';
import { ChatConversation } from './ChatConversation';
import { useCreateChat } from '@/hooks/useChats';

interface Props {
  open: boolean;
  onClose: () => void;
  /** City context — used to scope the chat and key the cached chat id. */
  city: string | null | undefined;
}

const STORAGE_PREFIX = 'tripgen_ask_ai_chat_';

function cacheKey(city: string) {
  return `${STORAGE_PREFIX}${city.toLowerCase()}`;
}

function readCachedChatId(city: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(cacheKey(city));
  } catch {
    return null;
  }
}

function writeCachedChatId(city: string, chatId: string) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(cacheKey(city), chatId);
  } catch {
    // noop
  }
}

export function AskAISheet({ open, onClose, city }: Props) {
  const [chatId, setChatId] = useState<string | null>(() =>
    city ? readCachedChatId(city) : null,
  );
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createChat = useCreateChat();
  const creatingRef = useRef(false);

  useEffect(() => {
    setChatId(city ? readCachedChatId(city) : null);
    setError(null);
  }, [city]);

  useEffect(() => {
    if (!open || chatId || creatingRef.current || !city) return;
    creatingRef.current = true;
    setCreating(true);
    setError(null);
    createChat
      .mutateAsync({ title: `Ask about ${city}` })
      .then((chat) => {
        setChatId(chat.chat_id);
        writeCachedChatId(city, chat.chat_id);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Could not start chat.');
      })
      .finally(() => {
        setCreating(false);
        creatingRef.current = false;
      });
  }, [open, chatId, city, createChat]);

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
      side="right"
      size="lg"
      title={
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
          <Box component="span" sx={{ display: 'inline-flex', color: 'primary.main' }}>
            <Sparkles size={16} aria-hidden />
          </Box>
          Ask AI
        </Box>
      }
      description={city ? `Scoped to ${city}` : 'Pick a city to scope the assistant.'}
    >
      <Box sx={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            borderBottom: 1,
            borderColor: 'divider',
            px: 2.5,
            py: 1,
          }}
        >
          {chatId ? (
            <Box
              component={Link}
              href={`/chat/${chatId}`}
              onClick={onClose}
              sx={(t) => ({
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                fontSize: 12,
                fontWeight: 500,
                color: 'text.secondary',
                textDecoration: 'none',
                '&:hover': { color: t.palette.text.primary },
              })}
            >
              Open full chat
              <ExternalLink size={12} aria-hidden />
            </Box>
          ) : null}
        </Box>

        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          {chatId ? (
            <ChatConversation key={chatId} chatId={chatId} embed />
          ) : (
            <Box
              sx={{
                display: 'flex',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2.5,
                textAlign: 'center',
                fontSize: 14,
                color: 'text.secondary',
              }}
            >
              {error ? (
                <Box component="span" sx={{ color: 'error.main' }}>
                  {error}
                </Box>
              ) : !city ? (
                <span>Pick a city first to scope the assistant.</span>
              ) : creating ? (
                <span>Starting chat…</span>
              ) : (
                <span>Opening chat…</span>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Sheet>
  );
}
