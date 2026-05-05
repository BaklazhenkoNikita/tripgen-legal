'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { alpha } from '@mui/material/styles';
import { UserButton, useUser } from '@clerk/nextjs';
import {
  AlertTriangle,
  ChevronUp,
  PanelLeft,
  PanelLeftClose,
  Plus,
} from 'lucide-react';
import { useChats, useCreateChat } from '@/hooks/useChats';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tooltip } from '@/components/ui/Tooltip';
import type { ChatSummary } from '@/types';
import { writeLastChatId } from './lastChatStorage';
import { useChatLayout } from './ChatLayoutContext';

interface Props {
  /** Called after a successful navigation (used by mobile drawer to auto-close). */
  onNavigate?: () => void;
}

const ERROR_PREFIXES = [
  'sorry, i encountered an error',
  'sorry, something went wrong',
  'an error occurred',
];

function isErrorReply(text: string | null | undefined): boolean {
  if (!text) return false;
  const t = text.trim().toLowerCase();
  return ERROR_PREFIXES.some((p) => t.startsWith(p));
}

function formatRelative(iso: string | null | undefined): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return '';
  const diffMs = Date.now() - then;
  if (diffMs < 60_000) return 'just now';
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function ChatSidebar({ onNavigate }: Props) {
  const router = useRouter();
  const params = useParams<{ chatId?: string }>();
  const activeChatId = params?.chatId;
  const { data: chats, isLoading } = useChats();
  const createChat = useCreateChat();
  const { collapsed, setCollapsed, isMobile } = useChatLayout();

  const handleNewChat = async () => {
    const fresh = await createChat.mutateAsync({});
    writeLastChatId(fresh.chat_id);
    router.push(`/chat/${fresh.chat_id}`);
    onNavigate?.();
  };

  // Cmd/Ctrl+N from the chat layout asks us to create a new chat.
  useEffect(() => {
    const onNew = () => {
      if (createChat.isPending) return;
      void handleNewChat();
    };
    window.addEventListener('tripgen:chat-new', onNew);
    return () => window.removeEventListener('tripgen:chat-new', onNew);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createChat.isPending]);

  // Collapse rail only applies on desktop; mobile sidebar lives in a Sheet.
  const isRail = !isMobile && collapsed;

  if (isRail) {
    return (
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          bgcolor: 'background.paper',
          py: 1,
        }}
      >
        <Tooltip content="Expand sidebar" side="right">
          <IconButton
            aria-label="Expand sidebar"
            onClick={() => setCollapsed(false)}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <PanelLeft size={18} aria-hidden />
          </IconButton>
        </Tooltip>
        <Tooltip content="New chat" side="right">
          <IconButton
            aria-label="New chat"
            onClick={() => void handleNewChat()}
            disabled={createChat.isPending}
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover:not(:disabled)': { bgcolor: 'primary.dark' },
              '&.Mui-disabled': { opacity: 0.5 },
            }}
          >
            <Plus size={16} aria-hidden />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        width: '100%',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          bgcolor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          px: 1.5,
          py: 1.25,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {!isMobile ? (
            <IconButton
              aria-label="Collapse sidebar"
              onClick={() => setCollapsed(true)}
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              <PanelLeftClose size={18} aria-hidden />
            </IconButton>
          ) : null}
          <Box component="h2" sx={{ m: 0, fontSize: 14, fontWeight: 700, color: 'text.primary' }}>
            Chats
          </Box>
        </Box>
        <Tooltip content="New chat">
          <IconButton
            aria-label="New chat"
            onClick={() => void handleNewChat()}
            disabled={createChat.isPending}
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover:not(:disabled)': { bgcolor: 'primary.dark' },
              '&.Mui-disabled': { opacity: 0.5 },
            }}
          >
            <Plus size={16} aria-hidden />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', px: 1, py: 1 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, px: 0.5 }}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} variant="card" height={44} />
            ))}
          </Box>
        ) : !chats || chats.length === 0 ? (
          <Box
            sx={{
              p: 2,
              fontSize: 13,
              color: 'text.secondary',
              textAlign: 'center',
            }}
          >
            No chats yet — start one above.
          </Box>
        ) : (
          <Box
            component="ul"
            sx={{ m: 0, p: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 0.25 }}
          >
            {chats.map((c) => (
              <ConversationRow
                key={c.chat_id}
                chat={c}
                isActive={c.chat_id === activeChatId}
                onNavigate={onNavigate}
              />
            ))}
          </Box>
        )}
      </Box>

      <SidebarFooter />
    </Box>
  );
}

function ConversationRow({
  chat,
  isActive,
  onNavigate,
}: {
  chat: ChatSummary;
  isActive: boolean;
  onNavigate?: () => void;
}) {
  const errored = isErrorReply(chat.last_message_preview);
  const when = formatRelative(chat.last_activity_at || chat.updated_at);

  return (
    <Box component="li" sx={{ listStyle: 'none' }}>
      <Box
        component={Link}
        href={`/chat/${chat.chat_id}`}
        onClick={() => onNavigate?.()}
        sx={(t) => ({
          display: 'block',
          borderRadius: 1.5,
          px: 1.5,
          py: 1.25,
          textDecoration: 'none',
          opacity: errored ? 0.6 : 1,
          bgcolor: isActive ? 'action.selected' : 'transparent',
          borderLeft: '2px solid',
          borderLeftColor: isActive ? t.palette.primary.main : 'transparent',
          transition: 'background-color 0.15s, border-color 0.15s, opacity 0.15s',
          '&:hover': {
            bgcolor: isActive ? 'action.selected' : t.palette.action.hover,
            opacity: errored ? 0.85 : 1,
          },
        })}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
          {errored ? (
            <AlertTriangle
              size={12}
              aria-label="Last reply errored"
              style={{ flexShrink: 0, color: 'var(--tg-palette-warning-main)' }}
            />
          ) : null}
          <Box
            component="p"
            sx={{
              m: 0,
              flex: 1,
              minWidth: 0,
              fontSize: 14,
              fontWeight: 500,
              color: 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {chat.title || 'Untitled chat'}
          </Box>
        </Box>
        {when ? (
          <Box
            component="p"
            sx={{
              m: 0,
              mt: 0.25,
              fontSize: 12,
              color: 'text.secondary',
            }}
          >
            {when}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}

function SidebarFooter() {
  const { user, isLoaded } = useUser();
  const display =
    user?.fullName ||
    user?.primaryEmailAddress?.emailAddress ||
    'Account';

  return (
    <Box
      sx={{
        mt: 'auto',
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={(t) => ({
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 1,
          borderRadius: 0,
          transition: 'background-color 0.15s',
          '&:hover': { bgcolor: alpha(t.palette.text.primary, 0.04) },
        })}
      >
        {isLoaded ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <Box sx={{ width: 32, height: 32, borderRadius: 999, bgcolor: 'action.hover' }} />
        )}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            fontSize: 13,
            fontWeight: 500,
            color: 'text.primary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {display}
        </Box>
        <ChevronUp size={14} aria-hidden style={{ color: 'var(--tg-palette-text-disabled)' }} />
      </Box>
    </Box>
  );
}
