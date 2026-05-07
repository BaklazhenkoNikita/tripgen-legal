import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { McpUpgradeBadges } from './McpUpgradeBadges';
import { McpUpgradeCheckout } from './McpUpgradeCheckout';

export const metadata: Metadata = {
  title: 'Periplo — Unlock unlimited trips',
  description:
    "You've used your free trips this cycle. Install Periplo to unlock unlimited AI travel planning, offline maps, and collaborative itineraries.",
  alternates: { canonical: '/legal/mcp-upgrade' },
  robots: { index: false, follow: false },
  openGraph: {
    type: 'website',
    url: 'https://periploapp.com/legal/mcp-upgrade',
    title: 'Periplo — Unlock unlimited trips',
    description: 'Install Periplo to unlock unlimited AI travel planning.',
    images: ['https://periploapp.com/assets/og-image.png'],
  },
};

const benefits: { title: string; copy: string }[] = [
  {
    title: 'Unlimited trip generation',
    copy: 'Plan as many trips as you want — no daily caps.',
  },
  {
    title: 'Offline maps and details',
    copy: 'Download your trips before you fly so they work without data.',
  },
  {
    title: 'Collaborative planning',
    copy: 'Share a live trip with travel partners; everyone edits together.',
  },
  {
    title: 'Priority support',
    copy: 'Reach a real human in under 24 hours.',
  },
];

const reasons: { title: string; copy: string }[] = [
  {
    title: 'Curated by humans, not just AI',
    copy: 'Periplo blends Gemini-generated structure with thousands of human-vetted attractions and restaurants — the spots locals would actually send you to.',
  },
  {
    title: 'Goes with you',
    copy: 'Your trips sync between this chat and the iPhone / Android app. Open in Periplo for live maps, walking directions, hours, and on-the-ground edits.',
  },
  {
    title: 'One subscription, every channel',
    copy: 'Premium unlocks unlimited trips here in chat AND in the app — there\'s no "MCP-only" or "mobile-only" tier.',
  },
];

export default function McpUpgradePage() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Navigation />
      <Box
        component="main"
        sx={{
          flex: 1,
          width: '100%',
          maxWidth: 640,
          mx: 'auto',
          px: { xs: 2, sm: 3 },
          py: { xs: 4, md: 6 },
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 0.75,
            borderRadius: 999,
            bgcolor: 'rgba(196, 96, 58, 0.10)',
            color: 'primary.main',
            border: '1px solid',
            borderColor: 'rgba(196, 96, 58, 0.25)',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            mb: 2.5,
          }}
        >
          <Box component="span" aria-hidden>
            ★
          </Box>
          Periplo Premium
        </Box>

        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '2rem', sm: '2.5rem', md: '2.75rem' },
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            mb: 2,
            color: 'text.primary',
          }}
        >
          Unlock unlimited Periplo trips
        </Typography>
        <Typography
          component="p"
          sx={{
            fontSize: '1.0625rem',
            color: 'text.secondary',
            mb: 4,
            lineHeight: 1.55,
          }}
        >
          You&apos;ve used your free trip credits this cycle. Install the
          Periplo app to keep planning, take your itineraries offline, and share
          them with travel partners.
        </Typography>

        <Suspense fallback={<Box sx={{ height: 280, mb: 3 }} />}>
          <McpUpgradeCheckout />
        </Suspense>

        <Box
          component="section"
          sx={{
            background: 'linear-gradient(135deg, rgba(196, 96, 58, 0.10) 0%, var(--tg-palette-background-paper) 100%)',
            border: '1px solid',
            borderColor: 'rgba(196, 96, 58, 0.18)',
            borderRadius: 2.5,
            p: { xs: 2.5, md: 3.5 },
            mb: 2.5,
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}
        >
          <Typography
            component="h2"
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'text.disabled',
              mb: 2,
            }}
          >
            What you unlock
          </Typography>
          <Box
            component="ul"
            sx={{
              listStyle: 'none',
              display: 'grid',
              gap: 2,
              m: 0,
              p: 0,
              mb: 3,
            }}
          >
            {benefits.map((benefit) => (
              <Box
                component="li"
                key={benefit.title}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '32px 1fr',
                  gap: 1.5,
                  alignItems: 'start',
                }}
              >
                <Box
                  aria-hidden
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  ✓
                </Box>
                <Box>
                  <Typography
                    component="strong"
                    sx={{
                      display: 'block',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: 'text.primary',
                      mb: 0.25,
                    }}
                  >
                    {benefit.title}
                  </Typography>
                  <Typography
                    component="span"
                    sx={{ color: 'text.secondary', fontSize: '0.875rem' }}
                  >
                    {benefit.copy}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <Box
          component="section"
          sx={{
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2.5,
            p: { xs: 2.5, md: 3.5 },
            mb: 2.5,
          }}
        >
          <Typography
            component="h2"
            sx={{
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: 'text.primary',
              mb: 0.5,
            }}
          >
            On iPhone or Android?
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', mb: 1.5 }}>
            Subscribe inside the Periplo mobile app — same Pro perks, billed
            through the App Store / Google Play.
          </Typography>
          <McpUpgradeBadges />
        </Box>

        <Box
          component="section"
          sx={{
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2.5,
            p: { xs: 2.5, md: 3.5 },
            mb: 2.5,
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}
        >
          <Typography
            component="h2"
            sx={{
              fontFamily: 'var(--font-display), Georgia, "Times New Roman", serif',
              fontSize: '1.375rem',
              lineHeight: 1.25,
              mb: 1.5,
              color: 'text.primary',
            }}
          >
            Why Periplo, instead of just chatting?
          </Typography>
          <Box component="dl" sx={{ display: 'grid', gap: 1.5, mt: 1.5, m: 0 }}>
            {reasons.map((reason) => (
              <Box key={reason.title}>
                <Typography
                  component="dt"
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    mt: 1,
                    fontSize: '0.9375rem',
                  }}
                >
                  {reason.title}
                </Typography>
                <Typography
                  component="dd"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.875rem',
                    ml: 0,
                    mt: 0.5,
                  }}
                >
                  {reason.copy}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Typography
          component="p"
          sx={{
            fontSize: '0.8125rem',
            color: 'text.disabled',
            textAlign: 'center',
            '& a': {
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            },
          }}
        >
          Need help? <Link href="/legal/help">Visit the help center</Link> or
          email{' '}
          <a href="mailto:hello@periploapp.com">hello@periploapp.com</a>.
        </Typography>
      </Box>
      <Footer />
    </Box>
  );
}
