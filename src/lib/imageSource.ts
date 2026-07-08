/**
 * Backend content photos (activity / destination / feed images) are already
 * routed through the images.weserv.nl CDN, which resizes to a bounded width
 * and re-encodes to webp. Running those URLs through Next.js's `/_next/image`
 * optimizer a second time is a pure double-proxy: it adds a second network
 * hop (next → weserv → upstream), which on the dev server surfaces as 400 /
 * 504 responses when the upstream is slow or dead, and on Vercel double-bills
 * image-optimization units for no visual gain.
 *
 * Detect those already-optimized sources so callers can pass `unoptimized`
 * and render the CDN URL directly. Local/static assets (marketing mockups,
 * not-found art) are NOT matched and keep the normal optimizer path.
 */
const PRE_OPTIMIZED_HOSTS = new Set(['images.weserv.nl', 'wsrv.nl']);

export function isPreOptimizedImage(src: string | null | undefined): boolean {
  if (!src) return false;
  try {
    return PRE_OPTIMIZED_HOSTS.has(new URL(src).hostname);
  } catch {
    return false;
  }
}
