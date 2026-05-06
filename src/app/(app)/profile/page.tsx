'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogOut, Pencil, Download, Trash2, Sparkles, AlertTriangle } from 'lucide-react';
import { useClerk, useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import {
  useProfile,
  useProfileFingerprint,
  useExportProfileData,
  useDeleteProfile,
} from '@/hooks/useProfile';
import { CreditsCard } from '@/components/credits/CreditsCard';
import { WelcomeProDialog } from '@/components/credits/WelcomeProDialog';
import { PreferencesForm } from '@/components/profile/PreferencesForm';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { ProBadge } from '@/components/credits/ProBadge';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Dialog } from '@/components/ui/Dialog';
import { useSubscriptionOptional } from '@/contexts/SubscriptionContext';

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfilePageInner />
    </Suspense>
  );
}

function ProfilePageInner() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { data: profile } = useProfile();
  const { data: fingerprint } = useProfileFingerprint();
  const exportData = useExportProfileData();
  const deleteAccount = useDeleteProfile();
  const subscription = useSubscriptionOptional();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [editingPrefs, setEditingPrefs] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);

  // Land here from Stripe Checkout success redirect (`/profile?upgraded=1`).
  // Open the welcome dialog and start polling credits — the Stripe redirect
  // typically arrives ~1s before the webhook does, so we keep refreshing
  // until `isPro` flips and the dialog can show its celebratory state.
  const upgradeHandled = useRef(false);
  useEffect(() => {
    if (upgradeHandled.current) return;
    if (searchParams.get('upgraded') !== '1') return;
    upgradeHandled.current = true;
    setWelcomeOpen(true);
    router.replace('/profile');
    let attempts = 0;
    const tick = () => {
      void subscription?.refresh();
      attempts += 1;
      if (attempts >= 10) return;
      setTimeout(tick, 1500);
    };
    tick();
  }, [searchParams, subscription, router]);

  const handleExport = async () => {
    try {
      const blob = await exportData.mutateAsync();
      const json = JSON.stringify(blob, null, 2);
      const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(json)}`;
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `periplo-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Data export downloaded.');
    } catch (err) {
      toast.error(err instanceof Error ? `Export failed: ${err.message}` : 'Export failed.');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAccount.mutateAsync();
      toast.success('Account deleted.');
      void signOut({ redirectUrl: '/' });
    } catch (err) {
      toast.error(err instanceof Error ? `Couldn't delete: ${err.message}` : "Couldn't delete account.");
    } finally {
      setConfirmingDelete(false);
    }
  };

  const displayName =
    profile?.name ??
    user?.fullName ??
    user?.firstName ??
    user?.primaryEmailAddress?.emailAddress ??
    '';
  const email = user?.primaryEmailAddress?.emailAddress ?? '';
  const initials = (displayName || email || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <Box sx={{ mx: 'auto', maxWidth: 768, px: { xs: 2, sm: 3 }, py: 5 }}>
      <Typography
        component="h1"
        sx={{
          fontFamily: 'var(--font-display, inherit)',
          fontSize: '2.25rem',
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: 'text.primary',
        }}
      >
        Profile
      </Typography>

      <Box
        component="section"
        sx={{
          mt: 3,
          overflow: 'hidden',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          backgroundImage: (t) =>
            `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.12)}, ${t.palette.background.paper}, ${t.palette.action.hover})`,
          p: 3,
        }}
      >
        {isLoaded ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2.5 }}>
            <Box
              sx={{
                display: 'flex',
                height: 64,
                width: 64,
                flexShrink: 0,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 999,
                bgcolor: 'primary.main',
                fontFamily: 'var(--font-display, inherit)',
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'common.white',
                boxShadow: 'var(--tg-shadow-card)',
              }}
            >
              {initials || '?'}
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-display, inherit)',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: 'text.primary',
                }}
              >
                {displayName || '—'}
              </Typography>
              {email && email !== displayName ? (
                <Typography
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: 14,
                    color: 'text.secondary',
                  }}
                >
                  {email}
                </Typography>
              ) : null}
            </Box>
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<LogOut className="size-3.5" />}
              onClick={() => void signOut({ redirectUrl: '/' })}
            >
              Sign out
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Skeleton variant="circle" className="h-16 w-16" />
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </Box>
          </Box>
        )}
      </Box>

      <Box component="section" sx={{ mt: 2 }}>
        <CreditsCard />
      </Box>

      <Box
        component="section"
        sx={{
          mt: 2,
          borderRadius: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          p: 2.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography
            component="h2"
            sx={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'text.disabled',
            }}
          >
            Preferences
          </Typography>
          {!editingPrefs ? (
            <Button
              variant="ghost"
              size="xs"
              iconLeft={<Pencil className="size-3" />}
              onClick={() => setEditingPrefs(true)}
            >
              Edit
            </Button>
          ) : null}
        </Box>

        {editingPrefs ? (
          <Box sx={{ mt: 2 }}>
            <PreferencesForm profile={profile} onClose={() => setEditingPrefs(false)} />
          </Box>
        ) : profile?.preferences ? (
          <Box
            component="dl"
            sx={{
              mt: 1.5,
              display: 'grid',
              gap: 1.25,
              gridTemplateColumns: { sm: '1fr 1fr' },
            }}
          >
            {profile.preferences.budget ? (
              <Pref label="Budget" value={profile.preferences.budget} />
            ) : null}
            {profile.preferences.energy_level ? (
              <Pref label="Energy" value={profile.preferences.energy_level} />
            ) : null}
            {profile.preferences.who ? (
              <Pref label="Who" value={profile.preferences.who} />
            ) : null}
            {profile.preferences.preferred_activity_types?.length ? (
              <Pref
                label="Interests"
                value={profile.preferences.preferred_activity_types.join(', ')}
              />
            ) : null}
            {profile.preferences.vibe_tags?.length ? (
              <Pref label="Vibe" value={profile.preferences.vibe_tags.join(', ')} />
            ) : null}
          </Box>
        ) : (
          <Typography sx={{ mt: 1.5, fontSize: 14, color: 'text.secondary' }}>
            No preferences set. Click Edit to personalize future trip suggestions.
          </Typography>
        )}
      </Box>

      <Box
        component="section"
        sx={{
          mt: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          p: 2.5,
        }}
      >
        <Box>
          <Typography
            component="h2"
            sx={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'text.disabled',
            }}
          >
            Appearance
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 14, color: 'text.secondary' }}>
            Light, dark, or follow your system.
          </Typography>
        </Box>
        <ThemeToggle />
      </Box>

      <SubscriptionSection />

      {(() => {
        const fp = fingerprint?.fingerprint;
        const text =
          typeof fp === 'string'
            ? fp
            : fp && typeof fp === 'object'
              ? Object.entries(fp as Record<string, number>)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([k]) => k)
                  .join(', ')
              : '';
        if (!text) return null;
        return (
          <Box
            component="section"
            sx={{
              mt: 2,
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              p: 2.5,
            }}
          >
            <Typography
              component="h2"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'text.disabled',
              }}
            >
              <Box component={Sparkles} aria-hidden sx={{ width: 12, height: 12, color: 'primary.main' }} />
              Travel personality
            </Typography>
            <Typography sx={{ mt: 1, fontSize: 14, color: 'text.secondary', textTransform: 'capitalize' }}>{text}</Typography>
          </Box>
        );
      })()}

      <Box
        component="section"
        sx={{
          mt: 2,
          borderRadius: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          p: 2.5,
        }}
      >
        <Typography
          component="h2"
          sx={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'text.disabled',
          }}
        >
          Data &amp; privacy
        </Typography>
        <Typography sx={{ mt: 1, fontSize: 14, color: 'text.secondary' }}>
          Download your trips, signals, and preferences as JSON, or delete your account permanently.
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="secondary"
            size="sm"
            iconLeft={<Download className="size-3.5" />}
            onClick={() => void handleExport()}
            disabled={exportData.isPending}
            loading={exportData.isPending}
          >
            Export my data
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconLeft={<Trash2 className="size-3.5" />}
            onClick={() => setConfirmingDelete(true)}
            disabled={deleteAccount.isPending}
            style={{ color: 'var(--tg-palette-error-main)' }}
          >
            Delete account
          </Button>
        </Box>
      </Box>

      <Dialog
        open={confirmingDelete}
        onOpenChange={(open) => {
          if (!open && !deleteAccount.isPending) setConfirmingDelete(false);
        }}
        title={
          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
            <AlertTriangle className="size-4" aria-hidden />
            Delete your account?
          </Box>
        }
        description="This permanently removes your trips, chats, saved items, and preferences. This can't be undone."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmingDelete(false)} disabled={deleteAccount.isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleDelete()}
              disabled={deleteAccount.isPending}
              loading={deleteAccount.isPending}
            >
              Yes, delete forever
            </Button>
          </>
        }
      >
        <Box />
      </Dialog>

      <WelcomeProDialog
        open={welcomeOpen}
        confirmed={subscription?.credits?.isPro ?? false}
        onClose={() => setWelcomeOpen(false)}
      />
    </Box>
  );
}

