'use client';

import { useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, MapPin, Check, Search } from 'lucide-react';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Popover from '@mui/material/Popover';
import { alpha } from '@mui/material/styles';
import { useCity } from '@/contexts';
import { tgShadow } from '@/theme/shadows';
import { useCitySuggestions } from '@/hooks/useCitySuggestions';
import { useRecentDestinations } from '@/hooks/useRecentDestinations';
import { destinationSlug } from '@/lib/destinationSlug';
import { formatPlaceName } from '@/lib/cities/normalizeCity';
import type { DestinationListItem } from '@/types';
import { NavSearch } from './NavSearch';

const POPULAR_FALLBACK = [
  'Barcelona', 'Paris', 'Rome', 'Tokyo', 'New York',
  'London', 'Lisbon', 'Berlin', 'Amsterdam', 'Bangkok',
];

const HIDDEN_PREFIXES = ['/profile', '/history', '/shared', '/community', '/join'];

export function CitySwitcherBar() {
  const pathname = usePathname() ?? '/';
  const hidden = HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (hidden) return null;
  return <CitySwitcherBarInner pathname={pathname} />;
}

function CitySwitcherBarInner({ pathname }: { pathname: string }) {
  const { city, setCity } = useCity();
  const { add: recordRecent } = useRecentDestinations();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);

  const trimmed = input.trim();
  const { suggestions, showFallback, isLoading } = useCitySuggestions(trimmed);

  const close = () => {
    setOpen(false);
    setInput('');
  };

  const pick = (next: string) => {
    if (!next) return;
    setCity(next);
    recordRecent(next);
    close();
    if (pathname === '/explore' || pathname.startsWith('/explore/')) {
      const slug = destinationSlug(next);
      if (slug) router.push(`/explore/${slug}`);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trimmed) pick(trimmed);
  };

  // When the query is empty, the hook still returns recent picks + active trip;
  // fall back to a hardcoded popular list only if nothing is in either.
  const isQueryActive = trimmed.length >= 2;
  const showPopularFallback = !isQueryActive && suggestions.length === 0;

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 64,
        zIndex: (t) => t.zIndex.appBar - 1,
        borderBottom: (t) => `1px solid ${t.palette.divider}`,
        bgcolor: (t) => alpha(t.palette.background.default, 0.85),
        backdropFilter: 'blur(12px)',
      }}
    >
      <Box
        sx={{
          mx: 'auto',
          maxWidth: 1280,
          height: 44,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: { xs: 2, sm: 3 },
        }}
      >
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
            border: (t) => `1px solid ${t.palette.divider}`,
            bgcolor: 'background.paper',
            px: 1.5,
            py: 0.75,
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
          <MapPin size={14} color="currentColor" style={{ color: 'var(--tg-palette-primary-main)' }} aria-hidden />
          <span>{city ?? 'Pick a city'}</span>
          <ChevronDown size={12} aria-hidden style={{ color: 'var(--tg-palette-text-disabled)' }} />
        </Box>

        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
          <NavSearch />
        </Box>
      </Box>

      <Popover
        open={open}
        onClose={close}
        anchorEl={triggerRef.current}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
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

          {!isQueryActive && suggestions.length > 0 ? (
            <Typography
              sx={{
                mb: 0.5,
                px: 1,
                fontSize: 10,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'text.disabled',
              }}
            >
              Recent
            </Typography>
          ) : null}

          {showPopularFallback ? (
            <>
              <Typography
                sx={{
                  mb: 0.5,
                  px: 1,
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'text.disabled',
                }}
              >
                Popular
              </Typography>
              <Box component="ul" role="listbox" sx={{ listStyle: 'none', m: 0, p: 0, maxHeight: 280, overflowY: 'auto' }}>
                {POPULAR_FALLBACK.map((s) => (
                  <SuggestionRow
                    key={s}
                    label={s}
                    selected={city === s}
                    onPick={() => pick(s)}
                  />
                ))}
              </Box>
            </>
          ) : (
            <Box component="ul" role="listbox" sx={{ listStyle: 'none', m: 0, p: 0, maxHeight: 320, overflowY: 'auto' }}>
              {suggestions.map((r) => {
                const display = pickDisplayName(r);
                if (!display) return null;
                return (
                  <SuggestionRow
                    key={`${display}-${r.country ?? ''}`}
                    label={display}
                    country={r.country || undefined}
                    isMajor={(r.populationTier ?? 0) >= 6}
                    selected={city === display}
                    onPick={() => pick(display)}
                  />
                );
              })}

              {isQueryActive && isLoading ? (
                <Box component="li" sx={{ px: 1, py: 1, fontSize: 13, color: 'text.disabled' }}>
                  Searching…
                </Box>
              ) : null}

              {showFallback ? (
                <Box
                  component="li"
                  sx={{
                    px: 1,
                    py: 1,
                    fontSize: 13,
                    color: 'text.disabled',
                    cursor: 'pointer',
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
                  }}
                  onClick={() => pick(trimmed)}
                >
                  No matches. Press Enter to use “{trimmed}”.
                </Box>
              ) : null}
            </Box>
          )}
        </Paper>
      </Popover>
    </Box>
  );
}

function pickDisplayName(item: DestinationListItem): string {
  // DB rows usually carry properly-cased `name` / `city`. GeoNames rows store
  // `name` with original casing and `city` lowercased — prefer `name` so the
  // value persisted to CityContext is presentable.
  const candidate = item.name || item.city || '';
  if (!candidate) return '';
  if (item.source === 'cities' && candidate === item.city) {
    return formatPlaceName(candidate);
  }
  return candidate;
}

interface SuggestionRowProps {
  label: string;
  country?: string;
  isMajor?: boolean;
  selected?: boolean;
  onPick: () => void;
}

function SuggestionRow({ label, country, isMajor, selected, onPick }: SuggestionRowProps) {
  return (
    <Box component="li">
      <Box
        component="button"
        type="button"
        onClick={onPick}
        sx={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          borderRadius: 1,
          px: 1,
          py: 0.75,
          textAlign: 'left',
          fontSize: 14,
          cursor: 'pointer',
          border: 0,
          background: 'transparent',
          ...(selected ? { fontWeight: 500, color: 'primary.main' } : { color: 'text.primary' }),
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            minWidth: 0,
          }}
        >
          <Box
            component="span"
            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {label}
          </Box>
          {isMajor ? (
            <Box
              component="span"
              sx={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                flexShrink: 0,
              }}
            />
          ) : null}
        </Box>
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            color: 'text.secondary',
            fontSize: 12,
            flexShrink: 0,
          }}
        >
          {country ? <span>{country}</span> : null}
          {selected ? (
            <Check size={16} aria-hidden style={{ color: 'var(--tg-palette-primary-main)' }} />
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}
