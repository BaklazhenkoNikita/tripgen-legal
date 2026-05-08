'use client';

import { useEffect, useRef, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useActivitiesFeed } from '@/hooks/useActivitiesFeed';
import type { FeedItem } from '@/hooks/useHomeFeed';
import { FeedRow } from '@/components/home/FeedRow';
import { SkeletonRail } from '@/components/ui/Skeleton';

interface Props {
  city: string;
  category: string;
  /** Forwarded from the parent home-feed `generating` flag. When true and
   *  the category row hasn't loaded any items yet, render the skeleton
   *  instead of collapsing — keeps the page coherent during cold-city
   *  generation. */
  isGenerating?: boolean;
  activeItemId: string | null;
  onHoverItem: (id: string | null) => void;
  onCardClick?: (item: FeedItem) => void;
}

/** Lazy per-category row rendered below ViatorRow on the destination view.
 *  Defers the activities fetch until the row is within 400px of the viewport
 *  so opening the page doesn't fan out one request per chip up-front. */
export function CategorySection({
  city,
  category,
  isGenerating,
  activeItemId,
  onHoverItem,
  onCardClick,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible || !ref.current) return;
    const node = ref.current;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: '400px 0px' },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [visible]);

  const { data, isLoading } = useActivitiesFeed(visible ? city : null, {
    category,
    limit: 12,
  });

  const items = data?.activities ?? [];
  const title = category.charAt(0).toUpperCase() + category.slice(1);

  if (visible && !isLoading && !isGenerating && items.length === 0) {
    return null;
  }

  return (
    <div ref={ref}>
      {visible ? (
        <FeedRow
          title={title}
          items={items}
          isLoading={isLoading}
          isGenerating={isGenerating}
          activeItemId={activeItemId}
          onHoverItem={onHoverItem}
          onCardClick={onCardClick}
          emptyTitle={`No ${title.toLowerCase()} yet`}
          loadMore={{
            city,
            sources: [{ contentType: 'activity', category }],
            aiAugmentable: true,
          }}
        />
      ) : (
        <Stack component="section" spacing={1.5} aria-hidden>
          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 600, lineHeight: 1.2, color: 'text.primary' }}
          >
            {title}
          </Typography>
          <SkeletonRail count={3} />
        </Stack>
      )}
    </div>
  );
}
