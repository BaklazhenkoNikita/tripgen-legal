import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export interface LegalLayoutProps {
  title: string;
  lastUpdated?: string;
  children: ReactNode;
}

/**
 * Header + prose container for legal / policy / help pages.
 *
 * Site chrome (Navigation/Footer) comes from src/app/legal/layout.tsx; this
 * provides sensible defaults for headings, paragraphs, lists, links, and
 * emphasis used inside the prose container.
 */
export function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  return (
    <Container maxWidth="md" sx={{ pt: { xs: 5, md: 6 }, pb: { xs: 7, md: 8 } }}>
          <Box component="header" sx={{ mb: { xs: 3, md: 4 } }}>
            <Typography
              variant="h1"
              sx={{ color: 'text.primary', mb: lastUpdated ? 1.5 : 0 }}
            >
              {title}
            </Typography>
            {lastUpdated ? (
              <Typography
                variant="caption"
                component="p"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.9rem',
                  display: 'block',
                }}
              >
                Last updated {lastUpdated}
              </Typography>
            ) : null}
          </Box>

          <Box
            sx={{
              fontSize: '1rem',
              lineHeight: 1.7,
              color: 'text.primary',
              maxWidth: '70ch',

              '& h2': {
                fontWeight: 600,
                fontSize: { xs: '1.4rem', md: '1.5rem' },
                lineHeight: 1.3,
                mt: 5,
                mb: 1.5,
                color: 'text.primary',
              },
              '& h3': {
                fontWeight: 600,
                fontSize: { xs: '1.15rem', md: '1.2rem' },
                lineHeight: 1.35,
                mt: 3,
                mb: 1,
                color: 'text.primary',
              },
              '& p': {
                mb: 1.5,
                color: 'text.primary',
              },
              '& ul, & ol': {
                pl: 3,
                mb: 1.5,
              },
              '& li': {
                mb: 1,
                color: 'text.primary',
              },
              '& li::marker': {
                color: 'text.secondary',
              },
              '& strong': {
                fontWeight: 600,
                color: 'text.primary',
              },
              '& em': {
                fontStyle: 'italic',
              },
              '& a': {
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              },
              '& code': {
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: '0.9em',
                bgcolor: 'action.hover',
                px: 0.75,
                py: 0.25,
                borderRadius: 0.75,
              },
              '& dl': {
                my: 1.5,
              },
              '& dt': {
                fontWeight: 600,
                mt: 1,
                color: 'text.primary',
              },
              '& dd': {
                ml: 0,
                color: 'text.primary',
                mb: 1,
              },
              '& table': {
                width: '100%',
                borderCollapse: 'collapse',
                my: 2,
              },
              '& th, & td': {
                textAlign: 'left',
                p: '10px 12px',
                borderBottom: '1px solid',
                borderColor: 'divider',
                verticalAlign: 'top',
                fontSize: '0.95rem',
              },
              '& th': {
                fontWeight: 600,
                bgcolor: 'action.hover',
              },
            }}
          >
            {children}
      </Box>
    </Container>
  );
}
