'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import { alpha } from '@mui/material/styles';
import { Menu } from 'lucide-react';
import { useCity, useActiveTrip } from '@/contexts';
import { useChatMessages } from '@/hooks/useChats';
import { useSmartChat } from '@/hooks/useSmartChat';
import { useChatEnabled } from '@/hooks/useFeatureConfig';
import { useChatLayout } from './ChatLayoutContext';
import { writeLastChatId } from './lastChatStorage';
import { ChatMessage } from './ChatMessage';
import { QuickActions } from './QuickActions';
import { SuggestionChips } from './SuggestionChips';
import type { SmartChatMessage } from '@/types';

interface Props {
  chatId: string;
  /** When true, lays out for an embedded surface (drawer/panel): fills its
   *  parent (h-full), drops the max-width clamp, and hides the back link. */
  embed?: boolean;
}

export function ChatConversation({ chatId, embed = false }: Props) {
  const { city } = useCity();
  const { activeTripId } = useActiveTrip();
  const { openHistory, isMobile } = useChatLayout();

  useEffect(() => {
    if (!embed) writeLastChatId(chatId);
  }, [chatId, embed]);

  const { data: historyRaw } = useChatMessages(chatId);
  const seed = useMemo<SmartChatMessage[]>(() => {
    if (!historyRaw) return [];
    return historyRaw.map((m) => ({
      id: m.message_id,
      role: (m.role === 'user' || m.role === 'assistant' || m.role === 'system'
        ? m.role
        : 'assistant') as SmartChatMessage['role'],
      content: m.content,
      timestamp: new Date(m.timestamp),
      messageType: 'text',
    }));
  }, [historyRaw]);

  const chatEnabled = useChatEnabled();

  const {
    messages,
    status,
    activeTool,
    error,
    send,
    confirmAction,
    rejectAction,
    answerQuestion,
    respondConfirm,
    resetMessages,
  } = useSmartChat({
    chatId,
    initialMessages: seed,
    tripContext: activeTripId ? { id: activeTripId } : undefined,
    city: city ?? undefined,
  });

  const seededRef = useRef(false);
  useEffect(() => {
    if (!seededRef.current && seed.length > 0) {
      resetMessages(seed);
      seededRef.current = true;
    }
  }, [seed, resetMessages]);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, status]);

  const [input, setInput] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    void send(input);
    setInput('');
  };

  const handleAction = (accept: boolean, actionId: string) => {
    if (accept) {
      void confirmAction(actionId);
    } else {
      rejectAction(actionId);
    }
  };

  const handleAnswer = (
    questionId: string,
    payload: { optionId?: string; freeText?: string; selectedIds?: string[]; label: string },
  ) => {
    void answerQuestion(questionId, payload);
  };

  const handleConfirm = (
    questionId: string,
    result: 'confirmed' | 'cancelled',
    label: string,
  ) => {
    void respondConfirm(questionId, result, label);
  };

  const sending = status === 'streaming' || status === 'tool_running';

  return (
    <Box
      sx={
        embed
          ? {
              display: 'flex',
              height: '100%',
              flexDirection: 'column',
              px: { xs: 2, sm: 2.5 },
            }
          : {
              mx: 'auto',
              display: 'flex',
              height: '100%',
              maxWidth: '48rem',
              width: '100%',
              flexDirection: 'column',
              px: { xs: 2, sm: 3 },
            }
      }
    >
      {embed ? (
        city ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', py: 1 }}>
            <Box
              component="span"
              sx={{
                borderRadius: 999,
                bgcolor: 'action.hover',
                px: 1,
                py: 0.25,
                fontSize: 11,
                color: 'text.secondary',
              }}
            >
              Context: {city}
            </Box>
          </Box>
        ) : null
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            py: 1.5,
          }}
        >
          {isMobile ? (
            <IconButton
              aria-label="Open chat history"
              onClick={openHistory}
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              <Menu size={18} aria-hidden />
            </IconButton>
          ) : (
            <Box />
          )}
          {city ? (
            <Box
              component="span"
              sx={{
                borderRadius: 999,
                bgcolor: 'action.hover',
                px: 1,
                py: 0.25,
                fontSize: 11,
                color: 'text.secondary',
              }}
            >
              Context: {city}
            </Box>
          ) : null}
        </Box>
      )}

      <Box
        ref={scrollRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          py: 2,
          '& > * + *': { mt: 1.5 },
        }}
      >
        {messages.length === 0 ? (
          <QuickActions
            city={city}
            hasActiveTrip={Boolean(activeTripId)}
            onPick={(prompt) => {
              void send(prompt);
            }}
            disabled={!chatEnabled || sending}
          />
        ) : (
          messages.map((m) => (
            <ChatMessage
              key={m.id}
              message={m}
              onAction={handleAction}
              onAnswer={handleAnswer}
              onConfirm={handleConfirm}
            />
          ))
        )}
        {activeTool ? (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Box
              component="span"
              sx={{
                borderRadius: 999,
                bgcolor: 'action.hover',
                px: 1.25,
                py: 0.25,
                fontSize: 11,
                fontWeight: 500,
                color: 'text.secondary',
              }}
            >
              {`Using: ${activeTool}`}
            </Box>
          </Box>
        ) : null}
      </Box>

      {error ? (
        <Box
          component="p"
          sx={{
            mt: 1,
            mb: 0,
            borderRadius: 1.5,
            border: 1,
            borderColor: alpha('#dc2626', 0.3),
            bgcolor: alpha('#dc2626', 0.08),
            px: 1.5,
            py: 0.75,
            fontSize: 14,
            color: '#b91c1c',
          }}
        >
          {error}
        </Box>
      ) : null}

      <Box sx={{ mt: 1.5 }}>
        <SuggestionChips
          city={city ?? undefined}
          activeTripId={activeTripId ?? undefined}
          messages={messages}
          onPick={(prompt) => {
            void send(prompt);
          }}
          disabled={sending}
        />
      </Box>

      {!chatEnabled ? (
        <Box
          component="p"
          sx={{
            mt: 1,
            mb: 0,
            borderRadius: 1.5,
            border: 1,
            borderColor: alpha('#FF9500', 0.3),
            bgcolor: alpha('#FF9500', 0.1),
            px: 1.5,
            py: 0.75,
            fontSize: 14,
            color: '#92400e',
          }}
        >
          Chat is paused for maintenance. Try again shortly.
        </Box>
      ) : null}

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ mt: 1, display: 'flex', gap: 1, pb: 2 }}
      >
        <InputBase
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={chatEnabled ? 'Type a message...' : 'Chat paused'}
          disabled={!chatEnabled || sending}
          sx={(t) => ({
            flex: 1,
            borderRadius: 999,
            border: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            px: 2,
            py: 1.25,
            fontSize: 14,
            color: 'text.primary',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            '& input::placeholder': { color: t.palette.text.disabled, opacity: 1 },
            '&.Mui-focused': {
              borderColor: t.palette.primary.main,
              boxShadow: `0 0 0 3px ${alpha(t.palette.primary.main, 0.18)}`,
            },
            '&.Mui-disabled': { opacity: 0.6 },
          })}
        />
        <Box
          component="button"
          type="submit"
          disabled={!chatEnabled || !input.trim() || sending}
          sx={{
            cursor: 'pointer',
            border: 0,
            borderRadius: 999,
            bgcolor: 'primary.main',
            px: 2.5,
            py: 1.25,
            fontSize: 14,
            fontWeight: 600,
            color: 'primary.contrastText',
            '&:hover:not(:disabled)': { bgcolor: 'primary.dark' },
            '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
          }}
        >
          {sending ? 'Sending…' : 'Send'}
        </Box>
      </Box>
    </Box>
  );
}
