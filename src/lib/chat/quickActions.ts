/**
 * Quick-action chip definitions for the empty-chat surface.
 * Ported from `trip_gen_mobile/mobile/src/hooks/useSmartChat.ts` so web and
 * mobile present the same starter prompts.
 */

import type { LucideIcon } from 'lucide-react';
import { displayPlaceName } from '@/lib/cities/normalizeCity';
import {
  Calendar,
  Clock,
  Compass,
  Lightbulb,
  List,
  MapPin,
  Moon,
  Navigation,
  Plane,
  PlusCircle,
  ScrollText,
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
  { label: 'Optimize route', icon: List, prompt: 'Optimize my route to cut travel time between stops' },
  { label: 'Weather', icon: Sun, prompt: "What's the weather like at my destination?" },
  { label: 'Go to trip', icon: Navigation, prompt: 'Navigate to my trip details' },
];

export function getGeneralQuickActions(city: string): QuickAction[] {
  const name = displayPlaceName(city) || 'your city';
  return [
    { label: "What's On?", icon: Calendar, prompt: `What events, exhibitions, and things are happening in ${name} today?` },
    { label: 'Plan a trip', icon: Plane, prompt: `I want to plan a trip to ${name}` },
    { label: 'What to do tonight', icon: Moon, prompt: `What are the best things to do tonight in ${name}?` },
    { label: 'Find hidden gems', icon: Compass, prompt: `Show me hidden gems and local favorites in ${name}` },
    { label: 'Food & restaurants', icon: UtensilsCrossed, prompt: `What are the must-try restaurants and local dishes in ${name}?` },
  ];
}

/** One-tap questions about a single place ("Ask Periplo" on a place). */
export function getPlaceQuickActions(placeName: string): QuickAction[] {
  const name = placeName.trim() || 'this place';
  return [
    { label: "What's the story?", icon: ScrollText, prompt: `What's the story behind ${name}, and what makes it special?` },
    { label: 'Hours & tickets', icon: Clock, prompt: `What are the opening hours and ticket prices for ${name}?` },
    { label: 'Best time to go', icon: Sun, prompt: `When's the best time to visit ${name} to avoid crowds?` },
    { label: 'Tips for visiting', icon: Lightbulb, prompt: `Any insider tips for visiting ${name}?` },
    { label: "What's nearby?", icon: MapPin, prompt: `What else is worth doing near ${name}?` },
  ];
}
