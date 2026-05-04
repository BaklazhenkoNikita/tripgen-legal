'use client';

import Box from '@mui/material/Box';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  children: string;
}

/**
 * Constrained markdown renderer for assistant turns.
 * Whitelist: bold, italic, links, bullet/ordered lists, h1–h3, inline code, blockquotes, hr.
 * Everything else (raw HTML, images, tables) is dropped — assistant output is
 * model-generated and we don't want surprise script tags or remote images.
 */
export function Markdown({ children }: Props) {
  return (
    <Box
      sx={(t) => ({
        fontSize: 14,
        lineHeight: 1.6,
        color: 'text.primary',
        '& > * + *': { mt: 1 },
        '& a': {
          fontWeight: 500,
          color: 'primary.main',
          textDecoration: 'underline',
          textUnderlineOffset: '2px',
          '&:hover': { color: t.palette.primary.dark },
        },
        '& ul': { ml: 2.5, pl: 0, listStyle: 'disc', '& > li + li': { mt: 0.5 } },
        '& ol': { ml: 2.5, pl: 0, listStyle: 'decimal', '& > li + li': { mt: 0.5 } },
        '& li::marker': { color: t.palette.text.disabled },
        '& h3': { fontSize: 16, fontWeight: 600, m: 0 },
        '& h4': { fontSize: 14, fontWeight: 600, m: 0 },
        '& h5, & h6': { fontSize: 14, fontWeight: 600, m: 0 },
        '& code': {
          borderRadius: 0.5,
          bgcolor: 'action.hover',
          px: 0.5,
          py: 0.25,
          fontFamily: 'ui-monospace, SFMono-Regular, monospace',
          fontSize: 12,
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
          a: ({ href, children: c }) => (
            <a href={href} target="_blank" rel="noreferrer">
              {c}
            </a>
          ),
          h1: ({ children: c }) => <h3>{c}</h3>,
          h2: ({ children: c }) => <h3>{c}</h3>,
          img: () => null,
          table: () => null,
        }}
      >
        {children}
      </ReactMarkdown>
    </Box>
  );
}
