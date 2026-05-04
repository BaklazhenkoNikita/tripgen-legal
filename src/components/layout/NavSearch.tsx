'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { useCityOptional } from '@/contexts';
import { tgShadow } from '@/theme/shadows';
import { useSearchSuggest } from '@/hooks/useSearchSuggest';
import { FeedItemDrawer } from '@/components/explore/FeedItemDrawer';
import type { FeedItem } from '@/hooks/useHomeFeed';
import type { ItemSuggestion } from '@/types/search';

function suggestionToFeedItem(
  it: ItemSuggestion,
  city: string | null,
): FeedItem {
  return {
    item: {
      _id: it._id,
      name: it.name,
      images: it.images,
      primary_categories: it.primary_categories,
      price_from: it.price_from,
      currency: it.currency,
      ...(city ? { city } : {}),
    },
    score: 1,
    entity_type: it.entity_type,
  };
}

export function NavSearch() {
  const router = useRouter();
  const city = useCityOptional()?.city ?? null;
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const [openItem, setOpenItem] = useState<FeedItem | null>(null);
  const [isPending, startTransition] = useTransition();
  const wrapRef = useRef<HTMLDivElement>(null);

  const { data } = useSearchSuggest(value, city);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    setOpen(false);
    startTransition(() => {
      router.push(`/trip?destination=${encodeURIComponent(trimmed)}`);
    });
  };

  const pickCategory = (label: string, name: string) => {
    const dest = city ? `${name} · ${label}` : label;
    setValue('');
    setOpen(false);
    startTransition(() => {
      router.push(`/trip?destination=${encodeURIComponent(dest)}`);
    });
  };

  const pickItemSuggestion = (it: ItemSuggestion) => {
    setOpenItem(suggestionToFeedItem(it, city));
    setValue('');
    setOpen(false);
  };

  const hasResults =
    (data?.categories?.length ?? 0) > 0 || (data?.items?.length ?? 0) > 0;

  return (
    <Box ref={wrapRef} sx={{ position: 'relative', display: { xs: 'none', md: 'block' } }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ position: 'relative' }}>
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: 'text.disabled',
            display: 'inline-flex',
          }}
        >
          <Search size={16} />
        </Box>
        <InputBase
          type="search"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={city ? `Search in ${city}…` : 'Search activities…'}
          sx={{
            height: 36,
            width: 224,
            borderRadius: 999,
            border: (t) => `1px solid ${t.palette.divider}`,
            bgcolor: 'background.paper',
            pl: 4.5,
            pr: 1.5,
            fontSize: 14,
            color: 'text.primary',
            opacity: isPending ? 0.6 : 1,
            transition: 'all 0.2s',
            '&:focus-within': {
              width: 288,
              borderColor: 'primary.main',
              boxShadow: (t) => `0 0 0 3px ${alpha(t.palette.primary.main, 0.20)}`,
            },
          }}
        />
      </Box>

      {open && value.trim().length >= 2 && hasResults ? (
        <Paper
          role="listbox"
          elevation={0}
          sx={{
            position: 'absolute',
            left: 0,
            top: 44,
            zIndex: (t) => t.zIndex.modal,
            maxHeight: 384,
            width: 320,
            overflowY: 'auto',
            borderRadius: 2,
            border: (t) => `1px solid ${t.palette.divider}`,
            bgcolor: 'background.paper',
            p: 1,
            boxShadow: (t) => tgShadow(t, 'dropdown'),
          }}
        >
          {data?.categories && data.categories.length > 0 ? (
            <Box sx={{ mb: 1 }}>
              <Typography
                sx={{
                  px: 1,
                  pb: 0.5,
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'text.disabled',
                }}
              >
                Categories
              </Typography>
              <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                {data.categories.map((c) => (
                  <Box component="li" key={c.name}>
                    <Box
                      component="button"
                      type="button"
                      onClick={() => pickCategory(c.label, c.name)}
                      sx={{
                        display: 'flex',
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                        borderRadius: 1,
                        px: 1,
                        py: 0.75,
                        textAlign: 'left',
                        fontSize: 14,
                        color: 'text.primary',
                        cursor: 'pointer',
                        border: 0,
                        background: 'transparent',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <span>{c.label}</span>
                      <Box component="span" sx={{ fontSize: 12, color: 'text.disabled' }}>{c.count}</Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          ) : null}

          {data?.items && data.items.length > 0 ? (
            <Box>
              <Typography
                sx={{
                  px: 1,
                  pb: 0.5,
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'text.disabled',
                }}
              >
                Places
              </Typography>
              <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                {data.items.map((it) => (
                  <Box component="li" key={it._id}>
                    <Box
                      component="button"
                      type="button"
                      onClick={() => pickItemSuggestion(it)}
                      sx={{
                        display: 'flex',
                        width: '100%',
                        alignItems: 'center',
                        gap: 1.5,
                        borderRadius: 1,
                        px: 1,
                        py: 0.75,
                        textAlign: 'left',
                        cursor: 'pointer',
                        border: 0,
                        background: 'transparent',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      {it.images?.[0]?.url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <Box
                          component="img"
                          src={it.images[0].url}
                          alt=""
                          loading="lazy"
                          sx={{ height: 32, width: 32, flexShrink: 0, borderRadius: 0.5, objectFit: 'cover' }}
                        />
                      ) : (
                        <Box sx={{ height: 32, width: 32, flexShrink: 0, borderRadius: 0.5, bgcolor: 'action.hover' }} />
                      )}
                      <Box
                        component="span"
                        sx={{
                          minWidth: 0,
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: 14,
                          color: 'text.primary',
                        }}
                      >
                        {it.name}
                      </Box>
                      {typeof it.price_from === 'number' ? (
                        <Box component="span" sx={{ fontSize: 12, color: 'text.disabled' }}>
                          from {it.currency ?? '$'}{it.price_from}
                        </Box>
                      ) : null}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          ) : null}
        </Paper>
      ) : null}

      <FeedItemDrawer
        item={openItem}
        city={city}
        onClose={() => setOpenItem(null)}
      />
    </Box>
  );
}
