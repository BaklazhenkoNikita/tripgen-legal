'use client';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { alpha, type Theme } from '@mui/material/styles';
import { Clock } from 'lucide-react';
import { destinations } from '@/data/destinations';
import { isoDateOffset } from '@/lib/date';
import { tgShadow } from '@/theme/shadows';

const FEATURED_SLUGS = [
  'paris-5-days',
  'new-york-5-days',
  'tokyo-7-days',
  'rome-4-days',
  'london-4-days',
  'barcelona-4-days',
];

const FEATURE_META: Record<string, { emoji: string; tagline: string }> = {
  'paris-5-days': { emoji: '🗼', tagline: 'Romance, art, and iconic landmarks' },
  'new-york-5-days': { emoji: '🗽', tagline: 'The city that never sleeps' },
  'tokyo-7-days': { emoji: '🗾', tagline: 'Modern meets traditional' },
  'rome-4-days': { emoji: '🏛️', tagline: 'Ancient history and timeless beauty' },
  'london-4-days': { emoji: '🎡', tagline: 'History, culture, and royalty' },
  'barcelona-4-days': { emoji: '🏖️', tagline: 'Sunshine, Gaudí, and tapas' },
};

const FEATURED_DESTINATIONS = FEATURED_SLUGS
  .map((slug) => destinations.find((d) => d.slug === slug))
  .filter((d): d is NonNullable<typeof d> => Boolean(d));

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function formatRange(startIso: string, days: number): string {
  const start = new Date(`${startIso}T00:00:00`);
  if (Number.isNaN(start.getTime())) return '';
  const end = new Date(start);
  end.setDate(end.getDate() + Math.max(days - 1, 0));
  const month = MONTHS_SHORT[start.getMonth()];
  return `${month} ${start.getDate()}–${end.getDate()}`;
}

export interface PopularDestinationSelection {
  destination: string;
  days: number;
  startDate: string;
}

interface Props {
  onSelect: (dest: PopularDestinationSelection) => void;
}

export function PopularCitiesRow({ onSelect }: Props) {
  if (FEATURED_DESTINATIONS.length === 0) return null;

  return (
    <Box
      role="list"
      aria-label="Popular trips"
      sx={{
        display: 'flex',
        flexWrap: 'nowrap',
        justifyContent: 'safe center',
        gap: 2,
        overflowX: 'auto',
        px: { xs: 2, sm: 3 },
        pb: 1,
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {FEATURED_DESTINATIONS.map((dest) => {
        const meta = FEATURE_META[dest.slug];
        const startDate = isoDateOffset(7);
        const range = formatRange(startDate, dest.days);
        return (
          <ButtonBase
            key={dest.slug}
            role="listitem"
            onClick={() =>
              onSelect({
                destination: `${dest.city}, ${dest.country}`,
                days: dest.days,
                startDate,
              })
            }
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 1,
              flex: '0 0 auto',
              width: { xs: 220, sm: 240 },
              p: { xs: 2.5, sm: 3 },
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              transition: 'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                borderColor: (t: Theme) => alpha(t.palette.primary.main, 0.32),
                transform: 'translateY(-2px)',
                boxShadow: (t: Theme) => tgShadow(t, 'cardHover'),
              },
              '&:focus-visible': {
                outline: 'none',
                boxShadow: (t: Theme) => `0 0 0 2px ${alpha(t.palette.primary.main, 0.4)}`,
              },
            }}
          >
            <Typography component="span" variant="h2" aria-hidden sx={{ lineHeight: 1, m: 0 }}>
              {meta?.emoji ?? '✈️'}
            </Typography>
            <Typography component="span" variant="h6" sx={{ m: 0, fontWeight: 600 }}>
              {dest.city}, {dest.country}
            </Typography>
            <Typography
              component="span"
              variant="body2"
              sx={{ color: 'text.secondary', m: 0 }}
            >
              {meta?.tagline ?? ''}
            </Typography>
            <Chip
              icon={<Clock size={14} aria-hidden />}
              label={range ? `${range}, ${dest.days} days` : `${dest.days} days`}
              size="medium"
              sx={{ mt: 0.5 }}
            />
          </ButtonBase>
        );
      })}
    </Box>
  );
}
