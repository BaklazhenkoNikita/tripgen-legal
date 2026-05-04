'use client';

import { useEffect, useMemo, useRef } from 'react';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import { useChatSuggestions } from '@/hooks/useChatSuggestions';
import type { SmartChatMessage } from '@/types';

interface Props {
  city?: string;
  activeTripId?: string;
  messages: SmartChatMessage[];
  onPick: (prompt: string) => void;
  disabled?: boolean;
}

/**
 * Context-aware prompt chips above the chat composer. Fetches from
 * `POST /api/chat/suggestions` on mount and whenever the city / active
 * trip / last message shifts. Rate-limited by `chat_suggestions` on the
 * backend; we de-dupe by a coarse context signature to avoid flooding.
 */
export function SuggestionChips({ city, activeTripId, messages, onPick, disabled }: Props) {
  const suggest = useChatSuggestions();
  const lastKey = useRef<string | null>(null);

  const lastTwo = useMemo(() => {
    return messages
      .slice(-2)
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
  }, [messages]);

  const key = useMemo(
    () => [city ?? '', activeTripId ?? '', lastTwo.map((m) => m.content).join('|')].join('⟂'),
    [city, activeTripId, lastTwo],
  );

  useEffect(() => {
    if (disabled) return;
    if (lastKey.current === key) return;
    lastKey.current = key;
    suggest.mutate({ city, active_trip_id: activeTripId, last_messages: lastTwo });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, disabled]);

  const suggestions = suggest.data?.suggestions ?? [];
  if (suggest.isError || suggestions.length === 0) return null;

  return (
    <Box
      sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5 }}
      aria-label="Suggested prompts"
    >
      {suggestions.map((s) => (
        <Box
          key={s.id}
          component="button"
          type="button"
          disabled={disabled}
          onClick={() => onPick(s.prompt)}
          sx={(t) => ({
            flexShrink: 0,
            cursor: 'pointer',
            borderRadius: 999,
            border: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            px: 1.5,
            py: 0.5,
            fontSize: 12,
            color: 'text.primary',
            '&:hover': {
              borderColor: alpha(t.palette.primary.main, 0.4),
              color: t.palette.primary.main,
            },
            '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
          })}
        >
          {s.label}
        </Box>
      ))}
    </Box>
  );
}
