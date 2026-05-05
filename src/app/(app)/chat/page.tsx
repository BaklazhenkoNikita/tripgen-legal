'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useChats, useCreateChat } from '@/hooks/useChats';
import { readLastChatId, writeLastChatId } from '@/components/chat/lastChatStorage';

export default function ChatIndexPage() {
  const router = useRouter();
  const decidedRef = useRef(false);

  // Resolve lastChatId synchronously on the client so we can redirect on the
  // very first commit without waiting for /api/chats. Stays null during SSR.
  const [lastChatId] = useState<string | null>(() => readLastChatId());

  // Only fetch the chat list if we have nothing remembered. The hook still
  // mounts on every render (rules of hooks), but `enabled: false` skips the
  // network request.
  const { data: chats, isLoading } = useChats({ enabled: !lastChatId });
  const createChat = useCreateChat();

  // Fast path: redirect immediately if we know the last chat.
  useEffect(() => {
    if (decidedRef.current) return;
    if (!lastChatId) return;
    decidedRef.current = true;
    router.replace(`/chat/${lastChatId}`);
  }, [lastChatId, router]);

  // Slow path: pick from the fetched list, or create a fresh chat.
  useEffect(() => {
    if (decidedRef.current) return;
    if (lastChatId) return; // fast path will handle it
    if (isLoading) return;

    const list = chats ?? [];
    const target = list[0]?.chat_id ?? null;

    if (target) {
      decidedRef.current = true;
      writeLastChatId(target);
      router.replace(`/chat/${target}`);
      return;
    }

    if (createChat.isPending) return;
    decidedRef.current = true;
    void createChat
      .mutateAsync({})
      .then((fresh) => {
        writeLastChatId(fresh.chat_id);
        router.replace(`/chat/${fresh.chat_id}`);
      })
      .catch(() => {
        decidedRef.current = false;
      });
  }, [lastChatId, chats, isLoading, createChat, router]);

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
      <CircularProgress size={20} />
    </Box>
  );
}
