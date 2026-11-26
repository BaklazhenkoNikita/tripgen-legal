'use client';

import { ArrowRight } from 'lucide-react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, type Theme } from '@mui/material/styles';
import { Skeleton } from '@/components/ui/Skeleton';
import { AskPeriploIcon } from '@/components/chat/AskPeriploIcon';
import type { ActivityDetails } from '@/types/chat';
import { iconForSection } from './sectionIcons';
import {
  Callout,
  CheckList,
  InlineEmphasis,
  PROSE_MAX,
  SectionHeading,
  dedupeStrings,
  proseFontSize,
  type PlaceBlockLayout,
} from './placeBlocks';

interface Props {
  context: ActivityDetails | null | undefined;
  isLoading: boolean;
  layout: PlaceBlockLayout;
  placeName: string;
  /** The card's own description — the summary is skipped when it repeats it. */
  description?: string | null;
  /** Feed-level tips (`detail.insiderTips`) merged into the tips callout. */
  extraTips?: readonly string[] | null;
  /** Lines already shown above (feed highlights / "Did you know"), so the
   *  context highlights don't repeat them. */
  shownElsewhere?: readonly string[];
  /** When set, renders an "Ask Periplo about this place" link under the card. */
  onAsk?: () => void;
}

/**
 * "Deeper context" — the editorial card under a place's description:
 * summary lead → icon-led sections → highlights check-list → amber insider
 * tips. Shared by the side-panel drawer and the full place page.
 */
export function DeeperContext({
  context,
  isLoading,
  layout,
  placeName,
  description,
  extraTips,
  shownElsewhere = [],
  onAsk,
}: Props) {
  const sections = (context?.sections ?? []).filter(
    (s) => s && typeof s.content === 'string' && s.content.trim(),
  );
  const summary = context?.summary?.trim() ?? '';
  const showSummary =
    summary.length > 0 &&
    summary.toLowerCase() !== (description ?? '').trim().toLowerCase();
  const highlights = dedupeStrings(context?.highlights ?? [], shownElsewhere);
  const tips = dedupeStrings([...(context?.tips ?? []), ...(extraTips ?? [])]);
  const hasContent =
    showSummary || sections.length > 0 || highlights.length > 0 || tips.length > 0;
  const bodySize = proseFontSize(layout);

  return (
    <Box
      component="section"
      aria-label="Deeper context"
      sx={{ mt: 3, borderTop: '1px solid', borderColor: 'divider', pt: 3 }}
    >
      <SectionHeading variant="title">Deeper context</SectionHeading>

      {isLoading ? (
        <Stack spacing={1} sx={{ mt: 2 }}>
          <Skeleton variant="line" height={12} width="33%" />
          <Skeleton variant="line" height={12} width="100%" />
          <Skeleton variant="line" height={12} width="83%" />
        </Stack>
      ) : !hasContent ? (
        <Typography sx={{ mt: 1.5, fontSize: '0.875rem', color: 'text.secondary' }}>
          No additional context yet.
        </Typography>
      ) : (
        <Box
          sx={{
            mt: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            p: { xs: 2, sm: 3 },
            minWidth: 0,
            // On the wide page the prose is capped at ~68ch; capping the card
            // too keeps it from trailing a wide empty band on the right.
            maxWidth: layout === 'page' ? 880 : undefined,
          }}
        >
          {showSummary ? (
            <Typography
              sx={{
                mb: sections.length > 0 ? 3 : 0,
                pl: 2,
                borderLeft: '3px solid',
                borderColor: 'primary.main',
                fontSize: layout === 'page' ? '1.125rem' : '1.0625rem',
                fontWeight: 500,
                lineHeight: 1.55,
                color: 'text.primary',
                maxWidth: PROSE_MAX,
                overflowWrap: 'anywhere',
              }}
            >
              <InlineEmphasis text={summary} />
            </Typography>
          ) : null}

          {sections.length > 0 ? (
            <Stack spacing={3}>
              {sections.map((section, i) => {
                const Icon = iconForSection(section);
                return (
                  <Box
                    key={`${section.title}-${i}`}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '32px minmax(0, 1fr)',
                      columnGap: 2,
                      alignItems: 'start',
                    }}
                  >
                    <Box
                      aria-hidden
                      sx={(t: Theme) => ({
                        width: 32,
                        height: 32,
                        borderRadius: 999,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(t.palette.primary.main, 0.12),
                        color: t.palette.mode === 'dark' ? 'primary.light' : 'primary.dark',
                      })}
                    >
                      <Icon size={16} />
                    </Box>
                    <Box sx={{ minWidth: 0, pt: '7px' }}>
                      {section.title ? <SectionHeading>{section.title}</SectionHeading> : null}
                      <Typography
                        sx={{
                          mt: 0.75,
                          whiteSpace: 'pre-line',
                          fontSize: bodySize,
                          lineHeight: 1.7,
                          color: 'text.primary',
                          maxWidth: PROSE_MAX,
                          overflowWrap: 'anywhere',
                        }}
                      >
                        <InlineEmphasis text={section.content} />
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          ) : null}

          {highlights.length > 0 ? (
            <CheckList
              title="Highlights"
              items={highlights}
              layout={layout}
              sx={
                showSummary || sections.length > 0
                  ? { mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }
                  : undefined
              }
            />
          ) : null}

          {tips.length > 0 ? (
            <Callout
              tone="tip"
              title="Insider tips"
              items={tips}
              sx={{ mt: showSummary || sections.length > 0 || highlights.length > 0 ? 3 : 0 }}
            />
          ) : null}
        </Box>
      )}

      {onAsk ? (
        <Box
          component="button"
          type="button"
          onClick={onAsk}
          sx={(t: Theme) => ({
            mt: 1.5,
            minHeight: 44,
            px: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            border: 0,
            bgcolor: 'transparent',
            cursor: 'pointer',
            font: 'inherit',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'primary.main',
            '&:hover': { color: t.palette.primary.dark, '& .ask-arrow': { transform: 'translateX(2px)' } },
            '&:focus-visible': {
              outline: `2px solid ${t.palette.primary.main}`,
              outlineOffset: 2,
              borderRadius: 1,
            },
          })}
        >
          <AskPeriploIcon size={18} aria-hidden />
          Ask Periplo about {placeName}
          <Box
            component="span"
            className="ask-arrow"
            sx={{ display: 'inline-flex', transition: 'transform 150ms' }}
          >
            <ArrowRight size={16} aria-hidden />
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}
