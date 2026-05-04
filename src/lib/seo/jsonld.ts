/**
 * Typed schema.org JSON-LD builders. Output is meant to be passed to
 * `JSON.stringify` and dropped into a `<script type="application/ld+json">`
 * tag rendered server-side. Builders return `null` when the inputs are
 * insufficient to produce a valid block — callers should `&&`-gate the
 * script tag on the truthiness of the result so we never emit empty
 * structured data.
 *
 * Validate output with Google's Rich Results Test:
 * https://search.google.com/test/rich-results
 */

const SITE_URL = 'https://periploapp.com';
const SITE_NAME = 'Periplo';

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon-512x512.png`,
    description: 'AI travel-planning app — day-by-day itineraries built around what you love.',
    sameAs: [
      // Social profiles can be added here once linked. Empty array still
      // validates; the field exists so `Organization` surfaces a knowledge
      // panel candidate.
    ],
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/explore?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbListJsonLd(items: BreadcrumbItem[]) {
  if (!items.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

interface TouristDestinationInput {
  city: string;
  country: string;
  description: string;
  image: string;
  url: string;
  geo?: { latitude: number; longitude: number };
  includedAttractions?: Array<{ name: string; url: string }>;
  touristType?: string[];
}

export function touristDestinationJsonLd(input: TouristDestinationInput) {
  const block: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: `${input.city}, ${input.country}`,
    description: input.description,
    image: input.image,
    url: input.url.startsWith('http') ? input.url : `${SITE_URL}${input.url}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: input.city,
      addressCountry: input.country,
    },
    touristType: input.touristType ?? ['Leisure', 'Cultural', 'Sightseeing'],
  };
  if (input.geo) {
    block.geo = {
      '@type': 'GeoCoordinates',
      latitude: input.geo.latitude,
      longitude: input.geo.longitude,
    };
  }
  if (input.includedAttractions?.length) {
    block.includesAttraction = input.includedAttractions.map((a) => ({
      '@type': 'TouristAttraction',
      name: a.name,
      url: a.url.startsWith('http') ? a.url : `${SITE_URL}${a.url}`,
    }));
  }
  return block;
}

interface TouristAttractionInput {
  name: string;
  description?: string;
  image?: string | string[];
  url: string;
  address?: string;
  city?: string;
  country?: string;
  geo?: { latitude: number; longitude: number };
  rating?: { value: number; count?: number };
  website?: string;
}

export function touristAttractionJsonLd(input: TouristAttractionInput) {
  if (!input.name) return null;
  const block: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: input.name,
    url: input.url.startsWith('http') ? input.url : `${SITE_URL}${input.url}`,
  };
  if (input.description) block.description = input.description;
  if (input.image) block.image = input.image;
  if (input.website) block.sameAs = [input.website];
  if (input.address || input.city || input.country) {
    const address: Record<string, unknown> = { '@type': 'PostalAddress' };
    if (input.address) address.streetAddress = input.address;
    if (input.city) address.addressLocality = input.city;
    if (input.country) address.addressCountry = input.country;
    block.address = address;
  }
  if (input.geo) {
    block.geo = {
      '@type': 'GeoCoordinates',
      latitude: input.geo.latitude,
      longitude: input.geo.longitude,
    };
  }
  if (input.rating && input.rating.value > 0) {
    block.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: input.rating.value,
      ratingCount: input.rating.count ?? 1,
      bestRating: 5,
      worstRating: 1,
    };
  }
  return block;
}

interface TouristTripInput {
  name: string;
  description: string;
  url: string;
  image?: string;
  destination: { city: string; country?: string };
  itinerary: Array<{ name: string; url?: string; description?: string }>;
}

export function touristTripJsonLd(input: TouristTripInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: input.name,
    description: input.description,
    url: input.url.startsWith('http') ? input.url : `${SITE_URL}${input.url}`,
    ...(input.image ? { image: input.image } : {}),
    touristType: ['Leisure'],
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    itinerary: {
      '@type': 'ItemList',
      numberOfItems: input.itinerary.length,
      itemListElement: input.itinerary.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'TouristAttraction',
          name: item.name,
          ...(item.description ? { description: item.description } : {}),
          ...(item.url ? { url: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}` } : {}),
        },
      })),
    },
    subjectOf: {
      '@type': 'Place',
      name: `${input.destination.city}${input.destination.country ? `, ${input.destination.country}` : ''}`,
    },
  };
}

/** Stringify a JSON-LD block for safe inline embedding. Escapes `</script>`
 *  to defend against accidental closure if a user-supplied string contained
 *  one. Returns `null` when block is null so callers can `&&`-gate. */
export function stringifyJsonLd(block: unknown): string | null {
  if (!block) return null;
  return JSON.stringify(block).replace(/</g, '\\u003c');
}
