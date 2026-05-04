import type { Metadata } from 'next';
import { HandoffCard } from '../../_components/HandoffCard';

export const metadata: Metadata = {
  title: 'Open in Periplo',
  robots: { index: false, follow: false },
};

interface TemplateHandoffPageProps {
  params: Promise<{ id: string }>;
}

export default async function TemplateHandoffPage({ params }: TemplateHandoffPageProps) {
  const { id } = await params;

  return (
    <HandoffCard
      subhead="We'll open the trip template in the app."
      deepLink={`periplo://template/${id}`}
      caption={`Template ${id}`}
    />
  );
}
