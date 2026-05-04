import {
  LayoutGrid,
  Sparkles,
  Landmark,
  Camera,
  Wine,
  Utensils,
  Theater,
  ShoppingBag,
  Trees,
  Music,
  HeartPulse,
  Mountain,
  Tag,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  all: LayoutGrid,
  activities: Sparkles,
  landmarks: Landmark,
  attractions: Camera,
  nightlife: Wine,
  food: Utensils,
  culture: Theater,
  shopping: ShoppingBag,
  nature: Trees,
  music: Music,
  wellness: HeartPulse,
  adventure: Mountain,
};

export function getCategoryIcon(category: string | null | undefined): LucideIcon {
  if (!category) return ICONS.all;
  return ICONS[category.toLowerCase()] ?? Tag;
}
