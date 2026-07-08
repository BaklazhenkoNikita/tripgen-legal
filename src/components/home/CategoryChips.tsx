'use client';

import { X, type LucideIcon } from 'lucide-react';
import { useCategoryCounts } from '@/hooks/useCategoryCounts';
import { Skeleton } from '@/components/ui/Skeleton';
import { getCategoryIcon } from '@/lib/categoryIcons';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { alpha } from '@mui/material/styles';

interface Props {
  city: string | null | undefined;
  active: string | null;
  onChange: (category: string | null) => void;
  /** Lowercase category keys to omit from the rendered toolbar. */
  hideCategories?: readonly string[];
}

export function CategoryChips({ city, active, onChange, hideCategories }: Props) {
  const { data, isLoading } = useCategoryCounts(city);
  const hidden = hideCategories?.length
    ? new Set(hideCategories.map((c) => c.toLowerCase()))
    : null;

  if (isLoading && !data) {
    return (
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          flexWrap: 'nowrap',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          pb: 0.5,
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
        }}
        aria-label="Loading categories"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} height={44} width={96} style={{ flexShrink: 0, borderRadius: 999 }} />
        ))}
      </Box>
    );
  }

  const counts = data?.counts ?? {};
  const entries = Object.entries(counts)
    .filter(([cat]) => !hidden?.has(cat.toLowerCase()))
    .sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return null;

  return (
    <Box
      role="toolbar"
      aria-label="Filter by category"
      sx={{
        mx: { xs: -2, sm: -3 },
        px: { xs: 2, sm: 3 },
        pb: 0.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flexWrap: 'nowrap',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
        // Soft fade on the right edge hints at scrollable overflow.
        // Invisible when content fits because there's nothing under the gradient.
        maskImage:
          'linear-gradient(to right, black calc(100% - 24px), transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to right, black calc(100% - 24px), transparent 100%)',
      }}
    >
      <Chip
        label="All"
        icon={getCategoryIcon('all')}
        count={data?.total}
        selected={active == null}
        onClick={() => onChange(null)}
      />
      {entries.map(([cat, count]) => (
        <Chip
          key={cat}
          label={cat}
          icon={getCategoryIcon(cat)}
          count={count}
          selected={active === cat}
          onClick={() => onChange(active === cat ? null : cat)}
        />
      ))}
      {active ? (
        <ButtonBase
          onClick={() => onChange(null)}
          sx={{
            ml: 0.5,
            display: 'inline-flex',
            flexShrink: 0,
            alignItems: 'center',
            gap: 0.5,
            minHeight: 44,
            borderRadius: 999,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            px: 1.5,
            fontSize: 12,
            fontWeight: 500,
            color: 'text.secondary',
            '&:hover': { color: 'text.primary' },
          }}
        >
          <X size={12} aria-hidden />
          Clear
        </ButtonBase>
      ) : null}
    </Box>
  );
}

function Chip({
  label,
  icon: Icon,
  count,
  selected,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  count?: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-pressed={selected}
      sx={{
        display: 'inline-flex',
        flexShrink: 0,
        alignItems: 'center',
        gap: 0.75,
        minHeight: 44,
        borderRadius: 999,
        px: 1.75,
        fontSize: 13,
        fontWeight: 500,
        transition: 'background-color 150ms, color 150ms, border-color 150ms',
        ...(selected
          ? {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              boxShadow: (t) =>
                `0 1px 2px ${alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.5 : 0.25)}`,
              '&:hover': { bgcolor: 'primary.dark' },
            }
          : {
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'text.disabled',
                color: 'text.primary',
              },
            }),
      }}
    >
      <Icon size={14} aria-hidden />
      <Box component="span" sx={{ textTransform: 'capitalize' }}>
        {label}
      </Box>
      {typeof count === 'number' ? (
        <Box
          component="span"
          sx={{
            borderRadius: 999,
            px: 0.75,
            fontSize: 10,
            fontVariantNumeric: 'tabular-nums',
            ...(selected
              ? { bgcolor: (t) => alpha(t.palette.common.white, 0.25), color: 'primary.contrastText' }
              : {
                  bgcolor: (t) => alpha(t.palette.text.primary, 0.04),
                  color: 'text.disabled',
                }),
          }}
        >
          {count}
        </Box>
      ) : null}
    </ButtonBase>
  );
}
