import { createLucideIcon } from 'lucide-react';

/**
 * "Ask Periplo" — a chat bubble with an AI sparkle inside. Built with
 * lucide's factory so it's a drop-in `LucideIcon` (same size / stroke /
 * className props) next to the stock nav icons. Bubble path = lucide
 * `message-circle`; the sparkle is lucide `sparkle` scaled to half size
 * around the centre and filled so it stays legible at 16px.
 */
export const AskPeriploIcon = createLucideIcon('ask-periplo', [
  [
    'path',
    {
      d: 'M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719',
      key: 'bubble',
    },
  ],
  [
    'path',
    {
      d: 'M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z',
      transform: 'translate(12 12) scale(.5) translate(-12 -12)',
      fill: 'currentColor',
      stroke: 'none',
      key: 'sparkle',
    },
  ],
]);
