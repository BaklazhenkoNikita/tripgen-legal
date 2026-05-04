import type { Metadata } from 'next';
import Script from 'next/script';
import { destinations } from '@/data/destinations';
import { slugToCity } from '@/lib/destinationSlug';
import { extractPlaceId } from '@/lib/placeSlug';
import { getActivity, firstImageUrl, activityCoords } from '@/lib/server/api';
import {
  breadcrumbListJsonLd,
  touristAttractionJsonLd,
  stringifyJsonLd,
} from '@/lib/seo/jsonld';
import { PlaceFullPageClient } from './PlaceFullPageClient';

interface Props {
  params: Promise<{ slug: string; place: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, place } = await params;
  const placeId = extractPlaceId(place);
  const city = slugToCity(slug);
  const url = `/explore/${slug}/${place}`;

  if (!placeId) {
    return {
      title: `Place — ${city}`,
      description: `Discover top places to visit in ${city} with Periplo.`,
      alternates: { canonical: url },
      robots: { index: false },
    };
  }

  const activity = await getActivity(placeId);
  if (!activity) {
    return {
      title: `Place — ${city}`,
      description: `Discover top places to visit in ${city} with Periplo.`,
      alternates: { canonical: url },
      robots: { index: false },
    };
  }

  const image = firstImageUrl(activity.images);
  const description =
    activity.description?.trim() ||
    `Visit ${activity.name} in ${city}. Plan your day, get tips, and add it to your AI-generated itinerary with Periplo.`;
  const title = `${activity.name} — ${city}`;
  const trimmedDescription = description.length > 200 ? `${description.slice(0, 197)}…` : description;

  return {
    title,
    description: trimmedDescription,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | Periplo`,
      description: trimmedDescription,
      url,
      type: 'website',
      ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: activity.name }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Periplo`,
      description: trimmedDescription,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function PlaceFullPage({ params }: Props) {
  const { slug, place } = await params;
  const city = slugToCity(slug);
  const placeId = extractPlaceId(place);
  const dest = destinations.find((d) => d.slug === slug);

  const activity = placeId ? await getActivity(placeId) : null;

  const breadcrumbLd = stringifyJsonLd(
    breadcrumbListJsonLd([
      { name: 'Home', url: '/' },
      { name: 'Explore', url: '/explore' },
      { name: city, url: `/explore/${slug}` },
      { name: activity?.name ?? 'Place', url: `/explore/${slug}/${place}` },
    ]),
  );

  const attractionLd = activity
    ? stringifyJsonLd(
        touristAttractionJsonLd({
          name: activity.name,
          description: activity.description,
          image: firstImageUrl(activity.images),
          url: `/explore/${slug}/${place}`,
          address: activity.address,
          city,
          country: dest?.country,
          geo: activityCoords(activity),
          rating: activity.rating ? { value: activity.rating } : undefined,
          website: activity.website_url,
        }),
      )
    : null;

  return (
    <>
      {breadcrumbLd && (
        <Script
          id={`ld-breadcrumb-${place}`}
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: breadcrumbLd }}
        />
      )}
      {attractionLd && (
        <Script
          id={`ld-attraction-${place}`}
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: attractionLd }}
        />
      )}
      <PlaceFullPageClient city={city} place={place} />
    </>
  );
}
