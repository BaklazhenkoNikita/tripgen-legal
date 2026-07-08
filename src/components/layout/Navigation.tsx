'use client';

import Link, { useLinkStatus } from 'next/link';
import { useOptimisticNav } from '@/hooks/useOptimisticNav';
import { SignedIn, SignedOut, UserButton, useClerk } from '@clerk/nextjs';
import { memo, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, House, Menu as MenuIcon, Sparkles, X, type LucideIcon } from 'lucide-react';
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
import { ProBadge } from '@/components/credits/ProBadge';
import { ThemeToggle, ThemeTogglePopover } from '@/components/ui/ThemeToggle';
import { tgShadow } from '@/theme/shadows';
import { useSubscriptionOptional } from '@/contexts/SubscriptionContext';
import { useLastChatId } from '@/components/chat/lastChatStorage';
import { TripSwitcher } from './TripSwitcher';

// "Guides" groups the editorial / marketing surfaces. Renamed from the old
// "Discover" dropdown to resolve the naming collision with the /discover AI
// page (which now lives under "Ask Periplo").
const guidesLinks = [
  { href: '/community', label: 'City guides' },
  { href: '/blog', label: 'Blog' },
  { href: '/faq', label: 'FAQ' },
];

const GUIDES_PATH_PREFIXES = ['/community', '/blog', '/faq'];

// Match prefixes for the active-state pill highlighting. Hrefs are computed
// per-render in the component below so the pills point directly at the
// user's canonical destination (/trip/{activeTripId}, /chat/{lastChatId})
// rather than the index pages that just redirect — skipping the second hop
// makes the click feel instant.
const PRIMARY_MATCHES = {
  trip: '/trip',
  history: '/history',
  explore: '/explore',
  chat: '/chat',
} as const;

// The /explore page is the primary entry point. The URL stays /explore —
// the /explore/[slug] SEO pages and sitemap depend on it.
const homeLink = {
  href: '/explore',
  match: PRIMARY_MATCHES.explore,
  label: 'Explore',
  icon: House,
} as const;

const planLink = {
  href: '/trip?new=1',
  match: PRIMARY_MATCHES.trip,
  label: 'Plan a trip',
} as const;

const myTripsLink = {
  href: '/history',
  match: PRIMARY_MATCHES.history,
  label: 'My Trips',
} as const;

