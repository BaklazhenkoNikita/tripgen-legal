'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MuiDialog from '@mui/material/Dialog';
import { motion } from 'framer-motion';
import { Crown, Infinity as InfinityIcon, Sparkles, Compass, MessageCircle } from 'lucide-react';
import { alpha } from '@mui/material/styles';
import { Button } from '@/components/ui/Button';
import { tgShadow } from '@/theme/shadows';

interface Props {
  open: boolean;
  onClose: () => void;
  /** True once the webhook has confirmed Pro server-side. */
  confirmed: boolean;
}

export function WelcomeProDialog({ open, onClose, confirmed }: Props) {
  // Show a brief "Confirming…" state until the webhook lands. After 8s of no
  // confirmation we celebrate anyway — webhooks usually arrive in <2s, but we
  // shouldn't leave the user staring at a spinner if relays lag.
  const [forceShow, setForceShow] = useState(false);
  useEffect(() => {
    if (!open || confirmed) return;
    const t = setTimeout(() => setForceShow(true), 8000);
    return () => clearTimeout(t);
  }, [open, confirmed]);

  const showCelebration = confirmed || forceShow;

  return (
    <MuiDialog
      open={open}
      onClose={(_, reason) => {
        if (reason === 'backdropClick' && !showCelebration) return;
        onClose();
      }}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: (t) => ({
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: tgShadow(t, 'sheet'),
          border: `1px solid ${t.palette.divider}`,
          bgcolor: 'background.paper',
        }),
      }}
    >
      {showCelebration ? <Celebration onClose={onClose} /> : <Confirming />}
    </MuiDialog>
  );
}

function Confirming() {
  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Box
        component={motion.div}
        animate={{ rotate: 360 }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
        sx={{ display: 'inline-flex', mb: 2 }}
      >
        <Sparkles size={28} style={{ color: 'var(--mui-palette-primary-main)' }} />
      </Box>
      <Typography sx={{ fontSize: 18, fontWeight: 600, mb: 0.5 }}>
        Confirming your upgrade…
      </Typography>
      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
        This usually takes a couple of seconds.
      </Typography>
    </Box>
  );
}

function Celebration({ onClose }: { onClose: () => void }) {
  const PERKS = [
    {
      icon: <InfinityIcon size={16} />,
      title: 'Unlimited AI credits',
      sub: 'Generate as many trips and chats as you want.',
    },
    {
      icon: <Compass size={16} />,
      title: 'Deeper itineraries',
      sub: 'Longer trips, richer detail, faster regenerations.',
    },
    {
      icon: <MessageCircle size={16} />,
      title: 'Priority assistance',
      sub: 'No waits when the AI is busy.',
    },
  ];

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        sx={(t) => ({
          position: 'relative',
          backgroundImage:
            t.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${alpha('#f5b301', 0.22)}, ${alpha('#d97706', 0.12)} 60%, ${t.palette.background.paper})`
              : `linear-gradient(135deg, ${alpha('#fef3c7', 0.95)}, ${alpha('#ffedd5', 0.7)} 55%, ${t.palette.background.paper})`,
          px: 4,
          pt: 4.5,
          pb: 3,
          textAlign: 'center',
          overflow: 'hidden',
        })}
      >
        <Sparkle delay={0}    top="14%"  left="12%" size={10} />
        <Sparkle delay={0.4}  top="22%"  left="82%" size={14} />
        <Sparkle delay={0.8}  top="62%"  left="8%"  size={12} />
        <Sparkle delay={0.2}  top="70%"  left="86%" size={10} />
        <Sparkle delay={0.6}  top="38%"  left="92%" size={8}  />

        <Box
          component={motion.div}
          initial={{ scale: 0.4, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 16 }}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 72,
            height: 72,
            borderRadius: 999,
            backgroundImage: `linear-gradient(135deg, #fbbf24, #d97706)`,
            color: '#fff',
            boxShadow: '0 14px 30px -10px rgba(217,119,6,0.55)',
            mb: 2,
          }}
        >
          <Crown size={34} strokeWidth={2.25} />
        </Box>

        <Typography
          component="h2"
          sx={{
            fontFamily: 'var(--font-display, inherit)',
            fontSize: '1.5rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'text.primary',
          }}
        >
          Welcome to Pro
        </Typography>
        <Typography sx={{ mt: 0.5, fontSize: 14, color: 'text.secondary' }}>
          Your subscription is active. Plan without limits.
        </Typography>
      </Box>

      <Stack spacing={1.25} sx={{ px: 3, pt: 2.5 }}>
        {PERKS.map((p) => (
          <Stack key={p.title} direction="row" spacing={1.5} alignItems="flex-start">
            <Box
              sx={(t) => ({
                mt: 0.25,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                borderRadius: 999,
                color: t.palette.mode === 'dark' ? '#fcd34d' : '#92400e',
                bgcolor: alpha('#f5b301', 0.18),
                border: `1px solid ${alpha('#f5b301', 0.4)}`,
                flexShrink: 0,
              })}
            >
              {p.icon}
            </Box>
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }}>
                {p.title}
              </Typography>
              <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.25 }}>
                {p.sub}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>

      <Box sx={{ p: 3, pt: 2.5 }}>
        <Button onClick={onClose} variant="primary" size="md" fullWidth>
          Start planning
        </Button>
      </Box>
    </Box>
  );
}

function Sparkle({
  top,
  left,
  size,
  delay,
}: {
  top: string;
  left: string;
  size: number;
  delay: number;
}) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: [0, 1, 0], scale: [0.4, 1, 0.6] }}
      transition={{ duration: 1.6, delay, repeat: Infinity, repeatDelay: 1.4 }}
      sx={{
        position: 'absolute',
        top,
        left,
        color: '#f5b301',
        pointerEvents: 'none',
      }}
    >
      <Sparkles size={size} aria-hidden />
    </Box>
  );
}
