// Pass-through wrapper for the (legal) route group. Each page renders its own
// `<LegalLayout>` (Navigation + Container + Footer + prose styling), so this
// file exists only to scope future legal-only providers without introducing
// extra DOM today.
export default function LegalRouteGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
