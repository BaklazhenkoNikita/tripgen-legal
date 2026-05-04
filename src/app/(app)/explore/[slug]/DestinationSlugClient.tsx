'use client';

import { useEffect } from 'react';
import { useCity } from '@/contexts';
import { DestinationView } from '@/components/destinations/DestinationView';

/** Sync the city context with the deep-linked slug, then render the live
 *  destination view. Extracted from the route file so the route itself can
 *  be a server component (for generateMetadata + structured data). */
export function DestinationSlugClient({ city }: { city: string }) {
  const { city: activeCity, setCity } = useCity();

  useEffect(() => {
    if (activeCity !== city) setCity(city);
  }, [city, activeCity, setCity]);

  return <DestinationView city={city} />;
}
