'use client';

import { type ReactNode } from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { X } from 'lucide-react';
import { tgShadow } from '@/theme/shadows';

type Side = 'right' | 'bottom' | 'left';

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: Side;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  hideTitle?: boolean;
  /** Optional slot rendered on the left side of the top header bar.
   *  When provided, the header (with the close button) is shown even
   *  if there is no visible title. */
  topAction?: ReactNode;
}

const widthFor = (size: NonNullable<SheetProps['size']>) => {
  switch (size) {
    case 'sm':   return 480;
    case 'md':   return 560;
    case 'lg':   return 720;
    case 'full': return '100%';
  }
};

export function Sheet({
  open,
  onOpenChange,
  side = 'right',
  title,
  description,
  children,
  className,
  size = 'md',
  hideTitle = false,
  topAction,
}: SheetProps) {
  const hasTitleBlock = !hideTitle && (title || description);
  const showVisibleHeader = Boolean(hasTitleBlock || topAction);
  const isHorizontal = side === 'left' || side === 'right';

  return (
    <Drawer
      anchor={side}
      open={open}
      onClose={() => onOpenChange(false)}
      className={className}
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          ...(isHorizontal
            ? {
                width: { xs: '100%', sm: widthFor(size) },
                maxWidth: '100%',
                height: '100dvh',
              }
            : {
                width: '100%',
                maxHeight: '92dvh',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              }),
          border: (t) =>
            `1px solid ${t.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: (t) => tgShadow(t, 'sheet'),
        },
      }}
    >
      {showVisibleHeader ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            borderBottom: (t) => `1px solid ${t.palette.divider}`,
            px: 2.5,
            py: hasTitleBlock ? 2 : 1.25,
          }}
        >
          <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
            {topAction ? <Box sx={{ minWidth: 0 }}>{topAction}</Box> : null}
            {hasTitleBlock ? (
              <Box sx={{ minWidth: 0 }}>
                {title ? (
                  <Typography component="h2" sx={{ fontSize: 18, fontWeight: 600, lineHeight: 1.3 }}>
                    {title}
                  </Typography>
                ) : null}
                {description ? (
                  <Typography sx={{ mt: 0.5, fontSize: 14, color: 'text.secondary' }}>
                    {description}
                  </Typography>
                ) : null}
              </Box>
            ) : null}
          </Box>
          <IconButton aria-label="Close" onClick={() => onOpenChange(false)} size="small">
            <X size={16} aria-hidden />
          </IconButton>
          {!hasTitleBlock ? (
            <Box component="span" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
              {title ?? 'Dialog'}
              {description}
            </Box>
          ) : null}
        </Box>
      ) : (
        <Box component="span" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
          {title ?? 'Dialog'}
          {description}
        </Box>
      )}
      <Box data-sheet-scroll="true" sx={{ flex: 1, overflowY: 'auto' }}>{children}</Box>
    </Drawer>
  );
}
