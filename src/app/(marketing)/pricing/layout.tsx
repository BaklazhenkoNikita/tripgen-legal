import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing — Periplo Pro',
  description:
    'Simple, transparent pricing for Periplo Pro. Unlimited AI-generated trips, real-time collaboration, and priority support. Start free.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Pricing — Periplo Pro',
    description:
      'Simple, transparent pricing for Periplo Pro. Unlimited AI-generated trips, real-time collaboration, and priority support. Start free.',
    url: 'https://periploapp.com/pricing',
    type: 'website',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
