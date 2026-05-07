import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getStripe, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_ANNUAL } from '@/lib/stripe/server';

const PRICE_MAP: Record<string, string> = {
  monthly: STRIPE_PRICE_MONTHLY,
  annual: STRIPE_PRICE_ANNUAL,
};

// Stripe metadata values cap at 500 chars; we cap our attribution tags much
// shorter to keep them readable in the dashboard and to avoid stuffing
// arbitrary user-supplied data into Stripe.
const ATTRIBUTION_MAX_LEN = 60;
const ATTRIBUTION_ALLOWED = /^[A-Za-z0-9_:.-]+$/;

function sanitizeAttribution(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim().slice(0, ATTRIBUTION_MAX_LEN);
  if (!trimmed) return undefined;
  return ATTRIBUTION_ALLOWED.test(trimmed) ? trimmed : undefined;
}

/**
 * Create a Stripe Checkout Session for Pro subscription. Auth-required —
 * we tie the Clerk user id into `client_reference_id` so the webhook can
 * resolve back to the right account when the subscription completes.
 *
 * Optional `source` / `campaign` (e.g. from the MCP-paywall landing page)
 * are stored as Stripe metadata for attribution; `source` is also echoed
 * into the success_url as `?from=...` so the post-purchase profile screen
 * can adapt copy for MCP-origin upgrades.
 */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  let body: { plan?: 'monthly' | 'annual'; source?: string; campaign?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const priceId = body.plan ? PRICE_MAP[body.plan] : null;
  if (!priceId) {
    return NextResponse.json(
      { error: `Unknown plan: ${body.plan}. Expected 'monthly' or 'annual'.` },
      { status: 400 },
    );
  }

  const source = sanitizeAttribution(body.source);
  const campaign = sanitizeAttribution(body.campaign);

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const origin = req.headers.get('origin') ?? new URL(req.url).origin;

  const metadata: Record<string, string> = { clerk_user_id: userId };
  if (source) metadata.source = source;
  if (campaign) metadata.campaign = campaign;

  const successUrl = source
    ? `${origin}/profile?upgraded=1&from=${encodeURIComponent(source)}`
    : `${origin}/profile?upgraded=1`;

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      client_reference_id: userId,
      // Anything we need on the webhook lives here — kept minimal because
      // Stripe also echoes `client_reference_id` on the session.
      metadata,
      subscription_data: {
        metadata,
      },
      allow_promotion_codes: true,
      success_url: successUrl,
      cancel_url: `${origin}/pricing?cancelled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : 'Checkout failed',
      },
      { status: 500 },
    );
  }
}
