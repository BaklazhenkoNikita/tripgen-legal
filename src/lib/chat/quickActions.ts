/**
 * Quick-action chip definitions for the empty-chat surface.
 * Ported from `trip_gen_mobile/mobile/src/hooks/useSmartChat.ts` so web and
 * mobile present the same starter prompts.
 */

import type { LucideIcon } from 'lucide-react';
import {
  Calendar,
  Compass,
  List,
  Moon,
  Navigation,
  Plane,
  PlusCircle,
  Sun,
  UtensilsCrossed,
} from 'lucide-react';

export interface QuickAction {
  label: string;
  icon: LucideIcon;
  prompt: string;
}

export const TRIP_QUICK_ACTIONS: QuickAction[] = [
  { label: 'Show itinerary', icon: List, prompt: 'Show me a summary of my current trip' },
  { label: 'Add activities', icon: PlusCircle, prompt: 'Add more activities to my trip' },
  { label: 'Add day', icon: Calendar, prompt: 'Add a new day to my trip' },
  { label: 'Reorganize', icon: List, prompt: 'Help me reorganize activities between days' },
  { label: 'Weather', icon: Sun, prompt: "What's the weather like at my destination?" },
  { label: 'Go to trip', icon: Navigation, prompt: 'Navigate to my trip details' },
];

export function getGeneralQuickActions(city: string): QuickAction[] {
  const name = formatPlaceName(city) || 'your city';
  return [
    { label: "What's On?", icon: Calendar, prompt: `What events, exhibitions, and things are happening in ${name} today?` },
    { label: 'Plan a trip', icon: Plane, prompt: `I want to plan a trip to ${name}` },
    { label: 'What to do tonight', icon: Moon, prompt: `What are the best things to do tonight in ${name}?` },
    { label: 'Find hidden gems', icon: Compass, prompt: `Show me hidden gems and local favorites in ${name}` },
    { label: 'Food & restaurants', icon: UtensilsCrossed, prompt: `What are the must-try restaurants and local dishes in ${name}?` },
  ];
}

function formatPlaceName(raw: string | null | undefined): string {
  if (!raw) return '';
  return raw
    .trim()
    .toLowerCase()
    .split(/(\s+|-)/)
    .map((part) => (part.length > 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join('');
}
