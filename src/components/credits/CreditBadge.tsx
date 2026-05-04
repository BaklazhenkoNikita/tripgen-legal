'use client';

import { SignedIn } from '@clerk/nextjs';
import { Sparkles, Crown } from 'lucide-react';
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

  if (credits.isPro) {
    return (
      <Tooltip content="Pro — unlimited AI generations">
        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
          <Badge tone="warning" size="md" iconLeft={<Crown size={12} />}>
            Pro
          </Badge>
        </Box>
      </Tooltip>
    );
  }

  const { credits: count, maxCredits } = credits;
  const tone =
    count === 0 ? 'danger' : count <= Math.ceil(maxCredits / 3) ? 'warning' : 'neutral';

  return (
    <Tooltip
      content={
        credits.nextRegenAt
          ? `Next credit at ${new Date(credits.nextRegenAt).toLocaleTimeString()}`
          : 'AI credits'
      }
    >
      <Box component="span" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
        <Badge tone={tone} size="md" iconLeft={<Sparkles size={12} />}>
          {count}
          <Box component="span" sx={{ fontWeight: 400, opacity: 0.6 }}>
            /{maxCredits}
          </Box>
        </Badge>
      </Box>
    </Tooltip>
  );
}
