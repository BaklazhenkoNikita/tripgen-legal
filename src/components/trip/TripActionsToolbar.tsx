'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import { MessageSquare, Share2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { Dialog } from '@/components/ui/Dialog';
import { ExportMenu } from './ExportMenu';

interface Props {
  searchId?: string;
  onOpenShare: () => void;
  onOpenChat: () => void;
  onReorganize: () => Promise<void>;
  disabled?: boolean;
}

/**
 * Trip-level actions, rendered inline at the right of the day-tabs row.
 * Day-level AI actions ("Fill open time", "Suggest alternatives") live in
 * the day header. Outline buttons: the itinerary is the page's focus, so no
 * filled CTA competes with it.
 */
export function TripActionsToolbar({
  searchId,
  onOpenShare,
  onOpenChat,
  onReorganize,
  disabled,
}: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    try {
      await onReorganize();
      toast.success('Route optimized.');
    } catch (err) {
      toast.error(
        err instanceof Error ? `Couldn't complete: ${err.message}` : "Couldn't complete.",
      );
    } finally {
      setRunning(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        <Tooltip content="Reorder stops across all days to cut travel time · 1 credit">
          <Button
            variant="outline"
            size="md"
            iconLeft={<Sparkles size={16} />}
            onClick={() => setConfirmOpen(true)}
            disabled={disabled || running}
          >
            Optimize route
          </Button>
        </Tooltip>
        <Button
          variant="outline"
          size="md"
          iconLeft={<MessageSquare size={16} />}
          onClick={onOpenChat}
          title="Chat with AI about this trip"
        >
          Chat
        </Button>
        <Button
          variant="outline"
          size="md"
          iconLeft={<Share2 size={16} />}
          onClick={onOpenShare}
          title="Share with collaborators"
        >
          Share
        </Button>
        {searchId ? <ExportMenu searchId={searchId} disabled={disabled || running} /> : null}
      </Box>

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open && !running) setConfirmOpen(false);
        }}
        title={
          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
            <Box component="span" sx={{ display: 'inline-flex', color: 'primary.main' }}>
              <Sparkles size={16} aria-hidden />
            </Box>
            Optimize the route across your trip?
          </Box>
        }
        description="AI reorders your stops across all days to cut travel time between them. Costs 1 credit."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={running}>
              Cancel
            </Button>
            <Button onClick={() => void run()} loading={running} disabled={running}>
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
