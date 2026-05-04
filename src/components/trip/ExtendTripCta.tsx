'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';

interface Props {
  onAddDay?: (mode?: 'empty' | 'ai' | 'fill_unassigned') => void | Promise<void>;
  disabled?: boolean;
}

export function ExtendTripCta({ onAddDay, disabled }: Props) {
  const [running, setRunning] = useState(false);

  const handleClick = async () => {
    if (!onAddDay) return;
    setRunning(true);
    try {
      await onAddDay('ai');
      toast.success('Another day added.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't add another day.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <Box
      component="section"
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        p: { xs: 3.5, sm: 4 },
        textAlign: 'center',
      }}
    >
      <Typography
        component="h3"
        sx={{
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: '-0.01em',
          color: 'text.primary',
          m: 0,
        }}
      >
        Want to extend your trip?
      </Typography>
      <Typography
        sx={{
          mx: 'auto',
          mt: 0.75,
          maxWidth: 480,
          fontSize: 14,
          lineHeight: 1.6,
          color: 'text.secondary',
        }}
      >
        Add another day to your itinerary with personalized activities and experiences.
      </Typography>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Button
          onClick={handleClick}
          loading={running}
          disabled={!onAddDay || disabled || running}
          iconLeft={<Sparkles size={16} />}
        >
          Generate Another Day
        </Button>
      </Box>
    </Box>
  );
}
