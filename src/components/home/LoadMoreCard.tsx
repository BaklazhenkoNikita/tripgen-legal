'use client';

import { type KeyboardEvent } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

interface Props {
  onClick: () => void;
  isPending: boolean;
  /** 'db' renders the default + Load more affordance.
   *  'ai' switches to a Sparkles icon and "Generate more with AI" copy —
   *  used after the database is exhausted on AI-augmentable rows. */
  mode: 'db' | 'ai';
  disabled?: boolean;
}

export function LoadMoreCard({ onClick, isPending, mode, disabled }: Props) {
  const handleClick = () => {
    if (isPending || disabled) return;
    onClick();
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isPending || disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const isAi = mode === 'ai';
  const Icon = isAi ? Sparkles : Plus;
  const label = isPending ? 'Loading' : isAi ? 'Generate more with AI' : 'Load more';

  return (
    <Box
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || isPending}
      aria-label={isAi ? 'Generate more with AI' : 'Load more'}
      onClick={handleClick}
      onKeyDown={onKey}
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.25,
        width: 288,
        // Match the adjacent FeedCard's 3:2 photo aspect (288 × 192) so the
        // dashed outline draws a card-shaped rectangle, not a short pill.
        aspectRatio: '3 / 2',
        flexShrink: 0,
        borderRadius: 2,
        border: '2px dashed',
        borderColor: isAi ? 'primary.main' : 'divider',
        bgcolor: 'transparent',
        cursor: disabled || isPending ? 'default' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'border-color 200ms, box-shadow 200ms, transform 200ms',
        '&:hover': disabled || isPending
          ? undefined
          : {
              borderStyle: 'solid',
              borderColor: 'primary.main',
              boxShadow: (t) =>
                `0 6px 20px ${alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.32 : 0.16)}`,
              transform: 'translateY(-1px)',
            },
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: 2,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '1.5px solid',
          borderColor: isAi ? 'primary.main' : 'divider',
          color: isAi ? 'primary.main' : 'text.secondary',
          bgcolor: 'background.paper',
        }}
      >
        {isPending ? (
          <CircularProgress size={20} thickness={5} />
        ) : (
          <Icon size={28} aria-hidden />
        )}
      </Box>
      <Typography
        sx={{
          px: 2,
          textAlign: 'center',
          fontSize: 13,
          fontWeight: 500,
          color: isAi ? 'primary.main' : 'text.secondary',
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}
