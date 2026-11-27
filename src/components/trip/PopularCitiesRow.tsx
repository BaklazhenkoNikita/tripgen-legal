'use client';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { alpha, type Theme } from '@mui/material/styles';
import { destinations } from '@/data/destinations';
import { formatDateRange, isoDateOffset } from '@/lib/date';
import { Photo } from '@/components/ui/Photo';
import { tgShadow } from '@/theme/shadows';
import { photoTextShadow, radii, textScale } from '@/theme/standards';

const FEATURED_SLUGS = [
  'paris-5-days',
  'new-york-5-days',
  'tokyo-7-days',
  'rome-4-days',
  'london-4-days',
  'barcelona-4-days',
];

const TAGLINES: Record<string, string> = {
  'paris-5-days': 'Romance, art, and iconic landmarks',
  'new-york-5-days': 'The city that never sleeps',
  'tokyo-7-days': 'Modern meets traditional',
  'rome-4-days': 'Ancient history and timeless beauty',
  'london-4-days': 'History, culture, and royalty',
  'barcelona-4-days': 'Sunshine, Gaudí, and tapas',
};

const FEATURED_DESTINATIONS = FEATURED_SLUGS
  .map((slug) => destinations.find((d) => d.slug === slug))
  .filter((d): d is NonNullable<typeof d> => Boolean(d));

function endDateFor(startIso: string, days: number): string {
  const [y, m, d] = startIso.split('-').map(Number);
  const end = new Date(y, m - 1, d + Math.max(days - 1, 0));
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`;
}

export interface PopularDestinationSelection {
  destination: string;
  days: number;
  startDate: string;
}

interface Props {
  onSelect: (dest: PopularDestinationSelection) => void;
}

/**
 * Photo cards for one-click trip presets. 3×2 grid from `md`, a horizontal
 * scroller below it. Lives inside the page container so its edges line up
 * with the form card above.
 */
export function PopularCitiesRow({ onSelect }: Props) {
  if (FEATURED_DESTINATIONS.length === 0) return null;
  const startDate = isoDateOffset(7);

  return (
    <Box
      component="ul"
      aria-label="Popular trips"
      sx={{
        listStyle: 'none',
        m: 0,
        p: 0,
        display: { xs: 'flex', md: 'grid' },
        gridTemplateColumns: { md: 'repeat(3, minmax(0, 1fr))' },
        gap: 2,
        overflowX: { xs: 'auto', md: 'visible' },
        scrollSnapType: { xs: 'x mandatory', md: 'none' },
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
        // Bleed the mobile scroller to the screen edge, keep the first card aligned.
        mx: { xs: -2, sm: -3, md: 0 },
        px: { xs: 2, sm: 3, md: 0 },
        pb: { xs: 1, md: 0 },
      }}
    >
      {FEATURED_DESTINATIONS.map((dest) => {
        const range = formatDateRange(startDate, endDateFor(startDate, dest.days));
        const tagline = TAGLINES[dest.slug];
        return (
          <Box
            component="li"
            key={dest.slug}
            sx={{ flex: { xs: '0 0 72%', sm: '0 0 44%', md: 'initial' }, minWidth: 0, scrollSnapAlign: 'start' }}
          >
            <ButtonBase
              onClick={() =>
                onSelect({
                  destination: `${dest.city}, ${dest.country}`,
                  days: dest.days,
                  startDate,
                })
              }
              aria-label={`Start a ${dest.days}-day trip to ${dest.city}`}
              sx={{
                position: 'relative',
                display: 'block',
                width: '100%',
                textAlign: 'left',
                borderRadius: radii.card,
                overflow: 'hidden',
                boxShadow: (t: Theme) => tgShadow(t, 'card'),
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: (t: Theme) => tgShadow(t, 'cardHover'),
                },
                '&:focus-visible': {
                  outline: 'none',
                  boxShadow: (t: Theme) => `0 0 0 3px ${alpha(t.palette.primary.main, 0.45)}`,
                },
              }}
            >
              <Photo
                src={dest.heroImage}
                alt=""
                aspect="16/10"
                gradient
                gradientStrength="strong"
                zoomOnHover
                sizes="(max-width: 900px) 72vw, 360px"
              />
              <Box
                sx={{
                  position: 'absolute',
                  insetInline: 0,
                  bottom: 0,
                  p: 2,
                  color: 'common.white',
                  textShadow: photoTextShadow,
                }}
              >
                <Typography component="span" sx={{ ...textScale.title, display: 'block', color: 'inherit' }}>
                  {dest.city}
                </Typography>
                {tagline ? (
                  <Typography
                    component="span"
                    sx={{
                      ...textScale.meta,
                      display: 'block',
                      color: 'rgba(255,255,255,0.88)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tagline}
                  </Typography>
                ) : null}
                <Typography
                  component="span"
                  sx={{ ...textScale.meta, display: 'block', mt: 0.5, fontWeight: 600, color: 'inherit' }}
                >
                  {range ? `${range} · ${dest.days} days` : `${dest.days} days`}
                </Typography>
              </Box>
            </ButtonBase>
          </Box>
        );
      })}
    </Box>
  );
}
