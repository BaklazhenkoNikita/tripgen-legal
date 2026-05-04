import Stripe from 'stripe';

/**
 * Server-only Stripe client. Reads `STRIPE_SECRET_KEY` from env. Throws at
 * call time (not module load) so build-time prerendering doesn't fail when
 * the key isn't injected yet.
 */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  _stripe = new Stripe(key, {
    // Use the SDK's bundled API version. Pinning here only matters when we
    // want to lock to an older version than the installed lib expects.
    typescript: true,
  });
  return _stripe;
}

export const STRIPE_PRICE_MONTHLY = process.env.STRIPE_PRICE_MONTHLY ?? '';
export const STRIPE_PRICE_ANNUAL = process.env.STRIPE_PRICE_ANNUAL ?? '';
