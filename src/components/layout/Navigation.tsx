'use client';

import Link, { useLinkStatus } from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SignedIn, SignedOut, UserButton, useClerk } from '@clerk/nextjs';
import { memo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Menu as MenuIcon, Sparkles, X } from 'lucide-react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import MuiMenu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { alpha, useTheme } from '@mui/material/styles';
import { CreditBadge } from '@/components/credits/CreditBadge';
import { ThemeToggle, ThemeTogglePopover } from '@/components/ui/ThemeToggle';
import { tgShadow } from '@/theme/shadows';
import { useSubscriptionOptional } from '@/contexts/SubscriptionContext';

const discoverLinks = [
  { href: '/community', label: 'Guides' },
  { href: '/blog', label: 'Blog' },
  { href: '/faq', label: 'FAQ' },
];

const DISCOVER_PATH_PREFIXES = ['/community', '/blog', '/faq'];

// Stable, SSR-safe hrefs for the navbar pills. The destination pages
// (/trip, /explore, /chat) handle redirecting to the canonical per-user
// path so the link element doesn't flip mid-navigation and cancel the
// in-flight transition.
const primaryLinks = [
  { href: '/trip', match: '/trip', label: 'Trip' },
  { href: '/explore', match: '/explore', label: 'Explore' },
  { href: '/chat', match: '/chat', label: 'Chat' },
];

