'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { alpha } from '@mui/material/styles';
import { ArrowUp, Menu, Sparkles } from 'lucide-react';
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

const MAX_INPUT_LINES = 6;

export function ChatConversation({ chatId, embed = false }: Props) {
  const { city } = useCity();
  const { activeTripId } = useActiveTrip();
  const { openHistory, isMobile, focusInputRequest } = useChatLayout();

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

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState('');

  // Cmd/Ctrl+K from the chat layout asks us to focus the input.
  useEffect(() => {
    if (focusInputRequest > 0) inputRef.current?.focus();
  }, [focusInputRequest]);

  const submit = () => {
    if (!input.trim()) return;
    void send(input);
    setInput('');
    // Reset textarea height after send.
    if (inputRef.current) inputRef.current.style.height = 'auto';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  // Auto-grow textarea up to MAX_INPUT_LINES, then internal scroll.
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 20;
    const max = lineHeight * MAX_INPUT_LINES + 16; // +padding
    el.style.height = Math.min(el.scrollHeight, max) + 'px';
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
  const hasMessages = messages.length > 0;
  const inputDisabled = !chatEnabled || sending;
  const sendDisabled = inputDisabled || !input.trim();

  const InputBar = (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        width: '100%',
        maxWidth: 940,
        mx: 'auto',
      }}
    >
      <Box
        sx={(t) => ({
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1.25,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 5,
          px: 2.5,
          py: 2,
          transition: 'border-color 0.15s, box-shadow 0.15s',
          '&:focus-within': {
            borderColor: t.palette.primary.main,
            boxShadow: `0 0 0 3px ${alpha(t.palette.primary.main, 0.18)}`,
          },
        })}
      >
        <Box
          component="textarea"
          ref={inputRef}
          rows={1}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={inputDisabled}
          placeholder={chatEnabled ? 'Ask anything about your trip…' : 'Chat paused'}
          sx={(t) => ({
            flex: 1,
            border: 0,
            outline: 'none',
            resize: 'none',
            bgcolor: 'transparent',
            color: 'text.primary',
            fontFamily: 'inherit',
            fontSize: 17,
            lineHeight: 1.5,
            py: 1.25,
            px: 0.5,
            minHeight: '3.25em',
            maxHeight: `${MAX_INPUT_LINES * 1.5 + 1}em`,
            overflowY: 'auto',
            '&::placeholder': { color: t.palette.text.disabled, opacity: 1 },
            '&:disabled': { opacity: 0.6, cursor: 'not-allowed' },
          })}
        />
        <IconButton
          type="submit"
          aria-label={sending ? 'Sending' : 'Send message'}
          disabled={sendDisabled}
          sx={(t) => ({
            flexShrink: 0,
            width: 52,
            height: 52,
            borderRadius: 999,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover:not(:disabled)': { bgcolor: 'primary.dark' },
            '&.Mui-disabled': {
              bgcolor: alpha(t.palette.primary.main, 0.4),
              color: t.palette.primary.contrastText,
              opacity: 0.3,
              cursor: 'not-allowed',
            },
          })}
        >
          <ArrowUp size={22} aria-hidden />
        </IconButton>
      </Box>
    </Box>
  );

  const ChipsRow = (
    <Box sx={{ width: '100%' }}>
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
  );

  const ErrorBand = error ? (
    <Box
      component="p"
      sx={(t) => ({
        m: 0,
        borderRadius: 1.5,
        border: 1,
        borderColor: alpha(t.palette.error.main, 0.3),
        bgcolor: alpha(t.palette.error.main, 0.08),
        px: 1.5,
        py: 0.75,
        fontSize: 14,
        color: t.palette.error.dark,
        maxWidth: 720,
        mx: 'auto',
        width: '100%',
      })}
    >
      {error}
    </Box>
  ) : null;

  const PausedBand = !chatEnabled ? (
    <Box
      component="p"
      sx={(t) => ({
        m: 0,
        borderRadius: 1.5,
        border: 1,
        borderColor: alpha(t.palette.warning.main, 0.3),
        bgcolor: alpha(t.palette.warning.main, 0.1),
        px: 1.5,
        py: 0.75,
        fontSize: 14,
        color: t.palette.warning.dark,
        maxWidth: 720,
        mx: 'auto',
        width: '100%',
      })}
    >
      Chat is paused for maintenance. Try again shortly.
    </Box>
  ) : null;

  const Greeting = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        textAlign: 'center',
      }}
    >
      <Box
        component="span"
        sx={(t) => ({
          display: 'inline-flex',
          width: 48,
          height: 48,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 999,
          bgcolor: alpha(t.palette.primary.main, 0.12),
          color: t.palette.primary.main,
        })}
      >
        <Sparkles size={24} aria-hidden />
      </Box>
      <Box component="p" sx={{ m: 0, fontSize: 24, fontWeight: 600, color: 'text.primary' }}>
        {activeTripId ? 'How can I help with your trip?' : 'Ask me anything about travel'}
      </Box>
      <Box component="p" sx={{ m: 0, fontSize: 16, color: 'text.secondary' }}>
        {activeTripId
          ? 'Pick a starter or just type a question.'
          : city
            ? `Quick starters for ${city}.`
            : 'Pick a city to unlock more suggestions.'}
      </Box>
    </Box>
  );

  return (
    <Box
      sx={
        embed
          ? {
              display: 'flex',
              height: '100%',
              minHeight: 0,
              flexDirection: 'column',
              px: { xs: 2, sm: 2.5 },
            }
          : {
              display: 'flex',
              height: '100%',
              minHeight: 0,
              flexDirection: 'column',
              width: '100%',
              px: { xs: 2, sm: 3 },
            }
      }
    >
      {!embed && isMobile ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
          <IconButton
            aria-label="Open chat history"
            onClick={openHistory}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <Menu size={18} aria-hidden />
          </IconButton>
        </Box>
      ) : null}

      {hasMessages || embed ? (
        <>
          <Box
            ref={scrollRef}
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              py: 2,
              '& > * + *': { mt: 1.5 },
            }}
          >
            {hasMessages ? (
              <Box sx={{ maxWidth: 720, mx: 'auto', width: '100%' }}>
                {messages.map((m) => (
                  <Box key={m.id} sx={{ '& + &': { mt: 1.5 } }}>
                    <ChatMessage
                      message={m}
                      onAction={handleAction}
                      onAnswer={handleAnswer}
                      onConfirm={handleConfirm}
                    />
                  </Box>
                ))}
                {activeTool ? (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 1.5 }}>
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
            ) : embed ? (
              <QuickActions
                city={city}
                hasActiveTrip={Boolean(activeTripId)}
                onPick={(prompt) => {
                  void send(prompt);
                }}
                disabled={!chatEnabled || sending}
              />
            ) : null}
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              flexShrink: 0,
              position: 'sticky',
              bottom: 0,
              zIndex: 1,
              bgcolor: 'background.default',
              pt: 1,
              pb: 'calc(44px + env(safe-area-inset-bottom))',
            }}
          >
            {ErrorBand}
            {PausedBand}
            {ChipsRow}
            {InputBar}
          </Box>
        </>
      ) : (
        <>
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2.5,
              overflowY: 'auto',
              py: 3,
            }}
          >
            <Box sx={{ width: '100%', maxWidth: 720, mx: 'auto' }}>{Greeting}</Box>
            <Box sx={{ width: '100%', maxWidth: 720, mx: 'auto' }}>
              <QuickActions
                city={city}
                hasActiveTrip={Boolean(activeTripId)}
                onPick={(prompt) => {
                  void send(prompt);
                }}
                disabled={!chatEnabled || sending}
              />
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              flexShrink: 0,
              position: 'sticky',
              bottom: 0,
              zIndex: 1,
              bgcolor: 'background.default',
              pt: 1,
              pb: 'calc(44px + env(safe-area-inset-bottom))',
            }}
          >
            {ErrorBand}
            {PausedBand}
            {ChipsRow}
            {InputBar}
          </Box>
        </>
      )}
    </Box>
  );
}
