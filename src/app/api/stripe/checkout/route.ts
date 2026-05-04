import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getStripe, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_ANNUAL } from '@/lib/stripe/server';

const PRICE_MAP: Record<string, string> = {
  monthly: STRIPE_PRICE_MONTHLY,
  annual: STRIPE_PRICE_ANNUAL,
};

/**
 * Create a Stripe Checkout Session for Pro subscription. Auth-required —
 * we tie the Clerk user id into `client_reference_id` so the webhook can
 * resolve back to the right account when the subscription completes.
 */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  let body: { plan?: 'monthly' | 'annual' };
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

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const origin = req.headers.get('origin') ?? new URL(req.url).origin;

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      client_reference_id: userId,
      // Anything we need on the webhook lives here — kept minimal because
      // Stripe also echoes `client_reference_id` on the session.
      metadata: { clerk_user_id: userId },
      subscription_data: {
        metadata: { clerk_user_id: userId },
      },
      allow_promotion_codes: true,
      success_url: `${origin}/profile?upgraded=1`,
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
