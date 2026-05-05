'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Sparkles, Compass, X, ExternalLink, AlertTriangle, MessageSquare } from 'lucide-react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { useCity } from '@/contexts';
import { useDiscover, type DiscoverResult } from '@/hooks/useDiscover';
import { useFeatureConfig, useChatEnabled } from '@/hooks/useFeatureConfig';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Photo } from '@/components/ui/Photo';
import { Skeleton } from '@/components/ui/Skeleton';
import { AskAISheet } from '@/components/chat/AskAISheet';

export default function DiscoverPage() {
  const { city } = useCity();
  const { phase, results, error, start, cancel } = useDiscover();
  const { data: featureConfig } = useFeatureConfig();
  const chatEnabled = useChatEnabled();
  const [query, setQuery] = useState('');
  const [askOpen, setAskOpen] = useState(false);

  const tripGenDisabled =
    featureConfig?.disable_trip_generation || featureConfig?.disable_all_ai;
  const busy = phase === 'connecting' || phase === 'streaming';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city || tripGenDisabled) return;
    start({ city, query: query.trim() || undefined, max_results: 20 });
  };

  if (!city) {
    return (
      <Box sx={{ mx: 'auto', maxWidth: 576, px: { xs: 2, sm: 3 }, py: 10 }}>
        <EmptyState
          icon={<Compass className="size-6" />}
          title="Pick a city first"
          description="Discover finds hidden gems, neighborhood walks, and local events for the city you're curious about."
          action={
            <Button asChild iconLeft={<Compass className="size-4" />}>
              <Link href="/explore">Choose a city</Link>
            </Button>
          }
        />
      </Box>
    );
  }

  return (
    <Box sx={{ mx: 'auto', maxWidth: 896, px: { xs: 2, sm: 3 }, py: 5 }}>
      <Box component="header" sx={{ mb: 4 }}>
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            borderRadius: 999,
            bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
            px: 1.5,
            py: 0.5,
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'primary.main',
          }}
        >
          <Sparkles className="size-3" aria-hidden />
          AI Discovery
        </Box>
        <Typography
          component="h1"
          sx={{
            mt: 1.5,
            fontFamily: 'var(--font-display, inherit)',
            fontSize: '2.25rem',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'text.primary',
          }}
        >
          Discover {city}
        </Typography>
        <Typography sx={{ mt: 1, fontSize: 15, color: 'text.secondary' }}>
          Find local events, niche spots, and seasonal picks the standard feed misses.
        </Typography>
      </Box>

      {tripGenDisabled ? (
        <Box
          role="status"
          sx={(t) => ({
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: alpha(t.palette.warning.main, 0.3),
            bgcolor: alpha(t.palette.warning.main, 0.1),
            p: 2,
            fontSize: 14,
            color: t.palette.warning.dark,
          })}
        >
          <AlertTriangle className="size-4 shrink-0" aria-hidden />
          Discovery is paused for maintenance. Try again shortly.
        </Box>
      ) : null}

      <Box component="form" onSubmit={handleSubmit} sx={{ position: 'relative' }}>
        <Box
          component={Search}
          aria-hidden
          sx={{
            pointerEvents: 'none',
            position: 'absolute',
            left: 16,
            top: '50%',
            width: 20,
            height: 20,
            transform: 'translateY(-50%)',
            color: 'text.disabled',
          }}
        />
        <Box
          component="input"
          type="text"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          placeholder="Wine bars with a view, Sunday market finds, late-night ramen…"
          disabled={busy || Boolean(tripGenDisabled)}
          sx={{
            height: 56,
            width: '100%',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            pl: 6,
            pr: 20,
            fontSize: 15,
            color: 'text.primary',
            '&::placeholder': { color: 'text.disabled' },
            '&:focus': {
              outline: 'none',
              borderColor: 'primary.main',
              boxShadow: (t) => `0 0 0 2px ${alpha(t.palette.primary.main, 0.3)}`,
            },
            '&:disabled': { opacity: 0.6 },
          }}
        />
        <Box sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
          {busy ? (
            <Button onClick={cancel} variant="secondary" iconLeft={<X className="size-4" />} size="md">
              Stop
            </Button>
          ) : (
            <Button type="submit" disabled={Boolean(tripGenDisabled)} size="md" iconLeft={<Sparkles className="size-4" />}>
              Discover
              <Box component="span" sx={{ ml: 0.5 }}>
                <Badge tone="accent" size="sm">1 credit</Badge>
              </Box>
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="ghost"
          size="sm"
          iconLeft={<MessageSquare className="size-4" />}
          onClick={() => setAskOpen(true)}
          disabled={!chatEnabled || !city}
        >
          Ask AI about {city}
        </Button>
      </Box>

      {phase === 'error' && error ? (
        <Box
          sx={(t) => ({
            mt: 2.5,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: alpha(t.palette.error.main, 0.3),
            bgcolor: alpha(t.palette.error.main, 0.1),
            p: 2,
            fontSize: 14,
            color: t.palette.error.dark,
          })}
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </Box>
      ) : null}

      <Box sx={{ mt: 4 }}>
        {phase === 'idle' ? (
          <EmptyState
            icon={<Sparkles className="size-6" />}
            title="Ready when you are"
            description="Type a vibe or just hit Discover to see a fresh set of local finds."
          />
        ) : results.length === 0 && !busy ? (
          <EmptyState
            icon={<Compass className="size-6" />}
            title="Nothing turned up"
            description="Try a different phrasing or come back later — the pool refreshes daily."
          />
        ) : (
          <Box
            sx={{
              columnGap: 2,
              columnCount: { xs: 1, sm: 2, lg: 3 },
            }}
          >
            {results.map((r, i) => (
              <Box key={`${r.id ?? r.title ?? 'r'}-${i}`} sx={{ mb: 2, breakInside: 'avoid' }}>
                <ResultCard result={r} />
              </Box>
            ))}
            {busy
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Box key={`s-${i}`} sx={{ mb: 2, breakInside: 'avoid' }}>
                    <Skeleton
                      style={{ width: '100%', borderRadius: 12, height: 200 + (i * 40) % 120, animationDelay: `${i * 0.12}s` }}
                    />
                  </Box>
                ))
              : null}
          </Box>
        )}
      </Box>

      <AskAISheet open={askOpen} onClose={() => setAskOpen(false)} city={city} />
    </Box>
  );
}

function ResultCard({ result }: { result: DiscoverResult }) {
  const title = result.title ?? '(untitled)';
  const imageUrl = result.images?.[0]?.url ?? null;
  return (
    <Box
      component="article"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        transition: 'all 200ms',
        boxShadow: 'var(--tg-shadow-card)',
        '&:hover': { borderColor: 'text.disabled', boxShadow: 'var(--tg-shadow-card-hover)', transform: 'translateY(-1px)' },
      }}
    >
      {imageUrl ? <Photo src={imageUrl} alt={title} aspect="3/2" zoomOnHover /> : null}
      <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', gap: 0.75, p: 2 }}>
        <Typography
          component="h3"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            fontFamily: 'var(--font-display, inherit)',
            fontSize: 15,
            fontWeight: 600,
            lineHeight: 1.35,
            color: 'text.primary',
          }}
        >
          {title}
        </Typography>
        {result.description ? (
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{result.description}</Typography>
        ) : null}
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          {result.category ? (
            <Badge tone="accent" size="sm">{result.category}</Badge>
          ) : <span />}
          {result.url ? (
            <Box
              component="a"
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                fontSize: 12,
                fontWeight: 500,
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Open
              <ExternalLink className="size-3" aria-hidden />
            </Box>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}
