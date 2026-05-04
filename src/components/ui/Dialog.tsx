'use client';

import { type ReactNode } from 'react';
import MuiDialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { X } from 'lucide-react';
import { tgShadow } from '@/theme/shadows';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  closeOnOverlay?: boolean;
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
  closeOnOverlay = true,
}: DialogProps) {
  return (
    <MuiDialog
      open={open}
      onClose={(_, reason) => {
        if (reason === 'backdropClick' && !closeOnOverlay) return;
        onOpenChange(false);
      }}
      fullWidth
      maxWidth="sm"
      className={className}
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: 'background.paper',
          boxShadow: (t) => tgShadow(t, 'sheet'),
          border: (t) => `1px solid ${t.palette.divider}`,
        },
      }}
    >
      {(title || description) && (
        <DialogTitle
          component="div"
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
            px: 3,
            pt: 2.5,
            pb: 1.5,
          }}
        >
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
          <IconButton
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <X size={16} aria-hidden />
          </IconButton>
        </DialogTitle>
      )}
      <DialogContent sx={{ px: 3, pb: 2.5 }}>{children}</DialogContent>
      {footer ? (
        <DialogActions
          sx={{
            borderTop: (t) => `1px solid ${t.palette.divider}`,
            px: 3,
            py: 2,
            gap: 1,
          }}
        >
          {footer}
        </DialogActions>
      ) : null}
    </MuiDialog>
  );
}
