import {
  Bike,
  BookOpen,
  Building2,
  Calendar,
  Camera,
  Clock,
  Coffee,
  Compass,
  Drama,
  Eye,
  Flame,
  Flower2,
  Footprints,
  Gem,
  Globe,
  Handshake,
  Heart,
  Info,
  Landmark,
  Leaf,
  Library,
  Lightbulb,
  Map as MapIcon,
  Mountain,
  Music,
  Navigation,
  Palette,
  ScrollText,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Sun,
  Ticket,
  TreePine,
  Users,
  UtensilsCrossed,
  Wallet,
  Wine,
  type LucideIcon,
} from 'lucide-react';

/**
 * Icon for a "Deeper context" section. The backend's context generator
 * suggests an Ionicons name per section (mobile renders it natively); the web
 * maps the common ones to lucide and falls back to keywords in the title, so
 * restaurants, temples, trails and bars each get a fitting glyph.
 */

const IONICON_MAP: Record<string, LucideIcon> = {
  book: BookOpen,
  library: Library,
  earth: Globe,
  globe: Globe,
  walk: Footprints,
  footsteps: Footprints,
  people: Users,
  person: Users,
  sunny: Sun,
  'partly-sunny': Sun,
  'musical-notes': Music,
  'musical-note': Music,
  musical: Music,
  mic: Music,
  restaurant: UtensilsCrossed,
  'fast-food': UtensilsCrossed,
  pizza: UtensilsCrossed,
  nutrition: UtensilsCrossed,
  cafe: Coffee,
  wine: Wine,
  beer: Wine,
  'trail-sign': Compass,
  compass: Compass,
  map: MapIcon,
  navigate: Navigation,
  camera: Camera,
  image: Camera,
  images: Camera,
  time: Clock,
  timer: Clock,
  calendar: Calendar,
  'information-circle': Info,
  information: Info,
  star: Star,
  sparkles: Sparkles,
  leaf: Leaf,
  flower: Flower2,
  rose: Flower2,
  business: Building2,
  home: Building2,
  build: Building2,
  construct: Building2,
  'color-palette': Palette,
  brush: Palette,
  ticket: Ticket,
  shirt: Shirt,
  heart: Heart,
  'hand-left': Handshake,
  'hand-right': Handshake,
  eye: Eye,
  bulb: Lightbulb,
  'shield-checkmark': ShieldCheck,
  shield: ShieldCheck,
  bicycle: Bike,
  storefront: Store,
  bag: ShoppingBag,
  cart: ShoppingBag,
  cash: Wallet,
  wallet: Wallet,
  pricetag: Wallet,
  diamond: Gem,
  flame: Flame,
  bonfire: Flame,
  film: Drama,
  happy: Drama,
};

const KEYWORD_ICONS: readonly [RegExp, LucideIcon][] = [
  [/histor|story|origin|happened|heritage|legacy|past\b/, ScrollText],
  [/architect|design|building|structure|built|facade/, Landmark],
  [/spiritual|sacred|religio|faith|worship|deit|divine|shrine/, Sparkles],
  [/ritual|custom|tradition|ceremon|festival|celebrat/, Flame],
  [/etiquette|manner|respect|dress|rules|getting in/, Handshake],
  [/wine|cocktail|drink|bar\b|beer|sake/, Wine],
  [/coffee|caf[eé]|tea\b/, Coffee],
  [/food|cuisine|dish|menu|eat|taste|order|snack|street food/, UtensilsCrossed],
  [/trail|hike|route option|walk/, Footprints],
  [/landscape|wildlife|nature|garden|forest|flora|fauna/, TreePine],
  [/mountain|peak|summit|difficulty|fitness/, Mountain],
  [/view|scenic|photo|panoram|sunset|sunrise/, Camera],
  [/collection|art\b|artwork|exhibit|works|gallery|museum/, Palette],
  [/music|perform|show|repertoire|program|stage|theat/, Music],
  [/vibe|atmosphere|ambien|crowd/, Drama],
  [/season|best time|timing|when to|hours|nights|schedule/, Clock],
  [/getting there|transport|access|location|how to get/, Navigation],
  [/tip|insider|strategy|advice|hack/, Lightbulb],
  [/safety|bring|pack|prepare/, ShieldCheck],
  [/shop|market|stall|souvenir/, Store],
  [/price|cost|budget|ticket|reservation|booking/, Ticket],
  [/culture|cultural|local|perspective|people|community/, Users],
  [/expect|experience|visit/, Eye],
  [/venue|about|overview/, Info],
  [/significan|highlight|must-see/, Star],
];

export function iconForSection(section: {
  title?: string | null;
  icon?: string | null;
}): LucideIcon {
  const key = (section.icon ?? '')
    .trim()
    .toLowerCase()
    .replace(/^(ios|md|logo)-/, '')
    .replace(/-(outline|sharp)$/, '');
  if (key && IONICON_MAP[key]) return IONICON_MAP[key];
  const title = (section.title ?? '').toLowerCase();
  for (const [pattern, icon] of KEYWORD_ICONS) {
    if (pattern.test(title)) return icon;
  }
  return Sparkles;
}
