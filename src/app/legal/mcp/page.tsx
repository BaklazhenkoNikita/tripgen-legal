import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { LegalLayout } from '@/components/layout/LegalLayout';

export const metadata: Metadata = {
  title: 'Periplo MCP Connector — Travel tools for Claude and ChatGPT',
  description:
    "Periplo's MCP connector lets Claude, ChatGPT, and other MCP-compatible hosts call our travel tools — curated attractions, day-by-day itineraries, and destination overviews — directly inside the chat.",
  alternates: { canonical: '/legal/mcp' },
};

type PillTone = 'read' | 'write';

function Pill({ tone, children }: { tone: PillTone; children: ReactNode }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        fontSize: '0.72rem',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        fontWeight: 600,
        px: 1,
        py: '2px',
        borderRadius: 999,
        ml: 1,
        verticalAlign: 'middle',
        ...(tone === 'read'
          ? {
              bgcolor: 'rgba(74, 107, 77, 0.15)',
              color: '#4A6B4D',
            }
          : {
              bgcolor: 'rgba(196, 96, 58, 0.15)',
              color: 'primary.main',
            }),
      }}
    >
      {children}
    </Box>
  );
}

function ToolCard({
  name,
  pill,
  children,
}: {
  name: ReactNode;
  pill: { tone: PillTone; label: string };
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        p: '20px 22px',
        mb: 1.5,
        '& > p': { mt: 1, mb: 0 },
        '& code': {
          display: 'inline-block',
          bgcolor: 'action.hover',
          color: 'text.primary',
          px: 1,
          py: '2px',
          borderRadius: 0.75,
          fontSize: '0.95rem',
        },
      }}
    >
      <Box component="span">
        <code>{name}</code>
      </Box>
      <Pill tone={pill.tone}>{pill.label}</Pill>
      {children}
    </Box>
  );
}

function CodeBlock({ children }: { children: ReactNode }) {
  return (
    <Box
      component="pre"
      sx={{
        bgcolor: 'grey.900',
        color: 'grey.100',
        p: '16px 18px',
        borderRadius: 1.25,
        overflowX: 'auto',
        fontSize: '0.92rem',
        my: 1.5,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        '& code': {
          bgcolor: 'transparent',
          color: 'inherit',
          p: 0,
        },
      }}
    >
      <code>{children}</code>
    </Box>
  );
}

