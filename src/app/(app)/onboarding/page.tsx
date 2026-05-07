'use client';

import Link from 'next/link';
import { Sparkles, Compass, ChefHat, Map } from 'lucide-react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

/**
 * Onboarding step 1 — welcome. The full flow is welcome → city → taste, then
 * /explore (signed-in or guest with locally-buffered preferences).
 */
export default function OnboardingWelcomePage() {
  return (
    <Box
      sx={{
        mx: 'auto',
        display: 'flex',
        minHeight: 'calc(100vh - 4rem)',
        maxWidth: 576,
        flexDirection: 'column',
        justifyContent: 'space-between',
        px: { xs: 2, sm: 3 },
        py: 5,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            mb: 3,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 999,
            bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
            p: 2,
            color: 'primary.main',
          }}
        >
          <Sparkles className="size-8" aria-hidden />
        </Box>
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: '1.875rem', sm: '2.25rem' },
            fontWeight: 700,
            color: 'text.primary',
          }}
        >
          Let&apos;s set up your travel taste
        </Typography>
        <Typography sx={{ mt: 1.5, fontSize: 16, color: 'text.secondary' }}>
          Two quick steps. We&apos;ll use this to personalize your home feed and future trip suggestions.
        </Typography>

        <Box
          component="ul"
          sx={{
            mt: 4,
            display: 'grid',
            width: '100%',
            gap: 1.5,
            textAlign: 'left',
            listStyle: 'none',
            p: 0,
          }}
        >
          <Step
            icon={<Compass className="size-4" />}
            title="Pick a city you love"
            subtitle="Anchors your home feed and explore tab."
          />
          <Step
            icon={<ChefHat className="size-4" />}
            title="Tell us your vibe"
            subtitle="Foodie? Hidden gems? Wellness retreats? Multiple is fine."
          />
          <Step
            icon={<Map className="size-4" />}
            title="That's it"
            subtitle="You can change everything later from your profile."
          />
        </Box>
      </Box>

      <Box
        sx={{
          mt: 4,
          display: 'flex',
          width: '100%',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1,
          justifyContent: { sm: 'center' },
          pb: 'env(safe-area-inset-bottom)',
        }}
      >
        <Box
          component={Link}
          href="/onboarding/city"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 1.5,
            bgcolor: 'primary.main',
            px: 3,
            py: 1.25,
            fontSize: 14,
            fontWeight: 600,
            color: 'common.white',
            textDecoration: 'none',
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        >
          Get started
        </Box>
        <Box
          component={Link}
          href="/explore"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            px: 3,
            py: 1.25,
            fontSize: 14,
            fontWeight: 500,
            color: 'text.primary',
            textDecoration: 'none',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          Skip for now
        </Box>
      </Box>
    </Box>
  );
}

function Step({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Box
      component="li"
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        p: 1.75,
      }}
    >
      <Box
        component="span"
        sx={{
          mt: 0.25,
          display: 'inline-flex',
          width: 28,
          height: 28,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 999,
          bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
          color: 'primary.main',
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }}>
          {title}
        </Typography>
        <Typography sx={{ mt: 0.25, fontSize: 12, color: 'text.secondary' }}>
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );
}
