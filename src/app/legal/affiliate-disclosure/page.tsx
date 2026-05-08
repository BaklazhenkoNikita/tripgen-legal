import type { Metadata } from 'next';
import Link from 'next/link';
import Box from '@mui/material/Box';
import { LegalLayout } from '@/components/layout/LegalLayout';

export const metadata: Metadata = {
  title: 'Affiliate Disclosure',
  description:
    "Periplo's affiliate relationships, how we earn commissions from partner bookings, and our editorial independence.",
  alternates: { canonical: '/legal/affiliate-disclosure' },
};

export default function AffiliateDisclosurePage() {
  return (
    <LegalLayout title="Affiliate Disclosure" lastUpdated="April 19, 2026">
      <Box
        sx={{
          bgcolor: 'rgb(var(--tg-palette-primary-mainChannel) / 0.08)',
          borderLeft: '3px solid',
          borderColor: 'primary.main',
          borderRadius: '0 12px 12px 0',
          p: '16px 20px',
          my: 2,
          '& p:last-child': { mb: 0 },
        }}
      >
        <p>
          <strong>In plain English:</strong> Periplo earns a commission when you
          book travel through some of the partner links inside the app. This
          never costs you extra. The partners do not pay us to recommend their
          products, and our trip suggestions are not ranked by commission.
        </p>
      </Box>

      <h2>1. What this disclosure covers</h2>
      <p>
        Periplo participates in affiliate programs &mdash; arrangements in which
        third-party travel providers pay us a commission on bookings that
        originate from links in our app. This page discloses those relationships
        in accordance with the U.S. Federal Trade Commission&apos;s Endorsement
        Guides (16 CFR Part 255) and analogous consumer-transparency rules in
        other jurisdictions.
      </p>

      <h2>2. Where affiliate links appear</h2>
      <p>
        Affiliate links appear on the in-app &quot;Book travel&quot;
        quick-actions (Hotels, Flights, Trains, eSIM) and on select booking
        buttons inside activity and tour cards. When you tap one of these
        buttons, you are redirected to a third-party website. Any purchase you
        make there is a direct transaction between you and that third party.
      </p>

      <h2>3. Our partners</h2>
      <p>We currently have affiliate relationships with the following providers:</p>
      <Box component="table">
        <thead>
          <tr>
            <th>Partner</th>
            <th>What it&apos;s used for</th>
            <th>How the link is built</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <a
                href="https://www.trip.com"
                target="_blank"
                rel="nofollow noopener noreferrer"
              >
                Trip.com
              </a>
            </td>
            <td>Hotel search &amp; booking</td>
            <td>Via Travelpayouts (tp.media) tracking</td>
          </tr>
          <tr>
            <td>
              <a
                href="https://www.aviasales.com"
                target="_blank"
                rel="nofollow noopener noreferrer"
              >
                Aviasales
              </a>
            </td>
            <td>Flight search</td>
            <td>Via Travelpayouts (tp.media) tracking</td>
          </tr>
          <tr>
            <td>
              <a
                href="https://www.omio.com"
                target="_blank"
                rel="nofollow noopener noreferrer"
              >
                Omio
              </a>
            </td>
            <td>Train, bus &amp; ferry search</td>
            <td>Via Travelpayouts (tp.media) tracking</td>
          </tr>
          <tr>
            <td>
              <a
                href="https://saily.com"
                target="_blank"
                rel="nofollow noopener noreferrer"
              >
                Saily
              </a>
            </td>
            <td>Travel eSIM data plans</td>
            <td>Direct Saily affiliate link</td>
          </tr>
          <tr>
            <td>
              <a
                href="https://www.viator.com"
                target="_blank"
                rel="nofollow noopener noreferrer"
              >
                Viator
              </a>
            </td>
            <td>Tours, tickets &amp; experiences</td>
            <td>Viator Partner API</td>
          </tr>
        </tbody>
      </Box>
      <p>
        This list may change as we add or remove partners. The current list on
        this page is authoritative.
      </p>

      <h2>4. Editorial independence</h2>
      <p>
        Our AI-generated trip itineraries and activity recommendations are
        produced independently of affiliate considerations:
      </p>
      <ul>
        <li>
          We do not rank, boost, or surface activities or destinations because a
          partner pays a higher commission.
        </li>
        <li>
          Partners do not pay us to include specific hotels, flights, tours, or
          attractions in generated itineraries.
        </li>
        <li>
          The AI does not receive affiliate-commission data as input; it plans
          based on your preferences, location, and publicly available
          information.
        </li>
        <li>
          We enable affiliate tracking <em>only</em> at the point where you
          choose to book, by redirecting via the partner-provided tracking URL.
        </li>
      </ul>

      <h2>5. What we earn, and what we don&apos;t</h2>
      <p>
        When you complete a qualifying booking through one of our links, the
        partner pays Periplo a commission &mdash; typically a small percentage of
        the booking value. The commission is paid by the partner out of their
        own margin; <strong>the price you pay is identical whether or not you
        use our link</strong>.
      </p>
      <p>
        We do not receive your payment details, booking confirmation data, or
        any personally identifying information about the booking from the
        partner. We typically receive only aggregate attribution data (that a
        booking occurred, and the commission owed).
      </p>

      <h2>6. How affiliate tracking works technically</h2>
      <p>
        When you tap an affiliate button, the app opens the partner&apos;s site
        through an intermediate tracking URL (for example,{' '}
        <code>tp.media/r?...</code> for our Travelpayouts partners). That URL
        places the partner&apos;s cookie or tracking identifier so the partner
        knows the booking came from Periplo. Periplo does not set any tracking
        cookies of its own; the cookies are the partner&apos;s, governed by the
        partner&apos;s privacy policy.
      </p>

      <h2>7. Your choice</h2>
      <p>
        You are never required to use an affiliate link. You can search for and
        book travel directly with any of the above providers without going
        through the app, and you will get the same price.
      </p>

      <h2>8. Related policies</h2>
      <p>
        See also: <Link href="/legal/privacy">Privacy Policy</Link> (what
        partners may receive about you) and{' '}
        <Link href="/legal/terms">Terms of Service</Link> &sect; 6 (third-party
        services and booking).
      </p>

      <h2>9. Questions</h2>
      <Box
        sx={{
          bgcolor: 'action.hover',
          borderRadius: 1.5,
          p: 2.5,
          mt: 3,
          '& p': { mb: 1, '&:last-child': { mb: 0 } },
        }}
      >
        <p>Questions about this disclosure or any specific recommendation?</p>
        <p>
          <a href="mailto:support@periploapp.com">support@periploapp.com</a>
        </p>
      </Box>
    </LegalLayout>
  );
}
