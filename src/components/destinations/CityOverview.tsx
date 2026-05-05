'use client';

import { useId, useState, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { DestinationInfo } from '@/types';

interface Props {
  city: string;
  info?: DestinationInfo | null;
  /** Trip pages may wire this to an "Add to trip?" affordance. */
  onHighlightClick?: (place: string) => void;
}

interface IntroProps {
  city: string;
  info?: DestinationInfo | null;
  open: boolean;
  onToggle: () => void;
  controlsId: string;
  /** When true, the intro card stretches to fill its parent's height and the
   *  "View more" toggle pins to the bottom. Used by the trip detail layout to
   *  keep the description card flush with the weather card next to it. */
  fill?: boolean;
}

interface DetailsProps {
  city: string;
  info?: DestinationInfo | null;
  open: boolean;
  controlsId: string;
  onHighlightClick?: (place: string) => void;
}

const INTRO_CLAMP_LINES = 2;
const INTRO_CLAMP_THRESHOLD = 120;

function computeFlags(info: DestinationInfo) {
  const description = info.description?.trim();
  const hasClimateCard = Boolean(info.climate || info.bestTimeToVisit);
  const hasPractical = Boolean(
    info.climate || info.currency || info.language || info.timezone || info.bestTimeToVisit,
  );
  const showGrid = hasClimateCard || hasPractical;
  const hasAttractions = Boolean(info.attractions && info.attractions.length > 0);
  const hasFacts = Boolean(info.interesting_facts && info.interesting_facts.length > 0);
  const hasExtraSections =
    Boolean(info.history) ||
    Boolean(info.culture) ||
    showGrid ||
    hasAttractions ||
    hasFacts;
  const introNeedsClamp =
    Boolean(description) && description!.length > INTRO_CLAMP_THRESHOLD;
  return {
    description,
    hasClimateCard,
    hasPractical,
    showGrid,
    hasAttractions,
    hasFacts,
    hasExtraSections,
    introNeedsClamp,
  };
}

export function CityOverviewIntro({
  city,
  info,
  open,
  onToggle,
  controlsId,
  fill,
}: IntroProps) {
  if (!info) return null;
  const flags = computeFlags(info);
  const showToggle = flags.hasExtraSections || flags.introNeedsClamp;
  if (!flags.description && !flags.hasExtraSections) return null;

  return (
    <SectionCard fill={fill}>
      <Box sx={fill ? { flex: 1, minHeight: 0 } : undefined}>
        <ClampedText
          body={flags.description ?? `Learn more about ${city}.`}
          clampLines={INTRO_CLAMP_LINES}
          expanded={open || !flags.introNeedsClamp}
        />
      </Box>
      {showToggle ? (
        <Box sx={{ mt: fill ? 'auto' : 0, pt: 1.25 }}>
          <ToggleButton
            open={open}
            onClick={onToggle}
            controls={controlsId}
            label={open ? 'View less' : `View more about ${city}`}
          />
        </Box>
      ) : null}
    </SectionCard>
  );
}

export function CityOverviewDetails({
  city,
  info,
  open,
  controlsId,
  onHighlightClick,
}: DetailsProps) {
  if (!info) return null;
  const flags = computeFlags(info);
  if (!flags.hasExtraSections) return null;

  return (
    <Collapse in={open} timeout="auto" unmountOnExit>
      <Stack id={controlsId} spacing={2.5}>
        {info.history ? (
          <SectionCard>
            <SectionTitle>History</SectionTitle>
            <BodyText>{info.history.trim()}</BodyText>
          </SectionCard>
        ) : null}

        {info.culture ? (
          <SectionCard>
            <SectionTitle>Cultural pulse</SectionTitle>
            <BodyText>{info.culture.trim()}</BodyText>
          </SectionCard>
        ) : null}

        {flags.showGrid ? (
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            }}
          >
            {flags.hasClimateCard ? (
              <SectionCard>
                <SectionTitle>Climate &amp; best time</SectionTitle>
                {info.climate ? <BodyText>{info.climate.trim()}</BodyText> : null}
                {info.bestTimeToVisit ? (
                  <Typography
                    sx={{
                      mt: info.climate ? 1.25 : 0,
                      fontSize: 14,
                      lineHeight: 1.65,
                      color: 'text.secondary',
                    }}
                  >
                    <Box
                      component="span"
                      sx={{ fontWeight: 600, color: 'text.primary' }}
                    >
                      Best time to visit:{' '}
                    </Box>
                    {info.bestTimeToVisit}
                  </Typography>
                ) : null}
              </SectionCard>
            ) : null}

            {flags.hasPractical ? (
              <SectionCard>
                <SectionLabel>Practical info</SectionLabel>
                <Stack spacing={1.25} sx={{ mt: 1.25 }}>
                  {info.currency ? (
                    <PracticalRow label="Currency" value={info.currency} />
                  ) : null}
                  {info.language ? (
                    <PracticalRow label="Language" value={info.language} />
                  ) : null}
                  {info.timezone ? (
                    <PracticalRow label="Timezone" value={info.timezone} />
                  ) : null}
                  {!flags.hasClimateCard && info.climate ? (
                    <PracticalRow label="Climate" value={info.climate} />
                  ) : null}
                  {!flags.hasClimateCard && info.bestTimeToVisit ? (
                    <PracticalRow label="Best time" value={info.bestTimeToVisit} />
                  ) : null}
                </Stack>
              </SectionCard>
            ) : null}
          </Box>
        ) : null}

        {flags.hasAttractions ? (
          <SectionCard>
            <SectionTitle>Must-see in {city}</SectionTitle>
            <BulletList items={info.attractions!} onItemClick={onHighlightClick} />
          </SectionCard>
        ) : null}

        {flags.hasFacts ? (
          <SectionCard>
            <SectionTitle>Interesting facts</SectionTitle>
            <BulletList items={info.interesting_facts!} />
          </SectionCard>
        ) : null}
      </Stack>
    </Collapse>
  );
}

