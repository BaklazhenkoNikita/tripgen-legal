import type { ElementType, ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { CONTAINER_WIDTHS, type ContainerWidth } from './Section';

interface PageContainerProps {
  children: ReactNode;
  /** Container width preset (see CONTAINER_WIDTHS). Defaults to `wide`. */
  width?: ContainerWidth;
  sx?: SxProps<Theme>;
  component?: ElementType;
}

/**
 * Centered, width-capped frame for app pages. Unlike `Section` it adds no
 * marketing vertical rhythm — pages set their own `py`.
 *
 * `width: 100%` matters: app pages render inside the layout's flex-column
 * `<main>`, where `mx: auto` alone disables stretch and the box shrinks to
 * its content's width.
 */
export function PageContainer({
  children,
  width = 'wide',
  sx,
  component = 'div',
}: PageContainerProps) {
  return (
    <Box
      component={component}
      sx={[
        {
          width: '100%',
          maxWidth: CONTAINER_WIDTHS[width],
          mx: 'auto',
          px: { xs: 2, sm: 3 },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ] as SxProps<Theme>}
    >
      {children}
    </Box>
  );
}
