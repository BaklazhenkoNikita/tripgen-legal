'use client';

import { type ReactNode } from 'react';
import MuiTooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import { tgShadow } from '@/theme/shadows';

/** Provider is a no-op with MUI; kept as a named export for callers. */
export function TooltipProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function Tooltip({
  content,
  children,
  side = 'top',
  align = 'center',
  delayDuration = 250,
  className,
}: {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  delayDuration?: number;
  className?: string;
}) {
  // MUI placement format: e.g. "top-start", "right", "bottom-end".
  const placement =
    align === 'center' ? side : (`${side}-${align}` as 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end');
  return (
    <MuiTooltip
      title={<Box className={className}>{content}</Box>}
      enterDelay={delayDuration}
      arrow
      placement={placement}
      slotProps={{
        tooltip: {
          sx: {
            bgcolor: 'text.primary',
            color: 'background.default',
            fontSize: 12,
            fontWeight: 500,
            borderRadius: 1,
            px: 1.25,
            py: 0.75,
            boxShadow: (t) => tgShadow(t, 'tooltip'),
            maxWidth: 320,
          },
        },
        arrow: { sx: { color: 'text.primary' } },
      }}
    >
      {children as never}
    </MuiTooltip>
  );
}
