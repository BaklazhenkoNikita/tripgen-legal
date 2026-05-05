'use client';

import { useEffect, useMemo, useRef } from 'react';
import Box from '@mui/material/Box';
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
      sx={{
        display: 'flex',
        flexWrap: 'nowrap',
        gap: 1,
        justifyContent: 'center',
        maxWidth: 940,
        mx: 'auto',
        px: 1,
        overflow: 'visible',
      }}
      aria-label="Suggested prompts"
    >
      {suggestions.map((s) => (
        <Box
          key={s.id}
          component="button"
          type="button"
          disabled={disabled}
          onClick={() => onPick(s.prompt)}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            height: 32,
            cursor: 'pointer',
            borderRadius: 999,
            border: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            px: 1.75,
            fontSize: 14,
            lineHeight: 1,
            color: 'text.primary',
            whiteSpace: 'nowrap',
            transition: 'background-color 0.15s, border-color 0.15s',
            '&:hover:not(:disabled)': { bgcolor: 'action.hover' },
            '&:disabled': { opacity: 0.4, cursor: 'not-allowed' },
          }}
        >
          {s.label}
        </Box>
      ))}
    </Box>
  );
}
