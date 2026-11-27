'use client';

import { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import { alpha, useTheme, type Theme } from '@mui/material/styles';
import { Maximize2, SquarePen, X } from 'lucide-react';
import { useAIContext, useChatDock } from '@/contexts';
import { Sheet } from '@/components/ui/Sheet';
import { tgShadow } from '@/theme/shadows';
import { minTap } from '@/theme/standards';
import { AskPeriploIcon } from '../AskPeriploIcon';
import { ChatConversation, type ChatEntryContext } from '../ChatConversation';
import { fullChatHref } from './fullChatHref';

const LAUNCHER = 56;
const EDGE = 24;
const GAP = 16;
/** Space other bottom-right floaters reserve while the launcher shows. */
const CLEARANCE = `${LAUNCHER + GAP}px`;

/**
 * "Ask Periplo" — the floating chat for signed-in users. A launcher pinned
 * bottom-right (desktop/tablet; phones use the dock's Ask tab) opens a
 * chat window that stays open while browsing. `useChatDock().open()` from
 * anywhere (e.g. the place page's Ask button) opens it with context; on
 * phones that renders as a bottom sheet.
 */
export function ChatDock() {
  const pathname = usePathname() ?? '';
  const { isSignedIn } = useAuth();
  const theme = useTheme();
  // Default (SSR-safe) mode: false on the server and the first client render,
  // so hydration matches; the launcher appears right after mount.
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const dock = useChatDock();
  const { context: pageContext } = useAIContext();
  const onChatRoute = pathname === '/chat' || pathname.startsWith('/chat/');
  const launcherVisible = Boolean(isSignedIn) && isDesktop && !onChatRoute;
  const panelOpen = dock.isOpen && !onChatRoute;
  const { ensureChat, close } = dock;

  // Reserve room for other bottom-right floaters (map buttons, toasts).
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--tg-fab-clearance', launcherVisible ? CLEARANCE : '0px');
    return () => root.style.setProperty('--tg-fab-clearance', '0px');
  }, [launcherVisible]);

  // Leaving for the full chat page closes the window.
  useEffect(() => {
    if (onChatRoute) close();
  }, [onChatRoute, close]);

  useEffect(() => {
    if (panelOpen) void ensureChat();
  }, [panelOpen, ensureChat]);

  const context = useMemo<ChatEntryContext | undefined>(() => {
    if (dock.openContext) return dock.openContext;
    const e = pageContext.entity;
    return e ? { entity_id: e.id, entity_type: e.type, entity_name: e.name } : undefined;
  }, [dock.openContext, pageContext.entity]);

  const body = (
    <DockBody
      chatId={dock.chatId}
      context={context}
      creating={dock.creating}
      error={dock.error}
      focusNonce={dock.openNonce}
    />
  );

  return (
    <>
      {launcherVisible ? (
        <Box
          component="button"
          type="button"
          onClick={dock.toggle}
          aria-label={panelOpen ? 'Close Ask Periplo' : 'Ask Periplo'}
          aria-expanded={panelOpen}
          aria-controls="tg-chat-dock"
          sx={(t: Theme) => ({
            position: 'fixed',
            right: EDGE,
            bottom: EDGE,
            zIndex: 1150,
            width: LAUNCHER,
            height: LAUNCHER,
            borderRadius: 999,
            border: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: t.palette.primary.contrastText,
            bgcolor: 'primary.main',
            boxShadow: tgShadow(t, 'sheet'),
            transition: 'transform 150ms ease, background-color 150ms ease',
            '&:hover': { bgcolor: 'primary.dark', transform: 'translateY(-1px)' },
            '&:focus-visible': {
              outline: `3px solid ${alpha(t.palette.primary.main, 0.45)}`,
              outlineOffset: 3,
            },
          })}
        >
          {panelOpen ? <X size={24} aria-hidden /> : <AskPeriploIcon size={26} aria-hidden />}
        </Box>
      ) : null}

      {isDesktop ? (
        panelOpen ? (
          <DesktopPanel
            chatId={dock.chatId}
            context={context}
            onClose={close}
            onNewChat={() => void dock.newChat()}
            withLauncher={launcherVisible}
          >
            {body}
          </DesktopPanel>
        ) : null
      ) : (
        <Sheet
          open={panelOpen}
          onOpenChange={(o) => {
            if (!o) close();
          }}
          side="bottom"
          title={
            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ display: 'inline-flex', color: 'primary.main' }}>
                <AskPeriploIcon size={18} aria-hidden />
              </Box>
              Ask Periplo
            </Box>
          }
          topAction={
            dock.chatId ? (
              <IconButton
                component={Link}
                href={fullChatHref(dock.chatId, context)}
                aria-label="Open full chat"
                sx={{ width: minTap, height: minTap, color: 'text.secondary' }}
              >
                <Maximize2 size={18} aria-hidden />
              </IconButton>
            ) : undefined
          }
        >
          <Box id="tg-chat-dock" sx={{ height: '82dvh', display: 'flex', flexDirection: 'column' }}>
            {body}
          </Box>
        </Sheet>
      )}
    </>
  );
}

