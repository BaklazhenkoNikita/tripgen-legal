'use client';

import { useClerk } from '@clerk/nextjs';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MuiButton from '@mui/material/Button';
import { tgShadow } from '@/theme/shadows';

interface Props {
  onDismiss: () => void;
  destination?: string;
}

/** Post-generation dialog shown to anonymous users, prompting sign-in so the
 *  trip (currently attributed to their guest id) gets saved to a real account
 *  on next visit. Dismissing keeps the guest trip viewable this session only. */
export function GuestSignInPrompt({ onDismiss, destination }: Props) {
  const { openSignIn } = useClerk();
  return (
    <Box
      role="dialog"
      aria-modal="true"
      aria-labelledby="guest-prompt-title"
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(0,0,0,0.4)',
        p: 2,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 448,
          borderRadius: 2,
          bgcolor: 'background.paper',
          p: 3,
          boxShadow: (t) => tgShadow(t, 'sheet'),
        }}
      >
        <Typography
          id="guest-prompt-title"
          component="h2"
          sx={{ fontSize: 18, fontWeight: 600, color: 'text.primary' }}
        >
          Save your trip
        </Typography>
        <Typography sx={{ mt: 1, fontSize: 14, color: 'text.secondary' }}>
          {destination
            ? `Your ${destination} itinerary is ready. Sign in to save it to your account and come back to edit it later.`
            : 'Your itinerary is ready. Sign in to save it to your account and come back to edit it later.'}
        </Typography>
        <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 3 }}>
          <MuiButton
            type="button"
            onClick={onDismiss}
            disableElevation
            sx={{
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              px: 2,
              py: 1,
              fontSize: 14,
              fontWeight: 500,
              color: 'text.primary',
              textTransform: 'none',
              bgcolor: 'background.paper',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            Continue as guest
          </MuiButton>
          <MuiButton
            type="button"
            onClick={() => openSignIn()}
            disableElevation
            sx={{
              borderRadius: 1.5,
              bgcolor: 'primary.main',
              px: 2,
              py: 1,
              fontSize: 14,
              fontWeight: 600,
              color: 'common.white',
              textTransform: 'none',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            Sign in
          </MuiButton>
        </Stack>
      </Box>
    </Box>
  );
}
