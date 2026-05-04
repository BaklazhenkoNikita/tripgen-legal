'use client';

import { use, useEffect } from 'react';
import { useCity } from '@/contexts';
import { slugToCity } from '@/lib/destinationSlug';
import { DestinationView } from '@/components/destinations/DestinationView';

interface Props {
  params: Promise<{ slug: string }>;
}

/** Deep-link entry: /explore/paris-5-days or /explore/tokyo. Resolves
 *  the slug to a city name (curated list first, then a humanised fallback for
 *  arbitrary slugs), syncs the city context, then renders the live view. */
export default function DestinationSlugPage({ params }: Props) {
  const { slug } = use(params);
  const city = slugToCity(slug);
  const { city: activeCity, setCity } = useCity();

  useEffect(() => {
    if (activeCity !== city) setCity(city);
  }, [city, activeCity, setCity]);

  return <DestinationView city={city} />;
}
