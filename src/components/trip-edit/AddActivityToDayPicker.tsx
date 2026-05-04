'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { Search } from 'lucide-react';
import type { TravelActivity } from '@/types';
import type { FeedItem } from '@/hooks/useHomeFeed';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ActivityCard } from '@/components/trip/ActivityCard';
import { CategoryChips } from '@/components/home/CategoryChips';
import { FeedCard, cardId } from '@/components/home/FeedCard';
import { useTripPickerFeed } from '@/hooks/useTripPickerFeed';
import { feedItemToTravelActivity } from '@/lib/feed/feedItemToActivity';
import { emitSignal } from '@/hooks/useSignals';

interface Props {
  destination: string;
  legacyPool: TravelActivity[];
  excludeIds: Set<string>;
  dayNumber: number | null;
  photoMap?: Record<string, string>;
  onClose: () => void;
  onSelectFromTripPool: (activity: TravelActivity) => void;
  onSelectFromCity: (activity: TravelActivity) => void;
}

const HIDDEN_CHIPS = ['happening_now'] as const;

export function AddActivityToDayPicker({
  destination,
  legacyPool,
  excludeIds,
  dayNumber,
  photoMap,
  onClose,
  onSelectFromTripPool,
  onSelectFromCity,
}: Props) {
  const open = dayNumber !== null;
  const city = useMemo(
    () => destination.split(',')[0]?.trim() ?? destination,
    [destination],
  );
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 200);
    return () => clearTimeout(t);
  }, [search]);

  // Reset filter state when sheet closes.
  useEffect(() => {
    if (!open) {
      setActiveCategory(null);
      setSearch('');
      setDebouncedSearch('');
    }
  }, [open]);

  const { items, isLoading, hasMore, isPending, loadMore } = useTripPickerFeed({
    city,
    activeCategory,
    excludeIds,
  });

  // Infinite scroll: when the sentinel below the grid intersects the Sheet's
  // own scroll container (or the viewport for tiny windows where the Sheet
  // is full-height), pull the next page.
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || isPending) return;
    // The Sheet wraps its body in a Box with `data-sheet-scroll="true"`. Use
    // that as the IntersectionObserver root so scrolling *inside* the sheet
    // (not the page) triggers loads. Fall back to viewport if not found.
    const root =
      (el.closest('[data-sheet-scroll]') as HTMLElement | null) ?? null;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          loadMore();
        }
      },
      { root, rootMargin: '400px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, isPending, loadMore, items.length]);

  const filteredLegacy = useMemo(
    () => filterLegacy(legacyPool, activeCategory, debouncedSearch),
    [legacyPool, activeCategory, debouncedSearch],
  );

  const filteredFeed = useMemo(
    () => filterFeed(items, debouncedSearch),
    [items, debouncedSearch],
  );

  const handleCardClick = (item: FeedItem) => {
    if (dayNumber == null) return;
    const activity = feedItemToTravelActivity(item);
    if (!activity) return;
    void emitSignal({
      signal_type: 'add_to_trip',
      entity_id: cardId(item),
      entity_type: item.entity_type as 'activity' | 'exploration' | 'viator',
      screen: 'add_to_trip',
    });
    onSelectFromCity(activity);
    onClose();
  };

  const handleLegacyClick = (activity: TravelActivity) => {
    if (dayNumber == null) return;
    onSelectFromTripPool(activity);
    onClose();
  };

  const showLegacy = filteredLegacy.length > 0;
  const isInitialLoading = (isLoading || isPending) && filteredFeed.length === 0;
  const showFeedEmpty = !isInitialLoading && filteredFeed.length === 0 && !hasMore;

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
      side="right"
      size="lg"
      title={dayNumber != null ? `Add to Day ${dayNumber}` : 'Add activity'}
      description={`Browse activities in ${city}`}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ px: { xs: 2, sm: 2.5 }, pt: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 999,
              px: 1.75,
              py: 0.75,
              bgcolor: 'background.paper',
              '&:focus-within': { borderColor: 'primary.main' },
            }}
          >
            <Search size={16} aria-hidden style={{ color: 'var(--mui-palette-text-secondary)' }} />
            <InputBase
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search activities in ${city}…`}
              sx={{ fontSize: 14 }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 5,
            mt: 1.5,
            px: { xs: 2, sm: 2.5 },
            py: 1,
            bgcolor: (t) => alpha(t.palette.background.paper, 0.92),
            borderBottom: '1px solid',
            borderColor: 'divider',
            backdropFilter: 'blur(12px)',
          }}
        >
          <CategoryChips
            city={city}
            active={activeCategory}
            onChange={setActiveCategory}
            hideCategories={HIDDEN_CHIPS}
          />
        </Box>

        <Box sx={{ p: { xs: 2, sm: 2.5 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {showLegacy ? (
            <Box>
              <SectionHeader
                title="In your trip"
                hint={`${filteredLegacy.length} not yet placed on a day`}
              />
              <Box
                sx={{
                  display: 'grid',
                  gap: 1.5,
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                  },
                }}
              >
                {filteredLegacy.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    photoMap={photoMap}
                    onClick={() => handleLegacyClick(activity)}
                  />
                ))}
              </Box>
            </Box>
          ) : null}

          <Box>
            <SectionHeader
              title={`Discover more in ${city}`}
              hint={
                activeCategory
                  ? `Showing ${activeCategory.replaceAll('_', ' ')}`
                  : 'A mix across categories'
              }
            />

            {isInitialLoading ? (
              <Box
                sx={{
                  display: 'grid',
                  gap: 1.5,
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                }}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    height={180}
                    style={{ width: '100%', borderRadius: 12 }}
                  />
                ))}
              </Box>
            ) : showFeedEmpty ? (
              <EmptyState
                hasFilters={!!activeCategory || !!debouncedSearch}
                onClear={() => {
                  setActiveCategory(null);
                  setSearch('');
                }}
              />
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gap: 1.5,
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                }}
              >
                {filteredFeed.map((item) => (
                  <FeedCard
                    key={cardId(item)}
                    item={item}
                    variant="grid"
                    onClick={() => handleCardClick(item)}
                  />
                ))}
              </Box>
            )}

            {hasMore && isPending && filteredFeed.length > 0 ? (
              <Box
                sx={{
                  mt: 1.5,
                  display: 'grid',
                  gap: 1.5,
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                }}
              >
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    height={180}
                    style={{ width: '100%', borderRadius: 12 }}
                  />
                ))}
              </Box>
            ) : null}

            {hasMore ? (
              <Box ref={sentinelRef} aria-hidden sx={{ height: 1 }} />
            ) : null}

            {!hasMore && filteredFeed.length > 0 && !isLoading ? (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                  You&rsquo;ve seen everything in {city}.
                </Typography>
              </Box>
            ) : null}
          </Box>
        </Box>
      </Box>
    </Sheet>
  );
}

function SectionHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1 }}>
      <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{title}</Typography>
      {hint ? (
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{hint}</Typography>
      ) : null}
    </Box>
  );
}

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <Box
      sx={{
        py: 5,
        px: 2,
        textAlign: 'center',
        borderRadius: 2,
        border: '1px dashed',
        borderColor: 'divider',
      }}
    >
      <Typography sx={{ fontSize: 14, color: 'text.secondary', mb: hasFilters ? 1.5 : 0 }}>
        {hasFilters
          ? 'No activities match these filters.'
          : 'No activities found for this destination.'}
      </Typography>
      {hasFilters ? (
        <Button variant="secondary" onClick={onClear} size="sm">
          Clear filters
        </Button>
      ) : null}
    </Box>
  );
}

function filterLegacy(
  pool: TravelActivity[],
  activeCategory: string | null,
  search: string,
): TravelActivity[] {
  const target = activeCategory?.toLowerCase();
  return pool.filter((a) => {
    if (target) {
      const cats = [
        ...(a.primary_categories ?? []),
        ...(a.category ?? []),
      ].map((c) => c.toLowerCase());
      if (!cats.includes(target)) return false;
    }
    if (search) {
      const haystack = `${a.name ?? ''} ${a.description ?? ''}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}

function filterFeed(items: FeedItem[], search: string): FeedItem[] {
  if (!search) return items;
  return items.filter((it) => {
    const inner = it.item ?? {};
    const title = (inner.title as string | undefined) ?? (inner.name as string | undefined) ?? '';
    const desc = (inner.description as string | undefined) ?? '';
    return `${title} ${desc}`.toLowerCase().includes(search);
  });
}