export function Navigation() {
  const { openSignIn } = useClerk();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileGuidesOpen, setMobileGuidesOpen] = useState(false);

  const isPro = useSubscriptionOptional()?.credits?.isPro ?? false;
  const lastChatId = useLastChatId();

  // "Ask Periplo" — the AI concierge. Deep-links to the last chat so the pill
  // resumes the conversation rather than hopping through the /chat redirector.
  const askLink = useMemo(
    () => ({
      href: lastChatId ? `/chat/${lastChatId}` : '/chat',
      match: PRIMARY_MATCHES.chat,
      label: 'Ask Periplo',
    }),
    [lastChatId],
  );

  const allHrefs = useMemo(
    () =>
      [homeLink, planLink, myTripsLink, askLink, ...guidesLinks].map((l) => l.href),
    [askLink],
  );
  const { pathname, pendingHref, setPendingHref } = useOptimisticNav(allHrefs);
  const onChat = pathname === '/chat' || pathname.startsWith('/chat/');

  const isActiveSection = (match: string, href: string) =>
    pendingHref === href || pathname.startsWith(match);
  const guidesActive =
    (pendingHref !== null &&
      GUIDES_PATH_PREFIXES.some((p) => pendingHref.startsWith(p))) ||
    GUIDES_PATH_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + '/'),
    );
  // "Plan a trip" owns /trip*; "My Trips" owns /history* — split so each pill
  // highlights independently under the new IA.
  const planActive =
    (pendingHref !== null && pendingHref.startsWith(PRIMARY_MATCHES.trip)) ||
    pathname === PRIMARY_MATCHES.trip ||
    pathname.startsWith(PRIMARY_MATCHES.trip + '/');
  const myTripsActive =
    (pendingHref !== null && pendingHref.startsWith(PRIMARY_MATCHES.history)) ||
    pathname === PRIMARY_MATCHES.history ||
    pathname.startsWith(PRIMARY_MATCHES.history + '/');

  const closeMobile = () => {
    setMobileOpen(false);
    setMobileGuidesOpen(false);
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
          sx={{
            justifySelf: 'start',
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Box
            component={Link}
            href="/"
            aria-label="Periplo home"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexShrink: 0,
              fontWeight: 600,
              fontSize: '1.25rem',
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
          {/* Active-trip context switcher — keeps the product anchored to one
              trip and makes the AI contextual. Renders nothing when idle. */}
          <Box sx={{ display: { xs: 'none', md: 'block' }, minWidth: 0 }}>
            <TripSwitcher onNavigate={setPendingHref} />
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
          <NavLink
            href={homeLink.href}
            icon={homeLink.icon}
            active={isActiveSection(homeLink.match, homeLink.href)}
            onNavigate={setPendingHref}
          >
            {homeLink.label}
          </NavLink>
          <NavLink
            href={planLink.href}
            active={planActive}
            onNavigate={setPendingHref}
          >
            {planLink.label}
          </NavLink>
          <NavLink
            href={myTripsLink.href}
            active={myTripsActive}
            onNavigate={setPendingHref}
          >
            {myTripsLink.label}
          </NavLink>
          <GuidesDropdown active={guidesActive} onNavigate={setPendingHref} />
          <NavLink
            href={askLink.href}
            active={isActiveSection(askLink.match, askLink.href)}
            onNavigate={setPendingHref}
          >
            {askLink.label}
          </NavLink>
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
            ) : (
              <Box
                component={Link}
                href="/profile"
                aria-label="You're on Pro — manage subscription"
                sx={{
                  display: { xs: 'none', md: 'inline-flex' },
                  textDecoration: 'none',
                  transition: 'transform 150ms',
                  '&:hover': { transform: 'translateY(-1px)' },
                }}
              >
                <ProBadge size="md" />
              </Box>
            )}
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
                    fontSize: '1rem',
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
              ) : (
                <Box
                  component={Link}
                  href="/profile"
                  onClick={() => {
                    setPendingHref('/profile');
                    closeMobile();
                  }}
                  aria-label="You're on Pro — manage subscription"
                  sx={{
                    alignSelf: 'flex-start',
                    mb: 0.5,
                    textDecoration: 'none',
                  }}
                >
                  <ProBadge size="md" />
                </Box>
              )}
            </SignedIn>
            <Box sx={{ mb: 0.5 }}>
              <TripSwitcher
                onNavigate={(href) => {
                  setPendingHref(href);
                  closeMobile();
                }}
              />
            </Box>
            <MobileLink
              href={homeLink.href}
              icon={homeLink.icon}
              active={isActiveSection(homeLink.match, homeLink.href)}
              onClick={() => {
                setPendingHref(homeLink.href);
                closeMobile();
              }}
            >
              {homeLink.label}
            </MobileLink>
            <MobileLink
              href={planLink.href}
              active={planActive}
              onClick={() => {
                setPendingHref(planLink.href);
                closeMobile();
              }}
            >
              {planLink.label}
            </MobileLink>
            <MobileLink
              href={myTripsLink.href}
              active={myTripsActive}
              onClick={() => {
                setPendingHref(myTripsLink.href);
                closeMobile();
              }}
            >
              {myTripsLink.label}
            </MobileLink>
            <Box
              component="button"
              type="button"
              onClick={() => setMobileGuidesOpen((v) => !v)}
              aria-expanded={mobileGuidesOpen}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: 1.5,
                px: 1.5,
                py: 1.25,
                fontSize: '1rem',
                fontWeight: guidesActive ? 600 : 500,
                background: 'transparent',
                border: 0,
                cursor: 'pointer',
                ...(guidesActive
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
              Guides
              <ChevronDown
                size={16}
                style={{
                  transition: 'transform 0.2s',
                  transform: mobileGuidesOpen ? 'rotate(180deg)' : undefined,
                }}
              />
            </Box>
            {mobileGuidesOpen ? (
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
                {guidesLinks.map((link) => (
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
            <MobileLink
              href={askLink.href}
              active={isActiveSection(askLink.match, askLink.href)}
              onClick={() => {
                setPendingHref(askLink.href);
                closeMobile();
              }}
            >
              {askLink.label}
            </MobileLink>
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
                  fontSize: '0.6875rem',
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
  icon: Icon,
  children,
}: {
  href: string;
  active: boolean;
  onNavigate?: (href: string) => void;
  icon?: LucideIcon;
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
        fontSize: '1rem',
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
      {Icon ? <Icon size={16} aria-hidden style={{ marginRight: 6 }} /> : null}
      {children}
      <LinkPendingDot />
    </Box>
  );
});

const GuidesDropdown = memo(function GuidesDropdown({
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
          fontSize: '1rem',
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
        Guides
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
        {guidesLinks.map((link) => (
          <MenuItem
            key={link.href}
            component={Link}
            href={link.href}
            prefetch
            onClick={() => {
              onNavigate?.(link.href);
              setAnchor(null);
            }}
            sx={{ borderRadius: 1, fontSize: '0.95rem', py: 1, px: 1.5 }}
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
  icon: Icon,
  children,
}: {
  href: string;
  active: boolean;
  onClick: () => void;
  icon?: LucideIcon;
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
        fontSize: '1rem',
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
      {Icon ? <Icon size={16} aria-hidden style={{ marginRight: 6 }} /> : null}
      {children}
      <LinkPendingDot />
    </Box>
  );
});
