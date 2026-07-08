'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import {
  MessageSquare,
  Share2,
  Shuffle,
  Wand2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { ExportMenu } from './ExportMenu';
import { tgShadow } from '@/theme/shadows';

interface Props {
  searchId?: string;
  onOpenShare: () => void;
  onOpenChat: () => void;
  onReorganize: () => Promise<void>;
  onSurpriseDay?: () => Promise<void>;
  activeDayNumber?: number | null;
  disabled?: boolean;
}

type ConfirmKind = 'reorganize' | 'surprise';

export function TripActionsToolbar({
  searchId,
  onOpenShare,
  onOpenChat,
  onReorganize,
  onSurpriseDay,
  activeDayNumber,
  disabled,
}: Props) {
  const [confirm, setConfirm] = useState<ConfirmKind | null>(null);
  const [running, setRunning] = useState(false);

  const run = async (action: ConfirmKind) => {
    setRunning(true);
    try {
      if (action === 'reorganize') {
        await onReorganize();
        toast.success('Route optimized.');
      } else if (action === 'surprise' && onSurpriseDay) {
        await onSurpriseDay();
        toast.success(`Day ${activeDayNumber ?? ''} refreshed with new picks.`);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? `Couldn't complete: ${err.message}` : "Couldn't complete.",
      );
    } finally {
      setRunning(false);
      setConfirm(null);
    }
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 1,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          px: 1.5,
          py: 1,
          boxShadow: (t) => tgShadow(t, 'card'),
        }}
      >
        <Button
          variant="primary"
          size="sm"
          iconLeft={<Shuffle size={14} />}
          onClick={() => setConfirm('reorganize')}
          disabled={disabled || running}
          title="Let AI reorder stops to cut travel time between them"
        >
          Optimize route
          <Box component="span" sx={{ ml: 0.5, display: 'inline-flex' }}>
            <Badge tone="accent" size="sm">
              1 credit
            </Badge>
          </Box>
        </Button>

        {onSurpriseDay && activeDayNumber != null ? (
          <Button
            variant="primary"
            size="sm"
            iconLeft={<Wand2 size={14} />}
            onClick={() => setConfirm('surprise')}
            disabled={disabled || running}
            title={`Swap Day ${activeDayNumber}'s stops for fresh AI suggestions`}
          >
            Suggest alternatives
            <Box component="span" sx={{ ml: 0.5, display: 'inline-flex' }}>
              <Badge tone="accent" size="sm">
                1 credit
              </Badge>
            </Box>
          </Button>
        ) : null}

        <Box sx={{ ml: 'auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
          <Button
            variant="secondary"
            size="sm"
            iconLeft={<MessageSquare size={14} />}
            onClick={onOpenChat}
            title="Chat with AI about this trip"
          >
            Chat
          </Button>
          <Button
            variant="secondary"
            size="sm"
            iconLeft={<Share2 size={14} />}
            onClick={onOpenShare}
            title="Share with collaborators"
          >
            Share
          </Button>
          {searchId ? <ExportMenu searchId={searchId} disabled={disabled || running} /> : null}
        </Box>
      </Box>

      <Dialog
        open={confirm !== null}
        onOpenChange={(open) => {
          if (!open && !running) setConfirm(null);
        }}
        title={
          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
            <Box component="span" sx={{ display: 'inline-flex', color: 'primary.main' }}>
              <Sparkles size={16} aria-hidden />
            </Box>
            {confirm === 'reorganize'
              ? 'Optimize the route across your trip?'
              : `Suggest alternatives for Day ${activeDayNumber}?`}
          </Box>
        }
        description={
          confirm === 'reorganize'
            ? 'AI reorders your stops across all days to cut travel time between them. Costs 1 credit.'
            : 'AI swaps this day’s stops for fresh suggestions. Costs 1 credit.'
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(null)} disabled={running}>
              Cancel
            </Button>
            <Button
              onClick={() => confirm && void run(confirm)}
              loading={running}
              disabled={running}
            >
              Confirm
            </Button>
          </>
        }
      >
        <Box />
      </Dialog>
    </>
  );
}
