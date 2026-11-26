'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, ChevronUp, MapPinned, Sparkles } from 'lucide-react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import { destinations } from '@/data/destinations';
import { useCity } from '@/contexts';
import { useHomeFeed, type FeedItem, type HomeFeedResponse } from '@/hooks/useHomeFeed';
import { FeedRow } from '@/components/home/FeedRow';
import { ViatorRow } from '@/components/home/ViatorRow';
import { FeedItemDrawer } from '@/components/explore/FeedItemDrawer';
import { PageContainer } from '@/components/layout/PageContainer';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { Button } from '@/components/ui/Button';
import { destinationSlug } from '@/lib/destinationSlug';
import Link from 'next/link';
import { ExploreHero } from './_components/ExploreHero';
import { DestinationCard } from './_components/DestinationCard';

const INITIAL_CITIES = 12;
const TOTAL_CITIES = destinations.length;
const FALLBACK_CITY = 'Barcelona';

export default function DestinationsPage() {
  const { city } = useCity();
  const activeCity = city ?? FALLBACK_CITY;
  const { data: feed, isLoading } = useHomeFeed(activeCity);
  const [showAllCities, setShowAllCities] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [openItem, setOpenItem] = useState<FeedItem | null>(null);

  const sections = useMemo(() => deriveExploreSections(feed), [feed]);
  const cityCards = showAllCities ? destinations : destinations.slice(0, INITIAL_CITIES);

  return (
    <Box sx={{ overflow: 'hidden' }}>
      <PageContainer width="wide">
        <ExploreHero />

        <Box
          component="section"
          aria-labelledby="active-city-heading"
          sx={{
            pt: { xs: 2, md: 3 },
            pb: { xs: 6, md: 8 },
          }}
        >
          <SectionHeader
            id="active-city-heading"
            eyebrow="City picks"
            eyebrowIcon={Sparkles}
            title={`What to do in ${activeCity}`}
            description="A live reference board for the city: places, activities, food, events, and tours surfaced before you commit to a full trip plan."
            action={
              <Button asChild variant="ghost" size="sm" iconRight={<ArrowRight size={16} aria-hidden />}>
                <Link href={`/explore/${destinationSlug(activeCity)}`}>Open full {activeCity} guide</Link>
              </Button>
            }
            sx={{ mb: { xs: 3, md: 4 } }}
          />

          <Stack spacing={{ xs: 4, md: 5 }}>
            <FeedRow
              headingLevel="h3"
              title={`Must see in ${activeCity}`}
              items={sections.mustSee}
              isLoading={isLoading}
              isGenerating={feed?.generating}
              activeItemId={activeItemId}
              onHoverItem={setActiveItemId}
              onCardClick={setOpenItem}
              hideWhenEmpty={false}
              emptyTitle={`No city references for ${activeCity} yet`}
              emptyDescription="Try another city or check back shortly while Periplo builds this guide."
              loadMore={{
                city: activeCity,
                sources: [{ contentType: 'exploration' }],
                aiAugmentable: false,
              }}
            />

            <FeedRow
              headingLevel="h3"
              title="Things to do"
              items={sections.activities}
              isLoading={isLoading}
              isGenerating={feed?.generating}
              activeItemId={activeItemId}
              onHoverItem={setActiveItemId}
              onCardClick={setOpenItem}
              hideWhenEmpty={false}
              emptyTitle="No activities yet"
              emptyDescription="The city page will keep filling in as more local references are generated."
              loadMore={{
                city: activeCity,
                sources: [{ contentType: 'activity' }],
                aiAugmentable: false,
              }}
            />

            <FeedRow
              headingLevel="h3"
              title="Where to eat"
              items={sections.restaurants}
              isLoading={isLoading}
              isGenerating={feed?.generating}
              activeItemId={activeItemId}
              onHoverItem={setActiveItemId}
              onCardClick={setOpenItem}
              emptyTitle="No food picks yet"
            />

            <FeedRow
              headingLevel="h3"
              title="Happening now"
              items={sections.events}
              isLoading={isLoading}
              isGenerating={feed?.events_generating}
              activeItemId={activeItemId}
              onHoverItem={setActiveItemId}
              onCardClick={setOpenItem}
              emptyTitle="No upcoming events"
            />

            <ViatorRow
              headingLevel="h3"
              city={activeCity}
              activeItemId={activeItemId}
              onHoverItem={setActiveItemId}
              onCardClick={setOpenItem}
            />
          </Stack>
        </Box>

        <Box
          component="section"
          aria-labelledby="cities-heading"
          sx={{
            pt: { xs: 5, md: 7 },
            pb: { xs: 7, md: 9 },
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <SectionHeader
            id="cities-heading"
            eyebrow="Browse cities"
            eyebrowIcon={MapPinned}
            title="City references, not trip templates"
            description="Open a city to browse its sights, neighborhoods, restaurants, events, and planning context. Build a trip only when you are ready."
            sx={{ mb: { xs: 3, md: 4 } }}
          />

          <Box
            sx={{
              display: 'grid',
              gap: { xs: 2, md: 3 },
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
            }}
          >
            {cityCards.map((d, i) => (
              <DestinationCard
                key={d.slug}
                destination={d}
                priority={i < 4}
              />
            ))}
          </Box>

          <Box
            sx={{
              mt: { xs: 4.5, sm: 6 },
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Box
              component="button"
              type="button"
              onClick={() => setShowAllCities((v) => !v)}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 3,
                py: 1.5,
                fontSize: 15,
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                color: 'primary.main',
                bgcolor: 'background.paper',
                borderRadius: 999,
                border: '1px solid',
                borderColor: (t) => alpha(t.palette.primary.main, 0.32),
                cursor: 'pointer',
                transition: 'background-color 0.15s, border-color 0.15s, color 0.15s',
                '&:hover': {
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                  borderColor: 'primary.main',
                },
                '& svg': {
                  transition: 'transform 0.2s',
                },
                '&:hover svg': {
                  transform: 'translateX(3px)',
                },
              }}
            >
              {showAllCities ? 'Show fewer cities' : `View all ${TOTAL_CITIES} cities`}
              {showAllCities ? <ChevronUp size={16} aria-hidden /> : <ArrowRight size={16} aria-hidden />}
            </Box>
          </Box>
        </Box>
      </PageContainer>

      <FeedItemDrawer item={openItem} city={activeCity} onClose={() => setOpenItem(null)} />
    </Box>
  );
}

interface ExploreSections {
  mustSee: FeedItem[];
  activities: FeedItem[];
  restaurants: FeedItem[];
  events: FeedItem[];
}

function deriveExploreSections(data: HomeFeedResponse | null | undefined): ExploreSections {
  const empty: ExploreSections = {
    mustSee: [],
    activities: [],
    restaurants: [],
    events: [],
  };
  if (!data) return empty;

  const exploration = (data.exploration ?? []).filter(isValidFeedItem);
  const explicitMustSee = exploration.filter((i) => i.item.must_see === true);
  const mustSee =
    explicitMustSee.length > 0
      ? explicitMustSee
      : [...exploration].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 8);

  return {
    mustSee,
    activities: (data.activities ?? []).filter(isValidFeedItem),
    restaurants: (data.restaurants ?? []).filter(isValidFeedItem),
    events: (data.events ?? []).filter(isValidFeedItem),
  };
}

function isValidFeedItem(item: FeedItem | null | undefined): item is FeedItem {
  return Boolean(item?.item);
}