function DesktopPanel({
  chatId,
  context,
  onClose,
  onNewChat,
  withLauncher,
  children,
}: {
  chatId: string | null;
  context?: ChatEntryContext;
  onClose: () => void;
  onNewChat: () => void;
  withLauncher: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const bottom = withLauncher ? EDGE + LAUNCHER + GAP : EDGE;

  return (
    <Box
      ref={ref}
      id="tg-chat-dock"
      role="dialog"
      aria-label="Ask Periplo"
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          onClose();
        }
      }}
      sx={(t: Theme) => ({
        position: 'fixed',
        right: EDGE,
        bottom,
        zIndex: 1150,
        width: 400,
        maxWidth: `calc(100vw - ${EDGE * 2}px)`,
        // Stays clear of the 64px app bar on short viewports.
        height: `min(640px, calc(100dvh - ${bottom + 88}px))`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.default',
        boxShadow: tgShadow(t, 'sheet'),
        animation: 'tgDockIn 180ms ease-out',
        '@keyframes tgDockIn': {
          from: { opacity: 0, transform: 'translateY(8px) scale(0.98)' },
          to: { opacity: 1, transform: 'none' },
        },
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
      })}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pl: 2,
          pr: 0.5,
          minHeight: 52,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          flexShrink: 0,
        }}
      >
        <Box component="span" sx={{ display: 'inline-flex', color: 'primary.main' }}>
          <AskPeriploIcon size={18} aria-hidden />
        </Box>
        <Box component="span" sx={{ flex: 1, fontSize: '0.9375rem', fontWeight: 600 }}>
          Ask Periplo
        </Box>
        <IconButton
          aria-label="New chat"
          title="New chat"
          onClick={onNewChat}
          sx={{ width: minTap, height: minTap, color: 'text.secondary' }}
        >
          <SquarePen size={17} aria-hidden />
        </IconButton>
        {chatId ? (
          <IconButton
            component={Link}
            href={fullChatHref(chatId, context)}
            aria-label="Open full chat"
            title="Open full chat"
            sx={{ width: minTap, height: minTap, color: 'text.secondary' }}
          >
            <Maximize2 size={17} aria-hidden />
          </IconButton>
        ) : null}
        <IconButton
          aria-label="Close"
          title="Close"
          onClick={onClose}
          sx={{ width: minTap, height: minTap, color: 'text.secondary' }}
        >
          <X size={18} aria-hidden />
        </IconButton>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>{children}</Box>
    </Box>
  );
}

function DockBody({
  chatId,
  context,
  creating,
  error,
  focusNonce,
}: {
  chatId: string | null;
  context?: ChatEntryContext;
  creating: boolean;
  error: string | null;
  focusNonce: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Focus the composer whenever the dock (re)opens or the chat swaps.
  useEffect(() => {
    if (!chatId) return;
    const raf = requestAnimationFrame(() => {
      ref.current?.querySelector<HTMLTextAreaElement>('textarea')?.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, [chatId, focusNonce]);

  if (!chatId) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
          textAlign: 'center',
          fontSize: '0.875rem',
          color: error ? 'error.main' : 'text.secondary',
        }}
      >
        {error ?? (creating ? 'Starting chat…' : 'Opening chat…')}
      </Box>
    );
  }
  return (
    <Box ref={ref} sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <ChatConversation key={chatId} chatId={chatId} embed context={context} />
    </Box>
  );
}
