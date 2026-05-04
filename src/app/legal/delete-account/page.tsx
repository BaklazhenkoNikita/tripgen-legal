import type { Metadata } from 'next';
import Link from 'next/link';
import Box from '@mui/material/Box';
import { LegalLayout } from '@/components/layout/LegalLayout';

export const metadata: Metadata = {
  title: 'Delete Your Account',
  description: 'How to delete your Periplo account and personal data.',
  alternates: { canonical: '/legal/delete-account' },
};

export default function DeleteAccountPage() {
  return (
    <LegalLayout title="Delete Your Account" lastUpdated="April 19, 2026">
      <p>
        You can permanently delete your Periplo account and associated personal data
        at any time. This page explains how, and what happens to your data.
      </p>

      <h2>Option 1: Delete from inside the app (recommended)</h2>
      <ol>
        <li>Open Periplo on your device.</li>
        <li>Tap your profile icon.</li>
        <li>
          Open <strong>Settings</strong>.
        </li>
        <li>
          Scroll to the bottom and tap <strong>Delete Account</strong>.
        </li>
        <li>Confirm when prompted.</li>
      </ol>
      <p>
        Your account is marked for deletion immediately. All associated personal data
        is removed from our systems within 30 days.
      </p>

      <h2>Option 2: Request deletion by email</h2>
      <p>
        If you cannot access the app (for example, you uninstalled it or lost access
        to your account), email us at{' '}
        <a href="mailto:support@periploapp.com">support@periploapp.com</a> with the
        subject line <code>Account Deletion Request</code>.
      </p>
      <p>Include:</p>
      <ul>
        <li>The email address associated with your Periplo account</li>
        <li>Your display name (if known)</li>
        <li>Optional: the approximate date you created the account</li>
      </ul>
      <p>We will verify the request and confirm deletion by reply within 30 days.</p>

      <h2>What gets deleted</h2>
      <ul>
        <li>Your account profile (email, display name, authentication record)</li>
        <li>All trips, itineraries, and saved activities tied to your account</li>
        <li>Preferences, swipe history, and recommendation data</li>
        <li>Chat history with the Periplo AI assistant</li>
        <li>
          Subscription linkage in our records (the Apple / Google / RevenueCat records
          remain with the payment provider &mdash; see below)
        </li>
      </ul>

      <h2>What is retained, and why</h2>
      <ul>
        <li>
          <strong>Anonymized crash reports and performance telemetry</strong> (Sentry):
          automatically deleted after 90 days. These are not linked to your identity.
        </li>
        <li>
          <strong>Subscription receipts</strong> held by Apple / Google / RevenueCat:
          retained by those providers per their own policies &mdash; we do not control
          them. To cancel an active subscription, do so <em>before</em> deleting your
          account via your device&apos;s subscription settings.
        </li>
        <li>
          <strong>Backups</strong>: routine backups may contain deleted data until
          they roll off (at most 30 days), after which they are overwritten.
        </li>
        <li>
          <strong>Records required by law</strong>: we may retain limited records
          (e.g., tax-relevant transaction metadata) where required by applicable law,
          for the minimum period required.
        </li>
      </ul>

      <Box
        sx={{
          bgcolor: 'rgba(196, 96, 58, 0.08)',
          borderLeft: '3px solid',
          borderColor: 'primary.main',
          borderRadius: '0 12px 12px 0',
          p: '16px 20px',
          my: 2,
          '& p:last-child': { mb: 0 },
        }}
      >
        <p>
          <strong>Before you delete:</strong> cancel any active Periplo Pro
          subscription in your device&apos;s App Store subscription settings first.
          Deleting your Periplo account does not cancel your subscription &mdash; only
          the payment provider can do that.
        </p>
      </Box>

      <h2>After deletion</h2>
      <p>
        Once your data is deleted, it cannot be recovered. If you want to use Periplo
        again, you will need to create a new account.
      </p>

      <h2>Contact</h2>
      <Box
        sx={{
          bgcolor: 'action.hover',
          borderRadius: 1.5,
          p: 2.5,
          mt: 3,
          '& p': { mb: 1, '&:last-child': { mb: 0 } },
        }}
      >
        <p>Questions about account deletion, or trouble with the in-app flow?</p>
        <p>
          Email: <a href="mailto:support@periploapp.com">support@periploapp.com</a>
        </p>
        <p>
          See also: <Link href="/legal/privacy">Privacy Policy</Link> &middot;{' '}
          <Link href="/legal/terms">Terms of Service</Link>
        </p>
      </Box>
    </LegalLayout>
  );
}
