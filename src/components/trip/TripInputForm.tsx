'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { alpha, type Theme } from '@mui/material/styles';
import {
  Sparkles,
  Calendar,
  Wallet,
  Compass,
  Users,
  Battery,
  Heart,
  Layers,
  Shuffle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { GenerateParams } from '@/hooks/useTripGeneration';
import { useDestinationsAutocomplete } from '@/hooks/useDestinationsAutocomplete';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { destinations } from '@/data/destinations';
import { loadCities, type CityEntry } from '@/lib/cities/cityIndex';
import type { DestinationListItem } from '@/types';
import { tgShadow } from '@/theme/shadows';
import { MODE_GUIDANCE } from '@/constants/planModes';

const ACTIVITY_TYPES = [
  { value: 'cultural', label: 'Cultural' },
  { value: 'food', label: 'Food' },
  { value: 'nature', label: 'Nature' },
  { value: 'art', label: 'Art' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'nightlife', label: 'Nightlife' },
  { value: 'relaxation', label: 'Relaxation' },
  { value: 'local_experiences', label: 'Local' },
];
const INTERESTS_VISIBLE_BY_DEFAULT = 4;

const BUDGET_OPTIONS = [
  { value: 'budget', label: 'Budget' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'luxury', label: 'Luxury' },
];

const VIBE_TAGS = [
  { value: 'adventurous', label: 'Adventurous' },
  { value: 'relaxing', label: 'Relaxing' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'foodie', label: 'Foodie' },
  { value: 'romantic', label: 'Romantic' },
  { value: 'family', label: 'Family' },
  { value: 'party', label: 'Party' },
  { value: 'off_beat', label: 'Off-beat' },
];

const ENERGY_LEVELS = [
  { value: 'packed', label: 'Packed', hint: 'See it all' },
  { value: 'moderate', label: 'Balanced', hint: 'Mix it up' },
  { value: 'relaxed', label: 'Relaxed', hint: 'Slow pace' },
];

const WHO_OPTIONS = [
  { value: 'solo', label: 'Solo' },
  { value: 'couple', label: 'Couple' },
  { value: 'family', label: 'Family' },
  { value: 'friends', label: 'Friends' },
];

const PLAN_MODES = [
  { value: 'balanced', label: 'Balanced' },
  { value: 'exploration', label: 'Exploration' },
  { value: 'activities', label: 'Activities' },
  { value: 'foodie', label: 'Foodie' },
  { value: 'for_you', label: 'For you' },
  { value: 'custom', label: 'Custom' },
];

const GEOLOCATION_TIMEOUT_MS = 8_000;
const GEOLOCATION_MAX_AGE_MS = 10 * 60 * 1000;
const POPULAR_FALLBACK_SLUGS = [
  'paris-5-days',
  'new-york-5-days',
  'tokyo-7-days',
  'rome-4-days',
  'london-4-days',
  'barcelona-4-days',
];

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Props {
  onSubmit: (params: GenerateParams) => void;
  isLoading: boolean;
  defaultDestination?: string;
  defaultStartDate?: string;
  defaultDays?: number;
  /** When this nonce changes, destination/start date/days reset from props (used by Popular trips prefill). */
  prefillNonce?: number;
  /** Render the in-form Sparkles + "Build your next trip" heading. Defaults to true. */
  showHeading?: boolean;
}

interface SectionHeadingProps {
  icon: ReactNode;
  children: ReactNode;
  action?: ReactNode;
}

function SectionHeading({ icon, children, action }: SectionHeadingProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'text.primary',
        }}
      >
        <Box component="span" sx={{ display: 'inline-flex', color: 'primary.main' }}>
          {icon}
        </Box>
        {children}
      </Box>
      {action}
    </Box>
  );
}

const pillChipSx = (selected: boolean) => ({
  display: 'inline-flex',
  height: 36,
  alignItems: 'center',
  borderRadius: 999,
  px: 2,
  fontSize: '0.875rem',
  fontWeight: 500,
  transition: 'all 0.2s ease',
  ...(selected
    ? {
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        border: '1px solid',
        borderColor: 'primary.main',
      }
    : {
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        color: 'text.secondary',
        '&:hover': { color: 'text.primary' },
      }),
});

function formatDestination(city: Pick<CityEntry, 'n' | 'c'>): string {
  return city.c ? `${city.n}, ${city.c}` : city.n;
}

