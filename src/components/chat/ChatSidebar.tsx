'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import { useChats, useCreateChat } from '@/hooks/useChats';
import { Skeleton } from '@/components/ui/Skeleton';
import { writeLastChatId } from './lastChatStorage';

interface Props {
  /** Called after a successful navigation (used by mobile drawer to auto-close). */
  onNavigate?: () => void;
}

export function ChatSidebar({ onNavigate }: Props) {
  const router = useRouter();
  const params = useParams<{ chatId?: string }>();
  const activeChatId = params?.chatId;
  const { data: chats, isLoading } = useChats();
  const createChat = useCreateChat();

  const handleNewChat = async () => {
    const fresh = await createChat.mutateAsync({});
    writeLastChatId(fresh.chat_id);
    router.push(`/chat/${fresh.chat_id}`);
    onNavigate?.();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100%',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box component="h2" sx={{ m: 0, fontSize: 14, fontWeight: 700, color: 'text.primary' }}>
          Chats
        </Box>
        <Box
          component="button"
          type="button"
          onClick={handleNewChat}
          disabled={createChat.isPending}
          sx={{
            cursor: 'pointer',
            border: 0,
            borderRadius: 1.5,
            bgcolor: 'primary.main',
            px: 1.25,
            py: 0.5,
            fontSize: 12,
            fontWeight: 600,
            color: 'primary.contrastText',
            '&:hover:not(:disabled)': { bgcolor: 'primary.dark' },
            '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
          }}
        >
          {createChat.isPending ? '…' : '+ New'}
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', px: 1, py: 1 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, px: 0.5 }}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} variant="card" height={48} />
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
            sx={{ m: 0, p: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 0.5 }}
          >
            {chats.map((c) => {
              const isActive = c.chat_id === activeChatId;
              return (
                <Box component="li" key={c.chat_id} sx={{ listStyle: 'none' }}>
                  <Box
                    component={Link}
                    href={`/chat/${c.chat_id}`}
                    onClick={() => onNavigate?.()}
                    sx={(t) => ({
                      display: 'block',
                      borderRadius: 1.5,
                      px: 1.25,
                      py: 1,
                      textDecoration: 'none',
                      bgcolor: isActive ? 'action.selected' : 'transparent',
                      border: 1,
                      borderColor: isActive ? 'divider' : 'transparent',
                      transition: 'background-color 0.15s',
                      '&:hover': {
                        bgcolor: isActive ? 'action.selected' : t.palette.action.hover,
                      },
                    })}
                  >
                    <Box
                      component="p"
                      sx={{
                        m: 0,
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'text.primary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {c.title || 'Untitled chat'}
                    </Box>
                    <Box
                      component="p"
                      sx={{
                        m: 0,
                        mt: 0.25,
                        fontSize: 11,
                        color: 'text.secondary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {c.last_message_preview || '—'}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
}
