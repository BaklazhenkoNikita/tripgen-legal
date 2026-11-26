import type { ElementType, ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { textScale } from '@/theme/standards';
import { Eyebrow } from './Eyebrow';

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  eyebrow?: ReactNode;
  eyebrowIcon?: ElementType;
  /** Right-aligned actions (buttons). Vertically centred on the title block. */
  actions?: ReactNode;
  sx?: SxProps<Theme>;
}

/** Page-level `h1` block: optional eyebrow, title, subtitle and actions. */
export function PageHeader({ title, subtitle, eyebrow, eyebrowIcon, actions, sx }: PageHeaderProps) {
  return (
    <Box
      component="header"
      sx={[
        {
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: { xs: 2, sm: 3 },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ] as SxProps<Theme>}
    >
      <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {eyebrow ? <Eyebrow icon={eyebrowIcon}>{eyebrow}</Eyebrow> : null}
        <Typography component="h1" sx={{ ...textScale.headline, fontWeight: 700, color: 'text.primary', m: 0 }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography sx={{ ...textScale.support, color: 'text.secondary', m: 0 }}>{subtitle}</Typography>
        ) : null}
      </Box>
      {actions ? <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>{actions}</Box> : null}
    </Box>
  );
}
