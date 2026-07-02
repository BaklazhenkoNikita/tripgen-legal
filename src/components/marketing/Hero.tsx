import Link from 'next/link';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { ArrowRight, Compass, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { surfaceBackgroundSx } from '@/theme/backgrounds';
import { HeroProductMockup } from './HeroProductMockup';
import { StoreBadge } from './StoreBadge';

export function Hero() {
  return (
    <Box
      component="section"
      sx={{
        ...surfaceBackgroundSx,
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          mx: 'auto',
          maxWidth: 1280,
          px: { xs: 2, sm: 3 },
          py: { xs: 6, sm: 7, md: 8 },
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          alignItems: 'center',
          gap: { xs: 5, md: 6 },
        }}
      >
        <Box sx={{ textAlign: { xs: 'center', md: 'left' }, order: { xs: 1, md: 0 } }}>
          <Box sx={{ mb: 3, display: 'inline-flex' }}>
            <Badge tone="accent" size="md" iconLeft={<Sparkles size={14} />}>
              AI-powered travel planning
            </Badge>
          </Box>
          <Typography variant="h1" sx={{ color: 'text.primary' }}>
            Plan your perfect trip,
            <br />
            <Box
              component="span"
              sx={{
                backgroundImage:
                  'linear-gradient(120deg, var(--tg-palette-primary-main) 0%, var(--tg-palette-primary-dark) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              day by day.
            </Box>
          </Typography>
          <Typography
            sx={{
              mx: { xs: 'auto', md: 0 },
              mt: 3,
              maxWidth: 540,
              color: 'text.secondary',
            }}
          >
            Get personalized itineraries, hand-picked activities, and real-time collaboration —
            all in minutes. No spreadsheets, no second-guessing.
          </Typography>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              mt: 4,
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', md: 'flex-start' },
              rowGap: 1.5,
            }}
          >
            <Button
              component={Link}
              href="/trip"
              variant="contained"
              color="primary"
              size="large"
              endIcon={<ArrowRight size={16} />}
              sx={{ borderRadius: 999, px: 3, py: 1.25 }}
            >
              Start planning
            </Button>
            <Button
              component={Link}
              href="/explore"
              variant="outlined"
              size="large"
              startIcon={<Compass size={16} />}
              sx={{
                borderRadius: 999,
                px: 3,
                py: 1.25,
                borderColor: 'divider',
                color: 'text.primary',
                '&:hover': { bgcolor: 'action.hover', borderColor: 'text.disabled' },
              }}
            >
              Explore destinations
            </Button>
          </Stack>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              mt: 2.5,
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', md: 'flex-start' },
              rowGap: 1.5,
            }}
          >
            <StoreBadge
              platform="apple"
              state="live"
              href="https://apps.apple.com/us/app/periplo-ai-trip-planner/id6761609896"
            />
            <StoreBadge platform="google" state="closed-beta" />
          </Stack>
        </Box>

        <HeroProductMockup />
      </Box>
    </Box>
  );
}
