import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { LegalLayout } from '@/components/layout/LegalLayout';

export const metadata: Metadata = {
  title: 'Help Center',
  description:
    'Help articles for Periplo: getting started, trips, Pro subscription, credits, account deletion, and troubleshooting.',
  alternates: { canonical: '/legal/help' },
};

function FaqItem({ question, children }: { question: string; children: ReactNode }) {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        p: 2.5,
        mb: 1.5,
      }}
    >
      <Typography
        component="h3"
        sx={{
          fontWeight: 400,
          fontSize: '1.05rem',
          lineHeight: 1.35,
          mb: 1,
          color: 'text.primary',
        }}
      >
        {question}
      </Typography>
      <Box sx={{ '& p:last-child': { mb: 0 } }}>{children}</Box>
    </Box>
  );
}

function Tip({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        bgcolor: 'rgb(var(--tg-palette-success-mainChannel) / 0.08)',
        borderLeft: '3px solid',
        borderColor: 'secondary.main',
        borderRadius: '0 12px 12px 0',
        p: '14px 18px',
        my: 2,
        '& p:last-child': { mb: 0 },
      }}
    >
      {children}
    </Box>
  );
}

export default function HelpPage() {
  return (
    <LegalLayout title="Help Center">
      <Typography
        component="p"
        sx={{
          color: 'text.secondary',
          fontSize: '1.05rem',
          mt: -2,
          mb: 4,
        }}
      >
        Everything you need to get the most out of Periplo.
      </Typography>

      <h2>Getting Started</h2>

      <FaqItem question="How do I create a trip?">
        <p>
          Tap the AI chat tab and describe where you want to go and what you&apos;re
          interested in. Periplo&apos;s AI will generate a personalized itinerary for
          you. You can also use the guided trip creator for a step-by-step experience.
        </p>
      </FaqItem>

      <FaqItem question="Do I need an account?">
        <p>
          You can explore and use Periplo as a guest. Creating an account lets you
          save trips, sync across devices, and get more personalized recommendations.
        </p>
      </FaqItem>

      <FaqItem question="How does the AI know what I like?">
        <p>
          During onboarding, you pick your travel style and interests. As you use the
          app - swiping on activities, saving places, and creating trips - Periplo
          learns your preferences to give better recommendations over time.
        </p>
      </FaqItem>

      <h2>Discover and Explore</h2>

      <FaqItem question="What is the Swipe feature?">
        <p>
          Swipe right on activities you like and left on ones you don&apos;t. This
          helps Periplo understand your taste and suggest better activities for your
          trips.
        </p>
      </FaqItem>

      <FaqItem question="Why does Periplo need my location?">
        <p>
          Location access lets us show activities and points of interest near you.
          It&apos;s optional - you can always search for any city manually. You can
          change location permissions anytime in your device settings.
        </p>
      </FaqItem>

      <h2>Managing Trips</h2>

      <FaqItem question="Can I edit my itinerary?">
        <p>
          Yes! After generating a trip, you can add or remove activities, rearrange
          days, and customize your schedule. Just open any trip and make changes
          directly.
        </p>
      </FaqItem>

      <FaqItem question="How do trip reminders work?">
        <p>
          When you set a start date for your trip, Periplo can send you a reminder
          the day before departure and a morning brief on your first day. You&apos;ll
          be asked to enable notifications when you set your first trip date.
        </p>
      </FaqItem>

      <Tip>
        <p>
          <strong>Tip:</strong> Notifications respect quiet hours (10 PM - 8 AM) and
          are limited to avoid being intrusive.
        </p>
      </Tip>

      <h2>Periplo Pro and Credits</h2>

      <FaqItem question="What is Periplo Pro?">
        <p>
          Periplo Pro is a subscription that gives you unlimited AI trip generation
          with no credit limits. Pro members also get priority access to new
          features. It&apos;s available as a monthly or annual auto-renewing
          subscription.
        </p>
      </FaqItem>

      <FaqItem question="How do credits work?">
        <p>
          Free users get 3 trip generation credits. Credits regenerate one at a time,
          with a new credit added every 4 hours. Credits are used when you generate a
          new trip, modify itineraries, or use the Discover feature. Pro users have
          unlimited credits.
        </p>
      </FaqItem>

      <FaqItem question="How do I subscribe to Pro?">
        <p>
          Tap your profile icon, then tap the Pro card or &quot;Upgrade&quot; option.
          You&apos;ll see the available plans with pricing. Select your preferred
          plan and confirm the purchase through the App Store.
        </p>
      </FaqItem>

      <FaqItem question="How do I cancel my subscription?">
        <p>
          You can cancel anytime through your device&apos;s subscription settings:
          Settings &gt; Apple ID &gt; Subscriptions &gt; Periplo. You&apos;ll keep
          Pro access until the end of your current billing period.
        </p>
      </FaqItem>

      <FaqItem question="How do I restore my purchases?">
        <p>
          If you reinstalled the app or switched devices, open the Pro screen and tap
          &quot;Restore Purchases&quot;. You can also find this option on the
          subscription management screen. This will recover your active subscription.
        </p>
      </FaqItem>

      <FaqItem question="Will I lose my trips if I cancel?">
        <p>
          No. All your saved trips and data are kept regardless of your subscription
          status. Cancelling Pro only affects your trip generation credits &mdash;
          you&apos;ll return to the free tier credit system.
        </p>
      </FaqItem>

      <FaqItem question="How do I request a refund?">
        <p>
          Refunds are handled by Apple, not by Periplo directly. Visit{' '}
          <a
            href="https://reportaproblem.apple.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            reportaproblem.apple.com
          </a>{' '}
          to submit a refund request.
        </p>
      </FaqItem>

      <h2>Booking</h2>

      <FaqItem question="Can I book activities through Periplo?">
        <p>
          Periplo provides links to booking platforms where you can reserve
          activities, tours, and accommodations. Tapping a booking link will open the
          provider&apos;s website in your browser.
        </p>
      </FaqItem>

      <h2>Account and Data</h2>

      <FaqItem question="How do I delete my account?">
        <p>
          Go to Settings and tap &quot;Delete Account&quot;. This will permanently
          remove your account and all associated data within 30 days.
        </p>
      </FaqItem>

      <FaqItem question="Is my data safe?">
        <p>
          Yes. We use encrypted connections (HTTPS) for all data transfers and store
          your authentication tokens securely on your device. We don&apos;t sell your
          data to third parties. See our{' '}
          <Link href="/legal/privacy">Privacy Policy</Link> for details.
        </p>
      </FaqItem>

      <h2>Troubleshooting</h2>

      <FaqItem question="The app isn't loading or seems slow">
        <p>
          Periplo requires an internet connection for AI features. Check your
          connection and try again. If the issue persists, try closing and reopening
          the app.
        </p>
      </FaqItem>

      <FaqItem question="I'm not getting notifications">
        <p>
          Make sure notifications are enabled in your device Settings &gt; Periplo
          &gt; Notifications. Also check that you&apos;ve set a start date for your
          trip - reminders are only sent for trips with dates.
        </p>
      </FaqItem>

      <h2>Still need help?</h2>
      <Box
        sx={{
          bgcolor: 'action.hover',
          borderRadius: 1.5,
          p: 2.5,
          mt: 2,
          '& p': { mb: 1, '&:last-child': { mb: 0 } },
        }}
      >
        <p>Reach out to us directly and we&apos;ll get back to you as soon as possible:</p>
        <p>
          <a href="mailto:support@periploapp.com">support@periploapp.com</a>
        </p>
      </Box>
    </LegalLayout>
  );
}
