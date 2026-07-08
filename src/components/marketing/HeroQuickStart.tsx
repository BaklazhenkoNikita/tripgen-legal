'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/**
 * Hero quick-start — demonstrates the core flow (name a place → get a plan)
 * right in the marketing hero. Deep-links into the guided builder with the
 * destination prefilled; empty just opens a fresh builder.
 */
export function HeroQuickStart() {
  const router = useRouter();
  const [dest, setDest] = useState('');

  const go = () => {
    const d = dest.trim();
    router.push(d ? `/trip?new=1&destination=${encodeURIComponent(d)}` : '/trip?new=1');
  };

  return (
    <Box
      component="form"
      onSubmit={(e: React.FormEvent) => {
        e.preventDefault();
        go();
      }}
      sx={{
        mt: 4,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 1.5,
        maxWidth: 520,
        mx: { xs: 'auto', md: 0 },
      }}
    >
      <TextField
        value={dest}
        onChange={(e) => setDest(e.target.value)}
        placeholder="Where to? e.g. Kyoto, Japan"
        aria-label="Destination"
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Box component="span" sx={{ display: 'inline-flex', color: 'primary.main' }}>
                <MapPin size={18} aria-hidden />
              </Box>
            </InputAdornment>
          ),
          sx: { borderRadius: 999, bgcolor: 'background.paper' },
        }}
      />
      <Box sx={{ flexShrink: 0 }}>
        <Button type="submit" size="lg" iconRight={<ArrowRight size={16} />} fullWidth>
          Plan my trip
        </Button>
      </Box>
    </Box>
  );
}
