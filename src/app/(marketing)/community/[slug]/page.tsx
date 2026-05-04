'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import {
  useClonePublicTemplate,
  usePublicTemplate,
  useVotePublicTemplate,
} from '@/hooks/useTemplates';
import { TripView } from '@/components/trip/TripView';
import { useSnackbar } from '@/contexts';

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * Read-only view of a community-published trip with vote + clone actions.
 * Public route — sign-in is only required to vote/clone (CTA prompts to sign in).
 */
export default function CommunityTemplatePage({ params }: Props) {
  const { slug } = use(params);
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { showSnackbar } = useSnackbar();
  const { data, isLoading } = usePublicTemplate(slug);
  const vote = useVotePublicTemplate();
  const clone = useClonePublicTemplate();
  const [optimisticVote, setOptimisticVote] = useState<1 | -1 | 0 | null>(null);

  if (isLoading) {
    return (
      <Box sx={{ mx: 'auto', maxWidth: 1024, px: { xs: 2, sm: 3 }, py: 6 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box
            sx={{
              height: 32,
              width: 192,
              borderRadius: 1,
              bgcolor: (t) => alpha(t.palette.text.primary, 0.1),
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
          <Box
            sx={{
              height: 16,
              width: 256,
              borderRadius: 1,
              bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
        </Box>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ mx: 'auto', maxWidth: 576, px: { xs: 2, sm: 3 }, py: 6, textAlign: 'center' }}>
        <Typography component="h2" sx={{ fontSize: '1.25rem', fontWeight: 700, color: 'text.primary' }}>
          Trip not found
        </Typography>
        <Box
          component={Link}
          href="/community"
          sx={{
            mt: 2,
            display: 'inline-block',
            fontSize: 14,
            fontWeight: 500,
            color: 'primary.main',
            textDecoration: 'none',
            '&:hover': { color: 'primary.dark' },
          }}
        >
          ← Back to community
        </Box>
      </Box>
    );
  }

  const currentVote = optimisticVote ?? data.user_vote ?? 0;

  const handleVote = (next: 1 | -1) => {
    if (!isSignedIn) {
      showSnackbar({ message: 'Sign in to vote on community trips.' });
      return;
    }
    const target = currentVote === next ? 0 : next;
    setOptimisticVote(target);
    vote.mutate(
      { slug, vote: target },
      {
        onError: () => {
          setOptimisticVote(null);
          showSnackbar({ message: "Vote didn't go through. Try again." });
        },
      },
    );
  };

  const handleClone = async () => {
    if (!isSignedIn) {
      router.push(`/?redirect=${encodeURIComponent(`/community/${slug}`)}`);
      return;
    }
    try {
      const res = await clone.mutateAsync({ slug });
      showSnackbar({ message: 'Cloned to your trips.' });
      router.push(`/trip/${res.search_id}`);
    } catch (err) {
      showSnackbar({
        message: err instanceof Error ? `Clone failed: ${err.message}` : 'Clone failed.',
      });
    }
  };

  return (
    <Box sx={{ mx: 'auto', maxWidth: 1024, px: { xs: 2, sm: 3 }, py: 4 }}>
      <Box component="nav" sx={{ mb: 2, fontSize: 14, color: 'text.secondary' }}>
        <Box
          component={Link}
          href="/community"
          sx={{
            color: 'inherit',
            textDecoration: 'none',
            '&:hover': { color: 'text.primary' },
          }}
        >
          Community
        </Box>
        <Box component="span" sx={{ mx: 1 }}>/</Box>
        <Box component="span" sx={{ color: 'text.primary' }}>{data.title}</Box>
      </Box>

      <Box
        sx={{
          mb: 3,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          p: 2,
        }}
      >
        <Box>
          <Typography component="h1" sx={{ fontSize: '1.25rem', fontWeight: 700, color: 'text.primary' }}>
            {data.title}
          </Typography>
          {data.owner_name ? (
            <Typography sx={{ mt: 0.25, fontSize: 12, color: 'text.secondary' }}>
              by {data.owner_name}
            </Typography>
          ) : null}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.0625,
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box
              component="button"
              type="button"
              onClick={() => handleVote(1)}
              disabled={vote.isPending}
              aria-label="Upvote"
              sx={{
                borderTopLeftRadius: 6,
                borderBottomLeftRadius: 6,
                px: 1,
                py: 0.5,
                fontSize: 14,
                cursor: 'pointer',
                border: 'none',
                transition: 'colors 200ms',
                ...(currentVote === 1
                  ? { bgcolor: (t) => alpha(t.palette.primary.main, 0.12), color: 'primary.dark' }
                  : { bgcolor: 'transparent', color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }),
              }}
            >
              ▲
            </Box>
            <Box component="span" sx={{ px: 1, fontSize: 12, fontWeight: 500, color: 'text.primary' }}>
              {data.vote_score + (optimisticVote != null ? optimisticVote - (data.user_vote ?? 0) : 0)}
            </Box>
            <Box
              component="button"
              type="button"
              onClick={() => handleVote(-1)}
              disabled={vote.isPending}
              aria-label="Downvote"
              sx={{
                borderTopRightRadius: 6,
                borderBottomRightRadius: 6,
                px: 1,
                py: 0.5,
                fontSize: 14,
                cursor: 'pointer',
                border: 'none',
                transition: 'colors 200ms',
                ...(currentVote === -1
                  ? { bgcolor: 'action.hover', color: 'text.primary' }
                  : { bgcolor: 'transparent', color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }),
              }}
            >
              ▼
            </Box>
          </Box>
          <Box
            component="button"
            type="button"
            onClick={() => void handleClone()}
            disabled={clone.isPending}
            sx={{
              borderRadius: 1.5,
              bgcolor: 'primary.main',
              border: 'none',
              px: 1.5,
              py: 0.75,
              fontSize: 14,
              fontWeight: 600,
              color: 'common.white',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'primary.dark' },
              '&:disabled': { opacity: 0.5 },
            }}
          >
            {clone.isPending ? 'Cloning…' : `Clone${data.fork_count ? ` (${data.fork_count})` : ''}`}
          </Box>
        </Box>
      </Box>

      <TripView
        travelData={data.travel_state}
        destination={data.travel_state.destination}
      />
    </Box>
  );
}
