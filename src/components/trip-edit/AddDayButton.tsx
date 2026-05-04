'use client';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { alpha, type Theme } from '@mui/material/styles';

interface Props {
  onAddDay: (mode: 'empty' | 'ai') => void;
}

export function AddDayButton({ onAddDay }: Props) {
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <ButtonBase
        onClick={() => onAddDay('empty')}
        sx={{
          flex: 1,
          borderRadius: 3,
          border: '2px dashed',
          borderColor: 'divider',
          py: 2,
          fontSize: 14,
          fontWeight: 500,
          color: 'text.disabled',
          transition: 'border-color 0.2s ease, color 0.2s ease',
          '&:hover': {
            borderColor: (t: Theme) => alpha(t.palette.primary.main, 0.4),
            color: 'primary.main',
          },
        }}
      >
        + Add Empty Day
      </ButtonBase>
      <ButtonBase
        onClick={() => onAddDay('ai')}
        sx={{
          flex: 1,
          borderRadius: 3,
          border: '2px dashed',
          borderColor: (t: Theme) => alpha(t.palette.primary.main, 0.32),
          bgcolor: (t: Theme) => alpha(t.palette.primary.main, 0.06),
          py: 2,
          fontSize: 14,
          fontWeight: 500,
          color: 'primary.main',
          transition: 'border-color 0.2s ease, color 0.2s ease',
          '&:hover': {
            borderColor: 'primary.main',
            color: 'primary.dark',
          },
        }}
      >
        + Add AI Day
      </ButtonBase>
    </Box>
  );
}
