import type { Metadata } from 'next';
import { ChevronDown } from 'lucide-react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { textScale } from '@/theme/standards';
import { Section } from '@/components/layout/Section';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'FAQ — Frequently Asked Questions',
  description:
    'Find answers to common questions about Periplo, our AI travel planner, trip generation, pricing, and more.',
};

const faqs = [
  {
    q: 'What is Periplo?',
    a: 'Periplo is an AI-powered travel planner that creates personalized day-by-day itineraries based on your destination, dates, budget, and interests. Our AI considers real activity data, weather, opening hours, and travel logistics to build practical plans.',
  },
  {
    q: 'Is Periplo free to use?',
    a: 'Yes, Periplo offers free trip generation. You can create itineraries, modify them, and share them at no cost. We may introduce premium features in the future, but core trip planning will remain free.',
  },
  {
    q: 'How does the AI generate itineraries?',
    a: 'Our AI uses a combination of curated activity databases, real-time event data, and large language models to plan your trip. It considers geographic proximity between activities, opening hours, typical visit durations, and your stated preferences to create a realistic day-by-day schedule.',
  },
  {
    q: 'Can I edit the generated itinerary?',
    a: 'Absolutely. You can add, remove, move, and reorder activities. You can add or delete days, drag activities between days, and ask the AI to suggest replacements. All changes are saved automatically.',
  },
  {
    q: 'Can I share my trip with others?',
    a: 'Yes. You can generate a share link and invite collaborators as editors or viewers. Editors can modify the itinerary in real time, while viewers can see it read-only.',
  },
  {
    q: 'What destinations are supported?',
    a: 'Periplo supports hundreds of destinations worldwide. Our AI can generate itineraries for any city or region. Popular destinations have richer activity databases with curated recommendations.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'You can try Periplo without an account as a guest. However, creating a free account lets you save trips, access your history, collaborate with others, and sync across devices.',
  },
  {
    q: 'Can I export my itinerary?',
    a: 'Yes. You can export your trip as a PDF for offline access or as an ICS calendar file to add events to Google Calendar, Apple Calendar, or Outlook.',
  },
  {
    q: 'How is Periplo different from other travel planners?',
    a: 'Periplo uses AI to create complete, actionable itineraries — not just lists of things to do. Each plan includes time-of-day scheduling, geographic routing, restaurant recommendations, and real activity data. You can also chat with our AI to refine your plans in natural language.',
  },
];

export default function FAQPage() {
  return (
    <Section width="prose" component="div">
      <Box component="header">
        <Badge tone="accent" size="md">Help</Badge>
        <Typography variant="h1" component="h1" sx={{ mt: 2, color: 'text.primary' }}>
          Frequently asked questions
        </Typography>
        <Typography sx={{ mt: 2, color: 'text.secondary' }}>
          Everything you need to know about Periplo.
        </Typography>
      </Box>

      <Box sx={{ mt: 6, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {faqs.map((faq, i) => (
          <Box
            component="details"
            key={i}
            className="group"
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              p: 2.5,
              boxShadow: 'var(--tg-shadow-card)',
              transition: 'all 0.2s',
              '&[open]': {
                bgcolor: 'action.hover',
                boxShadow: 'var(--tg-shadow-card-hover)',
              },
              '&:hover:not([open])': {
                borderColor: 'text.disabled',
              },
            }}
          >
            <Box
              component="summary"
              sx={{
                display: 'flex',
                cursor: 'pointer',
                listStyle: 'none',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                ...textScale.label,
                fontSize: '0.95rem',
                color: 'text.primary',
                '&::-webkit-details-marker': { display: 'none' },
              }}
            >
              <span>{faq.q}</span>
              <Box
                aria-hidden
                sx={{
                  display: 'flex',
                  flexShrink: 0,
                  color: 'text.disabled',
                  transition: 'transform 200ms',
                  '.group[open] &': { transform: 'rotate(180deg)' },
                }}
              >
                <ChevronDown size={16} />
              </Box>
            </Box>
            <Typography variant="body2" sx={{ mt: 1.5, color: 'text.secondary' }}>
              {faq.a}
            </Typography>
          </Box>
        ))}
      </Box>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.a,
              },
            })),
          }),
        }}
      />
    </Section>
  );
}
