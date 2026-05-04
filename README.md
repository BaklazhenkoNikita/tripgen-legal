# periplo-legal

Public legal pages for the Periplo travel planning app, served at:

- https://periploapp.com/privacy — Privacy Policy
- https://periploapp.com/terms — Terms of Service
- https://periploapp.com/help — Help Center

Hosted on GitHub Pages with a custom domain; pushes to `main` go live within ~1 minute.

The repo slug remains `tripgen-legal` for URL stability — it is consumed as a git submodule in the main Periplo mobile/backend repo and referenced by EAS / App Store metadata.

## SEO

Periplo is optimized for both classic Google rankings and AI Overview / ChatGPT / Gemini citations. The setup lives across:

| Surface | File | Purpose |
| --- | --- | --- |
| Default `<title>` / `<meta>` / icons / manifest | `src/app/layout.tsx` | Site-wide defaults, Twitter card, robots, GA4, Search Console verification |
| `Organization` + `WebSite` JSON-LD | `src/app/layout.tsx` (via `src/lib/seo/jsonld.ts`) | Knowledge-panel signals + sitelinks search box |
| Default OG / Twitter image | `src/app/opengraph-image.tsx`, `src/app/twitter-image.tsx` | 1200×630 brand fallback |
| Per-city metadata + `TouristDestination` JSON-LD + dynamic OG | `src/app/(app)/explore/[slug]/page.tsx` + `opengraph-image.tsx` | One indexable page per curated destination |
| Per-place metadata + `TouristAttraction` JSON-LD + dynamic OG | `src/app/(app)/explore/[slug]/[place]/page.tsx` + `opengraph-image.tsx` | Indexable places, with geo + rating |
| Per-trip metadata + `TouristTrip` JSON-LD + dynamic OG | `src/app/(app)/trip/[searchId]/page.tsx` + `opengraph-image.tsx` | Shareable AI itineraries with day-by-day `ItemList` |
| Sitemap | `src/app/sitemap.ts` | Lists home, marketing, blog, all curated destinations, legal |
| Robots | `src/app/robots.ts` | Disallows API, profile, activity, template, join — `/trip/` is **allowed** for indexing |
| JSON-LD builders | `src/lib/seo/jsonld.ts` | Typed `Organization` / `WebSite` / `BreadcrumbList` / `TouristDestination` / `TouristAttraction` / `TouristTrip` |
| Server-side fetchers | `src/lib/server/api.ts` | `getActivity`, `getTrip` (used inside `generateMetadata`) |

### Adding a new destination

Append an entry to `src/data/destinations.ts` with `slug`, `city`, `country`, `metaTitle`, `metaDescription`, `heroImage`, `overview`, etc. The new slug is automatically:

1. Pre-rendered at `/explore/{slug}` with proper `<title>`, OG, and `TouristDestination` JSON-LD
2. Listed in `/sitemap.xml` (priority 0.85, weekly)
3. Listed at `/explore` and on the `/community` index page
4. Given a generated 1200×630 OG image at `/explore/{slug}/opengraph-image`

### Environment variables

```
NEXT_PUBLIC_API_URL                       # Backend (drives server-side metadata fetches)
NEXT_PUBLIC_GA_ID                         # GA4 measurement id (G-XXXXXXX). Omit to disable.
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION      # Search Console verification token. Omit to skip.
```

Set both `NEXT_PUBLIC_GA_ID` and `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` on the Vercel project (Production + Preview).

### Verifying the site in Google Search Console

1. Go to https://search.google.com/search-console and add `https://periploapp.com` as a property.
2. Choose **HTML tag** verification. Copy the `content="..."` value.
3. Set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` on Vercel to that value, redeploy.
4. Click **Verify** in Search Console.
5. Submit the sitemap: `https://periploapp.com/sitemap.xml`.
6. Use **Inspect URL** → **Request Indexing** for the top 5 priority URLs:
   - `https://periploapp.com/`
   - `https://periploapp.com/explore`
   - `https://periploapp.com/community`
   - `https://periploapp.com/explore/paris-5-days`
   - `https://periploapp.com/blog`

### Validating structured data

Paste any deployed URL into:

- Google Rich Results Test — https://search.google.com/test/rich-results
- Schema Markup Validator — https://validator.schema.org/
- Facebook Sharing Debugger — https://developers.facebook.com/tools/debug/
- Twitter / X Card Validator — https://cards-dev.twitter.com/validator
- LinkedIn Post Inspector — https://www.linkedin.com/post-inspector/

### 6-week monitoring checklist

After launching the SEO push, check Search Console weekly for six weeks. Track week-over-week:

| Metric | Where | What "good" looks like |
| --- | --- | --- |
| Indexed pages | Coverage report | Climbing toward total `/sitemap.xml` count |
| Impressions | Performance → Search results | Up week-over-week |
| Avg position | Performance → Search results | Trending up (lower is better) |
| Click-through rate | Performance → Search results | ≥ 3% on branded queries, ≥ 1% on non-branded |
| Crawl errors | Coverage → Errors | Zero new server errors; investigate any 404 spike |
| Mobile usability | Experience → Mobile usability | Zero issues |
| Core Web Vitals | Experience → Page experience | All "Good" |
| AI Overview citations | Manual check + ChatGPT/Gemini | At least one citation by week 6 |

If any metric regresses two weeks in a row, open an issue and revisit the changed surface.
