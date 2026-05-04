import type { Metadata } from 'next';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Photo } from '@/components/ui/Photo';
import { destinations } from '@/data/destinations';

const CONTINENT_ORDER = ['Europe', 'Asia', 'North America', 'South America', 'Oceania', 'Africa'];

export const metadata: Metadata = {
  title: 'City Guides — Curated Itineraries',
  description: `${destinations.length} curated city guides with overviews, highlights, and ready-to-personalize itineraries — Paris, London, Rome, Tokyo, and more.`,
  alternates: { canonical: '/community' },
  openGraph: {
    title: 'City Guides — Curated Itineraries | Periplo',
    description: `${destinations.length} curated city guides with overviews, highlights, and ready-to-personalize itineraries.`,
    url: 'https://periploapp.com/community',
    type: 'website',
  },
};

/**
 * Community page — 50 curated city guides grouped by continent.
 * Each card links to /community/guides/[slug] for the full guide.
 */
export default function CommunityPage() {
  const byContinent = destinations.reduce<Record<string, typeof destinations>>((acc, dest) => {
    (acc[dest.continent] ??= []).push(dest);
    return acc;
  }, {});

  return (
    <Box sx={{ mx: 'auto', maxWidth: 1024, px: { xs: 2, sm: 3 }, py: 5 }}>
      <Box component="header">
        <Typography component="h1" sx={{ fontSize: '1.875rem', fontWeight: 700, color: 'text.primary' }}>
          Guides
        </Typography>
        <Typography sx={{ mt: 0.5, fontSize: 14, color: 'text.secondary' }}>
          {destinations.length} curated city guides — overviews, highlights, and ready-to-personalize itineraries.
        </Typography>
      </Box>

      {CONTINENT_ORDER.map((continent) => {
        const dests = byContinent[continent];
        if (!dests?.length) return null;
        return (
          <Box component="section" key={continent} sx={{ mt: 5 }}>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
              <Typography
                component="h2"
                sx={{
                  fontFamily: 'var(--font-display, inherit)',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: 'text.primary',
                }}
              >
                {continent}
              </Typography>
              <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>{dests.length} guides</Typography>
            </Box>
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: {
                  sm: 'repeat(2, 1fr)',
                  lg: 'repeat(3, 1fr)',
                  xl: 'repeat(4, 1fr)',
                },
              }}
            >
              {dests.map((dest) => (
                <Box
                  component={Link}
                  key={dest.slug}
                  href={`/community/guides/${dest.slug}`}
                  className="group"
                  sx={{
                    overflow: 'hidden',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    textDecoration: 'none',
                    transition: 'all 200ms',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      borderColor: 'text.disabled',
                      boxShadow: 3,
                    },
                  }}
                >
                  <Photo
                    src={dest.heroImage}
                    alt={`${dest.city}, ${dest.country}`}
                    aspect="16/10"
                    zoomOnHover
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <Box sx={{ p: 2 }}>
                    <Typography
                      component="h3"
                      sx={{
                        fontFamily: 'var(--font-display, inherit)',
                        fontSize: 16,
                        fontWeight: 600,
                        color: 'text.primary',
                        transition: 'color 200ms',
                        '.group:hover &': { color: 'primary.main' },
                      }}
                    >
                      {dest.city}
                    </Typography>
                    <Typography sx={{ mt: 0.25, fontSize: 14, color: 'text.secondary' }}>
                      {dest.country} · {dest.days}-day plan
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
