'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, UserButton, useClerk } from '@clerk/nextjs';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Menu as MenuIcon, X } from 'lucide-react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import MuiMenu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { alpha, useTheme } from '@mui/material/styles';
import { CreditBadge } from '@/components/credits/CreditBadge';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { tgShadow } from '@/theme/shadows';
import { useActiveTrip, useCityOptional } from '@/contexts';
import { destinationSlug } from '@/lib/destinationSlug';
import { readLastChatId } from '@/components/chat/lastChatStorage';

const marketingLinks = [
  { href: '/trip', label: 'Trip' },
  { href: '/explore', label: 'Explore' },
  { href: '/chat', label: 'Chat' },
];

const discoverLinks = [
  { href: '/community', label: 'Guides' },
  { href: '/blog', label: 'Blog' },
  { href: '/faq', label: 'FAQ' },
];

const DISCOVER_PATH_PREFIXES = ['/community', '/blog', '/faq'];
const TRIP_PATH_PREFIXES = ['/trip', '/history'];

export function Navigation() {
  const pathname = usePathname() ?? '/';
  const { openSignIn } = useClerk();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileDiscoverOpen, setMobileDiscoverOpen] = useState(false);
  const [mobileTripOpen, setMobileTripOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // Skip the redirect-page hop on /trip, /explore, /chat by linking directly
  // to the canonical destination when we already know it. The bare paths still
  // work as fallbacks for fresh sessions and deep links.
  const { activeTripId, hydrated: activeTripHydrated } = useActiveTrip();
  const city = useCityOptional()?.city ?? null;
  const [lastChatId, setLastChatId] = useState<string | null>(null);
  useEffect(() => {
    setLastChatId(readLastChatId());
  }, [pathname]);

  const appLinks = useMemo(() => {
    const slug = destinationSlug(city);
    const exploreHref = slug ? `/explore/${slug}` : '/explore';
    const chatHref = lastChatId ? `/chat/${lastChatId}` : '/chat';
    return [
      { href: exploreHref, match: '/explore', label: 'Explore' },
      { href: chatHref, match: '/chat', label: 'Chat' },
    ];
  }, [city, lastChatId]);

  const tripMenuItems = useMemo(() => {
    const items: { href: string; label: string }[] = [
      { href: '/trip?new=1', label: 'Plan a new trip' },
    ];
    if (activeTripHydrated && activeTripId) {
      items.push({ href: `/trip/${activeTripId}`, label: 'Open current trip' });
    }
    items.push({ href: '/history', label: 'All my trips' });
    return items;
  }, [activeTripHydrated, activeTripId]);

  useEffect(() => {
    if (pendingHref && pathname.startsWith(pendingHref.split('?')[0])) {
      setPendingHref(null);
    }
  }, [pathname, pendingHref]);

  const isActive = (href: string) =>
    pendingHref === href || pathname.startsWith(href);
  const isActiveSection = (match: string, href: string) =>
    pendingHref === href || pathname.startsWith(match);
  const discoverActive =
    (pendingHref !== null &&
      DISCOVER_PATH_PREFIXES.some((p) => pendingHref.startsWith(p))) ||
    DISCOVER_PATH_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + '/'),
    );
  const tripActive =
    (pendingHref !== null &&
      TRIP_PATH_PREFIXES.some((p) => pendingHref.startsWith(p))) ||
    TRIP_PATH_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + '/'),
    );

  const closeMobile = () => {
    setMobileOpen(false);
    setMobileDiscoverOpen(false);
    setMobileTripOpen(false);
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
          mx: 'auto',
          width: '100%',
          maxWidth: 1280,
          height: 64,
          minHeight: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          px: { xs: 2, sm: 3 },
        }}
      >
        <Box
          component={Link}
          href="/"
          aria-label="Periplo home"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            fontWeight: 600,
            fontSize: 20,
            color: 'text.primary',
            textDecoration: 'none',
          }}
        >
          <span>Peri</span>
          <Box component="span" sx={{ color: 'primary.main' }}>plo</Box>
          <Box
            component="span"
            aria-hidden
            sx={{
              ml: 0.25,
              display: 'inline-block',
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: 'primary.main',
            }}
          />
        </Box>

        {/* Desktop nav */}
        <Box
          component="nav"
          sx={{
            display: { xs: 'none', md: 'flex' },
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
          }}
        >
          <SignedOut>
            {marketingLinks.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                active={isActive(link.href)}
                onNavigate={setPendingHref}
              >
                {link.label}
              </NavLink>
            ))}
            <DiscoverDropdown active={discoverActive} onNavigate={setPendingHref} />
          </SignedOut>
          <SignedIn>
            <TripDropdown
              active={tripActive}
              items={tripMenuItems}
              onNavigate={setPendingHref}
            />
            {appLinks.map((link) => (
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
          </SignedIn>
        </Box>

        {/* Right cluster */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SignedIn>
            <CreditBadge />
          </SignedIn>

          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <ThemeToggle />
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
            <UserButton afterSignOutUrl="/" />
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
            <SignedOut>
              {marketingLinks.map((link) => (
                <MobileLink
                  key={link.href}
                  href={link.href}
                  active={isActive(link.href)}
                  onClick={() => {
                    setPendingHref(link.href);
                    closeMobile();
                  }}
                >
                  {link.label}
                </MobileLink>
              ))}
            </SignedOut>
            <SignedIn>
              <Box
                component="button"
                type="button"
                onClick={() => setMobileTripOpen((v) => !v)}
                aria-expanded={mobileTripOpen}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: 1.5,
                  px: 1.5,
                  py: 1.25,
                  fontSize: 14,
                  fontWeight: 500,
                  background: 'transparent',
                  border: 0,
                  cursor: 'pointer',
                  ...(tripActive
                    ? {
                        bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                        color: 'primary.main',
                      }
                    : {
                        color: 'text.secondary',
                        '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
                      }),
                }}
              >
                Trip
                <ChevronDown
                  size={16}
                  style={{
                    transition: 'transform 0.2s',
                    transform: mobileTripOpen ? 'rotate(180deg)' : undefined,
                  }}
                />
              </Box>
              {mobileTripOpen ? (
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
                  {tripMenuItems.map((link) => (
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
              {appLinks.map((link) => (
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
            </SignedIn>
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
                fontWeight: 500,
                background: 'transparent',
                border: 0,
                cursor: 'pointer',
                ...(discoverActive
                  ? {
                      bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
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

function NavLink({
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
        fontWeight: 500,
        textDecoration: 'none',
        transition: 'color 0.15s, background-color 0.15s',
        color: active ? 'primary.main' : 'text.secondary',
        bgcolor: active
          ? alpha(theme.palette.primary.main, 0.12)
          : 'transparent',
        '&:hover': { color: active ? 'primary.main' : 'text.primary' },
      }}
    >
      {children}
    </Box>
  );
}

function TripDropdown({
  active,
  items,
  onNavigate,
}: {
  active: boolean;
  items: { href: string; label: string }[];
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
          fontWeight: 500,
          background: 'transparent',
          border: 0,
          cursor: 'pointer',
          transition: 'color 0.2s, background-color 0.2s',
          ...(active
            ? {
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: 'primary.main',
              }
            : {
                color: 'text.secondary',
                '&:hover': { color: 'text.primary' },
              }),
        }}
      >
        Trip
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
              minWidth: 192,
              borderRadius: 1.5,
              border: (t) => `1px solid ${t.palette.divider}`,
              boxShadow: (t) => tgShadow(t, 'dropdown'),
              p: 0.5,
            },
          },
        }}
      >
        {items.map((item) => (
          <MenuItem
            key={item.href}
            component={Link}
            href={item.href}
            onClick={() => {
              onNavigate?.(item.href);
              setAnchor(null);
            }}
            sx={{ borderRadius: 1, fontSize: 14, py: 1, px: 1.5 }}
          >
            {item.label}
          </MenuItem>
        ))}
      </MuiMenu>
    </>
  );
}

function DiscoverDropdown({
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
          fontWeight: 500,
          background: 'transparent',
          border: 0,
          cursor: 'pointer',
          transition: 'color 0.2s, background-color 0.2s',
          ...(active
            ? {
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: 'primary.main',
              }
            : {
                color: 'text.secondary',
                '&:hover': { color: 'text.primary' },
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
            onClick={() => {
              onNavigate?.(link.href);
              setAnchor(null);
            }}
            sx={{ borderRadius: 1, fontSize: 14, py: 1, px: 1.5 }}
          >
            {link.label}
          </MenuItem>
        ))}
      </MuiMenu>
    </>
  );
}

function MobileLink({
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
      onClick={onClick}
      sx={{
        borderRadius: 1.5,
        px: 1.5,
        py: 1.25,
        fontSize: 14,
        fontWeight: 500,
        textDecoration: 'none',
        ...(active
          ? {
              bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
              color: 'primary.main',
            }
          : {
              color: 'text.secondary',
              '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
            }),
      }}
    >
      {children}
    </Box>
  );
}