function pickPopularFallbackDestination(): string {
  const pick =
    POPULAR_FALLBACK_SLUGS
      .map((slug) => destinations.find((d) => d.slug === slug))
      .find((d): d is NonNullable<typeof d> => Boolean(d)) ?? destinations[0];

  return pick ? `${pick.city}, ${pick.country}` : 'Paris, France';
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function distanceKm(a: Coordinates, city: CityEntry): number {
  const cityLat = city.a;
  const cityLng = city.o;
  if (!Number.isFinite(cityLat) || !Number.isFinite(cityLng)) return Infinity;

  const earthRadiusKm = 6371;
  const dLat = toRadians(cityLat - a.latitude);
  const dLng = toRadians(cityLng - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(cityLat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}

function pickNearestCity(coords: Coordinates, cities: CityEntry[]): CityEntry | null {
  let best: CityEntry | null = null;
  let bestScore = Infinity;

  for (const city of cities) {
    const distance = distanceKm(coords, city);
    if (!Number.isFinite(distance)) continue;

    // Favor the nearest city, with a small nudge toward more recognizable cities.
    const score = distance - (city.t ?? 0) * 1.5;
    if (score < bestScore) {
      best = city;
      bestScore = score;
    }
  }

  return best;
}

function getCurrentCoordinates(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (
      typeof window === 'undefined' ||
      typeof navigator === 'undefined' ||
      !navigator.geolocation
    ) {
      reject(new Error('geolocation-unavailable'));
      return;
    }

    let settled = false;
    const timeoutId = window.setTimeout(() => {
      settled = true;
      reject(new Error('geolocation-timeout'));
    }, GEOLOCATION_TIMEOUT_MS);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeoutId);
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeoutId);
        reject(error);
      },
      {
        enableHighAccuracy: false,
        maximumAge: GEOLOCATION_MAX_AGE_MS,
        timeout: GEOLOCATION_TIMEOUT_MS,
      },
    );
  });
}

async function detectCurrentLocationDestination(): Promise<string | null> {
  const coords = await getCurrentCoordinates();
  const cities = await loadCities();
  const nearest = pickNearestCity(coords, cities);
  return nearest ? formatDestination(nearest) : null;
}

