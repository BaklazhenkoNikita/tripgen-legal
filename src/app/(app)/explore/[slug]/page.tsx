import type { Metadata } from 'next';
import Script from 'next/script';
import { destinations } from '@/data/destinations';
import { slugToCity } from '@/lib/destinationSlug';
import {
  breadcrumbListJsonLd,
  touristDestinationJsonLd,
  stringifyJsonLd,
} from '@/lib/seo/jsonld';
import { DestinationSlugClient } from './DestinationSlugClient';

interface Props {
  params: Promise<{ slug: string }>;
}

/** Pre-render every curated destination at build time so the SSR HTML
 *  Googlebot sees on first crawl is the full city page (with metadata,
 *  JSON-LD, and breadcrumbs). Non-curated slugs still work — they fall
 *  through to dynamic rendering with humanised metadata. */
export async function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dest = destinations.find((d) => d.slug === slug);
  const url = `/explore/${slug}`;

  if (dest) {
    return {
      title: `Explore ${dest.city}, ${dest.country}`,
      description: dest.metaDescription,
      alternates: { canonical: url },
      openGraph: {
        title: `Explore ${dest.city}, ${dest.country} | Periplo`,
        description: dest.metaDescription,
        url,
        type: 'website',
        images: [{ url: dest.heroImage, width: 1200, height: 630, alt: `${dest.city}, ${dest.country}` }],
      },
      twitter: {
        card: 'summary_large_image',
        title: `Explore ${dest.city}, ${dest.country} | Periplo`,
        description: dest.metaDescription,
        images: [dest.heroImage],
      },
    };
  }

  // Non-curated slug — humanised fallback so we still emit useful metadata.
  const city = slugToCity(slug);
  const description = `Plan your perfect trip to ${city} with Periplo. Discover top activities, restaurants, and attractions, then build a personalized day-by-day itinerary with AI.`;
  return {
    title: `Explore ${city}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `Explore ${city} | Periplo`,
      description,
      url,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Explore ${city} | Periplo`,
      description,
    },
  };
}

export default async function DestinationSlugPage({ params }: Props) {
  const { slug } = await params;
  const city = slugToCity(slug);
  const dest = destinations.find((d) => d.slug === slug);

  const breadcrumbLd = stringifyJsonLd(
    breadcrumbListJsonLd([
      { name: 'Home', url: '/' },
      { name: 'Explore', url: '/explore' },
      { name: city, url: `/explore/${slug}` },
    ]),
  );

  const destinationLd = dest
    ? stringifyJsonLd(
        touristDestinationJsonLd({
          city: dest.city,
          country: dest.country,
          description: dest.overview,
          image: dest.heroImage,
          url: `/explore/${slug}`,
          touristType: ['Leisure', 'Cultural', 'Sightseeing'],
        }),
      )
    : null;

  return (
    <>
      {breadcrumbLd && (
        <Script
          id={`ld-breadcrumb-${slug}`}
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: breadcrumbLd }}
        />
      )}
      {destinationLd && (
        <Script
          id={`ld-destination-${slug}`}
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: destinationLd }}
        />
      )}
      <DestinationSlugClient city={city} />
    </>
  );
}
