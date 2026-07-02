'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { destinations } from '@/data/destinations';
import { ExploreHero } from './_components/ExploreHero';
import { DestinationCard } from './_components/DestinationCard';

const FEATURED = destinations.slice(0, 9);
const TOTAL_CITIES = destinations.length;

export default function DestinationsPage() {
  return (
    <Box component="main">
      <Box sx={{ mx: 'auto', maxWidth: 1180, px: { xs: 2.5, sm: 4 } }}>
        <ExploreHero />

        {/* Featured grid section */}
        <Box
          component="section"
          aria-labelledby="featured-heading"
          sx={{ pt: { xs: 4, sm: 6, md: 8 }, pb: { xs: 6, sm: 8 } }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: { xs: 'flex-start', sm: 'flex-end' },
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              gap: { xs: 1.5, sm: 3 },
              mb: { xs: 3.5, sm: 4.5 },
            }}
          >
            <Box>
              <Typography
                component="span"
                sx={{
                  display: 'inline-block',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'secondary.main',
                  mb: 1.25,
                }}
              >
                Featured guides
              </Typography>
              <Typography
                id="featured-heading"
                component="h2"
                sx={{
                  fontWeight: 400,
                  letterSpacing: '-0.015em',
                  lineHeight: 1.1,
                  fontSize: { xs: '1.85rem', sm: '2.4rem', md: '2.8rem' },
                  color: 'text.primary',
                }}
              >
                Where Periplo travelers are going
              </Typography>
            </Box>
            <Typography
              sx={{
                maxWidth: 360,
                fontSize: 14.5,
                lineHeight: 1.55,
                color: 'text.secondary',
                pb: { sm: 0.75 },
              }}
            >
              Hand-built city guides — itineraries, neighborhoods, and tips
              from people who&rsquo;ve actually been.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gap: { xs: 2.25, sm: 2.75, md: 3 },
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
            }}
          >
            {FEATURED.map((d, i) => (
              <DestinationCard
                key={d.slug}
                destination={d}
                priority={i < 3}
              />
            ))}
          </Box>

          {/* See-all CTA */}
          <Box
            sx={{
              mt: { xs: 5, sm: 7 },
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Box
              component={Link}
              href="/community"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 3,
                py: 1.5,
                fontSize: 15,
                fontWeight: 600,
                color: 'primary.main',
                textDecoration: 'none',
                borderRadius: 999,
                border: '1px solid',
                borderColor: (t) => alpha(t.palette.primary.main, 0.32),
                transition: 'background-color 0.15s, border-color 0.15s, color 0.15s',
                '&:hover': {
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                  borderColor: 'primary.main',
                },
                '& svg': {
                  transition: 'transform 0.2s',
                },
                '&:hover svg': {
                  transform: 'translateX(3px)',
                },
              }}
            >
              View all {TOTAL_CITIES} cities
              <ArrowRight size={16} aria-hidden />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
