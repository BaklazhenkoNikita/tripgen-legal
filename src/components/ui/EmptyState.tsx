'use client';

import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  variant?: 'default' | 'subtle';
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  variant = 'default',
}: EmptyStateProps) {
  return (
    <Box
      className={className}
      sx={[
        {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
          py: 6,
          textAlign: 'center',
        },
        ...(variant === 'default'
          ? [{
              borderRadius: 2,
              border: (t: import('@mui/material/styles').Theme) => `1px dashed ${t.palette.divider}`,
              bgcolor: 'background.paper',
            }]
          : []),
      ]}
    >
      {icon ? (
        <Box
          sx={{
            mb: 2,
            display: 'inline-flex',
            height: 48,
            width: 48,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
            color: 'primary.main',
          }}
        >
          {icon}
        </Box>
      ) : null}
      <Typography component="h3" sx={{ fontSize: 16, fontWeight: 600, color: 'text.primary' }}>
        {title}
      </Typography>
      {description ? (
        <Typography sx={{ mt: 0.75, maxWidth: 380, fontSize: 14, color: 'text.secondary' }}>
          {description}
        </Typography>
      ) : null}
      {action ? <Box sx={{ mt: 2.5 }}>{action}</Box> : null}
    </Box>
  );
}
