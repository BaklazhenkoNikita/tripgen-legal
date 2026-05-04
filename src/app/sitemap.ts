import type { MetadataRoute } from 'next';
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

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const home: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
  ];

  const topMarketing: MetadataRoute.Sitemap = [
    '/pricing',
    '/faq',
    '/blog',
    '/community',
    '/explore',
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Each destination renders at three URLs in the post-merge surface.
  const destinationPages: MetadataRoute.Sitemap = destinations.flatMap((d) => [
    {
      url: `${BASE_URL}/community/guides/${d.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/community/${d.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/explore/${d.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
  ]);

  const legalPages: MetadataRoute.Sitemap = LEGAL_SLUGS.map((slug) => ({
    url: `${BASE_URL}/legal/${slug}`,
    lastModified: now,
    changeFrequency: 'yearly',
    priority: 0.3,
  }));

  return [...home, ...topMarketing, ...blogPages, ...destinationPages, ...legalPages];
}
