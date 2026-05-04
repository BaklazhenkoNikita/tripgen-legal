import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getStripe } from '@/lib/stripe/server';

/**
 * Create a Stripe Billing Portal session. Looks up the customer by Clerk
 * user id (stored as `metadata.clerk_user_id` on the customer at checkout)
 * — falls back to email if no metadata customer is found.
 */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const origin = req.headers.get('origin') ?? new URL(req.url).origin;

  try {
    const stripe = getStripe();

    // Find the customer. Stripe doesn't index by metadata for the search API
    // unless explicitly enabled, so we use the `search` API which does
    // (it's eventually consistent — fine for portal access).
    let customerId: string | null = null;
    try {
      const found = await stripe.customers.search({
        query: `metadata['clerk_user_id']:'${userId}'`,
        limit: 1,
      });
      customerId = found.data[0]?.id ?? null;
    } catch {
      // search may fail for new accounts; fall back below
    }

    if (!customerId && email) {
      const list = await stripe.customers.list({ email, limit: 1 });
      customerId = list.data[0]?.id ?? null;
    }

    if (!customerId) {
      return NextResponse.json(
        { error: 'No active subscription found for this account.' },
        { status: 404 },
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/profile`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : 'Could not open portal',
      },
      { status: 500 },
    );
  }
}
