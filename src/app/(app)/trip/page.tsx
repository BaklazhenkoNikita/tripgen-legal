'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { TripInputForm } from '@/components/trip/TripInputForm';
import { GenerationProgress } from '@/components/trip/GenerationProgress';
import { ClarificationDialog } from '@/components/trip/ClarificationDialog';
import {
  PopularCitiesRow,
  type PopularDestinationSelection,
} from '@/components/trip/PopularCitiesRow';
import { GuestSignInPrompt } from '@/components/auth/GuestSignInPrompt';
import { useTripGeneration, type GenerateParams } from '@/hooks/useTripGeneration';
import { useFeatureConfig } from '@/hooks/useFeatureConfig';
import { Button } from '@/components/ui/Button';
import { isoDateOffset } from '@/lib/date';
import { useCity, useActiveTrip } from '@/contexts';

function TripPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlDestination = searchParams.get('destination');
  const defaultDays = Number(searchParams.get('days')) || 3;
  // Bypass the "redirect to current trip" behavior when the URL is asking for
  // the form (popular-city prefill, deep links, or the explicit "+ new" entry).
  const wantsForm =
    searchParams.has('destination') ||
    searchParams.has('days') ||
    searchParams.has('new');
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { city } = useCity();
  const { activeTripId, hydrated: activeTripHydrated } = useActiveTrip();

  const {
    travelData,
    phase,
    error,
    isLoading,
    searchId,
    currentDay,
    totalDays,
    clarificationQuestion,
    generate,
    cancel,
    reset,
    answerClarification,
  } = useTripGeneration();

  const { data: featureConfig } = useFeatureConfig();
  const tripGenDisabled =
    featureConfig?.disable_trip_generation || featureConfig?.disable_all_ai;
  const disabledReason =
    featureConfig?.maintenance_message ??
    (featureConfig?.disable_all_ai
      ? 'Trip generation is temporarily paused while we investigate an issue.'
      : featureConfig?.disable_trip_generation
      ? 'Trip generation is paused for maintenance. Check back shortly.'
      : null);

  const lastParamsRef = useRef<GenerateParams | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const [prefillDestination, setPrefillDestination] = useState(urlDestination ?? city ?? '');
  const [prefillStartDate, setPrefillStartDate] = useState<string>(() => isoDateOffset(1));
  const [prefillDays, setPrefillDays] = useState<number>(defaultDays);
  const [prefillNonce, setPrefillNonce] = useState(0);

  const cityAppliedRef = useRef(false);
  useEffect(() => {
    if (cityAppliedRef.current) return;
    if (urlDestination) return;
    if (!city) return;
    cityAppliedRef.current = true;
    setPrefillDestination(city);
    setPrefillNonce((n) => n + 1);
  }, [city, urlDestination]);

  const handlePrefill = useCallback((sel: PopularDestinationSelection) => {
    setPrefillDestination(sel.destination);
    setPrefillStartDate(sel.startDate);
    setPrefillDays(sel.days);
    setPrefillNonce((n) => n + 1);
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  const [guestPromptDismissed, setGuestPromptDismissed] = useState(false);
  useEffect(() => {
    if (phase === 'idle') setGuestPromptDismissed(false);
  }, [phase]);
  const showGuestPrompt =
    phase === 'complete' && authLoaded && !isSignedIn && !guestPromptDismissed;

  const handleGenerate = useCallback(
    (params: GenerateParams) => {
      lastParamsRef.current = params;
      generate(params);
    },
    [generate],
  );

  const handleAnswer = useCallback(
    (answer: string) => {
      if (lastParamsRef.current) {
        void answerClarification(answer, lastParamsRef.current);
      }
    },
    [answerClarification],
  );

  const [, startNavTransition] = useTransition();
  // Once generation finishes and we have a saved searchId, jump straight to the
  // unified edit view at /trip/[searchId]. This eliminates the old read-only
  // post-generation preview — there's only one canonical trip URL now.
  useEffect(() => {
    if (phase === 'complete' && searchId) {
      startNavTransition(() => {
        router.replace(`/trip/${searchId}`);
      });
    }
  }, [phase, searchId, router]);

  // If the user has a last-viewed trip, /trip should land them there instead
  // of the empty generation form. Skipped when the URL explicitly asks for
  // the form (`?new=1`, `?destination=…`, `?days=…`) or when a generation is
  // already in flight on this page.
  const isGenerationActive = phase !== 'idle' || Boolean(travelData);
  const shouldRedirectToActive =
    activeTripHydrated && !wantsForm && !isGenerationActive && activeTripId != null;
  useEffect(() => {
    if (shouldRedirectToActive && activeTripId) {
      router.replace(`/trip/${activeTripId}`);
    }
  }, [shouldRedirectToActive, activeTripId, router]);

  // Render a thin placeholder while we resolve the redirect. Avoids a flash of
  // the generation form before the activeTripId redirect kicks in.
  if (!isGenerationActive && (!activeTripHydrated || shouldRedirectToActive)) {
    return (
      <Box sx={{ mx: 'auto', maxWidth: 1320, px: { xs: 2, sm: 3 }, py: 4 }}>
        <Box
          sx={{
            mx: 'auto',
            maxWidth: 768,
            height: 320,
            borderRadius: 2,
            bgcolor: (t) => alpha(t.palette.text.primary, 0.04),
            animation: 'tgSkeletonPulse 1.6s ease-in-out infinite',
          }}
        />
      </Box>
    );
  }

  if (travelData && (phase === 'complete' || phase !== 'idle')) {
    return (
      <Box sx={{ mx: 'auto', maxWidth: 1320, px: { xs: 2, sm: 3 }, py: 4 }}>
        {isLoading ? (
          <GenerationProgress
            phase={phase}
            currentDay={currentDay}
            totalDays={totalDays}
            onCancel={cancel}
          />
        ) : null}

        {phase === 'complete' && !searchId ? (
          <Box sx={{ mt: 5, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            <Button onClick={reset} size="lg" variant="secondary" iconLeft={<RotateCcw className="size-4" />}>
              Plan another trip
            </Button>
          </Box>
        ) : null}

        {phase === 'error' && error ? (
          <Box
            sx={{
              mt: 3,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.5,
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: (t) => alpha('#dc2626', 0.3),
              bgcolor: (t) => alpha('#dc2626', 0.1),
              p: 2,
            }}
          >
            <Box component={AlertTriangle} aria-hidden sx={{ mt: 0.25, width: 16, height: 16, flexShrink: 0, color: '#dc2626' }} />
            <Box>
              <Typography sx={{ fontSize: 14, color: '#dc2626' }}>{error}</Typography>
              <Button variant="ghost" size="sm" onClick={reset} style={{ marginTop: 8 }}>
                Try again
              </Button>
            </Box>
          </Box>
        ) : null}

        {phase === 'awaiting_clarification' && clarificationQuestion ? (
          <ClarificationDialog
            question={clarificationQuestion}
            onAnswer={handleAnswer}
            onCancel={reset}
          />
        ) : null}

        {showGuestPrompt ? (
          <GuestSignInPrompt
            destination={travelData?.destination}
            onDismiss={() => setGuestPromptDismissed(true)}
          />
        ) : null}
      </Box>
    );
  }

  return (
    <Box sx={{ pt: { xs: 5, sm: 8 }, pb: { xs: 5, sm: 8 } }}>
      <Box sx={{ mx: 'auto', maxWidth: 1320, px: { xs: 2, sm: 3 } }}>
        {phase === 'error' && error ? (
          <Box
            sx={{
              mx: 'auto',
              mb: 3,
              display: 'flex',
              maxWidth: 768,
              alignItems: 'flex-start',
              gap: 1.5,
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: (t) => alpha('#dc2626', 0.3),
              bgcolor: (t) => alpha('#dc2626', 0.1),
              p: 2,
            }}
          >
            <Box component={AlertTriangle} aria-hidden sx={{ mt: 0.25, width: 16, height: 16, flexShrink: 0, color: '#dc2626' }} />
            <Typography sx={{ fontSize: 14, color: '#dc2626' }}>{error}</Typography>
          </Box>
        ) : null}

        {tripGenDisabled && disabledReason ? (
          <Box
            role="status"
            sx={{
              mx: 'auto',
              mb: 3,
              maxWidth: 768,
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: (t) => alpha('#FF9500', 0.3),
              bgcolor: (t) => alpha('#FF9500', 0.1),
              p: 2,
              fontSize: 14,
              color: '#FF9500',
            }}
          >
            {disabledReason}
          </Box>
        ) : null}

        <Box
          ref={formRef}
          sx={{
            mx: 'auto',
            maxWidth: 1120,
            scrollMarginTop: '32px',
            ...(tripGenDisabled && { pointerEvents: 'none', opacity: 0.6 }),
          }}
          aria-disabled={tripGenDisabled ? true : undefined}
        >
          <TripInputForm
            onSubmit={handleGenerate}
            isLoading={isLoading || Boolean(tripGenDisabled)}
            defaultDestination={prefillDestination}
            defaultStartDate={prefillStartDate}
            defaultDays={prefillDays}
            prefillNonce={prefillNonce}
          />
        </Box>
      </Box>

      <Box sx={{ mt: { xs: 5, sm: 7 } }}>
        <Typography
          variant="overline"
          sx={{
            display: 'block',
            textAlign: 'center',
            color: 'text.secondary',
            mb: 2.5,
          }}
        >
          Or start from a popular trip
        </Typography>
        <PopularCitiesRow onSelect={handlePrefill} />
      </Box>

      {phase === 'awaiting_clarification' && clarificationQuestion ? (
        <ClarificationDialog
          question={clarificationQuestion}
          onAnswer={handleAnswer}
          onCancel={reset}
        />
      ) : null}
    </Box>
  );
}

export default function TripPage() {
  return (
    <Suspense>
      <TripPageInner />
    </Suspense>
  );
}
