import type { Metadata } from 'next';
import Script from 'next/script';
import { stringifyJsonLd } from '@/lib/seo/jsonld';
import { PricingClient } from './PricingClient';

const TITLE = 'Pricing — Periplo Pro';
const DESCRIPTION =
  'Unlimited AI trip generations, priority routing, and the same itinerary engine the Periplo mobile app uses. Pro Monthly $4.99, Pro Annual $29.99.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/pricing',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

const productLd = stringifyJsonLd({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Periplo Pro',
  description:
    'Unlimited AI trip generations and priority routing for the Periplo travel planner.',
  brand: { '@type': 'Brand', name: 'Periplo' },
  offers: [
    {
      '@type': 'Offer',
      name: 'Pro Monthly',
      price: '4.99',
      priceCurrency: 'USD',
      url: 'https://periploapp.com/pricing',
      category: 'Subscription',
    },
    {
      '@type': 'Offer',
      name: 'Pro Annual',
      price: '29.99',
      priceCurrency: 'USD',
      url: 'https://periploapp.com/pricing',
      category: 'Subscription',
    },
  ],
});

export default function PricingPage() {
  return (
    <>
      <PricingClient />
      {productLd && (
        <Script
          id="ld-pricing-product"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: productLd }}
        />
      )}
    </>
  );
}
