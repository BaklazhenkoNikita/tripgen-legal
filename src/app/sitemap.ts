import type { MetadataRoute } from 'next';
import fs from 'node:fs';
import path from 'node:path';
import { destinations } from '@/data/destinations';
import { blogPosts } from '@/data/blogPosts';

const BASE_URL = 'https://periploapp.com';

// /mcp-upgrade is intentionally excluded — it's noindex.
const LEGAL_SLUGS = [
  'privacy',
  'terms',
  'help',
  'delete-account',
  'dsa',
  'affiliate-disclosure',
  'ai-disclosure',
  'mcp',
] as const;

// Captured once per build — used as the lastModified for surfaces whose
// content is generated rather than edited in a single source file.
const BUILD_TIME = new Date();

function fileModified(relPath: string): Date {
  try {
    return fs.statSync(path.join(process.cwd(), relPath)).mtime;
  } catch {
    return BUILD_TIME;
  }
}

// Parses blog post.date strings like "March 15, 2026" into a Date. Falls
// back to BUILD_TIME if the date is unparseable so we never emit invalid
// <lastmod> entries.
function parseBlogDate(dateStr: string): Date {
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? BUILD_TIME : d;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const destinationsModified = fileModified('src/data/destinations.ts');

  const home: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: BUILD_TIME,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];

  const topMarketing: MetadataRoute.Sitemap = (
    [
      { path: '/pricing', src: 'src/app/(marketing)/pricing/page.tsx' },
      { path: '/faq', src: 'src/app/(marketing)/faq/page.tsx' },
      { path: '/blog', src: 'src/app/(marketing)/blog/page.tsx' },
      { path: '/community', src: 'src/app/(marketing)/community/page.tsx' },
      { path: '/explore', src: 'src/app/(app)/explore/page.tsx' },
    ] as const
  ).map(({ path: p, src }) => ({
    url: `${BASE_URL}${p}`,
    lastModified: fileModified(src),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: parseBlogDate(p.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Each destination renders at two indexable surfaces:
  //   /explore/[slug]                — canonical (live picks)
  //   /community/guides/[slug]       — static guide, canonicalizes to /explore
  // /community/[slug] is intentionally excluded: that route serves
  // user-published trip templates with their own slug namespace, not
  // destination slugs.
  const destinationPages: MetadataRoute.Sitemap = destinations.flatMap((d) => [
    {
      url: `${BASE_URL}/explore/${d.slug}`,
      lastModified: destinationsModified,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/community/guides/${d.slug}`,
      lastModified: destinationsModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]);

  const legalPages: MetadataRoute.Sitemap = LEGAL_SLUGS.map((slug) => ({
    url: `${BASE_URL}/legal/${slug}`,
    lastModified: fileModified(`src/app/legal/${slug}/page.tsx`),
    changeFrequency: 'yearly',
    priority: 0.3,
  }));

  return [...home, ...topMarketing, ...blogPages, ...destinationPages, ...legalPages];
}
