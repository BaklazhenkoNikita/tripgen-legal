'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { Photo } from '@/components/ui/Photo';
import { tgShadow } from '@/theme/shadows';
import type { Destination } from '@/data/destinations';

interface DestinationCardProps {
  destination: Destination;
  priority?: boolean;
}

export function DestinationCard({ destination, priority }: DestinationCardProps) {
  const { slug, city, country, continent } = destination;

  return (
    <Box
      component={Link}
      href={`/explore/${slug}`}
      aria-label={`Explore ${city}, ${country}`}
      sx={{
        position: 'relative',
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: (t) => tgShadow(t, 'cardHover'),
          borderColor: (t) => alpha(t.palette.primary.main, 0.32),
        },
        '&:hover .destination-card-arrow': {
          color: 'primary.main',
          transform: 'translate(2px, -2px)',
        },
        '&:focus-visible': {
          outline: 'none',
          borderColor: 'primary.main',
          boxShadow: (t) => `0 0 0 3px ${alpha(t.palette.primary.main, 0.28)}`,
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <Photo
          src={destination.heroImage}
          alt={`${city}, ${country}`}
          aspect="4/3"
          zoomOnHover
          gradient
          priority={priority}
          sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 380px"
        />
        {/* Continent chip top-left */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            px: 1.25,
            py: 0.4,
            borderRadius: 999,
            bgcolor: (t) => alpha(t.palette.common.white, 0.92),
            color: 'text.primary',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0,
            backdropFilter: 'blur(6px)',
          }}
        >
          {continent}
        </Box>
        {/* City label overlaid on photo */}
        <Box
          sx={{
            position: 'absolute',
            insetInline: 0,
            bottom: 0,
            px: 2,
            py: 1.75,
            color: 'common.white',
          }}
        >
          <Typography
          component="div"
          sx={{
              fontWeight: 700,
              fontSize: { xs: 22, sm: 24 },
              lineHeight: 1.1,
              letterSpacing: 0,
              textShadow: '0 2px 8px rgba(0,0,0,0.35)',
            }}
          >
            {city}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          px: 2,
          py: 1.5,
        }}
      >
        <Typography
          sx={{
            fontSize: 13.5,
            color: 'text.secondary',
            fontWeight: 600,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {country}
        </Typography>
        <Box
          aria-hidden
          className="destination-card-arrow"
          sx={{
            flexShrink: 0,
            display: 'inline-flex',
            color: 'text.disabled',
            transition: 'color 0.2s, transform 0.2s',
          }}
        >
          <ArrowUpRight size={16} />
        </Box>
      </Box>
    </Box>
  );
}
