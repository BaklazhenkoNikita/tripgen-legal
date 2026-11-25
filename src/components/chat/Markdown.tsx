'use client';

import { memo, useMemo, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { closeStreamingTail, entityLinksToMarkdown, parseEntityHref } from '@/lib/chat/markdown';
import { EntityChip } from './EntityChip';
import { useChatRender } from './ChatRenderContext';

interface Props {
  children: string;
  /** While true, a trailing unclosed construct (`**bo`, `[lin`) is hidden. */
  streaming?: boolean;
}

function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  return '';
}

/**
 * Constrained markdown renderer for assistant turns.
 * Whitelist: bold, italic, links, bullet/ordered lists, h1–h3, inline code, blockquotes, hr.
 * Everything else (raw HTML, images, tables) is dropped — assistant output is
 * model-generated and we don't want surprise script tags or remote images.
 * Entity links (`[[activity:<id>|Name]]`) render as inline chips.
 */
export const Markdown = memo(function Markdown({ children, streaming = false }: Props) {
  const { city } = useChatRender();
  const source = useMemo(
    () => entityLinksToMarkdown(streaming ? closeStreamingTail(children) : children),
    [children, streaming],
  );

  return (
    <Box
      sx={(t) => ({
        fontSize: 15,
        lineHeight: 1.6,
        color: 'text.primary',
        overflowWrap: 'anywhere',
        '& > * + *': { mt: 1 },
        '& a': {
          fontWeight: 500,
          color: 'primary.main',
          textDecoration: 'underline',
          textUnderlineOffset: '2px',
          '&:hover': { color: t.palette.primary.dark },
          '&:focus-visible': { outline: `2px solid ${t.palette.primary.main}`, outlineOffset: 2, borderRadius: 0.5 },
        },
        '& ul': { ml: 2.5, pl: 0, listStyle: 'disc', '& > li + li': { mt: 0.5 } },
        '& ol': { ml: 2.5, pl: 0, listStyle: 'decimal', '& > li + li': { mt: 0.5 } },
        '& li::marker': { color: t.palette.text.disabled },
        '& h3': { fontSize: 16, fontWeight: 600, m: 0 },
        '& h4': { fontSize: 15, fontWeight: 600, m: 0 },
        '& h5, & h6': { fontSize: 15, fontWeight: 600, m: 0 },
        '& code': {
          borderRadius: 0.5,
          bgcolor: 'action.hover',
          px: 0.5,
          py: 0.25,
          fontFamily: 'ui-monospace, SFMono-Regular, monospace',
          fontSize: 13,
        },
        '& blockquote': {
          borderLeft: 2,
          borderColor: 'divider',
          pl: 1.5,
          fontStyle: 'italic',
          color: 'text.secondary',
          m: 0,
        },
        '& hr': { borderColor: t.palette.divider, my: 1 },
        '& p': { m: 0 },
      })}
    >
      <ReactMarkdown
        skipHtml
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children: c }) => {
            const entity = parseEntityHref(href);
            if (entity) {
              return <EntityChip type={entity.type} id={entity.id} name={textOf(c)} city={city} />;
            }
            return (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {c}
              </a>
            );
          },
          h1: ({ children: c }) => <h3>{c}</h3>,
          h2: ({ children: c }) => <h3>{c}</h3>,
          img: () => null,
          table: () => null,
        }}
      >
        {source}
      </ReactMarkdown>
    </Box>
  );
});
