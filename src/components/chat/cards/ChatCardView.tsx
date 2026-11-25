'use client';

/**
 * Card registry — renders a protocol-v2 `card` by kind.
 *
 * Contract (tripgen_backend/agents/chat_cards.py): unknown kinds, a newer
 * schema_v, `data_omitted`, or a malformed payload render the card's
 * fallback_text as a quiet note — a card must never crash the transcript.
 */

import { Component, memo, type ReactNode } from 'react';
import { CHAT_CARD_SCHEMA_V, type ChatCard } from '@/lib/chat/protocol';
import type {
  BookingLink,
  DayPlanItem,
  PlaceItem,
  RouteLeg,
  SourceItem,
  TripInsight,
  WeatherDay,
} from '@/lib/chat/protocol';
import { useChatRender } from '../ChatRenderContext';
import { FallbackNote } from './CardShell';
import { PlaceListCard } from './PlaceListCard';
import { TripInsightsCard } from './TripInsightsCard';
import {
  BookingLinksCard,
  CostSummaryCard,
  DayPlanCard,
  RouteCard,
  SourcesCard,
  TripSummaryCard,
  WeatherCard,
} from './InfoCards';

const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const s = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined);
const n = (v: unknown): number | undefined => (typeof v === 'number' ? v : undefined);
const obj = (v: unknown): Record<string, number> =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, number>) : {};

/** Malformed data that slips past the guards falls back instead of blanking the chat. */
class CardBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function CardBody({ card }: { card: ChatCard }) {
  const { city, sendPrompt, busy } = useChatRender();
  const d = card.data ?? {};
  const fallback = <FallbackNote text={card.fallbackText} />;

  if (card.schemaV > CHAT_CARD_SCHEMA_V || d.data_omitted) return fallback;

  switch (card.kind) {
    case 'place_list': {
      const items = arr<PlaceItem>(d.items).filter((i) => i && typeof i.name === 'string');
      return items.length ? (
        <PlaceListCard title={s(d.title) ?? 'Places'} items={items} truncated={d.truncated === true} city={city} />
      ) : fallback;
    }
    case 'weather': {
      const days = arr<WeatherDay>(d.days);
      return days.length ? (
        <WeatherCard
          location={s(d.location) ?? ''}
          current={d.current as { temp_c?: number; condition?: string; condition_text?: string } | null}
          days={days}
        />
      ) : fallback;
    }
    case 'day_plan': {
      const items = arr<DayPlanItem>(d.items);
      const tripId = s(d.trip_id);
      return items.length && tripId ? (
        <DayPlanCard tripId={tripId} dayNumber={n(d.day_number)} date={s(d.date)} items={items} />
      ) : fallback;
    }
    case 'trip_summary': {
      const tripId = s(d.trip_id);
      return tripId ? (
        <TripSummaryCard
          tripId={tripId}
          destination={s(d.destination)}
          startDate={s(d.start_date)}
          endDate={s(d.end_date)}
          dayCount={n(d.day_count)}
          activityCount={n(d.activity_count)}
          restaurantCount={n(d.restaurant_count)}
          coverUrl={s(d.cover_url)}
        />
      ) : fallback;
    }
    case 'cost_summary':
      return typeof d.total === 'number' ? (
        <CostSummaryCard
          currency={s(d.currency)}
          total={d.total}
          perDay={arr<{ day_number: number; amount: number }>(d.per_day)}
          byCategory={obj(d.by_category)}
          unpricedCount={n(d.unpriced_count)}
          confidence={s(d.confidence)}
        />
      ) : fallback;
    case 'route': {
      const legs = arr<RouteLeg>(d.legs);
      return legs.length ? (
        <RouteCard dayNumber={n(d.day_number)} legs={legs} totalKm={n(d.total_km)} straightLine={d.straight_line === true} />
      ) : fallback;
    }
    case 'sources':
      return <SourcesCard sources={arr<SourceItem>(d.sources)} />;
    case 'trip_insights':
      return <TripInsightsCard insights={arr<TripInsight>(d.insights)} onFix={sendPrompt} disabled={busy} />;
    case 'booking_links': {
      const items = arr<BookingLink>(d.items);
      return items.length ? <BookingLinksCard destination={s(d.destination)} items={items} /> : fallback;
    }
    default:
      return fallback;
  }
}

export const ChatCardView = memo(function ChatCardView({ card }: { card: ChatCard }) {
  return (
    <CardBoundary fallback={<FallbackNote text={card.fallbackText} />}>
      <CardBody card={card} />
    </CardBoundary>
  );
});
