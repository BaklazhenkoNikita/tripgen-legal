import type { Metadata } from 'next';
import Script from 'next/script';
import { getTrip, firstImageUrl } from '@/lib/server/api';
import {
  breadcrumbListJsonLd,
  touristTripJsonLd,
  stringifyJsonLd,
} from '@/lib/seo/jsonld';
import { TripDetailClient } from './TripDetailClient';

interface Props {
  params: Promise<{ searchId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { searchId } = await params;
  const trip = await getTrip(searchId);
  const url = `/trip/${searchId}`;

  // If the backend doesn't expose this trip publicly (auth-required, deleted,
  // or marked private), fall back to generic metadata + noindex so we don't
  // surface a broken-looking SERP entry.
  if (!trip || !trip.destination) {
    return {
      title: 'Trip itinerary',
      description: 'Plan your trip with AI on Periplo.',
      alternates: { canonical: url },
      robots: { index: false, follow: false },
    };
  }

  const dayCount = trip.travel_plan?.length ?? 0;
  const topActivities = trip.activities?.slice(0, 3).map((a) => a.name).filter(Boolean).join(', ');
  const dayLabel = dayCount > 0 ? `${dayCount}-day ` : '';
  const title = `${dayLabel}${trip.destination} itinerary`;
  const description = topActivities
    ? `${dayCount > 0 ? `A ${dayCount}-day ` : 'A '}AI-generated itinerary for ${trip.destination}, including ${topActivities}. Built with Periplo.`
    : `An AI-generated itinerary for ${trip.destination}. Built with Periplo.`;
  const trimmedDescription = description.length > 200 ? `${description.slice(0, 197)}…` : description;

  const heroImage = trip.activities?.length ? firstImageUrl(trip.activities[0].images as never) : undefined;

  return {
    title,
    description: trimmedDescription,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | Periplo`,
      description: trimmedDescription,
      url,
      type: 'article',
      ...(heroImage ? { images: [{ url: heroImage, width: 1200, height: 630, alt: trip.destination }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Periplo`,
      description: trimmedDescription,
      ...(heroImage ? { images: [heroImage] } : {}),
    },
  };
}

export default async function TripDetailPage({ params }: Props) {
  const { searchId } = await params;
  const trip = await getTrip(searchId);

  const breadcrumbLd = trip?.destination
    ? stringifyJsonLd(
        breadcrumbListJsonLd([
          { name: 'Home', url: '/' },
          { name: 'My Trips', url: '/history' },
          { name: trip.destination, url: `/trip/${searchId}` },
        ]),
      )
    : null;

  const tripLd = trip?.destination
    ? stringifyJsonLd(
        touristTripJsonLd({
          name: `${trip.travel_plan?.length ?? 0}-day ${trip.destination} itinerary`,
          description: `AI-generated itinerary for ${trip.destination}.`,
          url: `/trip/${searchId}`,
          image: trip.activities?.length ? firstImageUrl(trip.activities[0].images as never) : undefined,
          destination: { city: trip.destination },
          itinerary: (trip.activities ?? []).slice(0, 12).map((a) => ({
            name: a.name ?? 'Activity',
            description: a.description,
          })),
        }),
      )
    : null;

  return (
    <>
      {breadcrumbLd && (
        <Script
          id={`ld-breadcrumb-${searchId}`}
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: breadcrumbLd }}
        />
      )}
      {tripLd && (
        <Script
          id={`ld-trip-${searchId}`}
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: tripLd }}
        />
      )}
      <TripDetailClient searchId={searchId} initialDestination={trip?.destination} />
    </>
  );
}
