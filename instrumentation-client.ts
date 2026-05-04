/**
 * Sentry — browser (client) init.
 *
 * Activated only when `NEXT_PUBLIC_SENTRY_DSN` is set. Mirrors mobile's
 * `sentry.ts` filters: drops 4xx AxiosError/ApiError events (client-side
 * failures aren't actionable) and redacts Authorization headers from
 * breadcrumbs. Sample rate is low in production to keep budget sane.
 */

import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const environment = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? 'development';
const release = process.env.NEXT_PUBLIC_SENTRY_RELEASE;

if (dsn) {
  Sentry.init({
    dsn,
    environment,
    release,
    tracesSampleRate: environment === 'production' ? 0.02 : 1.0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.data && typeof breadcrumb.data === 'object') {
        const data = breadcrumb.data as Record<string, unknown>;
        if (typeof data.request_headers === 'object' && data.request_headers) {
          // Strip the auth header, keep everything else.
          const headers = { ...(data.request_headers as Record<string, unknown>) };
          delete headers.Authorization;
          delete headers.authorization;
          data.request_headers = headers;
        }
      }
      return breadcrumb;
    },
    beforeSend(event, hint) {
      // Drop 4xx client errors — they're UX-relevant but not server-actionable.
      const err = hint?.originalException;
      if (err && typeof err === 'object' && 'status' in err) {
        const status = (err as { status?: unknown }).status;
        if (typeof status === 'number' && status >= 400 && status < 500) {
          return null;
        }
      }
      return event;
    },
  });
}
