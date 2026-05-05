'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { alpha, type Theme } from '@mui/material/styles';
import { LogOut, UserPlus, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  useCollaborators,
  useCreateInvite,
  useRevokeInvite,
  useChangeCollaboratorRole,
  useRemoveCollaborator,
  useLeaveTrip,
  type CollabRole,
  type Collaborator,
} from '@/hooks/useCollab';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

interface Props {
  tripId: string;
  open: boolean;
  onClose: () => void;
  isOwner: boolean;
}

export function CollaboratorsSheet({ tripId, open, onClose, isOwner }: Props) {
  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
      side="right"
      size="md"
      title="Collaborators"
      description="Share access to this trip with editors and viewers."
    >
      <Box sx={{ px: 2.5, py: 2.5 }}>
        <CollabBody tripId={tripId} isOwner={isOwner} onDone={onClose} />
      </Box>
    </Sheet>
  );
}

function CollabBody({
  tripId,
  isOwner,
  onDone,
}: {
  tripId: string;
  isOwner: boolean;
  onDone: () => void;
}) {
  const { data, isLoading, refetch } = useCollaborators(tripId);
  const createInvite = useCreateInvite();
  const revokeInvite = useRevokeInvite();
  const changeRole = useChangeCollaboratorRole();
  const removeCollab = useRemoveCollaborator();
  const leave = useLeaveTrip();

  const editors =
    data?.collaborators?.filter((c) => c.role === 'editor') ?? [];
  const viewers =
    data?.collaborators?.filter((c) => c.role === 'viewer') ?? [];

  const handleInvite = async (role: CollabRole) => {
    try {
      const res = await createInvite.mutateAsync({ tripId, role });
      if (res.invite_url && typeof navigator !== 'undefined' && 'clipboard' in navigator) {
        await navigator.clipboard.writeText(res.invite_url);
        toast.success(`${labelForRole(role)} invite link copied.`);
      } else {
        toast.success(`${labelForRole(role)} invite created.`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't create invite.");
    }
  };

  const handleRevoke = async (role: CollabRole) => {
    try {
      await revokeInvite.mutateAsync({ tripId, role });
      toast.success(`${labelForRole(role)} invite revoked.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't revoke invite.");
    }
  };

  const handleLeave = async () => {
    if (!confirm('Leave this shared trip? You will lose access.')) return;
    try {
      await leave.mutateAsync(tripId);
      toast.success('You left the trip.');
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't leave trip.");
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Skeleton height={20} width={192} />
        <Skeleton height={20} width={224} />
        <Skeleton height={20} width={160} />
      </Box>
    );
  }

  return (
    <>
      {data?.owner ? (
        <Box
          component="section"
          sx={{
            mb: 2.5,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: (t: Theme) => alpha(t.palette.text.primary, 0.04),
            p: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'text.disabled',
            }}
          >
            Owner
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 14, fontWeight: 500, color: 'text.primary' }}>
            {collabDisplayName(data.owner)}
          </Typography>
        </Box>
      ) : null}

      <Section
        title="Editors"
        items={editors}
        emptyCopy="No editors yet."
        isOwner={isOwner}
        onChangeRole={(userId, role) =>
          changeRole.mutate(
            { tripId, userId, role },
            {
              onSuccess: () => {
                toast.success('Role updated.');
                void refetch();
              },
            },
          )
        }
        onRemove={(userId) =>
          removeCollab.mutate(
            { tripId, userId },
            {
              onSuccess: () => {
                toast.success('Collaborator removed.');
                void refetch();
              },
            },
          )
        }
      />

      <Section
        title="Viewers"
        items={viewers}
        emptyCopy="No viewers yet."
        isOwner={isOwner}
        onChangeRole={(userId, role) =>
          changeRole.mutate(
            { tripId, userId, role },
            {
              onSuccess: () => {
                toast.success('Role updated.');
                void refetch();
              },
            },
          )
        }
        onRemove={(userId) =>
          removeCollab.mutate(
            { tripId, userId },
            {
              onSuccess: () => {
                toast.success('Collaborator removed.');
                void refetch();
              },
            },
          )
        }
      />

      {isOwner ? (
        <Box
          sx={{
            mt: 3,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            borderTop: (t: Theme) => `1px solid ${t.palette.divider}`,
            pt: 2.5,
          }}
        >
          <Button
            size="sm"
            iconLeft={<UserPlus size={14} />}
            onClick={() => void handleInvite('editor')}
            disabled={createInvite.isPending}
          >
            Invite editor
          </Button>
          <Button
            variant="secondary"
            size="sm"
            iconLeft={<UserPlus size={14} />}
            onClick={() => void handleInvite('viewer')}
            disabled={createInvite.isPending}
          >
            Invite viewer
          </Button>
          <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => void handleRevoke('editor')}
              disabled={revokeInvite.isPending}
            >
              Revoke editor link
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => void handleRevoke('viewer')}
              disabled={revokeInvite.isPending}
            >
              Revoke viewer link
            </Button>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            mt: 3,
            display: 'flex',
            justifyContent: 'flex-end',
            borderTop: (t: Theme) => `1px solid ${t.palette.divider}`,
            pt: 2.5,
          }}
        >
          <Button
            variant="destructive"
            size="sm"
            iconLeft={<LogOut size={14} />}
            onClick={() => void handleLeave()}
            disabled={leave.isPending}
          >
            Leave trip
          </Button>
        </Box>
      )}
    </>
  );
}

function Section({
  title,
  items,
  emptyCopy,
  isOwner,
  onChangeRole,
  onRemove,
}: {
  title: string;
  items: Collaborator[];
  emptyCopy: string;
  isOwner: boolean;
  onChangeRole: (userId: string, role: CollabRole) => void;
  onRemove: (userId: string) => void;
}) {
  return (
    <Box component="section" sx={{ mb: 2 }}>
      <Typography
        sx={{
          fontSize: 10,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'text.disabled',
        }}
      >
        {title}
      </Typography>
      {items.length === 0 ? (
        <Typography sx={{ mt: 0.75, fontSize: 14, color: 'text.disabled' }}>
          {emptyCopy}
        </Typography>
      ) : (
        <Box
          component="ul"
          sx={{
            mt: 0.75,
            p: 0,
            m: 0,
            listStyle: 'none',
            '& > li + li': {
              borderTop: (t: Theme) => `1px solid ${t.palette.divider}`,
            },
          }}
        >
          {items.map((c, idx) => (
            <Box
              component="li"
              key={c.user_id ?? `${title}-${idx}`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                py: 1.25,
              }}
            >
              <Typography
                sx={{
                  flex: 1,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: 14,
                  color: 'text.primary',
                }}
              >
                {collabDisplayName(c)}
              </Typography>
              {isOwner && c.user_id ? (
                <>
                  <Select
                    value={c.role ?? 'editor'}
                    onChange={(e) =>
                      onChangeRole(c.user_id as string, e.target.value as CollabRole)
                    }
                    size="small"
                    aria-label="Role"
                    sx={{
                      fontSize: 12,
                      '& .MuiSelect-select': { py: 0.5, px: 1 },
                    }}
                  >
                    <MenuItem value="editor">Editor</MenuItem>
                    <MenuItem value="viewer">Viewer</MenuItem>
                  </Select>
                  <IconButton
                    onClick={() => onRemove(c.user_id as string)}
                    aria-label="Remove"
                    size="small"
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        bgcolor: (t: Theme) => alpha(t.palette.error.main, 0.12),
                        color: 'error.main',
                      },
                    }}
                  >
                    <X size={14} />
                  </IconButton>
                </>
              ) : c.role ? (
                <Badge tone="neutral" size="sm">{labelForRole(c.role)}</Badge>
              ) : null}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

function collabDisplayName(c: Collaborator): string {
  return c.name ?? c.email ?? c.user_id ?? 'Member';
}

function labelForRole(role: CollabRole): string {
  return role === 'editor' ? 'Editor' : 'Viewer';
}
