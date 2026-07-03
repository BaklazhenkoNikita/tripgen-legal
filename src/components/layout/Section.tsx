import type { ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';

/**
 * Canonical page container widths. Every page-level surface should pick one
 * of these instead of hand-rolling a maxWidth:
 * - wide:    card grids, nav/footer, hero (1280)
 * - content: mixed text + media layouts (1120)
 * - prose:   long-form reading measure (768)
 */
export const CONTAINER_WIDTHS = {
  wide: 1280,
  content: 1120,
  prose: 768,
} as const;

export type ContainerWidth = keyof typeof CONTAINER_WIDTHS;

/** Shared vertical rhythm for marketing page sections. */
export const SECTION_PY = { xs: 8, md: 12 } as const;

interface SectionProps {
  children: ReactNode;
  /** Container width preset. Defaults to `wide`. */
  width?: ContainerWidth;
  /** Overrides for the outer section element (background, borders, py). */
  sx?: SxProps<Theme>;
  /** Overrides for the inner centered container. */
  containerSx?: SxProps<Theme>;
  component?: React.ElementType;
}

/**
 * Marketing/legal page section: standard vertical rhythm outside, centered
 * width-capped container inside. Compose backgrounds/borders via `sx`.
 */
export function Section({
  children,
  width = 'wide',
  sx,
  containerSx,
  component = 'section',
}: SectionProps) {
  return (
    <Box component={component} sx={[{ py: SECTION_PY }, ...(Array.isArray(sx) ? sx : [sx])] as SxProps<Theme>}>
      <Box
        sx={[
          { mx: 'auto', maxWidth: CONTAINER_WIDTHS[width], px: { xs: 2, sm: 3 } },
          ...(Array.isArray(containerSx) ? containerSx : [containerSx]),
        ] as SxProps<Theme>}
      >
        {children}
      </Box>
    </Box>
  );
}
