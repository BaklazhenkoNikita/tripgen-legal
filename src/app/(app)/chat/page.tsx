'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useChats, useCreateChat } from '@/hooks/useChats';
import { readLastChatId, writeLastChatId } from '@/components/chat/lastChatStorage';

export default function ChatIndexPage() {
  const router = useRouter();
  const { data: chats, isLoading } = useChats();
  const createChat = useCreateChat();
  const decidedRef = useRef(false);

  useEffect(() => {
    if (decidedRef.current) return;
    if (isLoading) return;

    const list = chats ?? [];
    const lastId = readLastChatId();
    const target =
      (lastId && list.some((c) => c.chat_id === lastId) ? lastId : null) ??
      list[0]?.chat_id ??
      null;

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
        // Allow another attempt on next render if creation failed.
        decidedRef.current = false;
      });
  }, [chats, isLoading, createChat, router]);

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
