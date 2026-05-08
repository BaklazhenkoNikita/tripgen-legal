'use client';

import { useCallback, useId, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Map as MapIcon, Loader2 } from 'lucide-react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { Button } from '@/components/ui/Button';
import { tgShadow } from '@/theme/shadows';
import { useHomeFeed, type FeedItem } from '@/hooks/useHomeFeed';
import { useViatorFeed } from '@/hooks/useViatorFeed';
import { useDestinationInfo } from '@/hooks/useDestinationInfo';
import { useCategoryCounts } from '@/hooks/useCategoryCounts';
import { CategoryChips } from '@/components/home/CategoryChips';
import { FeedRow } from '@/components/home/FeedRow';
import { ViatorRow } from '@/components/home/ViatorRow';
import { FloatingMapShell } from '@/components/home/FloatingMapShell';
import { MapSheet } from '@/components/home/MapSheet';
import { cardId } from '@/components/home/FeedCard';
import { getLatLng } from '@/lib/geo/coords';
import { destinationSlug } from '@/lib/destinationSlug';
import { placeSlugWithId } from '@/lib/placeSlug';
import type { MapPinData } from '@/components/map/Map';
import { FeedItemDrawer } from '@/components/explore/FeedItemDrawer';
import { DestinationHero } from './DestinationHero';
import { CityOverviewIntro, CityOverviewDetails } from './CityOverview';
import { WeatherForecastStrip } from './WeatherForecastStrip';
import { CategorySection } from './CategorySection';

const breadcrumbLinkSx = {
  color: 'inherit',
  textDecoration: 'none',
  '&:hover': { color: 'text.primary' },
};

interface Props {
  city: string;
}

/** Live destination view: shared overlay hero (with About sheet) + sticky
 *  category chips, then category-filterable rows derived from the home feed
 *  payload — Must See, For You, Where to Eat, Happening Now, plus bookable
 *  tours. Right rail sticky map mirrors HomeShell. */
