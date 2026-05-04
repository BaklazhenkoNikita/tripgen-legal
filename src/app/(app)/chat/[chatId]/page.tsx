'use client';

import { use } from 'react';
import { ChatConversation } from '@/components/chat/ChatConversation';

interface Props {
  params: Promise<{ chatId: string }>;
}

export default function ChatDetailPage({ params }: Props) {
  const { chatId } = use(params);
  // Force remount on chatId change — useSmartChat seeds messages from history
  // via useState, which only initialises once. Without the key, navigating
  // between chats would keep stale messages in the streaming hook's state.
  return <ChatConversation key={chatId} chatId={chatId} />;
}
