'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import Popover, { type PopoverOrigin } from '@mui/material/Popover';
import { alpha } from '@mui/material/styles';
import { tgShadow } from '@/theme/shadows';
import { CitySuggestionsList } from './CitySuggestionsList';

const DEFAULT_ANCHOR_ORIGIN: PopoverOrigin = { vertical: 'bottom', horizontal: 'left' };
const DEFAULT_TRANSFORM_ORIGIN: PopoverOrigin = { vertical: 'top', horizontal: 'left' };

interface Props {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  /** Caller is responsible for any side-effects (setCity, recordRecent, navigation). */
  onPick: (city: string) => void;
  selectedCity: string | null;
  anchorOrigin?: PopoverOrigin;
  transformOrigin?: PopoverOrigin;
}

/** Shared city-picker popover used by the chat context bar and the
 *  destination hero. Owns input state and suggestion fetching; defers
 *  selection side-effects (state update, recent tracking, navigation)
 *  to the caller via `onPick`. */
export function CityPickerPopover({
  open,
  anchorEl,
  onClose,
  onPick,
  selectedCity,
  anchorOrigin = DEFAULT_ANCHOR_ORIGIN,
  transformOrigin = DEFAULT_TRANSFORM_ORIGIN,
}: Props) {
  const [input, setInput] = useState('');
  const trimmed = input.trim();

  const close = () => {
    onClose();
    setInput('');
  };

  const pick = (next: string) => {
    if (!next) return;
    onPick(next);
    setInput('');
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trimmed) pick(trimmed);
  };

  return (
    <Popover
      open={open}
      onClose={close}
      anchorEl={anchorEl}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
      slotProps={{
        paper: {
          elevation: 0,
          sx: {
            mt: 1,
            borderRadius: 2,
            border: (t) => `1px solid ${t.palette.divider}`,
            boxShadow: (t) => tgShadow(t, 'dropdown'),
            overflow: 'visible',
          },
        },
      }}
    >
      <Paper elevation={0} sx={{ width: 320, p: 1.5, bgcolor: 'background.paper' }}>
        <Box component="form" onSubmit={onSubmit} sx={{ mb: 1.5 }}>
          <Box sx={{ position: 'relative' }}>
            <Box
              sx={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: 'text.disabled',
                display: 'inline-flex',
              }}
            >
              <Search size={16} aria-hidden />
            </Box>
            <InputBase
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a city…"
              autoFocus
              fullWidth
              sx={{
                pl: 4,
                pr: 1.5,
                py: 1,
                fontSize: 14,
                borderRadius: 1.5,
                border: (t) => `1px solid ${t.palette.divider}`,
                bgcolor: 'background.paper',
                color: 'text.primary',
                '&:focus-within': {
                  borderColor: 'primary.main',
                  boxShadow: (t) => `0 0 0 3px ${alpha(t.palette.primary.main, 0.20)}`,
                },
              }}
            />
          </Box>
        </Box>

        <CitySuggestionsList
          query={input}
          selectedCity={selectedCity}
          onPick={pick}
        />
      </Paper>
    </Popover>
  );
}