function Pref({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'action.hover',
        px: 1.5,
        py: 1.25,
      }}
    >
      <Badge tone="neutral" size="sm">{label}</Badge>
      <Typography sx={{ mt: 0.75, fontSize: 14, fontWeight: 500, textTransform: 'capitalize', color: 'text.primary' }}>{value}</Typography>
    </Box>
  );
}

function SubscriptionSection() {
  const [pending, setPending] = useState<'portal' | null>(null);
  const subscription = useSubscriptionOptional();
  const isPro = subscription?.credits?.isPro ?? false;

  const openPortal = async () => {
    setPending('portal');
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        toast.error(data.error ?? 'Could not open billing portal.');
        setPending(null);
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not open billing portal.');
      setPending(null);
    }
  };

  return (
    <Box
      component="section"
      sx={{
        mt: 2,
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        p: 2.5,
      }}
    >
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
        <Box>
          <Typography
            component="h2"
            sx={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'text.disabled',
            }}
          >
            Subscription
          </Typography>
          {isPro ? (
            <Typography sx={{ mt: 0.75, display: 'inline-flex', alignItems: 'center', gap: 1, fontSize: 14, fontWeight: 500, color: 'text.primary' }}>
              <ProBadge size="sm" />
              Unlimited AI generation
            </Typography>
          ) : (
            <Typography sx={{ mt: 0.75, fontSize: 14, color: 'text.secondary' }}>
              Free plan — 3 credits, regenerating every 4h.
            </Typography>
          )}
        </Box>
        {isPro ? (
          <Button
            variant="secondary"
            size="sm"
            disabled={pending === 'portal'}
            loading={pending === 'portal'}
            onClick={() => void openPortal()}
          >
            Manage subscription
          </Button>
        ) : (
          <Box
            component="a"
            href="/pricing"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1,
              bgcolor: 'primary.main',
              px: 1.5,
              py: 0.75,
              fontSize: 14,
              fontWeight: 600,
              color: 'common.white',
              textDecoration: 'none',
              '&:hover': { opacity: 0.9 },
            }}
          >
            Upgrade to Pro
          </Box>
        )}
      </Box>
    </Box>
  );
}
