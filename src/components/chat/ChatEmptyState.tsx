'use client';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import { CloudSun, Route, Sparkles, Stethoscope, Utensils, Wallet, Wand2, type LucideIcon } from 'lucide-react';
import { useActiveTrip } from '@/contexts';
import { useTripDetail } from '@/hooks/useTripDetail';
import { useTripInsights } from '@/hooks/useTripInsights';
import { minTap, radii } from '@/theme/standards';
import { QuickActions } from './QuickActions';
import { Eyebrow } from './cards/CardShell';
import { TripInsightsList } from './cards/TripInsightsCard';

interface Capability {
  icon: LucideIcon;
  title: string;
  body: string;
  prompt: string;
}

const TRIP_CAPABILITIES: Capability[] = [
  { icon: Wand2, title: 'Rebalance my days', body: 'Even out busy and empty days', prompt: 'Rebalance my days so none feel too packed.' },
  { icon: CloudSun, title: 'Check the weather', body: 'Forecast for your trip dates', prompt: "What's the weather looking like for my trip?" },
  { icon: Wallet, title: 'Estimate costs', body: 'Activity spend per day', prompt: 'Estimate the activity costs for my trip.' },
  { icon: Utensils, title: 'Find food nearby', body: 'Restaurants near your stops', prompt: 'Suggest restaurants near my stops on day 1.' },
  { icon: Route, title: 'Walking route', body: 'Distances between stops', prompt: 'How far apart are the stops on day 1? Is it walkable?' },
];

interface Props {
  tripId?: string | null;
  city?: string | null;
  onPick: (prompt: string) => void;
  disabled?: boolean;
}

/**
 * Personalized chat empty state. With an active trip: "Planning X · N days",
 * capability cards, and the model-free trip check-up with "Fix it". Without
 * one: a greeting plus city quick-starters.
 */
export function ChatEmptyState({ tripId, city, onPick, disabled }: Props) {
  const { activeTripSummary } = useActiveTrip();
  // The conversation resolves the trip (entry context → active trip) and
  // drops it when the user removes the trip chip.
  const effectiveTripId = tripId ?? null;
  const summaryMatches = activeTripSummary && activeTripSummary.id === effectiveTripId;
  const { tripData } = useTripDetail(summaryMatches ? null : effectiveTripId);
  const insights = useTripInsights(effectiveTripId);

  const destination = summaryMatches
    ? activeTripSummary!.destinationDisplay || activeTripSummary!.destination
    : tripData?.destination;
  const days = summaryMatches
    ? activeTripSummary!.plannedDayCount
    : (tripData?.travel_plan?.length ?? tripData?.total_trip_days);
  const topInsights = (insights.data ?? []).slice(0, 3);

  if (!effectiveTripId) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5, textAlign: 'center', width: '100%' }}>
        <Box
          component="span"
          sx={(t) => ({
            display: 'inline-flex',
            width: 48,
            height: 48,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 999,
            bgcolor: alpha(t.palette.primary.main, 0.12),
            color: t.palette.primary.main,
          })}
        >
          <Sparkles size={24} aria-hidden />
        </Box>
        <Box>
          <Box component="h2" sx={{ m: 0, fontSize: 24, fontWeight: 600, color: 'text.primary' }}>
            Ask me anything about travel
          </Box>
          <Box component="p" sx={{ m: 0, mt: 0.5, fontSize: 16, color: 'text.secondary' }}>
            {city ? `Quick starters for ${city}.` : 'Pick a city to unlock more suggestions.'}
          </Box>
        </Box>
        <QuickActions city={city} hasActiveTrip={false} onPick={onPick} disabled={disabled} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, width: '100%' }}>
      <Box>
        <Eyebrow icon={Sparkles}>
          {destination ? `Planning ${destination}${days ? ` · ${days} ${days === 1 ? 'day' : 'days'}` : ''}` : 'Your trip'}
        </Eyebrow>
        <Box component="h2" sx={{ m: 0, mt: 0.5, fontSize: 24, fontWeight: 600, lineHeight: 1.25, color: 'text.primary' }}>
          How can I help with your trip?
        </Box>
      </Box>

      <Box
        component="ul"
        aria-label="Things I can do"
        sx={{
          listStyle: 'none',
          m: 0,
          p: 0,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
          gap: 1,
        }}
      >
        {TRIP_CAPABILITIES.map((c) => {
          const Icon = c.icon;
          return (
            <Box component="li" key={c.title} sx={{ display: 'flex' }}>
              <Box
                component="button"
                type="button"
                disabled={disabled}
                onClick={() => onPick(c.prompt)}
                sx={(t) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  width: '100%',
                  minHeight: minTap + 12,
                  px: 1.5,
                  py: 1.25,
                  textAlign: 'left',
                  borderRadius: radii.card,
                  border: 1,
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  color: 'text.primary',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, background-color 0.15s',
                  '&:hover:not(:disabled)': { borderColor: alpha(t.palette.primary.main, 0.4), bgcolor: alpha(t.palette.primary.main, 0.04) },
                  '&:focus-visible': { outline: `2px solid ${t.palette.primary.main}`, outlineOffset: 2 },
                  '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
                })}
              >
                <Box
                  component="span"
                  sx={(t) => ({
                    display: 'inline-flex',
                    flexShrink: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    bgcolor: alpha(t.palette.primary.main, 0.1),
                    color: 'primary.main',
                  })}
                >
                  <Icon size={18} aria-hidden />
                </Box>
                <Box component="span" sx={{ minWidth: 0 }}>
                  <Box component="span" sx={{ display: 'block', fontSize: 14, fontWeight: 600 }}>
                    {c.title}
                  </Box>
                  <Box component="span" sx={{ display: 'block', fontSize: 13, color: 'text.secondary' }}>
                    {c.body}
                  </Box>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>

      {topInsights.length ? (
        <Box component="section" aria-label="Trip check-up">
          <Box sx={{ mb: 1 }}>
            <Eyebrow icon={Stethoscope}>Trip check-up</Eyebrow>
          </Box>
          <TripInsightsList insights={topInsights} onFix={onPick} disabled={disabled} />
        </Box>
      ) : null}
    </Box>
  );
}
