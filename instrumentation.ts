/**
 * Next.js instrumentation hook — wires server + edge Sentry init.
 * See https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

/**
 * Forward request errors (server components, server actions, route handlers)
 * into Sentry. No-op when DSN isn't configured — the sentry init files
 * short-circuit and `captureRequestError` does nothing.
 */
export const onRequestError = Sentry.captureRequestError;
