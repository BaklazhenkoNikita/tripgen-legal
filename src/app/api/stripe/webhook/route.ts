import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe/server';
import { API_BASE_URL } from '@/lib/api/baseUrl';

/**
 * Stripe webhook receiver.
 *
 * Verifies the Stripe signature, then relays a normalized event to the
 * backend `POST /api/webhooks/stripe` (bearer-auth with a shared secret).
 * The backend updates `user_profiles.is_pro` etc. — this route is only
 * the trust boundary + format normalization.
 *
 * Required env:
 * - STRIPE_SECRET_KEY
 * - STRIPE_WEBHOOK_SECRET (Stripe-signing secret — `whsec_…`)
 * - BACKEND_STRIPE_RELAY_SECRET (shared secret with the FastAPI handler)
 */
export const runtime = 'nodejs';

export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'STRIPE_WEBHOOK_SECRET not configured' },
      { status: 503 },
    );
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Bad signature' },
      { status: 400 },
    );
  }

  const normalized = normalize(event);
  if (!normalized) {
    // Event type we don't care about — Stripe will mark this as success.
    return NextResponse.json({ status: 'ignored', type: event.type });
  }

  const relaySecret = process.env.BACKEND_STRIPE_RELAY_SECRET;
  if (!relaySecret) {
    return NextResponse.json(
      { error: 'BACKEND_STRIPE_RELAY_SECRET not configured' },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/webhooks/stripe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${relaySecret}`,
      },
      body: JSON.stringify(normalized),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return NextResponse.json(
        { error: `Backend relay failed: ${res.status} ${body.slice(0, 200)}` },
        { status: 502 },
      );
    }
    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? `Relay error: ${err.message}`
            : 'Relay error',
      },
      { status: 502 },
    );
  }
}

interface NormalizedEvent {
  type:
    | 'subscription.granted'
    | 'subscription.cancelled_autorenew'
    | 'subscription.expired';
  clerk_user_id: string;
  expires_at_ms: number | null;
  event_timestamp_ms: number;
}

/** Map Stripe events to a small, stable shape the backend handler can rely on. */
function normalize(event: Stripe.Event): NormalizedEvent | null {
  const ts = event.created * 1000;

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = clerkIdFromSession(session);
    if (!userId) return null;
    return {
      type: 'subscription.granted',
      clerk_user_id: userId,
      expires_at_ms: null,
      event_timestamp_ms: ts,
    };
  }

  if (
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.created'
  ) {
    const sub = event.data.object as Stripe.Subscription;
    const userId = clerkIdFromSubscription(sub);
    if (!userId) return null;
    const expiresMs = currentPeriodEndMs(sub);
    if (sub.cancel_at_period_end) {
      return {
        type: 'subscription.cancelled_autorenew',
        clerk_user_id: userId,
        expires_at_ms: expiresMs,
        event_timestamp_ms: ts,
      };
    }
    if (sub.status === 'active' || sub.status === 'trialing') {
      return {
        type: 'subscription.granted',
        clerk_user_id: userId,
        expires_at_ms: expiresMs,
        event_timestamp_ms: ts,
      };
    }
    if (
      sub.status === 'canceled' ||
      sub.status === 'incomplete_expired' ||
      sub.status === 'unpaid'
    ) {
      return {
        type: 'subscription.expired',
        clerk_user_id: userId,
        expires_at_ms: expiresMs,
        event_timestamp_ms: ts,
      };
    }
    return null;
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription;
    const userId = clerkIdFromSubscription(sub);
    if (!userId) return null;
    const expiresMs = currentPeriodEndMs(sub);
    return {
      type: 'subscription.expired',
      clerk_user_id: userId,
      expires_at_ms: expiresMs,
      event_timestamp_ms: ts,
    };
  }

  return null;
}

/**
 * `current_period_end` lived on the subscription itself in older Stripe API
 * versions and on each subscription item in newer ones (2025+). Read both
 * shapes so we don't break across SDK upgrades.
 */
function currentPeriodEndMs(sub: Stripe.Subscription): number | null {
  const top = (sub as unknown as { current_period_end?: number }).current_period_end;
  if (typeof top === 'number') return top * 1000;
  const item = sub.items?.data?.[0] as
    | (Stripe.SubscriptionItem & { current_period_end?: number })
    | undefined;
  if (item && typeof item.current_period_end === 'number') {
    return item.current_period_end * 1000;
  }
  return null;
}

function clerkIdFromSession(s: Stripe.Checkout.Session): string | null {
  return (
    s.client_reference_id ??
    (typeof s.metadata?.clerk_user_id === 'string' ? s.metadata.clerk_user_id : null)
  );
}

function clerkIdFromSubscription(s: Stripe.Subscription): string | null {
  return typeof s.metadata?.clerk_user_id === 'string'
    ? s.metadata.clerk_user_id
    : null;
}
