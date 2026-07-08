import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// NOTE: /trip, /chat and /history are intentionally NOT protected — anonymous
// users can use them as guests (X-Session-Id attribution on the backend) and
// later merge into an authenticated profile via POST /api/profiles/merge (wired
// through useGuestMerge in src/app/(app)/layout.tsx). /history reads back the
// guest's own X-Session-Id-attributed trips (or renders the empty state);
// protecting it would bounce guests to /?redirect=/history — a dead end nothing
// consumes.
const isProtectedRoute = createRouteMatcher([
  '/profile(.*)',
  '/discover(.*)',
  '/join(.*)',
  '/shared(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return;

  const { userId } = await auth();
  if (userId) return;

  // Unauthenticated users hitting a protected route — send them to the
  // marketing landing with the intended destination preserved. auth.protect()
  // would 404 instead of redirect, which confuses users arriving via a link
  // they can't yet open.
  const redirectUrl = new URL('/', req.url);
  const pathWithQuery = req.nextUrl.pathname + req.nextUrl.search;
  redirectUrl.searchParams.set('redirect', pathWithQuery);
  return NextResponse.redirect(redirectUrl);
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
