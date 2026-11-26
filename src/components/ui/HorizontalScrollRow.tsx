'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { minTap } from '@/theme/standards';

/** Gap between fitted rail cards (MUI spacing units → 16px). */
export const FITTED_GAP = 2;

/**
 * Card column widths for `fitted` rails: exactly 4 cards from lg, 3 at md,
 * 2 at sm, and a ~78% card on phones so the next one peeks in.
 */
export const FITTED_COLUMNS = {
  xs: '78%',
  sm: 'calc((100% - 16px) / 2)',
  md: 'calc((100% - 2 * 16px) / 3)',
  lg: 'calc((100% - 3 * 16px) / 4)',
};

interface Props {
  ariaLabel: string;
  children: ReactNode;
  /**
   * Size cards to the container (4/3/2/peek columns) instead of letting each
   * child set its own width. Children should be width-agnostic (100%).
   */
  fitted?: boolean;
  /** Callback ref from `useScrollRail`, so arrows outside the rail can drive it. */
  railRef?: (el: HTMLDivElement | null) => void;
  /** Gap between children, in MUI spacing units (legacy, non-fitted rails). */
  gap?: number;
  /** Right padding (peek amount) for legacy, non-fitted rails. */
  peekPadding?: { xs: number; sm: number; lg: number };
}

export function HorizontalScrollRow({
  ariaLabel,
  children,
  fitted = false,
  railRef,
  gap = 1.5,
  peekPadding = { xs: 5, sm: 6, lg: 7 },
}: Props) {
  return (
    <Box
      ref={railRef}
      role="region"
      aria-label={ariaLabel}
      tabIndex={0}
      sx={{
        // Vertical breathing room so hover lift/shadow isn't clipped.
        pt: 1,
        pb: 1,
        overflowX: 'auto',
        overflowY: 'hidden',
        scrollSnapType: 'x mandatory',
        scrollPaddingInlineStart: 0,
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
        '&::-webkit-scrollbar': { display: 'none' },
        outline: 'none',
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: 2,
        },
        '& > *': { scrollSnapAlign: 'start', minWidth: 0 },
        ...(fitted
          ? {
              display: 'grid',
              gridAutoFlow: 'column',
              gridAutoColumns: FITTED_COLUMNS,
              gap: FITTED_GAP,
            }
          : {
              display: 'flex',
              gap,
              pl: 0,
              pr: peekPadding,
            }),
      }}
    >
      {children}
    </Box>
  );
}

/**
 * Scroll state for a rail: whether it can page back/forward, and a pager.
 * Returns a callback `ref` (rails mount after their skeleton, so a plain
 * ref object would miss the element).
 */
export function useScrollRail() {
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const [state, setState] = useState({ canPrev: false, canNext: false });

  const update = useCallback(() => {
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const canPrev = el.scrollLeft > 2;
    const canNext = el.scrollLeft < max - 2;
    setState((s) => (s.canPrev === canPrev && s.canNext === canNext ? s : { canPrev, canNext }));
  }, [el]);

  useEffect(() => {
    if (!el) {
      setState((s) => (s.canPrev || s.canNext ? { canPrev: false, canNext: false } : s));
      return;
    }
    update();
    el.addEventListener('scroll', update, { passive: true });
    const resize = new ResizeObserver(update);
    resize.observe(el);
    // Items appended by "Load more" change scrollWidth without resizing el.
    const mutations = new MutationObserver(update);
    mutations.observe(el, { childList: true });
    return () => {
      el.removeEventListener('scroll', update);
      resize.disconnect();
      mutations.disconnect();
    };
  }, [el, update]);

  const scrollPage = useCallback(
    (direction: 1 | -1) => {
      if (!el) return;
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      el.scrollBy({ left: direction * el.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
    },
    [el],
  );

  return { ref: setEl, ...state, scrollPage };
}

interface RailArrowsProps {
  label: string;
  canPrev: boolean;
  canNext: boolean;
  onPage: (direction: 1 | -1) => void;
}

/**
 * ‹ › pager for a rail. Hidden on touch-only devices (they swipe) and when
 * everything already fits.
 */
export function RailArrows({ label, canPrev, canNext, onPage }: RailArrowsProps) {
  if (!canPrev && !canNext) return null;
  const buttonSx = {
    width: minTap,
    height: minTap,
    color: 'text.primary',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.paper',
    '&:hover': { bgcolor: 'action.hover', borderColor: 'text.disabled' },
    '&.Mui-disabled': { color: 'text.disabled', bgcolor: 'transparent' },
  } as const;
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        '@media (hover: none)': { display: 'none' },
      }}
    >
      <IconButton aria-label={`Scroll ${label} back`} disabled={!canPrev} onClick={() => onPage(-1)} sx={buttonSx}>
        <ChevronLeft size={18} aria-hidden />
      </IconButton>
      <IconButton aria-label={`Scroll ${label} forward`} disabled={!canNext} onClick={() => onPage(1)} sx={buttonSx}>
        <ChevronRight size={18} aria-hidden />
      </IconButton>
    </Box>
  );
}
