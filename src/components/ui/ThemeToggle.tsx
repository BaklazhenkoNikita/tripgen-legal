'use client';

import { useState } from 'react';
import { Moon, Sun, Laptop } from 'lucide-react';
import { useColorScheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import { alpha } from '@mui/material/styles';
import { tgShadow } from '@/theme/shadows';

type Mode = 'light' | 'dark' | 'system';
const order: Mode[] = ['light', 'dark', 'system'];

export function ThemeToggle({ sx }: { sx?: object }) {
  const { mode, setMode } = useColorScheme();
  if (!mode) return null; // SSR safety until CssVarsProvider hydrates

  return (
    <Box
      role="radiogroup"
      aria-label="Theme"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.25,
        borderRadius: 999,
        border: (t) => `1px solid ${t.palette.divider}`,
        bgcolor: 'background.paper',
        p: 0.25,
        ...sx,
      }}
    >
      {order.map((m) => {
        const Icon = m === 'light' ? Sun : m === 'dark' ? Moon : Laptop;
        const active = mode === m;
        return (
          <IconButton
            key={m}
            aria-label={m}
            aria-checked={active}
            role="radio"
            size="small"
            onClick={() => setMode(m)}
            sx={{
              width: 28,
              height: 28,
              color: active ? 'primary.main' : 'text.secondary',
              bgcolor: active ? (t) => alpha(t.palette.primary.main, 0.12) : 'transparent',
              '&:hover': { color: 'text.primary' },
            }}
          >
            <Icon size={14} aria-hidden />
          </IconButton>
        );
      })}
    </Box>
  );
}

export function ThemeTogglePopover() {
  const { mode } = useColorScheme();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  if (!mode) return null;
  const Icon = mode === 'dark' ? Moon : mode === 'light' ? Sun : Laptop;
  return (
    <>
      <IconButton
        aria-label="Theme"
        aria-haspopup="dialog"
        aria-expanded={Boolean(anchor)}
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          width: 36,
          height: 36,
          color: 'text.secondary',
          '&:hover': { color: 'text.primary' },
        }}
      >
        <Icon size={16} aria-hidden />
      </IconButton>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              p: 0.5,
              borderRadius: 1.5,
              border: (t) => `1px solid ${t.palette.divider}`,
              boxShadow: (t) => tgShadow(t, 'dropdown'),
            },
          },
        }}
      >
        <ThemeToggle sx={{ border: 0, p: 0 }} />
      </Popover>
    </>
  );
}
