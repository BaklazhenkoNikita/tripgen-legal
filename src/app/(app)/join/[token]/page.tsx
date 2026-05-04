'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useJoinTrip } from '@/hooks/useCollab';
import { useSnackbar } from '@/contexts';

/**
 * Accepts a trip invite. Reads the token from the URL, calls
 * `POST /api/trips/join/{token}`, then redirects to the joined trip's
 * detail page.
 */
export default function JoinInvitePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const joinTrip = useJoinTrip();
  const { showSnackbar } = useSnackbar();
  const [fired, setFired] = useState(false);

  useEffect(() => {
    if (fired || !params?.token) return;
    setFired(true);
    joinTrip.mutate(params.token, {
      onSuccess: (data) => {
        if (data.already_member) {
          showSnackbar({ message: 'You already have access to this trip.' });
        } else {
          showSnackbar({
            message: `Joined as ${data.role}${data.destination ? ` — ${data.destination}` : ''}.`,
          });
        }
        router.replace(`/trip/${data.search_id}`);
      },
    });
  }, [fired, params?.token, joinTrip, router, showSnackbar]);

  return (
    <Box sx={{ mx: 'auto', maxWidth: 576, px: 2, py: 8, textAlign: 'center' }}>
      {joinTrip.isPending || !fired ? (
        <>
          <Typography component="h1" sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'text.primary' }}>
            Joining trip…
          </Typography>
          <Typography sx={{ mt: 1, fontSize: 14, color: 'text.secondary' }}>
            Hang on, we&apos;re hooking you up.
          </Typography>
        </>
      ) : joinTrip.isError ? (
        <>
          <Typography component="h1" sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'text.primary' }}>
            We couldn&apos;t accept this invite
          </Typography>
          <Typography sx={{ mt: 1, fontSize: 14, color: 'text.secondary' }}>
            The link may be expired or revoked. Ask the owner to send a fresh one.
          </Typography>
          <Box
            component={Link}
            href="/explore"
            sx={{
              mt: 3,
              display: 'inline-flex',
              borderRadius: 1.5,
              bgcolor: 'primary.main',
              px: 2,
              py: 1,
              fontSize: 14,
              fontWeight: 500,
              color: 'common.white',
              textDecoration: 'none',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            Back to Explore
          </Box>
        </>
      ) : null}
    </Box>
  );
}
