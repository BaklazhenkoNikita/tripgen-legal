'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Calendar,
  CalendarClock,
  Clock,
  ExternalLink,
  Heart,
  MapPin,
  Navigation,
  Star,
  Wallet,
} from 'lucide-react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { FeedItem } from '@/hooks/useHomeFeed';
import { useViatorSearch } from '@/hooks/useViatorFeed';
import { useActivityContext } from '@/hooks/useActivityContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Photo } from '@/components/ui/Photo';
import { ImageCarousel } from '@/components/ui/ImageCarousel';
import { Lightbox } from '@/components/ui/Lightbox';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  normalizeFeedItem,
  type NormalizedFeedDetail,
} from '@/lib/feed/itemAdapter';
import {
  useShortlistIds,
  useShortlistAdd,
  useShortlistRemove,
} from '@/hooks/useShortlist';
import { getMapsUrl } from '@/lib/map/openInMaps';
import type { MapPinData } from '@/components/map/Map';
import type { TravelActivity } from '@/types';
import { PlaceGalleryMosaic } from '@/components/explore/PlaceGalleryMosaic';
import { AskPeriploIcon } from '@/components/chat/AskPeriploIcon';
import { DeeperContext } from './DeeperContext';
import {
  Callout,
  CheckList,
  SectionHeading,
  dedupeStrings,
  proseFontSize,
} from './placeBlocks';

export type PlaceDetailLayout = 'drawer' | 'page';

const LeafletMap = dynamic(() => import('@/components/map/Map'), {
  ssr: false,
  loading: () => <Skeleton variant="block" width="100%" height="100%" />,
});

interface Props {
  detail: NormalizedFeedDetail;
  /** City context for related experiences + deeper context lookup. */
  city: string | null;
  /** 'drawer' (default) renders the compact right-side sheet body;
   *  'page' renders the wider fullscreen-page hero gallery + larger
   *  typography variant served at `/explore/[city]/[place]`. */
  layout?: PlaceDetailLayout;
  /** "Ask Periplo about this place" — shown in the action bar and under the
   *  Deeper context card when provided. */
  onAsk?: () => void;
}

