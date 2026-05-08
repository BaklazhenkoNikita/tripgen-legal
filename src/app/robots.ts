import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/profile',
          '/activity/',
          '/template/',
          '/join/',
          '/discover',
          '/chat',
          '/trip',
          '/history',
          '/onboarding',
          '/handoff',
          '/shared',
        ],
      },
    ],
    sitemap: 'https://periploapp.com/sitemap.xml',
    host: 'https://periploapp.com',
  };
}
