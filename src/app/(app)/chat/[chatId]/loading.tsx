'use client';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';

export default function ChatDetailLoading() {
  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        height: '100%',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {[
          { align: 'flex-start', width: '70%', height: 64 },
          { align: 'flex-end', width: '52%', height: 48 },
          { align: 'flex-start', width: '60%', height: 96 },
          { align: 'flex-end', width: '40%', height: 40 },
          { align: 'flex-start', width: '74%', height: 80 },
        ].map((row, i) => (
          <Box
            key={i}
            sx={{
              alignSelf: row.align,
              width: row.width,
              maxWidth: 720,
              height: row.height,
              borderRadius: 2,
              bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
              animation: 'tgSkeletonPulse 1.6s ease-in-out infinite',
              animationDelay: `${i * 80}ms`,
            }}
          />
        ))}
      </Box>
      <Box
        sx={{
          borderTop: 1,
          borderColor: 'divider',
          px: { xs: 2, sm: 3 },
          py: 2,
        }}
      >
        <Box
          sx={{
            height: 48,
            borderRadius: 999,
            bgcolor: (t) => alpha(t.palette.text.primary, 0.08),
            animation: 'tgSkeletonPulse 1.6s ease-in-out infinite',
          }}
        />
      </Box>
    </Box>
  );
}
