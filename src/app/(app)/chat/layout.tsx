'use client';

import { useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Sheet } from '@/components/ui/Sheet';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatLayoutContext } from '@/components/chat/ChatLayoutContext';

const SIDEBAR_WIDTH = 280;

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openHistory = useCallback(() => setDrawerOpen(true), []);

  return (
    <ChatLayoutContext.Provider value={{ openHistory, isMobile }}>
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
              width: SIDEBAR_WIDTH,
              borderRight: 1,
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <ChatSidebar />
          </Box>
        ) : null}

        <Box sx={{ flex: 1, minWidth: 0, height: '100%', overflow: 'hidden' }}>
          {children}
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