export function Navigation() {
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const onChat = pathname === '/chat' || pathname.startsWith('/chat/');
  const { openSignIn } = useClerk();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileDiscoverOpen, setMobileDiscoverOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const isPro = useSubscriptionOptional()?.credits?.isPro ?? false;

  useEffect(() => {
    if (pendingHref && pathname.startsWith(pendingHref.split('?')[0])) {
      setPendingHref(null);
    }
  }, [pathname, pendingHref]);

  // Warm the router cache for the canonical pill destinations + discover
  // links as soon as the navbar mounts. `<Link prefetch>` only fires on
  // viewport intersection, which on a cold marketing → app click is too late
  // — the user pays the full RSC + bundle fetch on the first hop. Calling
  // router.prefetch on mount kicks the prefetch off immediately so by the
  // time they click the destination's loading.tsx + page chunk are cached.
  useEffect(() => {
    for (const link of primaryLinks) router.prefetch(link.href);
    for (const link of discoverLinks) router.prefetch(link.href);
  }, [router]);

  const isActiveSection = (match: string, href: string) =>
    pendingHref === href || pathname.startsWith(match);
  const discoverActive =
    (pendingHref !== null &&
      DISCOVER_PATH_PREFIXES.some((p) => pendingHref.startsWith(p))) ||
    DISCOVER_PATH_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + '/'),
    );

  const closeMobile = () => {
    setMobileOpen(false);
    setMobileDiscoverOpen(false);
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        zIndex: (t) => t.zIndex.appBar,
        borderBottom: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <Toolbar
        sx={{
          width: '100%',
          height: 64,
          minHeight: 64,
          // Grid keeps the middle pill cluster centered against the viewport
          // regardless of left/right content widths (the right cluster is
          // wider than the logo, so a flex `space-between` would offset the
          // pills to the left of true center).
          display: 'grid',
          gridTemplateColumns: { xs: '1fr auto', md: '1fr auto 1fr' },
          alignItems: 'center',
          columnGap: 2,
          px: { xs: 2, sm: 3 },
        }}
      >
        <Box
          component={Link}
          href="/"
          aria-label="Periplo home"
          sx={{
            justifySelf: 'start',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontWeight: 600,
            fontSize: 20,
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
              width: 28,
              height: 28,
              borderRadius: 1.25,
              display: 'block',
            }}
          />
          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <span>Peri</span>
            <Box component="span" sx={{ color: 'primary.main' }}>plo</Box>
          </Box>
        </Box>

        {/* Desktop nav */}
        <Box
          component="nav"
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
          }}
        >
          {primaryLinks.map((link) => (
            <NavLink
              key={link.match}
              href={link.href}
              active={isActiveSection(link.match, link.href)}
              onNavigate={setPendingHref}
            >
              {link.label}
            </NavLink>
          ))}
          <DiscoverDropdown active={discoverActive} onNavigate={setPendingHref} />
        </Box>

        {/* Right cluster */}
        <Box sx={{ justifySelf: 'end', display: 'flex', alignItems: 'center', gap: 1 }}>
          <SignedIn>
            <CreditBadge />
          </SignedIn>

          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <ThemeTogglePopover />
          </Box>

          <SignedOut>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => openSignIn()}
            >
              Sign In
            </Button>
          </SignedOut>
          <SignedIn>
            {!isPro ? (
              <Button
                component={Link}
                href="/pricing"
                variant="contained"
                color="primary"
                size="small"
                startIcon={<Sparkles size={14} />}
                sx={{ display: { xs: 'none', md: 'inline-flex' }, fontWeight: 600 }}
              >
                Upgrade
              </Button>
            ) : null}
            {!onChat ? (
              <UserButton afterSignOutUrl="/">
                <UserButton.MenuItems>
                  {!isPro ? (
                    <UserButton.Link
                      label="Upgrade"
                      labelIcon={<Sparkles size={14} />}
                      href="/pricing"
                    />
                  ) : (
                    <UserButton.Link
                      label="Manage subscription"
                      labelIcon={<Sparkles size={14} />}
                      href="/profile"
                    />
                  )}
                </UserButton.MenuItems>
              </UserButton>
            ) : null}
          </SignedIn>

          <IconButton
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
            sx={{
              display: { xs: 'inline-flex', md: 'none' },
              color: 'text.primary',
            }}
          >
            {mobileOpen ? <X size={18} /> : <MenuIcon size={18} />}
          </IconButton>
        </Box>
      </Toolbar>

      {mobileOpen ? (
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          sx={{
            display: { xs: 'block', md: 'none' },
            borderTop: (t) => `1px solid ${t.palette.divider}`,
            bgcolor: 'background.paper',
            px: 2,
            pt: 1,
            pb: 2,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <SignedIn>
              {!isPro ? (
                <Box
                  component={Link}
                  href="/pricing"
                  onClick={() => {
                    setPendingHref('/pricing');
                    closeMobile();
                  }}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    alignSelf: 'flex-start',
                    borderRadius: 1.5,
                    px: 1.5,
                    py: 1,
                    mb: 0.5,
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: 'none',
                    color: 'primary.contrastText',
                    bgcolor: 'primary.main',
                    '&:hover': { bgcolor: 'primary.dark' },
                  }}
                >
                  <Sparkles size={14} />
                  Upgrade
                </Box>
              ) : null}
            </SignedIn>
            {primaryLinks.map((link) => (
              <MobileLink
                key={link.match}
                href={link.href}
                active={isActiveSection(link.match, link.href)}
                onClick={() => {
                  setPendingHref(link.href);
                  closeMobile();
                }}
              >
                {link.label}
              </MobileLink>
            ))}
            <Box
              component="button"
              type="button"
              onClick={() => setMobileDiscoverOpen((v) => !v)}
              aria-expanded={mobileDiscoverOpen}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: 1.5,
                px: 1.5,
                py: 1.25,
                fontSize: 14,
                fontWeight: discoverActive ? 600 : 500,
                background: 'transparent',
                border: 0,
                cursor: 'pointer',
                ...(discoverActive
                  ? {
                      bgcolor: (t) => alpha(t.palette.primary.main, 0.16),
                      color: 'primary.main',
                    }
                  : {
                      color: 'text.secondary',
                      '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
                    }),
              }}
            >
              Discover
              <ChevronDown
                size={16}
                style={{
                  transition: 'transform 0.2s',
                  transform: mobileDiscoverOpen ? 'rotate(180deg)' : undefined,
                }}
              />
            </Box>
            {mobileDiscoverOpen ? (
              <Box
                component={motion.div}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                sx={{
                  ml: 1.5,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                  borderLeft: (t) => `1px solid ${t.palette.divider}`,
                  pl: 1.5,
                }}
              >
                {discoverLinks.map((link) => (
                  <MobileLink
                    key={link.href}
                    href={link.href}
                    active={
                      pendingHref === link.href ||
                      pathname === link.href.split('?')[0]
                    }
                    onClick={() => {
                      setPendingHref(link.href);
                      closeMobile();
                    }}
                  >
                    {link.label}
                  </MobileLink>
                ))}
              </Box>
            ) : null}
            <Box
              sx={{
                mt: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: (t) => `1px solid ${t.palette.divider}`,
                pt: 1.5,
              }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'text.disabled',
                }}
              >
                Theme
              </Typography>
              <ThemeToggle />
            </Box>
          </Box>
        </Box>
      ) : null}
    </AppBar>
  );
}