export function DestinationView({ city }: Props) {
  const router = useRouter();
  const { data: feed, isLoading } = useHomeFeed(city);
  const { data: viator } = useViatorFeed(city);
  const { data: info, isLoading: infoLoading } = useDestinationInfo(city);
  const { data: categoryData } = useCategoryCounts(city);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openItem, setOpenItem] = useState<FeedItem | null>(null);
  const [mapVisible, setMapVisible] = useState(false);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const overviewId = useId();

  const sections = useMemo(
    () => deriveSections(feed, (viator?.viator_activities ?? []) as FeedItem[], activeCategory),
    [feed, viator, activeCategory],
  );

  const forYouViatorIds = useMemo(
    () =>
      new Set(
        sections.forYou.filter((i) => i.entity_type === 'viator').map((i) => cardId(i)),
      ),
    [sections.forYou],
  );

  const categoryRows = useMemo(() => {
    const all = Object.entries(categoryData?.counts ?? {})
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
    return activeCategory
      ? all.filter((c) => c.toLowerCase() !== activeCategory.toLowerCase())
      : all;
  }, [categoryData, activeCategory]);

  const pins = useMemo<MapPinData[]>(() => extractPins(sections), [sections]);

  const itemById = useMemo(() => {
    const map = new Map<string, FeedItem>();
    for (const item of [
      ...sections.mustSee,
      ...sections.forYou,
      ...sections.eat,
      ...sections.events,
    ]) {
      map.set(cardId(item), item);
    }
    return map;
  }, [sections]);

  const handlePinClick = useCallback(
    (id: string) => {
      const item = itemById.get(id);
      if (!item) return;
      // Viator items have no stable activity id resolvable by the fullscreen
      // route's `useActivity` lookup, so we keep them in the drawer-only path.
      if (item.entity_type !== 'viator') {
        const title =
          (item.item.title as string | undefined) ??
          (item.item.name as string | undefined);
        const placeSlug = placeSlugWithId(title, cardId(item));
        const citySlug = destinationSlug(city);
        if (placeSlug && citySlug) {
          router.push(`/explore/${citySlug}/${placeSlug}`);
          return;
        }
      }
      setOpenItem(item);
    },
    [itemById, city, router],
  );

  const fallbackImage =
    (feed?.exploration?.[0]?.item?.images?.[0]?.url as string | undefined) ?? null;

  return (
    <Box
      sx={{
        position: 'relative',
        mx: 'auto',
        maxWidth: 1440,
        px: { xs: 2, sm: 3, lg: 4 },
        pb: 6,
        pt: 3,
      }}
    >
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box component="nav" sx={{ fontSize: 14, color: 'text.secondary' }}>
          <Box component={Link} href="/explore" sx={breadcrumbLinkSx}>
            Explore
          </Box>
          <Box component="span" sx={{ mx: 1 }}>/</Box>
          <Box component="span" sx={{ color: 'text.primary' }}>{city}</Box>
        </Box>
      </Box>

      <DestinationHero
        city={city}
        info={info}
        isLoading={infoLoading}
        fallbackImage={fallbackImage}
      />

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            md: 'minmax(0, 3fr) minmax(0, 2fr)',
          },
          alignItems: 'stretch',
          mt: 2.5,
        }}
      >
        <Box sx={{ minWidth: 0, display: 'flex', '& > *': { width: '100%' } }}>
          <CityOverviewIntro
            key={city}
            city={city}
            info={info}
            open={overviewOpen}
            onToggle={() => setOverviewOpen((v) => !v)}
            controlsId={overviewId}
            fill
          />
        </Box>

        <Box sx={{ minWidth: 0, display: 'flex', '& > *': { width: '100%' } }}>
          <WeatherForecastStrip location={city} />
        </Box>
      </Box>

      <Box sx={{ mt: 2.5 }}>
        <CityOverviewDetails
          key={`${city}-details`}
          city={city}
          info={info}
          open={overviewOpen}
          controlsId={overviewId}
        />
      </Box>

      {feed?.generating && !feed?.has_content ? (
        <Box
          sx={(t) => ({
            mt: 3,
            mb: -1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 1,
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: alpha(t.palette.primary.main, 0.06),
            color: 'text.secondary',
            fontSize: 13,
            '& .spin': { animation: 'destview-spin 1s linear infinite' },
            '@keyframes destview-spin': { to: { transform: 'rotate(360deg)' } },
          })}
        >
          <Box component="span" className="spin" sx={{ display: 'inline-flex' }} aria-hidden>
            <Loader2 size={14} />
          </Box>
          Building your {city} experience — this can take a few seconds.
        </Box>
      ) : null}

      <Box
        sx={{
          position: 'sticky',
          top: '4rem',
          zIndex: 10,
          mx: { xs: -2, sm: -3 },
          mb: 2.5,
          mt: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: (t) =>
            alpha(t.palette.background.default, t.palette.mode === 'dark' ? 0.7 : 0.85),
          px: { xs: 2, sm: 3 },
          py: 1.5,
          backdropFilter: 'blur(12px)',
        }}
      >
        <CategoryChips
          city={city}
          active={activeCategory}
          onChange={setActiveCategory}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 5,
          gridTemplateColumns: '1fr',
        }}
      >
        <Stack spacing={4} sx={{ minWidth: 0 }}>
          <FeedRow
            title={`Must See in ${city}`}
            items={sections.mustSee}
            isLoading={isLoading}
            isGenerating={feed?.generating}
            activeItemId={activeItemId}
            onHoverItem={setActiveItemId}
            onCardClick={setOpenItem}
            emptyTitle={`No must-see picks in ${city} yet`}
            emptyDescription="Try clearing the category filter or check back shortly."
            loadMore={{
              city,
              sources: [{ contentType: 'exploration', category: activeCategory ?? undefined }],
              aiAugmentable: false,
            }}
          />

          <FeedRow
            title="For You"
            items={sections.forYou}
            isLoading={isLoading}
            isGenerating={feed?.generating}
            activeItemId={activeItemId}
            onHoverItem={setActiveItemId}
            onCardClick={setOpenItem}
            emptyTitle="No personalised picks yet"
            loadMore={{
              city,
              sources: [
                { contentType: 'exploration', category: activeCategory ?? undefined },
                { contentType: 'activity', category: activeCategory ?? undefined },
                { contentType: 'viator', category: activeCategory ?? undefined },
              ],
              aiAugmentable: false,
            }}
          />

          {/* TODO: paginated /api/v4/restaurants endpoint — until then, restaurants
              come only from the home top-N batch and Load more is a no-op, so we
              omit it here. */}
          <FeedRow
            title="Where to Eat"
            items={sections.eat}
            isLoading={isLoading}
            isGenerating={feed?.generating}
            activeItemId={activeItemId}
            onHoverItem={setActiveItemId}
            onCardClick={setOpenItem}
            emptyTitle="No food picks yet"
          />

          <FeedRow
            title="Happening Now"
            items={sections.events}
            isLoading={isLoading}
            isGenerating={feed?.events_generating}
            activeItemId={activeItemId}
            onHoverItem={setActiveItemId}
            onCardClick={setOpenItem}
            emptyTitle="No upcoming events"
          />

          <ViatorRow
            city={city}
            activeItemId={activeItemId}
            onHoverItem={setActiveItemId}
            onCardClick={setOpenItem}
            hideWhenEmpty={false}
            excludeIds={forYouViatorIds}
          />

          {categoryRows.map((category) => (
            <CategorySection
              key={category}
              city={city}
              category={category}
              isGenerating={feed?.generating}
              activeItemId={activeItemId}
              onHoverItem={setActiveItemId}
              onCardClick={setOpenItem}
            />
          ))}

          <Typography
            sx={{
              pt: 2,
              textAlign: 'center',
              fontSize: 12,
              color: 'text.disabled',
            }}
          >
            Want a full day-by-day plan?{' '}
            <Box
              component={Link}
              href="/trip"
              sx={{
                fontWeight: 500,
                color: 'primary.main',
                textUnderlineOffset: '2px',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Generate a trip
            </Box>
          </Typography>
        </Stack>

        <FloatingMapShell
          pins={pins}
          itemById={itemById}
          activePinId={activeItemId}
          onPinHover={setActiveItemId}
          onPinClick={handlePinClick}
          visible={mapVisible}
          onClose={() => setMapVisible(false)}
          clusterThreshold={Number.POSITIVE_INFINITY}
        />
      </Box>

      {!mapVisible ? (
        <Box
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 20,
            display: { xs: 'none', lg: 'block' },
            boxShadow: (t) => tgShadow(t, 'cardHover'),
            borderRadius: 999,
          }}
        >
          <Button
            onClick={() => setMapVisible(true)}
            iconLeft={<MapIcon size={16} />}
            size="md"
          >
            Show map · {pins.length}
          </Button>
        </Box>
      ) : null}

      <MapSheet
        pins={pins}
        activePinId={activeItemId}
        onPinHover={setActiveItemId}
        onPinClick={handlePinClick}
      />

      <FeedItemDrawer item={openItem} city={city} onClose={() => setOpenItem(null)} />
    </Box>
  );
}

