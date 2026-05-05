'use client';

import Link from 'next/link';
import { SignedIn } from '@clerk/nextjs';
import { Sparkles } from 'lucide-react';
import Box from '@mui/material/Box';
import { useSubscriptionOptional } from '@/contexts';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';

export function CreditBadge() {
  return (
    <SignedIn>
      <CreditBadgeInner />
    </SignedIn>
  );
}

function CreditBadgeInner() {
  const subscription = useSubscriptionOptional();
  if (!subscription?.credits) return null;
  const { credits } = subscription;

  if (credits.isPro) return null;

  const { credits: count, maxCredits } = credits;
  const hasMax = typeof maxCredits === 'number' && maxCredits > 0;
  const tone =
    count === 0
      ? 'danger'
      : hasMax && count <= Math.ceil(maxCredits / 3)
        ? 'warning'
        : 'neutral';

  const tooltipBase = hasMax
    ? `${count} of ${maxCredits} AI credits remaining`
    : `${count} AI credits remaining`;
  const tooltipContent = credits.nextRegenAt
    ? `${tooltipBase} — next credit at ${new Date(credits.nextRegenAt).toLocaleTimeString()}`
    : `${tooltipBase} — click to upgrade`;

  return (
    <Tooltip content={tooltipContent}>
      <Box
        component={Link}
        href="/pricing"
        aria-label={`${tooltipBase}. Click to upgrade.`}
        sx={{
          display: { xs: 'none', sm: 'inline-flex' },
          textDecoration: 'none',
        }}
      >
        <Badge tone={tone} size="md" iconLeft={<Sparkles size={12} />}>
          {count}
          {hasMax ? (
            <Box component="span" sx={{ fontWeight: 400, opacity: 0.6 }}>
              /{maxCredits}
            </Box>
          ) : null}
        </Badge>
      </Box>
    </Tooltip>
  );
}
