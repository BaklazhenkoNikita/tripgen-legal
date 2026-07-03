'use client';

import { useMemo, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Compass, MapPin, Search } from 'lucide-react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { useCity } from '@/contexts';
import { useRecentDestinations } from '@/hooks/useRecentDestinations';
import { destinations } from '@/data/destinations';
import { destinationSlug } from '@/lib/destinationSlug';
import { Photo } from '@/components/ui/Photo';
import { tgShadow } from '@/theme/shadows';
import { CitySuggestionsList } from '@/components/destinations/CitySuggestionsList';

const SUGGESTIONS = ['Tokyo', 'Lisbon', 'Mexico City', 'Marrakech', 'Kyoto'];
const FALLBACK_CITY = 'Barcelona';

export function ExploreHero() {
  const router = useRouter();
  const { city: activeCity, setCity } = useCity();
  const { add: recordRecent } = useRecentDestinations();
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const currentCity = activeCity ?? FALLBACK_CITY;
  const featuredDestination = useMemo(() => {
    const normalized = currentCity.trim().toLowerCase();
    return (
      destinations.find((d) => d.city.toLowerCase() === normalized) ??
      destinations.find((d) => normalized.startsWith(d.city.toLowerCase())) ??
      null
    );
  }, [currentCity]);

  const submit = (raw: string) => {
    const value = raw.trim();
    if (!value) return;
    const slug = destinationSlug(value);
    if (!slug) return;
    setCity(value);
    recordRecent(value);
    setOpen(false);
    setInput('');
    router.push(`/explore/${slug}`);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit(input);
  };

  return (
    <Box
      component="header"
      sx={{
        position: 'relative',
        pt: { xs: 4, sm: 6, md: 7 },
        pb: { xs: 3, sm: 4, md: 5 },
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: { xs: '-24px -20px auto', md: '-32px -48px auto' },
          height: { xs: 360, md: 420 },
          zIndex: -1,
          background: (t) =>
            `linear-gradient(110deg, ${alpha(t.palette.primary.main, 0.12)} 0%, transparent 42%), radial-gradient(52% 64% at 82% 4%, ${alpha(t.palette.info.main, 0.16)} 0%, transparent 72%)`,
        }}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.05fr) minmax(340px, 0.95fr)' },
          alignItems: 'center',
          gap: { xs: 3.5, md: 6 },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              mb: 2,
              px: 1.5,
              py: 0.6,
              borderRadius: 999,
              border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.24)}`,
              bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
              color: 'primary.main',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 0,
            }}
          >
            <Compass size={14} aria-hidden />
            Explore
          </Box>

          <Typography
            component="h1"
            sx={{
              maxWidth: 720,
              fontWeight: 700,
              letterSpacing: 0,
              lineHeight: 1.04,
              fontSize: { xs: 42, sm: 54, md: 64 },
              color: 'text.primary',
              mb: { xs: 1.5, sm: 2 },
            }}
          >
            Start with {currentCity}
          </Typography>

          <Typography
            sx={{
              maxWidth: 600,
              mb: { xs: 3, sm: 3.5 },
              fontSize: { xs: 15, sm: 17 },
              lineHeight: 1.6,
              color: 'text.secondary',
            }}
          >
            Browse city references, local picks, food, events, and bookable
            experiences before you turn anything into a day-by-day plan.
          </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          role="search"
          aria-label="Search a city"
          sx={{
            maxWidth: 660,
          }}
        >
          <Box
            ref={anchorRef}
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              borderRadius: 999,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              boxShadow: (t) =>
                t.palette.mode === 'dark'
                  ? '0 1px 0 rgba(255,255,255,0.04), 0 14px 36px rgba(0,0,0,0.42)'
                  : '0 1px 0 rgba(34,34,34,0.02), 0 14px 36px rgba(34,34,34,0.08)',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              '&:focus-within': {
                borderColor: 'primary.main',
                boxShadow: (t) => `0 0 0 4px ${alpha(t.palette.primary.main, 0.16)}`,
              },
            }}
          >
            <Box
              sx={{
                pl: { xs: 2.25, sm: 2.75 },
                pr: 1,
                color: 'text.disabled',
                display: 'inline-flex',
              }}
            >
              <Search size={20} aria-hidden />
            </Box>
            <InputBase
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (!open) setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setOpen(false);
              }}
              placeholder="Search a city — Tokyo, Lisbon, Mexico City..."
              inputProps={{
                'aria-label': 'Search a city',
                'aria-autocomplete': 'list',
                'aria-expanded': open,
              }}
              fullWidth
              sx={{
                flex: 1,
                py: { xs: 1.65, sm: 1.9 },
                fontSize: { xs: 16, sm: 17 },
                fontFamily: 'var(--font-body)',
                color: 'text.primary',
                '& input::placeholder': { color: 'text.disabled', opacity: 1 },
              }}
            />
            <IconButton
              type="submit"
              aria-label="Go"
              disabled={!input.trim()}
              sx={{
                mr: { xs: 0.75, sm: 1 },
                width: { xs: 42, sm: 48 },
                height: { xs: 42, sm: 48 },
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': { bgcolor: 'primary.dark' },
                '&.Mui-disabled': {
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.32),
                  color: 'primary.contrastText',
                },
              }}
            >
              <ArrowRight size={18} aria-hidden />
            </IconButton>
          </Box>

          <Popover
            open={open}
            anchorEl={anchorRef.current}
            onClose={() => setOpen(false)}
            disableAutoFocus
            disableEnforceFocus
            disableRestoreFocus
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
                  width: anchorRef.current?.offsetWidth ?? 620,
                },
              },
            }}
          >
            <Paper
              elevation={0}
              sx={{ p: 1.5, bgcolor: 'background.paper', textAlign: 'left' }}
            >
              <CitySuggestionsList
                query={input}
                selectedCity={activeCity}
                onPick={submit}
              />
            </Paper>
          </Popover>

          <Box
            sx={{
              mt: 2,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Typography
              component="span"
              sx={{
                alignSelf: 'center',
                fontSize: 12,
                color: 'text.disabled',
                letterSpacing: 0,
                mr: 0.5,
              }}
            >
              Try
            </Typography>
            {SUGGESTIONS.map((label) => (
              <Box
                key={label}
                component="button"
                type="button"
                onClick={() => submit(label)}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: 'var(--font-body)',
                  color: 'text.secondary',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 999,
                  cursor: 'pointer',
                  transition: 'color 0.15s, border-color 0.15s, background-color 0.15s',
                  '&:hover': {
                    color: 'primary.main',
                    borderColor: (t) => alpha(t.palette.primary.main, 0.4),
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
                  },
                }}
              >
                {label}
              </Box>
            ))}
          </Box>
        </Box>
        </Box>

        <Box
          sx={{
            minWidth: 0,
            display: { xs: 'none', md: 'block' },
          }}
        >
          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              boxShadow: (t) => tgShadow(t, 'cardHover'),
            }}
          >
            <Photo
              src={featuredDestination?.heroImage ?? destinations[0]?.heroImage}
              alt={`${currentCity} city guide`}
              aspect="16/10"
              gradient
              priority
              sizes="520px"
            />
            <Box
              sx={{
                position: 'absolute',
                insetInline: 0,
                bottom: 0,
                p: 2.5,
                color: 'common.white',
              }}
            >
              <Stack spacing={1}>
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    alignSelf: 'flex-start',
                    px: 1.25,
                    py: 0.5,
                    borderRadius: 999,
                    bgcolor: (t) => alpha(t.palette.common.white, 0.92),
                    color: 'text.primary',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  <MapPin size={14} aria-hidden />
                  Current city
                </Box>
                <Box>
                  <Typography
                    component="div"
                    sx={{
                      fontSize: 30,
                      lineHeight: 1.1,
                      fontWeight: 700,
                      letterSpacing: 0,
                      textShadow: '0 2px 10px rgba(0,0,0,0.42)',
                    }}
                  >
                    {currentCity}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: 14,
                      color: (t) => alpha(t.palette.common.white, 0.88),
                      textShadow: '0 2px 10px rgba(0,0,0,0.42)',
                    }}
                  >
                    {featuredDestination
                      ? `${featuredDestination.country} · ${featuredDestination.continent}`
                      : 'Local references · Activities · Food'}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