export function TripInputForm({
  onSubmit,
  isLoading,
  defaultDestination,
  defaultStartDate,
  defaultDays,
  prefillNonce,
  showHeading = true,
}: Props) {
  const [destination, setDestination] = useState(defaultDestination ?? '');
  const destinationRef = useRef(defaultDestination ?? '');
  const destinationTouchedRef = useRef(false);
  const autoPrefillStartedRef = useRef(false);
  const [startDate, setStartDate] = useState(defaultStartDate ?? '');
  const [numberOfDays, setNumberOfDays] = useState(defaultDays ?? 3);
  const [budget, setBudget] = useState('moderate');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showAllInterests, setShowAllInterests] = useState(false);

  const [vibeTags, setVibeTags] = useState<string[]>([]);
  const [energyLevel, setEnergyLevel] = useState('moderate');
  const [who, setWho] = useState('');
  const [planMode, setPlanMode] = useState('balanced');
  const [surpriseMe, setSurpriseMe] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState(MODE_GUIDANCE.balanced);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const lastRandomSlugRef = useRef<string | null>(null);
  const lastGuidanceRef = useRef<string>(MODE_GUIDANCE.balanced);
  const setDestinationValue = useCallback((next: string) => {
    destinationRef.current = next;
    setDestination(next);
  }, []);
  const setDestinationFromUser = useCallback(
    (next: string) => {
      destinationTouchedRef.current = true;
      setDestinationValue(next);
    },
    [setDestinationValue],
  );

  useEffect(() => {
    destinationRef.current = destination;
  }, [destination]);

  useEffect(() => {
    const next = planMode ? MODE_GUIDANCE[planMode] ?? '' : '';
    setAdditionalInfo((current) =>
      current === '' || current === lastGuidanceRef.current ? next : current,
    );
    lastGuidanceRef.current = next;
  }, [planMode]);

  const [destinationDebounced, setDestinationDebounced] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDestinationDebounced(destination.trim()), 250);
    return () => clearTimeout(t);
  }, [destination]);
  const { data: autocompleteData, isLoading: autocompleteLoading } =
    useDestinationsAutocomplete(destinationDebounced);
  const destinationOptions: DestinationListItem[] = autocompleteData?.results ?? [];

  useEffect(() => {
    if (prefillNonce === undefined) return;
    if (defaultDestination !== undefined) setDestinationValue(defaultDestination);
    if (defaultStartDate !== undefined) setStartDate(defaultStartDate);
    if (defaultDays !== undefined) setNumberOfDays(defaultDays);
  }, [prefillNonce, defaultDestination, defaultStartDate, defaultDays, setDestinationValue]);

  useEffect(() => {
    if (autoPrefillStartedRef.current) return;
    if ((defaultDestination ?? '').trim() || destinationRef.current.trim()) return;

    autoPrefillStartedRef.current = true;
    let cancelled = false;

    const canApplyAutoPrefill = () =>
      !cancelled && !destinationTouchedRef.current && !destinationRef.current.trim();

    const applyFallback = () => {
      if (canApplyAutoPrefill()) setDestinationValue(pickPopularFallbackDestination());
    };

    void detectCurrentLocationDestination()
      .then((detectedDestination) => {
        if (!detectedDestination) {
          applyFallback();
          return;
        }
        if (canApplyAutoPrefill()) setDestinationValue(detectedDestination);
      })
      .catch(applyFallback);

    return () => {
      cancelled = true;
    };
  }, [defaultDestination, setDestinationValue]);

  const toggleIn = (set: React.Dispatch<React.SetStateAction<string[]>>, v: string) =>
    set((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));

  const pickRandomDestination = () => {
    if (destinations.length === 0) return;
    const pool =
      destinations.length > 1
        ? destinations.filter((d) => d.slug !== lastRandomSlugRef.current)
        : destinations;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    lastRandomSlugRef.current = pick.slug;
    setDestinationFromUser(`${pick.city}, ${pick.country}`);
  };

  const canSubmit = !!destination.trim();

  const submit = () => {
    if (!canSubmit) return;
    onSubmit({
      destination: destination.trim(),
      startDate: startDate || undefined,
      numberOfDays,
      budget,
      preferredActivityTypes: selectedTypes.length > 0 ? selectedTypes : undefined,
      additionalInfo: additionalInfo.trim() || undefined,
      vibeTags: vibeTags.length > 0 ? vibeTags : undefined,
      energyLevel: energyLevel || undefined,
      who: who || undefined,
      planMode: planMode || undefined,
      surpriseMe: surpriseMe || undefined,
    });
  };

  return (
    <Box
      component="form"
      onSubmit={(e: React.FormEvent) => {
        e.preventDefault();
        submit();
      }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        borderRadius: 3,
        border: 'none',
        bgcolor: 'background.paper',
        boxShadow: (t) => tgShadow(t, 'cardHover'),
        p: { xs: 3, sm: 4 },
      }}
    >
      {showHeading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 999,
                bgcolor: (t: Theme) => alpha(t.palette.primary.main, 0.12),
                color: 'primary.main',
              }}
              aria-hidden
            >
              <Sparkles size={20} />
            </Box>
            <Typography
              component="h1"
              sx={{
                m: 0,
                fontSize: { xs: 22, sm: 26 },
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: 'text.primary',
              }}
            >
              Build your next trip
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
            Give the essentials — location, timing, and interests — and Periplo does the rest.
          </Typography>
        </Box>
      ) : null}

      <Autocomplete<DestinationListItem, false, false, true>
        freeSolo
        fullWidth
        autoHighlight
        clearOnBlur={false}
        selectOnFocus={false}
        inputValue={destination}
        onInputChange={(_, value, reason) => {
          if (reason !== 'reset') setDestinationFromUser(value);
        }}
        onChange={(_, value) => {
          if (!value) return;
          if (typeof value === 'string') {
            setDestinationFromUser(value);
            return;
          }
          const cityName = value.city || value.name || '';
          if (!cityName) return;
          setDestinationFromUser(value.country ? `${cityName}, ${value.country}` : cityName);
        }}
        options={destinationOptions}
        filterOptions={(opts) => opts}
        loading={autocompleteLoading && destinationDebounced.length >= 2}
        getOptionLabel={(opt) => {
          if (typeof opt === 'string') return opt;
          const cityName = opt.city || opt.name || '';
          return opt.country ? `${cityName}, ${opt.country}` : cityName;
        }}
        isOptionEqualToValue={(opt, val) => {
          if (typeof opt === 'string' || typeof val === 'string') return false;
          return (opt.city || opt.name) === (val.city || val.name) && opt.country === val.country;
        }}
        renderOption={(props, opt) => {
          const cityName = opt.city || opt.name || '';
          return (
            <Box
              component="li"
              {...props}
              key={`${cityName}-${opt.country ?? ''}`}
              sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}
            >
              <Box component="span" sx={{ fontWeight: 500, color: 'text.primary' }}>
                {cityName}
              </Box>
              {opt.country ? (
                <Box component="span" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                  {opt.country}
                </Box>
              ) : null}
            </Box>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            id="destination"
            label="Destination"
            placeholder="e.g. Kyoto, Japan"
            required
            autoFocus
            InputLabelProps={{ shrink: true }}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {params.InputProps.endAdornment}
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={pickRandomDestination}
                      aria-label="Pick a random destination"
                      size="small"
                    >
                      <Shuffle size={18} />
                    </IconButton>
                  </InputAdornment>
                </>
              ),
            }}
          />
        )}
      />

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
        }}
      >
        <TextField
          id="startDate"
          label="Start date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Box component="span" sx={{ display: 'inline-flex', color: 'text.disabled' }}>
                  <Calendar size={18} aria-hidden />
                </Box>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          id="days"
          label="Number of days"
          select
          value={numberOfDays}
          onChange={(e) => setNumberOfDays(Number(e.target.value))}
          fullWidth
          InputLabelProps={{ shrink: true }}
        >
          {Array.from({ length: 14 }, (_, i) => i + 1).map((n) => (
            <MenuItem key={n} value={n}>
              {n} {n === 1 ? 'day' : 'days'}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <SectionHeading
          icon={<Heart size={14} aria-hidden />}
          action={
            ACTIVITY_TYPES.length > INTERESTS_VISIBLE_BY_DEFAULT ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAllInterests((v) => !v)}
                iconRight={
                  showAllInterests ? (
                    <ChevronUp size={14} aria-hidden />
                  ) : (
                    <ChevronDown size={14} aria-hidden />
                  )
                }
              >
                {showAllInterests ? 'Show less' : 'Show more'}
              </Button>
            ) : undefined
          }
        >
          Interests
        </SectionHeading>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {(showAllInterests ? ACTIVITY_TYPES : ACTIVITY_TYPES.slice(0, INTERESTS_VISIBLE_BY_DEFAULT)).map((t) => {
            const on = selectedTypes.includes(t.value);
            return (
              <ButtonBase
                key={t.value}
                type="button"
                onClick={() => toggleIn(setSelectedTypes, t.value)}
                sx={pillChipSx(on)}
              >
                {t.label}
              </ButtonBase>
            );
          })}
        </Box>
      </Box>

      <Box>
        <Button
          type="button"
          variant="ghost"
          size="md"
          fullWidth
          onClick={() => setAdvancedOpen((v) => !v)}
          iconRight={
            advancedOpen ? (
              <ChevronUp size={16} aria-hidden />
            ) : (
              <ChevronDown size={16} aria-hidden />
            )
          }
          aria-expanded={advancedOpen}
        >
          {advancedOpen ? 'Hide additional options' : 'Show additional options'}
        </Button>
        <Collapse in={advancedOpen} unmountOnExit={false}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <SectionHeading icon={<Wallet size={14} aria-hidden />}>Budget</SectionHeading>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {BUDGET_OPTIONS.map((opt) => {
                  const on = budget === opt.value;
                  return (
                    <ButtonBase
                      key={opt.value}
                      type="button"
                      onClick={() => setBudget(opt.value)}
                      sx={pillChipSx(on)}
                    >
                      {opt.label}
                    </ButtonBase>
                  );
                })}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <SectionHeading icon={<Compass size={14} aria-hidden />}>
                What&apos;s the vibe?
              </SectionHeading>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {VIBE_TAGS.map((v) => {
                  const on = vibeTags.includes(v.value);
                  return (
                    <ButtonBase
                      key={v.value}
                      type="button"
                      onClick={() => toggleIn(setVibeTags, v.value)}
                      sx={pillChipSx(on)}
                    >
                      {v.label}
                    </ButtonBase>
                  );
                })}
              </Box>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gap: 3,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <SectionHeading icon={<Battery size={14} aria-hidden />}>Energy</SectionHeading>
                <Box sx={{ display: 'grid', gap: 1 }}>
                  {ENERGY_LEVELS.map((opt) => {
                    const on = energyLevel === opt.value;
                    return (
                      <ButtonBase
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setEnergyLevel(energyLevel === opt.value ? '' : opt.value)
                        }
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderRadius: 1.5,
                          border: '1px solid',
                          px: 2,
                          py: 1.25,
                          textAlign: 'left',
                          transition: 'border-color 0.2s ease, background-color 0.2s ease',
                          ...(on
                            ? {
                                borderColor: 'primary.main',
                                bgcolor: (t: Theme) => alpha(t.palette.primary.main, 0.12),
                              }
                            : {
                                borderColor: 'divider',
                                bgcolor: 'background.paper',
                                '&:hover': {
                                  borderColor: (t: Theme) =>
                                    alpha(t.palette.primary.main, 0.32),
                                },
                              }),
                        }}
                      >
                        <Box
                          component="span"
                          sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}
                        >
                          {opt.label}
                        </Box>
                        <Box component="span" sx={{ fontSize: '0.6875rem', color: 'text.disabled' }}>
                          {opt.hint}
                        </Box>
                      </ButtonBase>
                    );
                  })}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <SectionHeading icon={<Users size={14} aria-hidden />}>
                  Who&apos;s going
                </SectionHeading>
                <Box
                  sx={{
                    display: 'grid',
                    gap: 1,
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  }}
                >
                  {WHO_OPTIONS.map((opt) => {
                    const on = who === opt.value;
                    return (
                      <ButtonBase
                        key={opt.value}
                        type="button"
                        onClick={() => setWho(who === opt.value ? '' : opt.value)}
                        sx={{
                          borderRadius: 1.5,
                          border: '1px solid',
                          px: 1.5,
                          py: 1.25,
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          transition: 'all 0.2s ease',
                          ...(on
                            ? {
                                borderColor: 'primary.main',
                                bgcolor: (t: Theme) =>
                                  alpha(t.palette.primary.main, 0.12),
                                color: 'primary.main',
                              }
                            : {
                                borderColor: 'divider',
                                bgcolor: 'background.paper',
                                color: 'text.primary',
                                '&:hover': {
                                  borderColor: (t: Theme) =>
                                    alpha(t.palette.primary.main, 0.32),
                                },
                              }),
                        }}
                      >
                        {opt.label}
                      </ButtonBase>
                    );
                  })}
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <SectionHeading icon={<Layers size={14} aria-hidden />}>Plan style</SectionHeading>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {PLAN_MODES.map((opt) => {
                  const on = planMode === opt.value;
                  return (
                    <ButtonBase
                      key={opt.value}
                      type="button"
                      onClick={() => setPlanMode(on ? '' : opt.value)}
                      sx={pillChipSx(on)}
                    >
                      {opt.label}
                    </ButtonBase>
                  );
                })}
              </Box>
            </Box>

            <Box
              component="label"
              sx={{
                display: 'flex',
                cursor: 'pointer',
                alignItems: 'flex-start',
                gap: 1.5,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: (t: Theme) => alpha(t.palette.text.primary, 0.04),
                p: 2,
                '&:hover': {
                  borderColor: (t: Theme) => alpha(t.palette.primary.main, 0.32),
                },
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={surpriseMe}
                    onChange={(e) => setSurpriseMe(e.target.checked)}
                    size="small"
                    sx={{
                      p: 0,
                      color: 'divider',
                      '&.Mui-checked': { color: 'primary.main' },
                    }}
                  />
                }
                label={
                  <Box component="span" sx={{ fontSize: '0.875rem' }}>
                    <Box component="span" sx={{ fontWeight: 500, color: 'text.primary' }}>
                      Surprise me
                    </Box>
                    <Box
                      component="span"
                      sx={{ display: 'block', fontSize: '0.75rem', color: 'text.secondary' }}
                    >
                      Periplo picks the vibe — just tell us the city.
                    </Box>
                  </Box>
                }
                sx={{ m: 0, alignItems: 'flex-start', gap: 1.5, flex: 1 }}
              />
              {surpriseMe ? (
                <Box sx={{ ml: 'auto' }}>
                  <Badge tone="accent" size="sm">
                    On
                  </Badge>
                </Box>
              ) : null}
            </Box>

            <TextField
              id="additionalInfo"
              label="Anything else? (optional)"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Travelling with kids, prefer walking, want to see cherry blossoms…"
              helperText="This tells the AI what to focus on. Edit to refine your trip."
              multiline
              rows={4}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Collapse>
      </Box>

      <Button
        type="submit"
        disabled={isLoading || !canSubmit}
        loading={isLoading}
        iconLeft={<Sparkles size={16} />}
        size="lg"
        fullWidth
      >
        {isLoading ? 'Generating' : 'Generate itinerary'}
      </Button>
    </Box>
  );
}
