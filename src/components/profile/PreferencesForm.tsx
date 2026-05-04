'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MuiButton from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import { useUpdateProfile, type Profile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/Button';

interface Props {
  profile: Profile | null | undefined;
  onClose: () => void;
}

const ACTIVITY_TYPES = [
  'culture',
  'food',
  'nature',
  'landmarks',
  'nightlife',
  'wellness',
  'shopping',
  'family',
] as const;

const BUDGETS = ['budget', 'moderate', 'luxury'] as const;
const ENERGY_LEVELS = [
  { value: 'packed', label: 'High' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'relaxed', label: 'Low' },
] as const;
const WHO_OPTIONS = ['solo', 'couple', 'family', 'friends'] as const;

export function PreferencesForm({ profile, onClose }: Props) {
  const updateProfile = useUpdateProfile();

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [budget, setBudget] = useState<string>('');
  const [energyLevel, setEnergyLevel] = useState<string>('');
  const [who, setWho] = useState<string>('');

  useEffect(() => {
    const prefs = profile?.preferences ?? {};
    setSelectedTypes(prefs.preferred_activity_types ?? []);
    setBudget(prefs.budget ?? '');
    setEnergyLevel(prefs.energy_level ?? '');
    setWho(prefs.who ?? '');
  }, [profile]);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({
        preferences: {
          preferred_activity_types: selectedTypes,
          budget: budget || undefined,
          energy_level: energyLevel || undefined,
          who: who || undefined,
        },
      });
      toast.success('Preferences saved.');
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? `Couldn't save: ${err.message}` : "Couldn't save.");
    }
  };

  return (
    <Stack component="form" onSubmit={submit} spacing={2.5}>
      <Box>
        <Typography sx={{ fontSize: 12, fontWeight: 500, color: 'text.primary' }}>
          Favorite activity types
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {ACTIVITY_TYPES.map((t) => {
            const on = selectedTypes.includes(t);
            return (
              <MuiButton
                type="button"
                key={t}
                onClick={() => toggleType(t)}
                disableElevation
                sx={{
                  height: 32,
                  minWidth: 0,
                  borderRadius: 999,
                  px: 1.5,
                  fontSize: 12,
                  fontWeight: 500,
                  textTransform: 'capitalize',
                  transition: 'background-color 150ms, color 150ms',
                  ...(on
                    ? {
                        bgcolor: 'primary.main',
                        color: 'common.white',
                        border: 'none',
                        '&:hover': { bgcolor: 'primary.dark' },
                      }
                    : {
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        color: 'text.secondary',
                        '&:hover': {
                          color: 'text.primary',
                          bgcolor: 'background.paper',
                        },
                      }),
                }}
              >
                {t}
              </MuiButton>
            );
          })}
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
        }}
      >
        <FieldSelect
          label="Default budget"
          value={budget}
          onChange={setBudget}
          options={BUDGETS.map((b) => ({ value: b, label: b }))}
        />
        <FieldSelect
          label="Energy level"
          value={energyLevel}
          onChange={setEnergyLevel}
          options={ENERGY_LEVELS as unknown as { value: string; label: string }[]}
        />
        <FieldSelect
          label="Travel with"
          value={who}
          onChange={setWho}
          options={WHO_OPTIONS.map((w) => ({ value: w, label: w }))}
        />
      </Box>

      <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ pt: 0.5 }}>
        <Button type="button" variant="ghost" onClick={onClose} disabled={updateProfile.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={updateProfile.isPending} loading={updateProfile.isPending}>
          Save
        </Button>
      </Stack>
    </Stack>
  );
}

function FieldSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <Box component="label" sx={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'text.primary' }}>
      {label}
      <Box
        component="select"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
        sx={(theme) => ({
          mt: 0.5,
          width: '100%',
          borderRadius: 1.5,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          px: 1.5,
          py: 1,
          fontSize: 14,
          color: 'text.primary',
          '&:focus': {
            outline: 'none',
            borderColor: 'primary.main',
            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`,
          },
        })}
      >
        <option value="">Any</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ textTransform: 'capitalize' }}>
            {opt.label}
          </option>
        ))}
      </Box>
    </Box>
  );
}
