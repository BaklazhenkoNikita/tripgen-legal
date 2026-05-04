'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { useClerk, useUser } from '@clerk/nextjs';
import { useUpdateProfile } from '@/hooks/useProfile';
import { useSnackbar } from '@/contexts';

const VIBES = [
  'culture',
  'food',
  'nature',
  'landmarks',
  'nightlife',
  'wellness',
  'shopping',
  'family',
  'hidden-gem',
] as const;

const ENERGY_LEVELS = [
  { value: 'relaxed', label: 'Easy pace' },
  { value: 'moderate', label: 'Balanced' },
  { value: 'packed', label: 'Pack it in' },
] as const;

const WHO_OPTIONS = [
  { value: 'solo', label: 'Solo' },
  { value: 'couple', label: 'Couple' },
  { value: 'family', label: 'Family' },
  { value: 'friends', label: 'Friends' },
] as const;

const BUDGETS = [
  { value: 'budget', label: 'Budget' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'luxury', label: 'Luxury' },
] as const;

const BUFFER_KEY = 'tripgen_onboarding_buffer';
const COMPLETED_KEY = 'tripgen_onboarding_completed';

/**
 * Onboarding step 3 — taste preferences. Signed-in users PATCH the profile
 * directly. Guests have their selections buffered to localStorage; on
 * sign-in, the merge effect applies them.
 */
export default function OnboardingTastePage() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  const updateProfile = useUpdateProfile();
  const { showSnackbar } = useSnackbar();

  const [vibes, setVibes] = useState<string[]>([]);
  const [energy, setEnergy] = useState('');
  const [who, setWho] = useState('');
  const [budget, setBudget] = useState('');

  useEffect(() => {
    try {
      const buf = localStorage.getItem(BUFFER_KEY);
      if (buf) {
        const parsed = JSON.parse(buf) as Partial<{
          vibes: string[];
          energy: string;
          who: string;
          budget: string;
        }>;
        if (Array.isArray(parsed.vibes)) setVibes(parsed.vibes);
        if (parsed.energy) setEnergy(parsed.energy);
        if (parsed.who) setWho(parsed.who);
        if (parsed.budget) setBudget(parsed.budget);
      }
    } catch {
      // ignore corrupt buffer
    }
  }, []);

  const toggleVibe = (v: string) => {
    setVibes((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  const submit = async () => {
    const preferences = {
      preferred_activity_types: vibes,
      vibe_tags: vibes,
      energy_level: energy || undefined,
      who: who || undefined,
      budget: budget || undefined,
    };

    if (isSignedIn) {
      try {
        await updateProfile.mutateAsync({
          preferences,
          onboarding_completed: true,
        });
        try {
          localStorage.setItem(COMPLETED_KEY, '1');
          localStorage.removeItem(BUFFER_KEY);
        } catch {
          // ignore
        }
        showSnackbar({ message: 'All set — your feed is personalizing.' });
        router.push('/explore');
      } catch (err) {
        showSnackbar({
          message:
            err instanceof Error ? `Couldn't save: ${err.message}` : "Couldn't save.",
        });
      }
    } else {
      try {
        localStorage.setItem(BUFFER_KEY, JSON.stringify({ vibes, energy, who, budget }));
        localStorage.setItem(COMPLETED_KEY, '1');
      } catch {
        // ignore
      }
      showSnackbar({ message: 'Saved locally. Sign in any time to keep them.' });
      router.push('/explore');
    }
  };

  return (
    <Box sx={{ mx: 'auto', maxWidth: 672, px: { xs: 2, sm: 3 }, py: 5 }}>
      <ProgressDots step={2} />
      <Typography component="h1" sx={{ mt: 2, fontSize: '1.5rem', fontWeight: 700, color: 'text.primary' }}>
        What&apos;s your vibe?
      </Typography>
      <Typography sx={{ mt: 0.75, fontSize: 14, color: 'text.secondary' }}>
        Pick anything that resonates. We use these signals to rank suggestions.
      </Typography>

      <Box component="section" sx={{ mt: 3 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary' }}>
          Interests
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {VIBES.map((v) => {
            const on = vibes.includes(v);
            return (
              <Box
                component="button"
                type="button"
                key={v}
                onClick={() => toggleVibe(v)}
                sx={{
                  borderRadius: 999,
                  px: 1.5,
                  py: 0.75,
                  fontSize: 12,
                  fontWeight: 500,
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                  transition: 'colors 200ms',
                  ...(on
                    ? {
                        bgcolor: 'primary.main',
                        color: 'common.white',
                        border: 'none',
                      }
                    : {
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                        '&:hover': { borderColor: (t) => alpha(t.palette.primary.main, 0.6) },
                      }),
                }}
              >
                {v.replace('-', ' ')}
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box component="section" sx={{ mt: 3 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary' }}>
          Pace
        </Typography>
        <ChipGroup options={ENERGY_LEVELS} value={energy} onChange={setEnergy} />
      </Box>

      <Box component="section" sx={{ mt: 3 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary' }}>
          Travel with
        </Typography>
        <ChipGroup options={WHO_OPTIONS} value={who} onChange={setWho} />
      </Box>

      <Box component="section" sx={{ mt: 3 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary' }}>
          Budget
        </Typography>
        <ChipGroup options={BUDGETS} value={budget} onChange={setBudget} />
      </Box>

      <Box
        sx={{
          mt: 5,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          pt: 3,
        }}
      >
        <Box
          component={Link}
          href="/onboarding/city"
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
        <Box sx={{ display: 'flex', gap: 1 }}>
          {!isSignedIn ? (
            <Box
              component="button"
              type="button"
              onClick={() => openSignIn()}
              sx={{
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                px: 2,
                py: 1,
                fontSize: 14,
                fontWeight: 500,
                color: 'text.primary',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              Sign in to save
            </Box>
          ) : null}
          <Box
            component="button"
            type="button"
            onClick={() => void submit()}
            disabled={updateProfile.isPending}
            sx={{
              borderRadius: 1.5,
              bgcolor: 'primary.main',
              border: 'none',
              px: 2,
              py: 1,
              fontSize: 14,
              fontWeight: 600,
              color: 'common.white',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'primary.dark' },
              '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
            }}
          >
            {updateProfile.isPending ? 'Saving…' : 'Finish'}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function ChipGroup<T extends { value: string; label: string }>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
      {options.map((opt) => {
        const on = value === opt.value;
        return (
          <Box
            component="button"
            type="button"
            key={opt.value}
            onClick={() => onChange(on ? '' : opt.value)}
            sx={{
              borderRadius: 999,
              px: 1.5,
              py: 0.75,
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'colors 200ms',
              ...(on
                ? {
                    bgcolor: 'primary.main',
                    color: 'common.white',
                    border: 'none',
                  }
                : {
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    '&:hover': { borderColor: (t) => alpha(t.palette.primary.main, 0.6) },
                  }),
            }}
          >
            {opt.label}
          </Box>
        );
      })}
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
