'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useChats, useCreateChat } from '@/hooks/useChats';
import { readLastChatId, writeLastChatId } from '@/components/chat/lastChatStorage';

function Spinner() {
  return (
    <Box
      sx={{
        display: 'flex',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'text.secondary',
      }}
    >
      <CircularProgress size={20} aria-label="Opening chat" />
    </Box>
  );
}

function ChatIndexInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const decidedRef = useRef(false);

  // Deep links ("Continue in Periplo" from MCP widgets): `/chat?city=&prefill=&days=&utm_*`.
  // They start a fresh chat and forward every param to it; the conversation
  // reads city/prefill/days once (composer prefill — never auto-sent).
  const forwardQs = searchParams.toString();
  const isDeepLink = searchParams.has('prefill') || searchParams.has('city');
  const suffix = forwardQs ? `?${forwardQs}` : '';

  // Resolve lastChatId synchronously on the client so we can redirect on the
  // very first commit without waiting for /api/chats. Stays null during SSR.
  const [lastChatId] = useState<string | null>(() => (isDeepLink ? null : readLastChatId()));

  // Only fetch the chat list if we have nothing remembered. The hook still
  // mounts on every render (rules of hooks), but `enabled: false` skips the
  // network request.
  const { data: chats, isLoading } = useChats({ enabled: !lastChatId && !isDeepLink });
  const createChat = useCreateChat();

  // Fast path: redirect immediately if we know the last chat.
  useEffect(() => {
    if (decidedRef.current) return;
    if (!lastChatId) return;
    decidedRef.current = true;
    router.replace(`/chat/${lastChatId}${suffix}`);
  }, [lastChatId, router, suffix]);

  // Slow path: pick from the fetched list, or create a fresh chat.
  useEffect(() => {
    if (decidedRef.current) return;
    if (lastChatId) return; // fast path will handle it
    if (!isDeepLink && isLoading) return;

    const target = isDeepLink ? null : ((chats ?? [])[0]?.chat_id ?? null);

    if (target) {
      decidedRef.current = true;
      writeLastChatId(target);
      router.replace(`/chat/${target}${suffix}`);
      return;
    }

    if (createChat.isPending) return;
    decidedRef.current = true;
    const city = searchParams.get('city')?.trim();
    void createChat
      .mutateAsync(city ? { title: `Trip ideas: ${city}` } : {})
      .then((fresh) => {
        writeLastChatId(fresh.chat_id);
        router.replace(`/chat/${fresh.chat_id}${suffix}`);
      })
      .catch(() => {
        decidedRef.current = false;
      });
  }, [lastChatId, chats, isLoading, createChat, router, isDeepLink, suffix, searchParams]);

  return <Spinner />;
}

export default function ChatIndexPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <ChatIndexInner />
    </Suspense>
  );
}
