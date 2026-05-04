import { clsx, type ClassValue } from 'clsx';

/** Lightweight class joiner. Tailwind has been removed; this is a thin
 *  clsx wrapper kept so existing className= callers compile while we
 *  progressively migrate them onto MUI's `sx` prop. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
