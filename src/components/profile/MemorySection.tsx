'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Brain, X } from 'lucide-react';
import { api, ApiError } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import type { MemoryFact } from '@/lib/chat/protocol';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { minTap } from '@/theme/standards';

const MEMORY_KEY = ['chat', 'memory'] as const;

const CATEGORY_LABELS: Record<string, string> = {
  diet: 'Diet',
  mobility: 'Mobility',
  party: 'Travelling with',
  pace: 'Pace',
  budget: 'Budget',
  likes: 'Likes',
  dislikes: 'Dislikes',
  home: 'Home',
  other: 'Other',
};

/**
 * "What Periplo remembers" — durable traveller facts the assistant learned
 * (GET/DELETE /api/chat/memory). Signed-in only; guests get 401.
 */
export function MemorySection() {
  const { isSignedIn, isLoaded } = useAuth();
  const queryClient = useQueryClient();
  const [confirmAll, setConfirmAll] = useState(false);

  const memory = useQuery({
    queryKey: MEMORY_KEY,
    queryFn: async () => {
      const res = await api.get<{ facts?: MemoryFact[] }>(endpoints.chatMemory);
      return Array.isArray(res?.facts) ? res.facts : [];
    },
    enabled: isLoaded && !!isSignedIn,
    staleTime: 60 * 1000,
    retry: (count, err) => !(err instanceof ApiError && err.status === 401) && count < 2,
  });

  const forgetOne = useMutation({
    mutationFn: (id: string) => api.delete(endpoints.chatMemoryById(id)),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: MEMORY_KEY });
      const prev = queryClient.getQueryData<MemoryFact[]>(MEMORY_KEY);
      queryClient.setQueryData<MemoryFact[]>(MEMORY_KEY, (old) => (old ?? []).filter((f) => f.id !== id));
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(MEMORY_KEY, ctx.prev);
      toast.error("Couldn't forget that — try again");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: MEMORY_KEY }),
  });

  const forgetAll = useMutation({
    mutationFn: () => api.delete(endpoints.chatMemory),
    onSuccess: () => {
      queryClient.setQueryData<MemoryFact[]>(MEMORY_KEY, []);
      toast.success('Periplo forgot everything it learned about you');
      setConfirmAll(false);
    },
    onError: () => toast.error("Couldn't clear memory — try again"),
  });

  if (!isLoaded || !isSignedIn) return null;
  if (memory.error instanceof ApiError && memory.error.status === 401) return null;

  const facts = memory.data ?? [];

  return (
    <Box
      component="section"
      aria-labelledby="memory-heading"
      sx={{ mt: 2, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', p: 2.5 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography
          id="memory-heading"
          component="h2"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.disabled' }}
        >
          <Brain size={13} aria-hidden />
          What Periplo remembers
        </Typography>
        {facts.length ? (
          <Button variant="ghost" size="xs" onClick={() => setConfirmAll(true)}>
            Forget all
          </Button>
        ) : null}
      </Box>
      <Typography sx={{ mt: 0.5, fontSize: 14, color: 'text.secondary' }}>
        Things the assistant picked up in chat to personalize suggestions. Remove anything that&apos;s wrong.
      </Typography>

      {memory.isLoading ? (
        <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-5 w-48" />
        </Box>
      ) : memory.isError ? (
        <Typography sx={{ mt: 1.5, fontSize: 14, color: 'text.secondary' }}>
          Couldn&apos;t load memory right now.
        </Typography>
      ) : facts.length === 0 ? (
        <Typography sx={{ mt: 1.5, fontSize: 14, color: 'text.secondary' }}>
          Nothing yet. Mention things like &ldquo;I&apos;m vegetarian&rdquo; in chat and they&apos;ll show up here.
        </Typography>
      ) : (
        <Box component="ul" sx={{ listStyle: 'none', m: 0, mt: 1.5, p: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {facts.map((f) => (
            <Box
              component="li"
              key={f.id}
              sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.25, borderTop: 1, borderColor: 'divider', '&:first-of-type': { borderTop: 0 } }}
            >
              <Box
                component="span"
                sx={{ flexShrink: 0, minWidth: 96, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'primary.main' }}
              >
                {CATEGORY_LABELS[f.category] ?? f.category}
              </Box>
              <Box component="span" sx={{ flex: 1, minWidth: 0, fontSize: 14, color: 'text.primary' }}>
                {f.fact}
              </Box>
              <Box
                component="button"
                type="button"
                onClick={() => forgetOne.mutate(f.id)}
                aria-label={`Forget: ${f.fact}`}
                sx={(t) => ({
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: minTap,
                  height: minTap,
                  flexShrink: 0,
                  border: 0,
                  borderRadius: 999,
                  bgcolor: 'transparent',
                  color: 'text.secondary',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
                  '&:focus-visible': { outline: `2px solid ${t.palette.primary.main}`, outlineOffset: 0 },
                })}
              >
                <X size={16} aria-hidden />
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <Dialog
        open={confirmAll}
        onOpenChange={(o) => {
          if (!o && !forgetAll.isPending) setConfirmAll(false);
        }}
        title="Forget everything?"
        footer={
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button variant="ghost" onClick={() => setConfirmAll(false)}>
              Cancel
            </Button>
            <Button variant="destructive" loading={forgetAll.isPending} onClick={() => forgetAll.mutate()}>
              Forget all
            </Button>
          </Box>
        }
      >
        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
          Periplo will stop using what it learned about you in chat. This can&apos;t be undone.
        </Typography>
      </Dialog>
    </Box>
  );
}
