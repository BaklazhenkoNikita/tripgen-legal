'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha, type Theme } from '@mui/material/styles';
import { Loader2, X } from 'lucide-react';
import type { GenerationPhase } from '@/hooks/useTripGeneration';
import { Button } from '@/components/ui/Button';

const PHASE_LABELS: Record<string, string> = {
  connecting: 'Connecting',
  routing: 'Analyzing your request',
  activities_preliminary: 'Planning activities',
  activities_progress: 'Building your itinerary',
  activities_complete: 'Finalizing activities',
  coordinates_update: 'Adding locations',
  destination_info: 'Loading destination info',
  restaurants_complete: 'Adding restaurants',
  finalizing: 'Wrapping up',
  recovering: 'Reconnecting — hang tight, your trip is being saved',
  saving_fallback: 'Saving your trip',
  awaiting_clarification: 'Waiting on your answer',
};

interface Props {
  phase: GenerationPhase;
  currentDay: number | null;
  totalDays: number | null;
  onCancel: () => void;
}

export function GenerationProgress({ phase, currentDay, totalDays, onCancel }: Props) {
  const label = PHASE_LABELS[phase] ?? 'Generating';
  const progress =
    totalDays && currentDay
      ? Math.min(Math.round((currentDay / totalDays) * 100), 95)
      : null;

  return (
    <Box
      sx={{
        position: 'relative',
        mb: 3,
        overflow: 'hidden',
        borderRadius: 3,
        border: '1px solid',
        borderColor: (t: Theme) => alpha(t.palette.primary.main, 0.32),
        background: (t: Theme) =>
          `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.12)}, ${
            t.palette.background.paper
          } 50%, ${alpha(t.palette.text.primary, 0.04)})`,
        p: 2.5,
      }}
    >
      <Box
        aria-hidden
        sx={{
          pointerEvents: 'none',
          position: 'absolute',
          right: -48,
          top: -48,
          height: 160,
          width: 160,
          borderRadius: '50%',
          bgcolor: 'primary.main',
          opacity: 0.08,
          filter: 'blur(60px)',
        }}
      />
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 40,
              width: 40,
              borderRadius: '50%',
              bgcolor: (t: Theme) => alpha(t.palette.primary.main, 0.12),
              color: 'primary.main',
            }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                animation: 'spin 1s linear infinite',
              }}
            >
              <Loader2 size={20} aria-hidden />
            </Box>
          </Box>
          <Box>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 600,
                color: 'text.primary',
                m: 0,
              }}
            >
              {label}…
            </Typography>
            {currentDay && totalDays ? (
              <Typography sx={{ mt: 0.25, fontSize: 12, color: 'text.secondary' }}>
                Day {currentDay} of {totalDays}
              </Typography>
            ) : null}
          </Box>
        </Box>
        <Button variant="ghost" size="sm" iconLeft={<X size={14} />} onClick={onCancel}>
          Cancel
        </Button>
      </Box>

      {progress != null ? (
        <Box
          sx={{
            mt: 2,
            height: 6,
            overflow: 'hidden',
            borderRadius: 999,
            bgcolor: (t: Theme) => alpha(t.palette.primary.main, 0.16),
          }}
        >
          <Box
            sx={{
              height: '100%',
              borderRadius: 999,
              bgcolor: 'primary.main',
              transition: 'width 0.5s ease',
              width: `${progress}%`,
            }}
          />
        </Box>
      ) : null}
    </Box>
  );
}
