'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search } from 'lucide-react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { useCity } from '@/contexts';
import { useRecentDestinations } from '@/hooks/useRecentDestinations';
import { destinationSlug } from '@/lib/destinationSlug';
import { tgShadow } from '@/theme/shadows';
import { CitySuggestionsList } from '@/components/destinations/CitySuggestionsList';

const SUGGESTIONS = ['Tokyo', 'Lisbon', 'Mexico City', 'Marrakech', 'Kyoto'];

export function ExploreHero() {
  const router = useRouter();
  const { city: activeCity, setCity } = useCity();
  const { add: recordRecent } = useRecentDestinations();
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

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
        textAlign: 'center',
        pt: { xs: 6, sm: 9, md: 12 },
        pb: { xs: 4, sm: 6, md: 8 },
      }}
    >
      {/* Soft brand wash behind hero */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: -1,
          background: (t) =>
            `radial-gradient(60% 70% at 50% 0%, ${alpha(t.palette.primary.main, 0.12)} 0%, transparent 70%)`,
        }}
      />

      <Typography
        component="span"
        sx={{
          display: 'inline-block',
          mb: 2.5,
          px: 1.75,
          py: 0.5,
          borderRadius: 999,
          border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.32)}`,
          bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
          color: 'primary.main',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}
      >
        Atlas
      </Typography>

      <Typography
        component="h1"
        sx={{
          fontWeight: 400,
          letterSpacing: '-0.02em',
          lineHeight: 1.04,
          fontSize: { xs: '2.6rem', sm: '3.6rem', md: '4.4rem' },
          color: 'text.primary',
          mb: { xs: 1.5, sm: 2 },
        }}
      >
        Where to?
      </Typography>

      <Typography
        sx={{
          mx: 'auto',
          maxWidth: 560,
          mb: { xs: 3.5, sm: 4.5 },
          px: 1,
          fontSize: { xs: 15, sm: 17 },
          lineHeight: 1.55,
          color: 'text.secondary',
        }}
      >
        Pick a city and we&rsquo;ll hand you a curated guide — the sights, the
        neighborhoods, the days that matter most.
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        role="search"
        aria-label="Search a city"
        sx={{
          mx: 'auto',
          maxWidth: 620,
          px: { xs: 0.5, sm: 0 },
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
                ? '0 1px 0 rgba(255,255,255,0.04), 0 12px 32px rgba(0,0,0,0.45)'
                : '0 1px 0 rgba(34,34,34,0.02), 0 12px 32px rgba(34,34,34,0.06)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            '&:focus-within': {
              borderColor: 'primary.main',
              boxShadow: (t) => `0 0 0 4px ${alpha(t.palette.primary.main, 0.18)}`,
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
            placeholder="Search a city — Tokyo, Lisbon, Mexico City…"
            inputProps={{
              'aria-label': 'Search a city',
              'aria-autocomplete': 'list',
              'aria-expanded': open,
            }}
            fullWidth
            sx={{
              flex: 1,
              py: { xs: 1.75, sm: 2 },
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

        {/* Suggestion chips below search */}
        <Box
          sx={{
            mt: 2.25,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <Typography
            component="span"
            sx={{
              alignSelf: 'center',
              fontSize: 12,
              color: 'text.disabled',
              letterSpacing: '0.04em',
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
                bgcolor: 'transparent',
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
  );
}
