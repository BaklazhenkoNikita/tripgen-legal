/**
 * Single source for the backend API base URL.
 *
 * When `NEXT_PUBLIC_USE_API_PROXY=true`, returns '' so callers produce
 * relative `/api/...` URLs that the Next.js `rewrites()` proxy forwards to
 * the real backend server-side. This avoids browser CORS preflight on dev
 * origins (e.g. localhost:3000) that aren't on the backend allowlist.
 *
 * Otherwise returns the absolute backend URL — production origins are on
 * the backend's allowlist so direct cross-origin calls work.
 */
const useProxy = process.env.NEXT_PUBLIC_USE_API_PROXY === 'true';

export const API_BASE_URL = useProxy
  ? ''
  : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080');