export default function McpPage() {
  return (
    <LegalLayout title="Periplo MCP">
      <Typography
        component="p"
        sx={{
          color: 'text.secondary',
          fontSize: '1.05rem',
          mt: -2,
          mb: 4,
        }}
      >
        Travel tools for Claude, ChatGPT, and any MCP-compatible host. Ask about
        a destination &mdash; get a curated map, an itinerary, or a
        magazine-style overview rendered inline.
      </Typography>

      <h2>What it does</h2>
      <p>
        Periplo MCP exposes Periplo&apos;s curated travel database &mdash;
        human-edited highlights, ranked activities, restaurants, and bookable
        tours &mdash; over the{' '}
        <a
          href="https://modelcontextprotocol.io"
          target="_blank"
          rel="noopener noreferrer"
        >
          Model Context Protocol
        </a>
        . Your AI host calls the right tool for each question, and the response
        renders as an interactive widget (map, photo cards, day-by-day plan)
        right in the chat.
      </p>

      <h2>Tools</h2>

      <ToolCard
        name="explore_destination"
        pill={{ tone: 'read', label: 'Read-only' }}
      >
        <p>
          Top sights, neighborhoods, restaurants, and bookable tours for a city,
          region, or country. Renders as an interactive map with photo cards.
          The default for any travel question about a place.
        </p>
      </ToolCard>

      <ToolCard
        name="build_itinerary"
        pill={{ tone: 'write', label: 'Generates content' }}
      >
        <p>
          Multi-day day-by-day schedule with activities, restaurants, and a
          recommended split across days. Use when you want a structured
          itinerary, not just exploration.
        </p>
      </ToolCard>

      <ToolCard
        name="destination_info"
        pill={{ tone: 'read', label: 'Read-only' }}
      >
        <p>
          Magazine-style overview of a place &mdash; description, history,
          culture, currency, language, climate, hero photos. Use when you want
          to <em>understand</em> a place rather than visit it.
        </p>
      </ToolCard>

      <ToolCard
        name={
          <>
            search<span style={{ background: 'transparent' }}> + </span>fetch
          </>
        }
        pill={{ tone: 'read', label: 'Read-only' }}
      >
        <p>
          OpenAI deep-research compatibility shims. <code>search(query)</code>{' '}
          returns flat citations; <code>fetch(id)</code> dereferences a single
          entity into its full record. For normal travel questions, hosts should
          prefer the three tools above.
        </p>
      </ToolCard>

      <h2>Connecting</h2>

      <h3>Claude (web, desktop, mobile)</h3>
      <p>Settings &rarr; Connectors &rarr; Add custom connector. Paste this URL:</p>
      <CodeBlock>https://api.periploapp.com/mcp</CodeBlock>
      <p>
        Claude walks you through the Periplo (Clerk) sign-in once, then keeps
        the connector available across conversations.
      </p>

      <h3>ChatGPT (Apps SDK / Developer Mode)</h3>
      <p>
        Settings &rarr; Connectors (or Developer Mode &rarr; Connectors) &rarr;
        Add. Same URL:
      </p>
      <CodeBlock>https://api.periploapp.com/mcp</CodeBlock>

      <h3>Other MCP hosts</h3>
      <p>
        Any host that speaks the MCP <em>Streamable HTTP</em> transport with
        OAuth 2.1 + Dynamic Client Registration can connect. There are no API
        keys to manage on either end &mdash; Clerk handles registration and
        tokens.
      </p>

      <h2>Authentication</h2>
      <p>
        Periplo MCP is a pure OAuth 2.1 resource server. Identity is provided by{' '}
        <a href="https://clerk.com" target="_blank" rel="noopener noreferrer">
          Clerk
        </a>
        ; the resource-discovery doc lives at{' '}
        <a
          href="https://api.periploapp.com/.well-known/oauth-protected-resource"
          target="_blank"
          rel="noopener noreferrer"
        >
          <code>/.well-known/oauth-protected-resource</code>
        </a>{' '}
        per RFC 9728. Hosts auto-register via Dynamic Client Registration on
        first use &mdash; no manual setup required.
      </p>
      <p>
        Sign-in supports Google, Apple, and email magic links &mdash; the same
        options as the Periplo mobile app.
      </p>

      <h2>Rate limits</h2>
      <ul>
        <li>
          <strong>Free</strong>: 1,000 destination lookups per day.{' '}
          <code>build_itinerary</code> only debits the counter on a cache miss;
          warm cities are free.
        </li>
        <li>
          <strong>Pro</strong>: a much higher cap, plus priority on long-tail
          city generation. <Link href="/legal/mcp-upgrade">Upgrade &rarr;</Link>
        </li>
      </ul>
      <p>
        When you hit the cap, the tool returns a structured{' '}
        <code>rate_limited</code> response with an upgrade link rather than
        failing &mdash; your host can render that gracefully.
      </p>

      <h2>Privacy</h2>
      <p>
        We capture the bare minimum needed to keep the connector reliable: which
        tool was called, the destination string, your Periplo user ID, and
        request timing &mdash; no chat content, no personal context the host
        might pass alongside. Logs roll off after 90 days. See our{' '}
        <Link href="/legal/privacy">Privacy Policy</Link> for the full picture.
      </p>

      <Box
        sx={{
          bgcolor: 'rgba(91, 123, 94, 0.10)',
          borderLeft: '3px solid',
          borderColor: 'secondary.main',
          borderRadius: '0 12px 12px 0',
          p: '14px 18px',
          my: 2.25,
          '& p': { mb: 0 },
        }}
      >
        <p>
          <strong>For developers:</strong> the connector implements the MCP
          2025-06-18 spec including <code>readOnlyHint</code> /{' '}
          <code>destructiveHint</code> annotations, embedded UI resources for
          in-chat widgets, and Origin-header validation. Source-of-truth
          descriptions and JSON schemas come from the live <code>/mcp</code>{' '}
          endpoint.
        </p>
      </Box>

      <h2>Support</h2>
      <Box
        sx={{
          bgcolor: 'action.hover',
          borderRadius: 1.5,
          p: 2.5,
          mt: 3,
          '& p': { mb: 1, '&:last-child': { mb: 0 } },
        }}
      >
        <p>
          Questions, feedback, or a destination we should add to the curated
          set?
        </p>
        <p>
          <a href="mailto:support@periploapp.com">support@periploapp.com</a>
        </p>
      </Box>
    </LegalLayout>
  );
}
