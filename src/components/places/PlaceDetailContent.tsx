'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Calendar,
  Clock,
  ExternalLink,
  Heart,
  MapPin,
  Navigation,
  Star,
  Wallet,
} from 'lucide-react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, type SxProps, type Theme } from '@mui/material/styles';
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
}

export function PlaceDetailContent({ detail, city, layout = 'drawer' }: Props) {
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
  const deeperSections = context?.sections ?? [];
  const moreHighlights = context?.highlights ?? [];
  const hasDeeperContent =
    deeperSections.length > 0 || moreHighlights.length > 0;

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
            fontSize: isPage ? { xs: 32, md: 44 } : 30,
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

        <PlaceActionBar detail={detail} city={city} mapsHref={mapsHref} />

        {detail.address ? (
          <Typography
            sx={{
              mt: 1.5,
              display: 'inline-flex',
              alignItems: 'flex-start',
              gap: 0.75,
              fontSize: '0.875rem',
              color: 'text.secondary',
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
            <Chip icon={<Clock size={14} />} label={detail.workingHours} />
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
              fontSize: isPage ? 16 : 15,
              lineHeight: 1.65,
              color: 'text.primary',
              maxWidth: isPage ? 760 : undefined,
            }}
          >
            {detail.description}
          </Typography>
        ) : null}

        <List title="Highlights" items={detail.highlights} />
        <List title="Did you know" items={detail.interestingFacts} />
        <List title="Insider tips" items={detail.insiderTips} />

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
          <Box
            sx={{
              mt: 3,
              borderTop: '1px solid',
              borderColor: 'divider',
              pt: 3,
            }}
          >
            <SectionHeading variant="title">Deeper context</SectionHeading>
            {contextLoading ? (
              <Stack spacing={1} sx={{ mt: 1.5 }}>
                <Skeleton variant="line" height={12} width="33%" />
                <Skeleton variant="line" height={12} width="100%" />
                <Skeleton variant="line" height={12} width="83%" />
              </Stack>
            ) : hasDeeperContent ? (
              <Box
                sx={{
                  mt: 1.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  // A distinct warm editorial panel — the old 2.5% tint was
                  // effectively invisible against the page/paper surface.
                  bgcolor: (t: Theme) => alpha(t.palette.primary.main, 0.05),
                  p: { xs: 2, sm: 2.5 },
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {deeperSections.map((section, i) => (
                  <Box
                    key={`${section.title}-${i}`}
                    sx={{
                      pt: i === 0 ? 0 : 2,
                      mt: i === 0 ? 0 : 2,
                      borderTop: i === 0 ? 0 : '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <SectionHeading>{section.title}</SectionHeading>
                    <Typography
                      sx={{
                        mt: 1,
                        whiteSpace: 'pre-line',
                        fontSize: 14.5,
                        lineHeight: 1.65,
                        color: 'text.primary',
                      }}
                    >
                      {section.content}
                    </Typography>
                  </Box>
                ))}
                {moreHighlights.length > 0 ? (
                  <Box
                    sx={{
                      pt: deeperSections.length > 0 ? 2 : 0,
                      mt: deeperSections.length > 0 ? 2 : 0,
                      borderTop: deeperSections.length > 0 ? '1px solid' : 0,
                      borderColor: 'divider',
                    }}
                  >
                    <List title="More highlights" items={moreHighlights} dense />
                  </Box>
                ) : null}
              </Box>
            ) : (
              <Typography
                sx={{ mt: 1.5, fontSize: '0.875rem', color: 'text.disabled' }}
              >
                No additional context yet.
              </Typography>
            )}
          </Box>
        ) : null}

        {!detail.isViator && city ? (
          <RelatedViator
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
  isLoading,
  items,
}: {
  isLoading: boolean;
  items: FeedItem[];
}) {
  if (!isLoading && items.length === 0) return null;
  return (
    <Box sx={{ mt: 3 }}>
      <SectionHeading variant="title">Popular nearby</SectionHeading>
      <Typography
        sx={{ mt: 0.25, mb: 1.25, fontSize: '0.75rem', color: 'text.disabled' }}
      >
        Bookable experiences related to this place
      </Typography>
      {isLoading ? (
        <Box
          sx={{
            display: 'grid',
            gap: 1.25,
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
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
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
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
                  src={v.images[0] ?? null}
                  alt={v.title}
                  aspect="3/2"
                  sizes="160px"
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
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      lineHeight: 1.25,
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

function SectionHeading({
  children,
  variant = 'eyebrow',
  sx,
}: {
  children: React.ReactNode;
  /** 'eyebrow' — small tracked terracotta caps (nested sub-labels, list
   *  labels). 'title' — a readable section title for top-level blocks, so the
   *  page reads as a real two-level hierarchy instead of one flat overline. */
  variant?: 'eyebrow' | 'title';
  sx?: SxProps<Theme>;
}) {
  const base: SxProps<Theme> =
    variant === 'title'
      ? {
          fontSize: '1rem',
          fontWeight: 600,
          lineHeight: 1.3,
          letterSpacing: '-0.01em',
          color: 'text.primary',
          m: 0,
        }
      : {
          fontSize: '0.6875rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.16em',
          color: 'primary.dark',
          m: 0,
        };
  return (
    <Typography
      component="h3"
      sx={[base, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
    >
      {children}
    </Typography>
  );
}

function List({
  title,
  items,
  dense,
}: {
  title: string;
  items?: string[] | null;
  dense?: boolean;
}) {
  if (!items || items.length === 0) return null;
  return (
    <Box sx={{ mt: dense ? 0 : 2.5 }}>
      <SectionHeading>{title}</SectionHeading>
      <Stack
        component="ul"
        spacing={0.75}
        sx={{ mt: 1, listStyle: 'none', m: 0, p: 0 }}
      >
        {items.map((item, i) => (
          <Box
            component="li"
            key={i}
            sx={{
              display: 'flex',
              gap: 1,
              fontSize: '0.875rem',
              lineHeight: 1.6,
              color: 'text.primary',
            }}
          >
            <Box
              component="span"
              sx={{
                mt: 1,
                display: 'inline-block',
                height: 4,
                width: 4,
                flexShrink: 0,
                borderRadius: 999,
                bgcolor: 'primary.main',
              }}
            />
            <Box component="span">{item}</Box>
          </Box>
        ))}
      </Stack>
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
}: {
  detail: NormalizedFeedDetail;
  city: string | null;
  mapsHref: string | null;
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

  if (!canSave && !mapsHref) return null;

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
    </Box>
  );
}
