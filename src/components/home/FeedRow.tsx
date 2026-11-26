'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import type { FeedItem } from '@/hooks/useHomeFeed';
import { FeedCard, cardId } from './FeedCard';
import { LoadMoreCard } from './LoadMoreCard';
import { SkeletonRail } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { HorizontalScrollRow, RailArrows, useScrollRail } from '@/components/ui/HorizontalScrollRow';
import { useLoadMoreFeed, type LoadMoreSource } from '@/hooks/useLoadMoreFeed';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { textScale } from '@/theme/standards';

interface Props {
  title: string;
  /** Heading element for the row title. Use `h3` under a section `h2`. */
  headingLevel?: 'h2' | 'h3';
  items: FeedItem[];
  isLoading: boolean;
  isGenerating?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  activeItemId: string | null;
  onHoverItem: (id: string | null) => void;
  onCardClick?: (item: FeedItem) => void;
  /** When true (default), the row collapses to nothing if items is empty.
   *  Pass false on prominent destination-view rows where an empty state is
   *  more informative than a missing section. */
  hideWhenEmpty?: boolean;
  /** When provided, appends a trailing "Load more" card to the rail. The card
   *  pulls more items from the database first, and only escalates to AI
   *  generation when `aiAugmentable` is true and the DB is exhausted. */
  loadMore?: {
    city: string;
    sources: LoadMoreSource[];
    aiAugmentable: boolean;
  };
}

export function FeedRow({
  title,
  headingLevel = 'h2',
  items,
  isLoading,
  isGenerating,
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  activeItemId,
  onHoverItem,
  onCardClick,
  hideWhenEmpty = true,
  loadMore,
}: Props) {
  const safe = items.filter((it): it is FeedItem => !!it && !!it.item);
  const rail = useScrollRail();

  // Hooks must run unconditionally — the pager is a no-op when sources is empty.
  const sourcesKey = useMemo(
    () => (loadMore ? JSON.stringify(loadMore.sources) : ''),
    [loadMore],
  );
  const pager = useLoadMoreFeed({
    city: loadMore?.city ?? '',
    sources: loadMore?.sources ?? [],
    aiAugmentable: Boolean(loadMore?.aiAugmentable),
  });

  // Reset pagination when the source identity (e.g. category filter) changes,
  // so we don't carry stale extras from a previous filter.
  const lastKeyRef = useRef(sourcesKey);
  useEffect(() => {
    if (lastKeyRef.current !== sourcesKey) {
      lastKeyRef.current = sourcesKey;
      pager.reset();
    }
  }, [sourcesKey, pager]);

  const allItems = loadMore ? [...safe, ...pager.extras] : safe;
  const isEmpty = allItems.length === 0;

  if (isEmpty && !isLoading && !isGenerating && hideWhenEmpty) {
    return null;
  }

  const showLoadMoreCard =
    Boolean(loadMore) && (pager.hasMoreInDB || pager.canGenerate);

  return (
    <Box component="section" sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, minHeight: 44 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, minWidth: 0 }}>
          <Typography
            component={headingLevel}
            sx={{ ...textScale.title, fontSize: '1.25rem', color: 'text.primary', m: 0 }}
          >
            {title}
          </Typography>
          {isGenerating ? (
            <Box
              component="span"
              sx={{
                ...textScale.meta,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                color: 'text.secondary',
                '& .spin': {
                  animation: 'feedrow-spin 1s linear infinite',
                },
                '@keyframes feedrow-spin': {
                  to: { transform: 'rotate(360deg)' },
                },
              }}
            >
              <Box component="span" className="spin" sx={{ display: 'inline-flex' }} aria-hidden>
                <Loader2 size={12} />
              </Box>
              Loading more
            </Box>
          ) : null}
        </Box>
        <RailArrows label={title} canPrev={rail.canPrev} canNext={rail.canNext} onPage={rail.scrollPage} />
      </Box>

      {isLoading || (isEmpty && isGenerating) ? (
        <SkeletonRail count={4} fitted />
      ) : isEmpty ? (
        <EmptyState title={emptyTitle} description={emptyDescription} variant="subtle" />
      ) : (
        <HorizontalScrollRow ariaLabel={title} fitted railRef={rail.ref}>
          {allItems.map((it) => {
            const id = cardId(it);
            return (
              <Box key={id}>
                <FeedCard
                  item={it}
                  variant="grid"
                  showTypeBadge={false}
                  onHover={onHoverItem}
                  isActive={activeItemId === id}
                  onClick={onCardClick ? () => onCardClick(it) : undefined}
                />
              </Box>
            );
          })}
          {showLoadMoreCard ? (
            <Box>
              <LoadMoreCard
                onClick={() => void pager.loadMore()}
                isPending={pager.isPending}
                mode={pager.canGenerate ? 'ai' : 'db'}
              />
            </Box>
          ) : null}
        </HorizontalScrollRow>
      )}
    </Box>
  );
}
