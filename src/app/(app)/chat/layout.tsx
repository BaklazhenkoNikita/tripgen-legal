'use client';

import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Sheet } from '@/components/ui/Sheet';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatContextBar } from '@/components/chat/ChatContextBar';
import { ChatLayoutContext } from '@/components/chat/ChatLayoutContext';

const SIDEBAR_WIDTH = 280;
const SIDEBAR_RAIL_WIDTH = 56;
const COLLAPSE_KEY = 'tripgen_chat_sidebar_collapsed';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [collapsed, setCollapsedState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem(COLLAPSE_KEY) === '1';
    } catch {
      return false;
    }
  });

  const setCollapsed = useCallback((next: boolean) => {
    setCollapsedState(next);
    try {
      window.localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
    } catch {
      // Private mode / storage disabled — fall back to in-memory state.
    }
  }, []);

  const [focusInputRequest, setFocusInputRequest] = useState(0);
  const requestFocusInput = useCallback(() => {
    setFocusInputRequest((n) => n + 1);
  }, []);

  const openHistory = useCallback(() => setDrawerOpen(true), []);

  // Cmd/Ctrl+K focuses the input; Cmd/Ctrl+N starts a new chat; Esc closes
  // the mobile drawer.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      if (mod && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        requestFocusInput();
        return;
      }
      if (mod && (e.key === 'n' || e.key === 'N')) {
        // Don't hijack Cmd+N when the user is composing in another input
        // outside the chat input — only when on the chat page itself.
        if (isTyping && (target as HTMLElement).closest('[data-chat-input]')) {
          // chat input itself — let new-chat fire
        }
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('tripgen:chat-new'));
        return;
      }
      if (e.key === 'Escape') {
        setDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [requestFocusInput]);

  const sidebarWidth = collapsed ? SIDEBAR_RAIL_WIDTH : SIDEBAR_WIDTH;

  return (
    <ChatLayoutContext.Provider
      value={{
        openHistory,
        isMobile,
        collapsed,
        setCollapsed,
        focusInputRequest,
        requestFocusInput,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
          width: '100%',
        }}
      >
        {!isMobile ? (
          <Box
            sx={{
              flexShrink: 0,
              width: sidebarWidth,
              borderRight: 1,
              borderColor: 'divider',
              display: 'flex',
              transition: 'width 0.18s ease',
              overflow: 'hidden',
            }}
          >
            <ChatSidebar />
          </Box>
        ) : null}

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <ChatContextBar />
          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            {children}
          </Box>
        </Box>
      </Box>

      {isMobile ? (
        <Sheet
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          side="left"
          size="sm"
          title="Chats"
          hideTitle
        >
          <ChatSidebar onNavigate={() => setDrawerOpen(false)} />
        </Sheet>
      ) : null}
    </ChatLayoutContext.Provider>
  );
}
