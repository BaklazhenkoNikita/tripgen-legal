'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Map as MapIcon } from 'lucide-react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { Button } from '@/components/ui/Button';
import { tgShadow } from '@/theme/shadows';
import { useHomeFeed, type FeedItem } from '@/hooks/useHomeFeed';
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
import { CityOverview } from './CityOverview';
import { CategorySection } from './CategorySection';

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
  const { data: info, isLoading: infoLoading } = useDestinationInfo(city);
  const { data: categoryData } = useCategoryCounts(city);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openItem, setOpenItem] = useState<FeedItem | null>(null);
  const [mapVisible, setMapVisible] = useState(true);

  const sections = useMemo(
    () => deriveSections(feed, activeCategory),
    [feed, activeCategory],
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
        maxWidth: 1320,
        px: { xs: 2, sm: 3, lg: 4 },
        pb: 6,
        pt: 3,
      }}
    >
      <DestinationHero
        city={city}
        info={info}
        isLoading={infoLoading}
        fallbackImage={fallbackImage}
      />

      <CityOverview key={city} city={city} info={info} />

      <Box
        sx={{
          position: 'sticky',
          top: '7rem',
          zIndex: 10,
          mx: { xs: -2, sm: -3 },
          mb: 2.5,
          mt: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: (t) => alpha(t.palette.background.default, 0.85),
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
          />

          {categoryRows.map((category) => (
            <CategorySection
              key={category}
              city={city}
              category={category}
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
            boxShadow: (t) => tgShadow(t, 'sheet'),
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

function deriveSections(
  data: ReturnType<typeof useHomeFeed>['data'],
  category: string | null,
): DerivedSections {
  const empty: DerivedSections = { mustSee: [], forYou: [], eat: [], events: [] };
  if (!data) return empty;

  const isValid = (i: FeedItem | undefined | null): i is FeedItem => !!i && !!i.item;
  const exploration = (data.exploration ?? []).filter(isValid).filter(matchCategory(category));
  const activities = (data.activities ?? []).filter(isValid).filter(matchCategory(category));
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
  const forYou = [...exploration, ...activities]
    .filter((i) => !seenIds.has(cardId(i)))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, FOR_YOU_LIMIT);

  return { mustSee, forYou, eat: restaurants, events };
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