export function PlaceDetailContent({ detail, city, layout = 'drawer', onAsk }: Props) {
  const isPage = layout === 'page';
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const carouselImages = detail.images.map((url) => ({ url }));
  const altText = detail.title;

  const mapPins = useMemo<MapPinData[]>(
    () =>
      detail.coords
        ? [
            {
              id: detail.id,
              lat: detail.coords.lat,
              lng: detail.coords.lng,
              title: detail.title,
              entityType: detail.isViator ? 'viator' : undefined,
              selected: true,
            },
          ]
        : [],
    [detail],
  );

  const related = useViatorSearch(
    !detail.isViator && city
      ? { q: detail.title, city, limit: 6 }
      : null,
  );

  const adaptedActivity: TravelActivity | null = useMemo(() => {
    if (detail.isViator) return null;
    return {
      id: detail.id,
      activity_id: detail.id,
      name: detail.title,
      description: detail.description ?? undefined,
      category:
        detail.categories.length > 0
          ? detail.categories
          : detail.category
            ? [detail.category]
            : [],
    };
  }, [detail]);

  const { data: context, isLoading: contextLoading } = useActivityContext(
    adaptedActivity,
    city,
  );
  const didYouKnow = dedupeStrings(detail.interestingFacts, detail.highlights);

  const mapsHref = getMapsUrl({
    name: detail.title,
    address: detail.address,
    lat: detail.coords?.lat ?? null,
    lng: detail.coords?.lng ?? null,
  });

  return (
    <Box>
      <Box sx={{ position: 'relative' }}>
        {isPage ? (
          <PlaceGalleryMosaic images={detail.images} alt={altText} />
        ) : carouselImages.length > 0 ? (
          <ImageCarousel
            images={carouselImages}
            alt={altText}
            aspect="16/9"
            gradient
            sizes="(max-width: 768px) 100vw, 672px"
            onPhotoClick={(i) => setLightboxIndex(i)}
          />
        ) : (
          <Photo src={null} alt={altText} aspect="16/9" gradient />
        )}
      </Box>

      <Box sx={{ px: isPage ? 0 : 3, py: isPage ? 4 : 3 }}>
        <Box
          sx={{
            mb: 1.5,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 0.75,
          }}
        >
          {detail.isViator ? (
            <Badge tone="viator" size="sm">Bookable tour</Badge>
          ) : detail.category ? (
            <Badge tone="accent" size="sm">{detail.category}</Badge>
          ) : null}
          {detail.eventDate ? (
            <Badge tone="info" size="sm" iconLeft={<Calendar size={12} />}>
              {formatEventDate(detail.eventDate)}
            </Badge>
          ) : null}
          {detail.tags.slice(0, 4).map((t) => (
            <Badge key={t} tone="neutral" size="sm">{t}</Badge>
          ))}
        </Box>

        <Typography
          component={isPage ? 'h1' : 'h2'}
          sx={{
            fontSize: isPage ? { xs: 32, md: 44 } : '1.875rem',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'text.primary',
            lineHeight: 1.1,
          }}
        >
          {detail.title}
        </Typography>
        {detail.subtitle ? (
          <Typography sx={{ mt: 0.5, fontSize: '0.875rem', color: 'text.primary' }}>
            {detail.subtitle}
          </Typography>
        ) : null}

        <PlaceActionBar detail={detail} city={city} mapsHref={mapsHref} onAsk={onAsk} />

        {detail.address ? (
          <Typography
            sx={{
              mt: 1.5,
              display: 'inline-flex',
              alignItems: 'flex-start',
              gap: 0.75,
              fontSize: '0.875rem',
              color: 'text.secondary',
              overflowWrap: 'anywhere',
            }}
          >
            <Box
              component="span"
              sx={{ mt: '2px', flexShrink: 0, display: 'inline-flex' }}
            >
              <MapPin size={16} aria-hidden />
            </Box>
            {mapsHref ? (
              <Box
                component="a"
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: 'inherit',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {detail.address}
              </Box>
            ) : (
              <Box component="span">{detail.address}</Box>
            )}
          </Typography>
        ) : null}

        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {detail.duration ? (
            <Chip icon={<Clock size={14} />} label={detail.duration} />
          ) : null}
          {detail.isViator && detail.priceFrom !== null ? (
            <Chip
              icon={<Wallet size={14} />}
              label={`From ${detail.currency ?? ''} ${detail.priceFrom}`.trim()}
            />
          ) : detail.cost ? (
            <Chip icon={<Wallet size={14} />} label={detail.cost} />
          ) : null}
          {detail.workingHours ? (
            <Chip icon={<CalendarClock size={14} />} label={detail.workingHours} />
          ) : null}
          {detail.rating !== null ? (
            <Chip
              icon={<Star size={14} fill="currentColor" />}
              label={`${detail.rating.toFixed(1)}${detail.reviewCount ? ` (${detail.reviewCount})` : ''}`}
              tone="warning"
            />
          ) : null}
        </Box>

        {detail.description ? (
          <Typography
            sx={{
              mt: 2.5,
              fontSize: proseFontSize(layout),
              lineHeight: 1.65,
              color: 'text.primary',
              maxWidth: isPage ? 760 : undefined,
              overflowWrap: 'anywhere',
            }}
          >
            {detail.description}
          </Typography>
        ) : null}

        <CheckList
          title="Highlights"
          items={detail.highlights}
          layout={layout}
          sx={{ mt: 3 }}
        />
        <Callout
          tone="info"
          title="Did you know"
          items={didYouKnow}
          sx={{ mt: 3, maxWidth: isPage ? 880 : undefined }}
        />
        {/* With a Deeper context card the tips merge into its amber callout;
            Viator items (no context lookup) keep a standalone one. */}
        {!adaptedActivity ? (
          <Callout
            tone="tip"
            title="Insider tips"
            items={detail.insiderTips}
            sx={{ mt: 3, maxWidth: isPage ? 880 : undefined }}
          />
        ) : null}

        {(detail.isViator && detail.bookingUrl) ||
        (detail.websiteUrl && !detail.isViator) ? (
          <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {detail.isViator && detail.bookingUrl ? (
              <Button
                asChild
                variant="primary"
                iconRight={<ExternalLink size={16} />}
              >
                <a
                  href={detail.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Book on Viator
                </a>
              </Button>
            ) : null}
            {detail.websiteUrl && !detail.isViator ? (
              <Button
                asChild
                variant="secondary"
                iconRight={<ExternalLink size={16} />}
              >
                <a
                  href={detail.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Website
                </a>
              </Button>
            ) : null}
          </Box>
        ) : null}

        {adaptedActivity ? (
          <DeeperContext
            context={context}
            isLoading={contextLoading}
            layout={layout}
            placeName={detail.title}
            description={detail.description}
            extraTips={detail.insiderTips}
            shownElsewhere={[...detail.highlights, ...didYouKnow]}
            onAsk={onAsk}
          />
        ) : null}

        {!detail.isViator && city ? (
          <RelatedViator
            layout={layout}
            isLoading={related.isLoading}
            items={related.data?.viator_activities ?? []}
          />
        ) : null}

        {detail.coords ? (
          <Box sx={{ mt: 3 }}>
            <SectionHeading variant="title">On the map</SectionHeading>
            <Box
              sx={{
                mt: 1,
                height: isPage ? { xs: 320, md: 420 } : 180,
                overflow: 'hidden',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'action.hover',
              }}
            >
              <LeafletMap pins={mapPins} activePinId={detail.id} />
            </Box>
            {mapsHref ? (
              <Box sx={{ mt: 1 }}>
                <Box
                  component="a"
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Open in Google Maps
                  <ExternalLink size={13} aria-hidden />
                </Box>
              </Box>
            ) : null}
          </Box>
        ) : null}
      </Box>

      <Lightbox
        images={carouselImages}
        alt={altText}
        initialIndex={lightboxIndex ?? 0}
        open={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
      />
    </Box>
  );
}

function RelatedViator({
  layout,
  isLoading,
  items,
}: {
  layout: PlaceDetailLayout;
  isLoading: boolean;
  items: FeedItem[];
}) {
  if (!isLoading && items.length === 0) return null;
  // The drawer is ~620px wide whatever the window size, so window
  // breakpoints would squeeze four ~150px cards in; keep it at two there.
  const isDrawer = layout === 'drawer';
  const columns = isDrawer
    ? 'repeat(2, minmax(0, 1fr))'
    : { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' };
  return (
    <Box sx={{ mt: 3 }}>
      <SectionHeading variant="title">Popular nearby</SectionHeading>
      <Typography
        sx={{ mt: 0.5, mb: 1.5, fontSize: '0.75rem', color: 'text.secondary' }}
      >
        Bookable experiences related to this place
      </Typography>
      {isLoading ? (
        <Box
          sx={{
            display: 'grid',
            gap: 1.25,
            gridTemplateColumns: columns,
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} variant="block" height={132} />
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 1.25,
            gridTemplateColumns: columns,
          }}
        >
          {items.slice(0, 4).map((it) => {
            const v = normalizeFeedItem(it);
            return (
              <Box
                component="a"
                key={v.id}
                href={v.bookingUrl ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  borderRadius: 1.5,
                  border: '1px solid transparent',
                  bgcolor: 'background.paper',
                  textDecoration: 'none',
                  transition: 'border-color 150ms',
                  '&:hover': { borderColor: 'divider' },
                }}
              >
                <Photo
                  src={v.images}
                  alt={v.title}
                  aspect="3/2"
                  sizes={isDrawer ? '300px' : '200px'}
                  zoomOnHover
                />
                <Box
                  sx={{
                    display: 'flex',
                    flex: 1,
                    flexDirection: 'column',
                    gap: 0.5,
                    px: 0.5,
                    pt: 0.75,
                    pb: 0.5,
                  }}
                >
                  <Typography
                    component="h4"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      fontSize: isDrawer ? '0.8125rem' : '0.75rem',
                      fontWeight: 600,
                      lineHeight: 1.3,
                      color: 'text.primary',
                    }}
                  >
                    {v.title}
                  </Typography>
                  <Box
                    sx={{
                      mt: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 0.5,
                      fontSize: '0.625rem',
                      color: 'text.disabled',
                    }}
                  >
                    {v.rating !== null ? (
                      <Box
                        component="span"
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                          color: 'warning.main',
                        }}
                      >
                        <Star size={10} fill="currentColor" aria-hidden />
                        <Box component="span" sx={{ fontWeight: 600 }}>
                          {v.rating.toFixed(1)}
                        </Box>
                      </Box>
                    ) : (
                      <Box component="span" />
                    )}
                    {v.priceFrom !== null ? (
                      <Box
                        component="span"
                        sx={{ fontWeight: 600, color: 'text.primary' }}
                      >
                        {`${v.currency ?? ''} ${v.priceFrom}`.trim()}
                      </Box>
                    ) : null}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

function Chip({
  icon,
  label,
  tone = 'neutral',
}: {
  icon: React.ReactNode;
  label: string;
  tone?: 'neutral' | 'warning';
}) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        borderRadius: 999,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'action.hover',
        px: 1.25,
        py: 0.5,
        fontSize: '0.75rem',
        fontWeight: 500,
        color: tone === 'warning' ? 'warning.main' : 'text.secondary',
      }}
    >
      {icon}
      {label}
    </Box>
  );
}

function formatEventDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

/**
 * Planning action bar for the place drawer/page — surfaces the two actions
 * that apply in every context: Save (to the shortlist) and Directions.
 * (Add-to-trip with a placement chooser pairs with the smart-placement
 * backend and lands with that track.)
 */
function PlaceActionBar({
  detail,
  city,
  mapsHref,
  onAsk,
}: {
  detail: NormalizedFeedDetail;
  city: string | null;
  mapsHref: string | null;
  onAsk?: () => void;
}) {
  const savedIds = useShortlistIds();
  const add = useShortlistAdd();
  const remove = useShortlistRemove();

  const entityType = detail.saveEntityType;
  const canSave = entityType !== null;
  const saved = savedIds.has(detail.id);

  const toggleSave = () => {
    if (!canSave) return;
    if (saved) {
      remove.mutate(detail.id);
    } else {
      add.mutate({ entity_id: detail.id, entity_type: entityType, city: city ?? undefined });
    }
  };

  if (!canSave && !mapsHref && !onAsk) return null;

  return (
    <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {canSave ? (
        <Button
          variant={saved ? 'primary' : 'outline'}
          size="sm"
          iconLeft={<Heart size={15} fill={saved ? 'currentColor' : 'none'} />}
          onClick={toggleSave}
          disabled={add.isPending || remove.isPending}
          aria-pressed={saved}
        >
          {saved ? 'Saved' : 'Save'}
        </Button>
      ) : null}
      {mapsHref ? (
        <Button asChild variant="secondary" size="sm" iconLeft={<Navigation size={15} />}>
          <a href={mapsHref} target="_blank" rel="noopener noreferrer">
            Directions
          </a>
        </Button>
      ) : null}
      {onAsk ? (
        <Button
          variant="secondary"
          size="sm"
          iconLeft={<AskPeriploIcon size={15} />}
          onClick={onAsk}
        >
          Ask Periplo
        </Button>
      ) : null}
    </Box>
  );
}