/** Long-form destination content rendered below DestinationHero on Explore +
 *  Trip pages. The intro paragraph is the always-visible head; everything else
 *  (History, Cultural pulse, Climate, Practical info, Must-see, Interesting
 *  facts) lives inside a single Collapse controlled by one "View more" toggle. */
export function CityOverview({ city, info, onHighlightClick }: Props) {
  const [open, setOpen] = useState(false);
  const collapseId = useId();

  if (!info) return null;

  return (
    <Stack spacing={2.5} sx={{ mt: 2.5 }}>
      <CityOverviewIntro
        city={city}
        info={info}
        open={open}
        onToggle={() => setOpen((v) => !v)}
        controlsId={collapseId}
      />
      <CityOverviewDetails
        city={city}
        info={info}
        open={open}
        controlsId={collapseId}
        onHighlightClick={onHighlightClick}
      />
    </Stack>
  );
}

function SectionCard({ children, fill }: { children: ReactNode; fill?: boolean }) {
  return (
    <Card elevation="raised" style={fill ? { height: '100%' } : undefined}>
      <Box
        sx={{
          p: { xs: 2.5, sm: 3 },
          ...(fill
            ? { display: 'flex', flexDirection: 'column', height: '100%' }
            : null),
        }}
      >
        {children}
      </Box>
    </Card>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Typography
      component="h3"
      sx={{
        m: 0,
        mb: 1,
        fontSize: 16,
        fontWeight: 600,
        lineHeight: 1.3,
        color: 'text.primary',
      }}
    >
      {children}
    </Typography>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Typography
      component="h3"
      sx={{
        m: 0,
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color: 'text.secondary',
      }}
    >
      {children}
    </Typography>
  );
}

function BodyText({ children }: { children: ReactNode }) {
  return (
    <Typography
      sx={{
        whiteSpace: 'pre-line',
        fontSize: 15,
        lineHeight: 1.6,
        color: 'text.secondary',
      }}
    >
      {children}
    </Typography>
  );
}

function ClampedText({
  body,
  clampLines,
  expanded,
}: {
  body: string;
  clampLines: number;
  expanded: boolean;
}) {
  if (expanded) {
    return <BodyText>{body}</BodyText>;
  }
  return (
    <Typography
      sx={{
        fontSize: 15,
        lineHeight: 1.6,
        color: 'text.secondary',
        display: '-webkit-box',
        WebkitLineClamp: clampLines,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}
    >
      {body}
    </Typography>
  );
}

function BulletList({
  items,
  onItemClick,
}: {
  items: string[];
  onItemClick?: (item: string) => void;
}) {
  return (
    <Stack
      component="ul"
      spacing={0.75}
      sx={{ m: 0, p: 0, listStyle: 'none' }}
    >
      {items.map((item, i) => (
        <ListRow key={`${i}-${item}`} item={item} onItemClick={onItemClick} />
      ))}
    </Stack>
  );
}

function ListRow({
  item,
  onItemClick,
}: {
  item: string;
  onItemClick?: (item: string) => void;
}) {
  return (
    <Box
      component="li"
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1,
        fontSize: 14,
        lineHeight: 1.55,
        color: 'text.secondary',
      }}
    >
      <Box
        aria-hidden
        component="span"
        sx={{
          mt: '7px',
          width: 5,
          height: 5,
          borderRadius: '50%',
          bgcolor: 'primary.main',
          flexShrink: 0,
        }}
      />
      {onItemClick ? (
        <Box
          component="button"
          type="button"
          onClick={() => onItemClick(item)}
          sx={{
            background: 'transparent',
            border: 0,
            p: 0,
            textAlign: 'left',
            fontSize: 'inherit',
            fontFamily: 'inherit',
            lineHeight: 'inherit',
            color: 'text.secondary',
            cursor: 'pointer',
            '&:hover': { color: 'primary.main', textDecoration: 'underline' },
          }}
        >
          {item}
        </Box>
      ) : (
        <Box component="span">{item}</Box>
      )}
    </Box>
  );
}

function ToggleButton({
  open,
  onClick,
  controls,
  label,
}: {
  open: boolean;
  onClick: () => void;
  controls: string;
  label: string;
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-controls={controls}
      sx={{
        background: 'transparent',
        border: 0,
        p: 0,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        fontWeight: 500,
        fontSize: 13,
        fontFamily: 'inherit',
        color: 'primary.main',
        cursor: 'pointer',
        '&:hover': { textDecoration: 'underline', textUnderlineOffset: '3px' },
      }}
    >
      {label}
      {open ? (
        <ChevronUp size={14} aria-hidden />
      ) : (
        <ChevronDown size={14} aria-hidden />
      )}
    </Box>
  );
}

function PracticalRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', gap: 2, fontSize: 13 }}>
      <Box sx={{ width: 110, flexShrink: 0, color: 'text.secondary' }}>{label}</Box>
      <Box sx={{ color: 'text.primary' }}>{value}</Box>
    </Box>
  );
}
