'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { ChevronDown } from 'lucide-react';

type FooterLink = { label: string; href: string; external?: boolean };

const footerLinks: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Explore',
    links: [
      { label: 'Guides', href: '/community' },
      { label: 'Blog', href: '/blog' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    title: 'Product',
    links: [
      { label: 'Plan a Trip', href: '/trip' },
      { label: 'My Trips', href: '/history' },
      { label: 'Discover', href: '/discover' },
      { label: 'Browse cities', href: '/explore' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/legal/privacy' },
      { label: 'Terms of Service', href: '/legal/terms' },
      { label: 'Help Center', href: '/legal/help' },
      { label: 'Delete account', href: '/legal/delete-account' },
      { label: 'EU DSA notice', href: '/legal/dsa' },
      { label: 'Affiliate disclosure', href: '/legal/affiliate-disclosure' },
      { label: 'AI disclosure', href: '/legal/ai-disclosure' },
      { label: 'MCP connector', href: '/legal/mcp' },
    ],
  },
  {
    title: 'Contact',
    links: [
      { label: 'support@periploapp.com', href: 'mailto:support@periploapp.com', external: true },
      { label: 'hello@periploapp.com', href: 'mailto:hello@periploapp.com', external: true },
    ],
  },
];

const inlineLinks: FooterLink[] = [
  { label: 'Help', href: '/legal/help' },
  { label: 'Privacy', href: '/legal/privacy' },
  { label: 'Terms', href: '/legal/terms' },
];

export function Footer() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <Box
      component="footer"
      sx={{
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: { xs: 'none', sm: 'block' },
      }}
    >
      <Box
        sx={{
          mx: 'auto',
          maxWidth: 1280,
          px: { xs: 2, sm: 3 },
          py: 4,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box
            component={Link}
            href="/"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              color: 'text.primary',
              textDecoration: 'none',
            }}
          >
            <Box
              component="img"
              src="/apple-touch-icon.png"
              alt=""
              aria-hidden
              sx={{
                width: 24,
                height: 24,
                borderRadius: 1,
                display: 'block',
              }}
            />
            <Box
              component="span"
              sx={{
                fontSize: '1.25rem',
                fontWeight: 400,
                letterSpacing: '-0.01em',
              }}
            >
              Periplo
            </Box>
          </Box>

          <Stack
            component="ul"
            direction="row"
            spacing={1.25}
            sx={{
              listStyle: 'none',
              m: 0,
              p: 0,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {inlineLinks.map((link, i) => (
              <Box
                component="li"
                key={link.href}
                sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.25 }}
              >
                {i > 0 && (
                  <Box
                    aria-hidden
                    sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.disabled' }}
                  />
                )}
                <Box
                  component={Link}
                  href={link.href}
                  sx={{
                    fontSize: '0.8125rem',
                    color: 'text.secondary',
                    textDecoration: 'none',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  {link.label}
                </Box>
              </Box>
            ))}
          </Stack>

          <Box
            component="button"
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={panelId}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              border: 0,
              background: 'transparent',
              p: 0.5,
              fontFamily: 'inherit',
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'text.secondary',
              cursor: 'pointer',
              transition: 'color 0.2s',
              '&:hover': { color: 'text.primary' },
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: 2,
                borderRadius: 1,
              },
            }}
          >
            {open ? 'Less' : 'More'}
            <ChevronDown
              size={14}
              aria-hidden
              style={{
                transition: 'transform 0.2s',
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </Box>
        </Box>

        <Box
          id={panelId}
          role="region"
          aria-label="Site links"
          aria-hidden={!open}
          sx={{
            overflow: 'hidden',
            maxHeight: open ? 720 : 0,
            opacity: open ? 1 : 0,
            pointerEvents: open ? 'auto' : 'none',
            transition: 'max-height 0.3s ease, opacity 0.2s ease, margin-top 0.2s ease',
            mt: open ? 4 : 0,
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' },
              gap: 5,
            }}
          >
            <Box sx={{ gridColumn: { xs: 'span 2', md: 'span 1' } }}>
              <Typography sx={{ maxWidth: 280, fontSize: '0.875rem', color: 'text.secondary' }}>
                AI-powered travel planning. Personal itineraries, day by day.
              </Typography>
            </Box>

            {footerLinks.map((group) => (
              <Box key={group.title}>
                <Typography
                  component="h3"
                  sx={{
                    m: 0,
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'text.disabled',
                  }}
                >
                  {group.title}
                </Typography>
                <Stack component="ul" sx={{ listStyle: 'none', m: 0, mt: 1.5, p: 0 }} spacing={1.25}>
                  {group.links.map((link) => (
                    <Box component="li" key={link.href}>
                      {link.external ? (
                        <Box
                          component="a"
                          href={link.href}
                          tabIndex={open ? 0 : -1}
                          sx={{
                            fontSize: '0.875rem',
                            color: 'text.secondary',
                            textDecoration: 'none',
                            '&:hover': { color: 'primary.main' },
                          }}
                        >
                          {link.label}
                        </Box>
                      ) : (
                        <Box
                          component={Link}
                          href={link.href}
                          tabIndex={open ? 0 : -1}
                          sx={{
                            fontSize: '0.875rem',
                            color: 'text.secondary',
                            textDecoration: 'none',
                            '&:hover': { color: 'primary.main' },
                          }}
                        >
                          {link.label}
                        </Box>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Box>
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            mt: 3,
            borderTop: '1px solid',
            borderColor: 'divider',
            pt: 2.5,
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'text.disabled',
            letterSpacing: '0.01em',
          }}
        >
          &copy; {new Date().getFullYear()} Periplo &middot; Plan with intent.
        </Box>
      </Box>
    </Box>
  );
}