/** Tiny spinner that appears alongside a Link's label while the click-driven
 *  navigation is in flight. Combined with App Router's `loading.tsx`
 *  boundaries, this is the user's confirmation that the click registered. */
function LinkPendingDot({ size = 12 }: { size?: number }) {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <Box
      component="span"
      aria-hidden
      sx={{
        ml: 0.75,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
      }}
    >
      <CircularProgress size={size} thickness={5} sx={{ color: 'inherit' }} />
    </Box>
  );
}

const NavLink = memo(function NavLink({
  href,
  active,
  onNavigate,
  children,
}: {
  href: string;
  active: boolean;
  onNavigate?: (href: string) => void;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <Box
      component={Link}
      href={href}
      prefetch
      onClick={() => onNavigate?.(href)}
      sx={{
        display: 'inline-flex',
        height: 36,
        alignItems: 'center',
        borderRadius: 999,
        px: 1.75,
        fontSize: 14,
        fontWeight: active ? 600 : 500,
        textDecoration: 'none',
        transition: 'color 0.15s, background-color 0.15s',
        color: active ? 'primary.main' : 'text.secondary',
        bgcolor: active
          ? alpha(theme.palette.primary.main, 0.16)
          : 'transparent',
        '&:hover': {
          color: active ? 'primary.main' : 'text.primary',
          bgcolor: active ? alpha(theme.palette.primary.main, 0.16) : 'action.hover',
        },
      }}
    >
      {children}
      <LinkPendingDot />
    </Box>
  );
});

const DiscoverDropdown = memo(function DiscoverDropdown({
  active,
  onNavigate,
}: {
  active: boolean;
  onNavigate?: (href: string) => void;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const theme = useTheme();
  const open = Boolean(anchor);
  return (
    <>
      <Box
        component="button"
        type="button"
        onClick={(e) => setAnchor(e.currentTarget as HTMLElement)}
        sx={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          height: 36,
          borderRadius: 999,
          px: 1.75,
          fontSize: 14,
          fontWeight: active ? 600 : 500,
          background: 'transparent',
          border: 0,
          cursor: 'pointer',
          transition: 'color 0.2s, background-color 0.2s',
          ...(active
            ? {
                bgcolor: alpha(theme.palette.primary.main, 0.16),
                color: 'primary.main',
              }
            : {
                color: 'text.secondary',
                '&:hover': { color: 'text.primary', bgcolor: 'action.hover' },
              }),
        }}
      >
        Discover
        <ChevronDown size={14} aria-hidden />
      </Box>
      <MuiMenu
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 176,
              borderRadius: 1.5,
              border: (t) => `1px solid ${t.palette.divider}`,
              boxShadow: (t) => tgShadow(t, 'dropdown'),
              p: 0.5,
            },
          },
        }}
      >
        {discoverLinks.map((link) => (
          <MenuItem
            key={link.href}
            component={Link}
            href={link.href}
            prefetch
            onClick={() => {
              onNavigate?.(link.href);
              setAnchor(null);
            }}
            sx={{ borderRadius: 1, fontSize: 14, py: 1, px: 1.5 }}
          >
            {link.label}
            <LinkPendingDot />
          </MenuItem>
        ))}
      </MuiMenu>
    </>
  );
});

const MobileLink = memo(function MobileLink({
  href,
  active,
  onClick,
  children,
}: {
  href: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Box
      component={Link}
      href={href}
      prefetch
      onClick={onClick}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 1.5,
        px: 1.5,
        py: 1.25,
        fontSize: 14,
        fontWeight: active ? 600 : 500,
        textDecoration: 'none',
        ...(active
          ? {
              bgcolor: (t) => alpha(t.palette.primary.main, 0.16),
              color: 'primary.main',
            }
          : {
              color: 'text.secondary',
              '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
            }),
      }}
    >
      {children}
      <LinkPendingDot />
    </Box>
  );
});