interface DerivedSections {
  mustSee: FeedItem[];
  forYou: FeedItem[];
  eat: FeedItem[];
  events: FeedItem[];
}

const FOR_YOU_LIMIT = 12;
const MUST_SEE_FALLBACK_LIMIT = 6;
// 1-indexed positions 4, 8, 12 become Viator slots — roughly one tour per 4 cards.
const VIATOR_INTERVAL = 4;

function deriveSections(
  data: ReturnType<typeof useHomeFeed>['data'],
  viatorItems: FeedItem[],
  category: string | null,
): DerivedSections {
  const empty: DerivedSections = { mustSee: [], forYou: [], eat: [], events: [] };
  if (!data) return empty;

  const isValid = (i: FeedItem | undefined | null): i is FeedItem => !!i && !!i.item;
  const exploration = (data.exploration ?? []).filter(isValid).filter(matchCategory(category));
  const events = (data.events ?? []).filter(isValid).filter(matchCategory(category));
  const restaurants = (data.restaurants ?? []).filter(isValid).filter(matchCategory(category));

  const explicitMustSee = exploration.filter((i) => i.item.must_see === true);
  const mustSee =
    explicitMustSee.length > 0
      ? explicitMustSee
      : [...exploration]
          .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
          .slice(0, MUST_SEE_FALLBACK_LIMIT);

  const seenIds = new Set(mustSee.map(cardId));
  const baseForYou = (data.for_you ?? [])
    .filter(isValid)
    .filter(matchCategory(category))
    .filter((i) => !seenIds.has(cardId(i)));
  const viatorPicks = viatorItems
    .filter(isValid)
    .filter(matchCategory(category))
    .filter((i) => !seenIds.has(cardId(i)));
  const forYou = interleaveViator(baseForYou, viatorPicks, FOR_YOU_LIMIT, VIATOR_INTERVAL);

  return { mustSee, forYou, eat: restaurants, events };
}

function interleaveViator(
  base: FeedItem[],
  viator: FeedItem[],
  limit: number,
  interval: number,
): FeedItem[] {
  const out: FeedItem[] = [];
  const seen = new Set<string>();
  let baseIdx = 0;
  let viatorIdx = 0;

  for (let pos = 0; out.length < limit; pos++) {
    const wantViator = (pos + 1) % interval === 0;
    let next: FeedItem | null = null;
    if (wantViator && viatorIdx < viator.length) {
      next = viator[viatorIdx++];
    } else if (baseIdx < base.length) {
      next = base[baseIdx++];
    } else if (viatorIdx < viator.length) {
      next = viator[viatorIdx++];
    } else {
      break;
    }
    const id = cardId(next);
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(next);
  }
  return out;
}

function matchCategory(category: string | null) {
  if (!category) return () => true;
  const target = category.toLowerCase();
  return (item: FeedItem): boolean => {
    const fields: Array<string | string[] | undefined> = [
      item.item.primary_categories as string[] | undefined,
      item.item.category as string | undefined,
      item.item.cuisine_type as string[] | undefined,
    ];
    for (const f of fields) {
      if (!f) continue;
      if (typeof f === 'string') {
        if (f.toLowerCase() === target) return true;
      } else if (Array.isArray(f)) {
        if (f.some((v) => v?.toLowerCase() === target)) return true;
      }
    }
    return false;
  };
}

function extractPins(sections: DerivedSections): MapPinData[] {
  const all: FeedItem[] = [
    ...sections.mustSee,
    ...sections.forYou,
    ...sections.eat,
    ...sections.events,
  ];
  const seen = new Set<string>();
  const pins: MapPinData[] = [];
  for (const item of all) {
    const id = cardId(item);
    if (seen.has(id)) continue;
    const coord = getLatLng(item.item);
    if (!coord) continue;
    seen.add(id);
    pins.push({
      id,
      lat: coord.lat,
      lng: coord.lng,
      title:
        (item.item.title as string | undefined) ??
        (item.item.name as string | undefined) ??
        'Item',
      entityType: item.entity_type,
    });
  }
  return pins;
}
