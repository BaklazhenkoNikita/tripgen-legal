'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCity } from '@/contexts';
import { useRecentDestinations } from '@/hooks/useRecentDestinations';
import { destinationSlug } from '@/lib/destinationSlug';
import { CityPickerPopover } from './CityPickerPopover';
import type { DestinationInfo } from '@/types';

interface Props {
  city: string;
  info?: DestinationInfo | null;
  isLoading?: boolean;
  fallbackImage?: string | null;
}

const SWIPE_THRESHOLD = 40;
// Hero overlay gradient — strengthened in dark mode so cream-cream city
// labels stay legible over a dark page background bleeding through any
// translucent areas of the photo.
const HERO_GRADIENT_LIGHT =
  'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.55) 72%, rgba(0,0,0,0.8) 100%)';
const HERO_GRADIENT_DARK =
  'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.7) 72%, rgba(0,0,0,0.9) 100%)';

/** Shared overlay-style hero used on both the destination explore page and the
 *  trip detail page. Image fills a fixed-height container; country/city/
 *  short description/facts strip are rendered as a single overlay. The full
 *  long-form content lives in CityOverview rendered below the hero. */
export function DestinationHero({
  city,
  info,
  fallbackImage,
}: Props) {
  const country = info?.country;
  const altText = `${city}${country ? `, ${country}` : ''}`;

  const photos = useMemo(() => {
    const fromInfo = (info?.images ?? [])
      .map((img) => img?.url ?? '')
      .filter((url) => url.length > 0);
    if (fromInfo.length > 0) return fromInfo;
    if (fallbackImage) return [fallbackImage];
    return [];
  }, [info?.images, fallbackImage]);

  const [index, setIndex] = useState(0);
  const startX = useRef<number | null>(null);
  const total = photos.length;
  const hasMany = total > 1;

  const router = useRouter();
  const { city: activeCity, setCity } = useCity();
  const { add: recordRecent } = useRecentDestinations();
  const [pickerOpen, setPickerOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const onPickCity = useCallback(
    (next: string) => {
      if (!next) return;
      setCity(next);
      recordRecent(next);
      setPickerOpen(false);
      if (next.toLowerCase() !== city.toLowerCase()) {
        router.push(`/explore/${destinationSlug(next)}`);
      }
    },
    [city, router, setCity, recordRecent],
  );

  const goTo = useCallback(
    (i: number) => {
      if (total === 0) return;
      setIndex(((i % total) + total) % total);
    },
    [total],
  );
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current == null) return;
    const delta = (e.changedTouches[0]?.clientX ?? startX.current) - startX.current;
    startX.current = null;
    if (!hasMany) return;
    if (delta > SWIPE_THRESHOLD) prev();
    else if (delta < -SWIPE_THRESHOLD) next();
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!hasMany) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
  };
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  const facts = useMemo(() => buildFacts(info), [info]);

  return (
    <Box
      component="section"
      role="region"
      aria-label={`About ${altText}`}
      tabIndex={hasMany ? 0 : -1}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        height: { xs: 280, md: 400 },
        bgcolor: 'action.hover',
        outline: 'none',
        // Neutral fallback when there is no image at all.
        ...(total === 0
          ? {
              background:
                'linear-gradient(135deg, rgba(196,96,58,0.12), rgba(216,133,100,0.04))',
            }
          : null),
      }}
    >
      {photos.map((url, i) => (
        <Box
          key={url + i}
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: i === index ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}
          aria-hidden={i !== index}
        >
          <Image
            src={url}
            alt={i === 0 ? altText : ''}
            fill
            priority={i === 0}
            sizes="(max-width: 1024px) 100vw, 1400px"
            style={{ objectFit: 'cover' }}
          />
        </Box>
      ))}

      {/* Overlay gradient for text legibility. */}
      <Box
        aria-hidden
        sx={(t) => ({
          pointerEvents: 'none',
          position: 'absolute',
          inset: 0,
          background: t.palette.mode === 'dark' ? HERO_GRADIENT_DARK : HERO_GRADIENT_LIGHT,
        })}
      />

      {hasMany ? (
        <>
          <Box
            component="button"
            type="button"
            onClick={(e) => { stop(e); prev(); }}
            aria-label="Previous photo"
            sx={navZoneSx('left')}
          >
            <ChevronLeft size={28} aria-hidden />
          </Box>
          <Box
            component="button"
            type="button"
            onClick={(e) => { stop(e); next(); }}
            aria-label="Next photo"
            sx={navZoneSx('right')}
          >
            <ChevronRight size={28} aria-hidden />
          </Box>
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              bottom: 12,
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              zIndex: 2,
            }}
          >
            {photos.map((_, i) => (
              <Box
                key={i}
                component="button"
                type="button"
                onClick={(e) => { stop(e); goTo(i); }}
                aria-label={`Go to photo ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
                sx={{
                  height: 6,
                  width: i === index ? 20 : 6,
                  borderRadius: 999,
                  border: 0,
                  bgcolor: (t) =>
                    i === index ? t.palette.common.white : alpha(t.palette.common.white, 0.55),
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  p: 0,
                  '&:hover': { bgcolor: (t) => alpha(t.palette.common.white, 0.85) },
                }}
              />
            ))}
          </Box>
        </>
      ) : null}

      {/* Bottom-left content stack. */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          p: { xs: 2.5, sm: 3 },
          // Reserve room for the dot strip.
          pb: hasMany ? { xs: 4.5, sm: 5 } : { xs: 2.5, sm: 3 },
          maxWidth: 720,
        }}
      >
        {country ? (
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: (t) => alpha(t.palette.common.white, 0.85),
              textShadow: '0 1px 4px rgba(0,0,0,0.45)',
            }}
          >
            {country}
          </Typography>
        ) : null}
        <Box
          component="button"
          ref={triggerRef}
          type="button"
          onClick={(e) => { stop(e); setPickerOpen((v) => !v); }}
          aria-haspopup="listbox"
          aria-expanded={pickerOpen}
          aria-label={`Change city (currently ${city})`}
          sx={{
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: { xs: 0.75, sm: 1 },
            border: 0,
            background: 'transparent',
            p: 0,
            m: 0,
            cursor: 'pointer',
            color: 'common.white',
            textAlign: 'left',
            '&:focus-visible': {
              outline: (t) => `2px solid ${t.palette.primary.main}`,
              outlineOffset: 4,
              borderRadius: 4,
            },
            '& .city-name': {
              transition: 'opacity 0.15s ease',
            },
            '&:hover .city-name': {
              textDecoration: 'underline',
              textDecorationThickness: '2px',
              textUnderlineOffset: '6px',
            },
            '&:hover .city-chev': {
              opacity: 1,
              transform: 'translateY(2px)',
            },
          }}
        >
          <Typography
            component="h1"
            className="city-name"
            sx={{
              fontSize: { xs: 28, sm: 44 },
              fontWeight: 600,
              color: 'common.white',
              lineHeight: 1.0,
              letterSpacing: '-0.02em',
              textShadow: '0 2px 12px rgba(0,0,0,0.5)',
              m: 0,
            }}
          >
            {city}
          </Typography>
          <Box
            component="span"
            className="city-chev"
            aria-hidden
            sx={{
              display: 'inline-flex',
              opacity: 0.85,
              transition: 'opacity 0.15s ease, transform 0.15s ease',
              filter: 'drop-shadow(0 1px 6px rgba(0,0,0,0.55))',
            }}
          >
            <ChevronDown size={22} />
          </Box>
        </Box>

        <CityPickerPopover
          open={pickerOpen}
          anchorEl={triggerRef.current}
          onClose={() => setPickerOpen(false)}
          onPick={onPickCity}
          selectedCity={activeCity ?? city}
        />

        {facts.length > 0 ? (
          <Box
            sx={{
              mt: 1,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 0,
              fontSize: 14,
              fontWeight: 500,
              color: 'common.white',
              textShadow: '0 2px 12px rgba(0,0,0,0.85)',
            }}
          >
            {facts.map((f, i) => (
              <Box
                key={f}
                component="span"
                sx={{ display: 'inline-flex', alignItems: 'center' }}
              >
                {i > 0 ? (
                  <Box
                    aria-hidden
                    component="span"
                    sx={{ mx: 1, color: (t) => alpha(t.palette.common.white, 0.65) }}
                  >
                    ·
                  </Box>
                ) : null}
                {f}
              </Box>
            ))}
          </Box>
        ) : null}

      </Box>
    </Box>
  );
}

function buildFacts(info?: DestinationInfo | null): string[] {
  if (!info) return [];
  const out: string[] = [];
  if (info.currency) out.push(info.currency);
  if (info.language) out.push(info.language);
  if (info.timezone) out.push(info.timezone);
  if (info.climate) out.push(clampClimate(info.climate));
  return out;
}

// Climate names are single words ("Mediterranean", "Tropical"). If the server
// sends a sentence ("Mediterranean with mild winters…") we'd otherwise show a
// partial fragment like "Mediterranean with" — so just take the first word.
function clampClimate(climate: string): string {
  const first = climate.trim().split(/\s+/)[0] ?? '';
  return first.replace(/[,.;:]+$/, '');
}

function navZoneSx(side: 'left' | 'right') {
  const gradient =
    side === 'left'
      ? 'linear-gradient(90deg, rgba(0,0,0,0.45), rgba(0,0,0,0))'
      : 'linear-gradient(270deg, rgba(0,0,0,0.45), rgba(0,0,0,0))';
  return {
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    [side]: 0,
    width: '30%',
    border: 0,
    p: 0,
    m: 0,
    background: 'transparent',
    cursor: 'pointer',
    color: 'common.white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: side === 'left' ? 'flex-start' : 'flex-end',
    pl: side === 'left' ? 1.5 : 0,
    pr: side === 'right' ? 1.5 : 0,
    zIndex: 1,
    outline: 'none',
    '& > svg': {
      opacity: 0,
      transition: 'opacity 0.2s ease',
      filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.55))',
    },
    '&:hover, &:focus-visible': {
      background: gradient,
    },
    '&:hover > svg, &:focus-visible > svg': { opacity: 1 },
  };
}
