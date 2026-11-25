/**
 * Pure text helpers for rendering streamed assistant markdown.
 */

/**
 * Hide a trailing, not-yet-closed markdown construct while a turn streams so
 * the user never sees raw `**bol` / `[Lin` / `[[activity:…` flicker before
 * the closing token arrives. Only the *tail* is trimmed; finished text is
 * untouched, and callers must pass the full text once the turn is done.
 */
export function closeStreamingTail(text: string): string {
  let out = text;

  // Entity link `[[kind:id|Name]]` still open.
  const openEntity = out.lastIndexOf('[[');
  if (openEntity !== -1 && out.indexOf(']]', openEntity) === -1) {
    out = out.slice(0, openEntity);
  }

  // Fenced code blocks render fine unclosed; ignore everything inside them
  // when balancing inline markers below.
  const fenceCount = (out.match(/```/g) ?? []).length;
  if (fenceCount % 2 === 1) return out;

  // Markdown link `[text` or `[text](http…` still open. Scan backwards for
  // the last `[` that isn't part of a `[[` pair.
  for (let i = out.length - 1; i >= 0; i--) {
    if (out[i] !== '[') continue;
    if (out[i - 1] === '[' || out[i + 1] === '[') break; // entity link — handled above
    const rest = out.slice(i);
    const close = rest.indexOf(']');
    if (close === -1) {
      // Only hide if it plausibly starts a link (short, same line).
      if (!rest.includes('\n') && rest.length < 120) out = out.slice(0, i);
    } else if (rest[close + 1] === '(' && rest.indexOf(')', close) === -1) {
      out = out.slice(0, i);
    }
    break;
  }

  // Inline code: odd number of single backticks.
  const ticks = out.replace(/```/g, '').match(/`/g)?.length ?? 0;
  if (ticks % 2 === 1) out = out.slice(0, out.lastIndexOf('`'));

  // Bold: odd number of `**`.
  const bold = (out.match(/\*\*/g) ?? []).length;
  if (bold % 2 === 1) out = out.slice(0, out.lastIndexOf('**'));

  // A dangling single emphasis marker at the very end ("word *").
  out = out.replace(/(^|\s)[*_]$/, '$1');

  return out;
}

export type EntityType = 'activity' | 'restaurant';

export interface EntityRef {
  type: EntityType;
  id: string;
  name: string;
}

const ENTITY_RE = /\[\[(activity|restaurant):([^|\]\s]+)\|([^\]]+?)\]\]/g;

/** Href prefix used to smuggle entity links through react-markdown. A
 *  fragment URL survives the default URL sanitizer untouched. */
export const ENTITY_HREF_PREFIX = '#periplo-entity/';

function escapeLinkText(s: string): string {
  return s.replace(/([\\[\]])/g, '\\$1');
}

/** Rewrite `[[activity:<id>|Name]]` → `[Name](#periplo-entity/activity/<id>)`
 *  so the markdown renderer's `a` override can turn it into a chip. */
export function entityLinksToMarkdown(text: string): string {
  return text.replace(ENTITY_RE, (_m, type: string, id: string, name: string) => {
    return `[${escapeLinkText(name.trim())}](${ENTITY_HREF_PREFIX}${type}/${encodeURIComponent(id)})`;
  });
}

/** Inverse of the href built above. */
export function parseEntityHref(href: string | undefined): Omit<EntityRef, 'name'> | null {
  if (!href || !href.startsWith(ENTITY_HREF_PREFIX)) return null;
  const [type, rawId] = href.slice(ENTITY_HREF_PREFIX.length).split('/');
  if ((type !== 'activity' && type !== 'restaurant') || !rawId) return null;
  try {
    return { type, id: decodeURIComponent(rawId) };
  } catch {
    return null;
  }
}

/** Replace entity links with their plain names (copy-to-clipboard). */
export function stripEntityLinks(text: string): string {
  return text.replace(ENTITY_RE, (_m, _t, _id, name: string) => name.trim());
}

export function mapsSearchUrl(name: string, city?: string | null): string {
  const q = [name, city].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}
