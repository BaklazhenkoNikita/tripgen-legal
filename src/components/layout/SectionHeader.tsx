import type { ElementType, ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { textScale } from '@/theme/standards';
import { Eyebrow } from './Eyebrow';

interface SectionHeaderProps {
  title: ReactNode;
  eyebrow?: ReactNode;
  eyebrowIcon?: ElementType;
  /** Supporting copy. Sits in a right-hand column on md+, below on mobile. */
  description?: ReactNode;
  /** Trailing link/buttons, aligned to the title's baseline row. */
  action?: ReactNode;
  /** Heading element. `h2` for page sections, `h3` for sub-sections. */
  level?: 'h2' | 'h3';
  /** `lg` = section headline scale, `md` = sub-section title scale. */
  size?: 'lg' | 'md';
  id?: string;
  sx?: SxProps<Theme>;
}

/** Eyebrow + heading (+ description / action) for a page section. */
export function SectionHeader({
  title,
  eyebrow,
  eyebrowIcon,
  description,
  action,
  level = 'h2',
  size = 'lg',
  id,
  sx,
}: SectionHeaderProps) {
  const headingSx =
    size === 'lg'
      ? { ...textScale.headline, fontWeight: 700 }
      : { ...textScale.title, fontSize: '1.25rem' };
  return (
    <Box
      sx={[
        {
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: description ? 'minmax(0, 1fr) minmax(0, 400px)' : '1fr auto' },
          alignItems: 'end',
          columnGap: 4,
          rowGap: 1.5,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ] as SxProps<Theme>}
    >
      <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {eyebrow ? <Eyebrow icon={eyebrowIcon}>{eyebrow}</Eyebrow> : null}
        <Typography id={id} component={level} sx={{ ...headingSx, color: 'text.primary', m: 0 }}>
          {title}
        </Typography>
      </Box>
      {description || action ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'flex-start', md: description ? 'flex-start' : 'flex-end' },
            gap: 1.5,
          }}
        >
          {description ? (
            <Typography sx={{ ...textScale.support, color: 'text.secondary', m: 0 }}>{description}</Typography>
          ) : null}
          {action}
        </Box>
      ) : null}
    </Box>
  );
}
