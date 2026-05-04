'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { Plus } from 'lucide-react';
import { useActiveTrip } from '@/contexts';
import { useTripDetail } from '@/hooks/useTripDetail';
import { useActivityPhotosBatch } from '@/hooks/useActivityPhotos';
import { useTripMutations } from '@/hooks/useTripMutations';
import { useCollaborators } from '@/hooks/useCollab';
import { Button } from '@/components/ui/Button';
import { TripActionsToolbar } from '@/components/trip/TripActionsToolbar';
import { EditableTripView } from '@/components/trip-edit/EditableTripView';
import { CollaboratorsSheet } from '@/components/trip/CollaboratorsSheet';
import { ChatDrawer } from '@/components/chat/ChatDrawer';

function NewTripButton() {
  return (
    <Button asChild variant="ghost" size="sm" iconLeft={<Plus size={14} />}>
      <Link href="/trip?new=1">Generate new trip</Link>
    </Button>
  );
}

interface Props {
  searchId: string;
  initialDestination?: string;
}

export function TripDetailClient({ searchId, initialDestination }: Props) {
  const { userId } = useAuth();
  const [activeDayNumber, setActiveDayNumber] = useState<number | null>(null);
  const [collabOpen, setCollabOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const { tripData, isLoading, error, activityPool, restaurants, setTripData } =
    useTripDetail(searchId);
  const { data: collab } = useCollaborators(searchId);
  const { setActiveTripId } = useActiveTrip();

  const destination = tripData?.destination ?? initialDestination ?? '';

  useEffect(() => {
    if (tripData) setActiveTripId(searchId);
  }, [tripData, searchId, setActiveTripId]);

  // If the trip we tried to load no longer exists (deleted, wrong id, lost
  // access), drop it from `activeTripId` so /trip stops bouncing the user
  // back into a broken view.
  useEffect(() => {
    if (error) setActiveTripId(null);
  }, [error, setActiveTripId]);
  const { data: photoMap } = useActivityPhotosBatch(activityPool, destination, restaurants);
  const { reorganize, surpriseDay } = useTripMutations({
    searchId,
    tripData,
    setTripData,
  });

  const isOwner =
    !collab?.owner ? true : Boolean(userId && collab.owner.user_id === userId);
  const isEditor = Boolean(
    userId && collab?.editors?.some((e) => e.user_id === userId),
  );
  const canEdit = isOwner || isEditor;

  if (isLoading && !tripData) {
    return (
      <Box sx={{ mx: 'auto', maxWidth: 1152, px: { xs: 2, sm: 3 }, py: 3 }}>
        <Box
          sx={{
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
          }}
        >
          <Box component="nav" sx={{ fontSize: 14, color: 'text.secondary' }}>
            <Box
              component={Link}
              href="/history"
              sx={{
                color: 'inherit',
                textDecoration: 'none',
                '&:hover': { color: 'text.primary' },
              }}
            >
              My Trips
            </Box>
            <Box component="span" sx={{ mx: 1 }}>/</Box>
            {initialDestination ? (
              <Box component="span" sx={{ color: 'text.primary' }}>{initialDestination}</Box>
            ) : (
              <Box
                component="span"
                sx={{
                  display: 'inline-block',
                  height: 14,
                  width: 140,
                  verticalAlign: 'middle',
                  borderRadius: 1,
                  bgcolor: (t) => alpha(t.palette.text.primary, 0.08),
                  animation: 'tgSkeletonPulse 1.6s ease-in-out infinite',
                }}
              />
            )}
          </Box>
          <NewTripButton />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box
            sx={{
              height: 32,
              width: 240,
              borderRadius: 1,
              bgcolor: (t) => alpha(t.palette.text.primary, 0.1),
              animation: 'tgSkeletonPulse 1.6s ease-in-out infinite',
            }}
          />
          <Box
            sx={{
              height: 16,
              width: 320,
              borderRadius: 1,
              bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
              animation: 'tgSkeletonPulse 1.6s ease-in-out infinite',
            }}
          />
          <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {[1, 2, 3, 4].map((i) => (
              <Box
                key={i}
                sx={{
                  height: 96,
                  borderRadius: 2,
                  bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
                  animation: 'tgSkeletonPulse 1.6s ease-in-out infinite',
                  animationDelay: `${i * 80}ms`,
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mx: 'auto', maxWidth: 576, px: { xs: 2, sm: 3 }, py: 6, textAlign: 'center' }}>
        <Typography component="h2" sx={{ fontSize: '1.25rem', fontWeight: 700, color: 'text.primary' }}>
          Failed to load trip
        </Typography>
        <Typography sx={{ mt: 1, color: 'text.secondary' }}>{error}</Typography>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Box
            component={Link}
            href="/history"
            sx={{
              fontSize: 14,
              fontWeight: 500,
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': { color: 'primary.dark' },
            }}
          >
            Back to My Trips
          </Box>
          <NewTripButton />
        </Box>
      </Box>
    );
  }

  if (!tripData) {
    return (
      <Box sx={{ mx: 'auto', maxWidth: 576, px: { xs: 2, sm: 3 }, py: 6, textAlign: 'center' }}>
        <Typography component="h2" sx={{ fontSize: '1.25rem', fontWeight: 700, color: 'text.primary' }}>
          Trip not found
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Box
            component={Link}
            href="/history"
            sx={{
              fontSize: 14,
              fontWeight: 500,
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': { color: 'primary.dark' },
            }}
          >
            Back to My Trips
          </Box>
          <NewTripButton />
        </Box>
      </Box>
    );
  }

  const toolbar = (
    <TripActionsToolbar
      searchId={searchId}
      onOpenShare={() => setCollabOpen(true)}
      onOpenChat={() => setChatOpen(true)}
      onReorganize={() => reorganize()}
      onSurpriseDay={activeDayNumber ? () => surpriseDay(activeDayNumber) : undefined}
      activeDayNumber={activeDayNumber}
    />
  );

  return (
    <Box sx={{ mx: 'auto', maxWidth: 1440, px: { xs: 2, sm: 3 }, py: 3 }}>
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Box component="nav" sx={{ fontSize: 14, color: 'text.secondary' }}>
          <Box
            component={Link}
            href="/history"
            sx={{
              color: 'inherit',
              textDecoration: 'none',
              '&:hover': { color: 'text.primary' },
            }}
          >
            My Trips
          </Box>
          <Box component="span" sx={{ mx: 1 }}>/</Box>
          <Box component="span" sx={{ color: 'text.primary' }}>{destination}</Box>
        </Box>
        <NewTripButton />
      </Box>

      <CollaboratorsSheet
        tripId={searchId}
        open={collabOpen}
        onClose={() => setCollabOpen(false)}
        isOwner={isOwner}
      />

      <ChatDrawer
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        tripId={searchId}
        tripDestination={destination || undefined}
      />

      <EditableTripView
        searchId={searchId}
        tripData={tripData}
        setTripData={setTripData}
        photoMap={photoMap}
        toolbar={toolbar}
        onActiveDayChange={setActiveDayNumber}
        canEdit={canEdit}
        onRequestEditAccess={() => setCollabOpen(true)}
      />
    </Box>
  );
}
