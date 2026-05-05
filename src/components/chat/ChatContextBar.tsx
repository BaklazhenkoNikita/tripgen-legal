'use client';

import { useRef, useState } from 'react';
import { ChevronDown, MapPin, Menu } from 'lucide-react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { useCity } from '@/contexts';
import { useRecentDestinations } from '@/hooks/useRecentDestinations';
import { CityPickerPopover } from '@/components/destinations/CityPickerPopover';
import { NavSearch } from '@/components/layout/NavSearch';
import { useChatLayout } from './ChatLayoutContext';

/**
 * Slim chat-only contextual toolbar: shows the active city + search input.
 * Replaces the global CitySwitcherBar's role on the chat surface — kept
 * out of the global header so the chat page reads as a single focused
 * conversational surface.
 */
export function ChatContextBar() {
  const { city, setCity } = useCity();
  const { add: recordRecent } = useRecentDestinations();
  const { isMobile, openHistory } = useChatLayout();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = () => setOpen(false);

  const pick = (next: string) => {
    if (!next) return;
    setCity(next);
    recordRecent(next);
    close();
  };

  return (
    <Box
      sx={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        height: 44,
        px: { xs: 1.5, sm: 2 },
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: (t) => alpha(t.palette.background.default, 0.85),
        backdropFilter: 'blur(12px)',
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
      ) : null}

      <Typography
        sx={{
          display: { xs: 'none', sm: 'inline' },
          fontSize: 11,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'text.disabled',
        }}
      >
        Exploring
      </Typography>

      <Box
        component="button"
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          borderRadius: 999,
          border: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          px: 1.5,
          py: 0.5,
          fontSize: 13,
          fontWeight: 500,
          color: 'text.primary',
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            bgcolor: 'action.hover',
            borderColor: 'text.disabled',
          },
        }}
      >
        <MapPin
          size={14}
          aria-hidden
          style={{ color: 'var(--tg-palette-primary-main)' }}
        />
        <span>{city ?? 'Pick a city'}</span>
        <ChevronDown
          size={12}
          aria-hidden
          style={{ color: 'var(--tg-palette-text-disabled)' }}
        />
      </Box>

      <Box sx={{ ml: 'auto', display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
        <NavSearch />
      </Box>

      <CityPickerPopover
        open={open}
        anchorEl={triggerRef.current}
        onClose={close}
        onPick={pick}
        selectedCity={city}
      />
    </Box>
  );
}
