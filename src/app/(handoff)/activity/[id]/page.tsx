import type { Metadata } from 'next';
import { HandoffCard } from '../../_components/HandoffCard';

export const metadata: Metadata = {
  title: 'Open in Periplo',
  robots: { index: false, follow: false },
};

interface ActivityHandoffPageProps {
  params: Promise<{ id: string }>;
}

export default async function ActivityHandoffPage({ params }: ActivityHandoffPageProps) {
  const { id } = await params;

  return (
    <HandoffCard
      subhead="We'll take you straight to the activity once the app is open."
      deepLink={`periplo://activity/${id}`}
      caption={`Activity ${id}`}
    />
  );
}
