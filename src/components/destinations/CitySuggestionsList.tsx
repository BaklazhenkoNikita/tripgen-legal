'use client';

import { Check } from 'lucide-react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useCitySuggestions } from '@/hooks/useCitySuggestions';
import { formatPlaceName } from '@/lib/cities/normalizeCity';
import type { DestinationListItem } from '@/types';

const POPULAR_FALLBACK = [
  'Barcelona', 'Paris', 'Rome', 'Tokyo', 'New York',
  'London', 'Lisbon', 'Berlin', 'Amsterdam', 'Bangkok',
];

interface Props {
  /** Current input value. Empty/short queries show Recent or Popular. */
  query: string;
  /** Selected city — gets a check icon in the list. */
  selectedCity: string | null;
  /** Called when the user clicks a suggestion or the "Press Enter" fallback. */
  onPick: (city: string) => void;
  /** Heading shown above the list when there's no active query. Default "Recent". */
  recentLabel?: string;
}

/** Pure suggestion list — Recent / Popular / live matches / "press enter"
 *  fallback. Used by CityPickerPopover (which adds its own search input)
 *  and by surfaces that already own an input (e.g. the explore hero). */
export function CitySuggestionsList({
  query,
  selectedCity,
  onPick,
  recentLabel = 'Recent',
}: Props) {
  const trimmed = query.trim();
  const { suggestions, showFallback, isLoading } = useCitySuggestions(trimmed);

  const isQueryActive = trimmed.length >= 2;
  const showPopularFallback = !isQueryActive && suggestions.length === 0;

  return (
    <>
      {!isQueryActive && suggestions.length > 0 ? (
        <Typography sx={sectionLabelSx}>{recentLabel}</Typography>
      ) : null}

      {showPopularFallback ? (
        <>
          <Typography sx={sectionLabelSx}>Popular</Typography>
          <Box
            component="ul"
            role="listbox"
            sx={{ listStyle: 'none', m: 0, p: 0, maxHeight: 280, overflowY: 'auto' }}
          >
            {POPULAR_FALLBACK.map((s) => (
              <SuggestionRow
                key={s}
                label={s}
                selected={selectedCity === s}
                onPick={() => onPick(s)}
              />
            ))}
          </Box>
        </>
      ) : (
        <Box
          component="ul"
          role="listbox"
          sx={{ listStyle: 'none', m: 0, p: 0, maxHeight: 320, overflowY: 'auto' }}
        >
          {suggestions.map((r) => {
            const display = pickDisplayName(r);
            if (!display) return null;
            return (
              <SuggestionRow
                key={`${display}-${r.country ?? ''}`}
                label={display}
                country={r.country || undefined}
                isMajor={(r.populationTier ?? 0) >= 6}
                selected={selectedCity === display}
                onPick={() => onPick(display)}
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
              onClick={() => onPick(trimmed)}
            >
              No matches. Press Enter to use “{trimmed}”.
            </Box>
          ) : null}
        </Box>
      )}
    </>
  );
}

const sectionLabelSx = {
  mb: 0.5,
  px: 1,
  fontSize: 10,
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  color: 'text.disabled',
};

function pickDisplayName(item: DestinationListItem): string {
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
        // Use onMouseDown so picking a suggestion fires before the input's
        // onBlur handler closes the popover.
        onMouseDown={(e) => { e.preventDefault(); onPick(); }}
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
          ...(selected
            ? { fontWeight: 500, color: 'primary.main' }
            : { color: 'text.primary' }),
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
            <Check
              size={16}
              aria-hidden
              style={{ color: 'var(--tg-palette-primary-main)' }}
            />
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}
