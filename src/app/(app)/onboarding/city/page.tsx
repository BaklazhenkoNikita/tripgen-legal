'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { useCity } from '@/contexts';
import { useDestinationsAutocomplete } from '@/hooks/useDestinationsAutocomplete';

/**
 * Onboarding step 2 — favorite/home city. Saves to CityContext (which
 * persists to localStorage) and continues to taste preferences.
 */
export default function OnboardingCityPage() {
  const { city, setCity } = useCity();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isLoading } = useDestinationsAutocomplete(debounced);
  const results = data?.results ?? [];

  const select = (cityName: string) => {
    setCity(cityName);
    router.push('/onboarding/taste');
  };

  return (
    <Box
      sx={{
        mx: 'auto',
        display: 'flex',
        minHeight: 'calc(100vh - 4rem)',
        maxWidth: 512,
        flexDirection: 'column',
        justifyContent: 'space-between',
        px: { xs: 2, sm: 3 },
        py: 6,
      }}
    >
      <Box>
        <ProgressDots step={1} />
        <Typography component="h1" sx={{ mt: 2, fontSize: '1.5rem', fontWeight: 700, color: 'text.primary' }}>
          Where do you most want to go?
        </Typography>
        <Typography sx={{ mt: 0.75, fontSize: 14, color: 'text.secondary' }}>
          We&apos;ll start exploring here. You can switch cities anytime.
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Box
            component="input"
            type="text"
            autoFocus
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            placeholder="e.g. Tokyo, Lisbon, Mexico City…"
            sx={{
              width: '100%',
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              px: 2,
              py: 1.5,
              fontSize: 16,
              bgcolor: 'background.paper',
              color: 'text.primary',
              '&:focus': {
                outline: 'none',
                borderColor: 'primary.main',
                boxShadow: (t) => `0 0 0 1px ${t.palette.primary.main}`,
              },
            }}
          />
          {city ? (
            <Typography sx={{ mt: 1, fontSize: 12, color: 'text.secondary' }}>
              Currently set: <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>{city}</Box>
            </Typography>
          ) : null}
        </Box>

        <Box
          component="ul"
          sx={{
            mt: 2,
            maxHeight: 320,
            overflowY: 'auto',
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            listStyle: 'none',
            p: 0,
            m: 0,
          }}
        >
          {isLoading && debounced ? (
            <Box component="li" sx={{ px: 2, py: 1.5, fontSize: 14, color: 'text.disabled' }}>Searching…</Box>
          ) : results.length === 0 && debounced.length >= 2 ? (
            <Box component="li" sx={{ px: 2, py: 1.5, fontSize: 14, color: 'text.disabled' }}>
              No matches. Type a different city name.
            </Box>
          ) : (
            results.map((r) => {
              const cityName = r.city ?? r.name ?? '';
              if (!cityName) return null;
              return (
                <Box
                  component="li"
                  key={cityName}
                  sx={{
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    '&:first-of-type': { borderTop: 'none' },
                  }}
                >
                  <Box
                    component="button"
                    type="button"
                    onClick={() => select(cityName)}
                    sx={{
                      display: 'flex',
                      width: '100%',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                      px: 2,
                      py: 1.25,
                      textAlign: 'left',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Box component="span" sx={{ fontWeight: 500, color: 'text.primary' }}>{cityName}</Box>
                    {r.country ? (
                      <Box component="span" sx={{ fontSize: 12, color: 'text.secondary' }}>{r.country}</Box>
                    ) : null}
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
      </Box>

      <Box
        sx={{
          mt: 3,
          display: 'flex',
          justifyContent: 'space-between',
          pb: 'env(safe-area-inset-bottom)',
        }}
      >
        <Box
          component={Link}
          href="/onboarding"
          sx={{
            fontSize: 14,
            fontWeight: 500,
            color: 'text.secondary',
            textDecoration: 'none',
            '&:hover': { color: 'text.primary' },
          }}
        >
          ← Back
        </Box>
        {city ? (
          <Box
            component="button"
            type="button"
            onClick={() => router.push('/onboarding/taste')}
            sx={{
              borderRadius: 1.5,
              bgcolor: 'primary.main',
              px: 2,
              py: 1,
              fontSize: 14,
              fontWeight: 600,
              color: 'common.white',
              border: 'none',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            Next: vibe →
          </Box>
        ) : (
          <Box
            component={Link}
            href="/explore"
            sx={{
              fontSize: 14,
              fontWeight: 500,
              color: 'text.secondary',
              textDecoration: 'none',
              '&:hover': { color: 'text.primary' },
            }}
          >
            Skip
          </Box>
        )}
      </Box>
    </Box>
  );
}

function ProgressDots({ step }: { step: 1 | 2 }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {[1, 2].map((i) => (
        <Box
          component="span"
          key={i}
          sx={{
            height: 6,
            borderRadius: 999,
            transition: 'all 200ms',
            width: i === step ? 24 : 6,
            bgcolor: (t) => (i === step ? t.palette.primary.main : alpha(t.palette.text.primary, 0.15)),
          }}
        />
      ))}
    </Box>
  );
}
