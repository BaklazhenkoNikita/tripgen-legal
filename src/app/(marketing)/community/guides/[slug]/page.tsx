import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { destinations } from '@/data/destinations';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dest = destinations.find((d) => d.slug === slug);
  if (!dest) return {};
  return {
    title: dest.metaTitle,
    description: dest.metaDescription,
    openGraph: {
      title: dest.metaTitle,
      description: dest.metaDescription,
      images: [{ url: dest.heroImage, width: 800, height: 500 }],
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const dest = destinations.find((d) => d.slug === slug);
  if (!dest) notFound();

  const relatedDests = dest.relatedSlugs
    .map((s) => destinations.find((d) => d.slug === s))
    .filter(Boolean);

  return (
    <>
      <Box sx={{ position: 'relative', height: '50vh', minHeight: 320, overflow: 'hidden', bgcolor: 'common.black' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <Box
          component="img"
          src={dest.heroImage}
          alt={`${dest.city}, ${dest.country}`}
          sx={{ position: 'absolute', inset: 0, height: '100%', width: '100%', objectFit: 'cover', opacity: 0.75 }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(to top, rgba(0, 0, 0, 0.78), rgba(0, 0, 0, 0.15) 55%, transparent 80%)',
          }}
        />
        <Box
          sx={{
            position: 'relative',
            mx: 'auto',
            display: 'flex',
            height: '100%',
            maxWidth: 1024,
            flexDirection: 'column',
            justifyContent: 'flex-end',
            px: { xs: 2, sm: 3 },
            pb: 5,
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.85)',
              textShadow: '0 1px 4px rgba(0,0,0,0.45)',
            }}
          >
            {dest.country} &middot; {dest.continent}
          </Typography>
          <Typography
            component="h1"
            sx={{
              mt: 1,
              fontSize: { xs: '2.25rem', sm: '3rem' },
              fontWeight: 700,
              letterSpacing: '-0.025em',
              lineHeight: 1.0,
              color: 'common.white',
              textShadow: '0 2px 12px rgba(0,0,0,0.5)',
            }}
          >
            {dest.city} — {dest.days}-Day Itinerary
          </Typography>
        </Box>
      </Box>

      <Box component="article" sx={{ mx: 'auto', maxWidth: 1024, px: { xs: 2, sm: 3 }, py: 6 }}>
        <Box
          component={Link}
          href={`/explore/${dest.slug}`}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'rgb(var(--tg-palette-primary-mainChannel) / 0.3)',
            bgcolor: 'rgb(var(--tg-palette-primary-mainChannel) / 0.1)',
            px: 2.5,
            py: 2,
            textDecoration: 'none',
            transition: 'background-color 200ms',
            '&:hover': { bgcolor: 'rgb(var(--tg-palette-primary-mainChannel) / 0.2)' },
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'primary.dark',
              }}
            >
              Live picks
            </Typography>
            <Typography sx={{ mt: 0.25, fontSize: 14, fontWeight: 500, color: 'text.primary' }}>
              See what&apos;s on in {dest.city} right now — must-see spots, food, and events
            </Typography>
          </Box>
          <Typography sx={{ flexShrink: 0, fontSize: 14, fontWeight: 600, color: 'primary.dark' }}>Open →</Typography>
        </Box>

        <Box component="section" sx={{ mt: 5 }}>
          <Typography component="h2" sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'text.primary' }}>
            Overview
          </Typography>
          <Typography sx={{ mt: 1.5, lineHeight: 1.75, color: 'text.primary' }}>{dest.overview}</Typography>
        </Box>

        <Box component="section" sx={{ mt: 5 }}>
          <Typography component="h2" sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'text.primary' }}>
            Highlights
          </Typography>
          <Box component="ul" sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5, listStyle: 'none', p: 0 }}>
            {dest.highlights.map((h, i) => (
              <Box component="li" key={i} sx={{ display: 'flex', gap: 1.5, color: 'text.primary' }}>
                <Box
                  component="span"
                  sx={{
                    mt: 0.5,
                    display: 'flex',
                    height: 24,
                    width: 24,
                    flexShrink: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 999,
                    bgcolor: 'rgb(var(--tg-palette-primary-mainChannel) / 0.15)',
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'primary.dark',
                  }}
                >
                  {i + 1}
                </Box>
                {h}
              </Box>
            ))}
          </Box>
        </Box>

        <Box component="section" sx={{ mt: 5 }}>
          <Typography component="h2" sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'text.primary' }}>
            Best Time to Visit
          </Typography>
          <Typography sx={{ mt: 1.5, lineHeight: 1.75, color: 'text.primary' }}>{dest.bestTimeToVisit}</Typography>
        </Box>

        <Box component="section" sx={{ mt: 5 }}>
          <Typography component="h2" sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'text.primary' }}>
            Travel Tips
          </Typography>
          <Box component="ul" sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1, listStyle: 'none', p: 0 }}>
            {dest.tips.map((tip, i) => (
              <Box component="li" key={i} sx={{ display: 'flex', gap: 1, color: 'text.primary' }}>
                <Box component="span" sx={{ flexShrink: 0, color: 'primary.light' }}>&bull;</Box>
                {tip}
              </Box>
            ))}
          </Box>
        </Box>

        {dest.faqs && dest.faqs.length > 0 && (
          <Box component="section" sx={{ mt: 5 }}>
            <Typography component="h2" sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'text.primary' }}>
              Frequently Asked Questions
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {dest.faqs.map((faq, i) => (
                <Box
                  component="details"
                  key={i}
                  sx={{
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    p: 2,
                    '&[open]': { bgcolor: 'action.hover' },
                  }}
                >
                  <Box component="summary" sx={{ cursor: 'pointer', fontWeight: 500, color: 'text.primary' }}>
                    {faq.question}
                  </Box>
                  <Typography sx={{ mt: 1, fontSize: 14, lineHeight: 1.5, color: 'text.secondary' }}>
                    {faq.answer}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        <Box
          sx={{
            mt: 6,
            borderRadius: 4,
            bgcolor: 'rgb(var(--tg-palette-primary-mainChannel) / 0.1)',
            p: 4,
            textAlign: 'center',
          }}
        >
          <Typography component="h3" sx={{ fontSize: '1.25rem', fontWeight: 700, color: 'text.primary' }}>
            Ready to plan your {dest.city} trip?
          </Typography>
          <Typography sx={{ mt: 1, fontSize: 14, color: 'text.secondary' }}>
            Get a personalized {dest.days}-day itinerary in minutes.
          </Typography>
          <Box
            component={Link}
            href={`/trip?destination=${encodeURIComponent(`${dest.city}, ${dest.country}`)}&days=${dest.days}`}
            sx={{
              mt: 2,
              display: 'inline-block',
              borderRadius: 1.5,
              bgcolor: 'primary.main',
              px: 3,
              py: 1.25,
              fontSize: 14,
              fontWeight: 600,
              color: 'common.white',
              textDecoration: 'none',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            Plan My Trip
          </Box>
        </Box>

        {relatedDests.length > 0 && (
          <Box component="section" sx={{ mt: 6 }}>
            <Typography component="h2" sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'text.primary' }}>
              Related Guides
            </Typography>
            <Box
              sx={{
                mt: 2,
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { sm: 'repeat(3, 1fr)' },
              }}
            >
              {relatedDests.map((rd) =>
                rd ? (
                  <Box
                    component={Link}
                    key={rd.slug}
                    href={`/community/guides/${rd.slug}`}
                    className="group"
                    sx={{
                      overflow: 'hidden',
                      borderRadius: 2,
                      boxShadow: 'inset 0 0 0 1px var(--tg-palette-divider)',
                      textDecoration: 'none',
                    }}
                  >
                    <Box sx={{ aspectRatio: '16/10', overflow: 'hidden', bgcolor: 'action.hover' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <Box
                        component="img"
                        src={rd.heroImage}
                        alt={rd.city}
                        loading="lazy"
                        sx={{
                          height: '100%',
                          width: '100%',
                          objectFit: 'cover',
                          transition: 'transform 200ms',
                          '.group:hover &': { transform: 'scale(1.05)' },
                        }}
                      />
                    </Box>
                    <Box sx={{ p: 1.5 }}>
                      <Typography sx={{ fontWeight: 500, color: 'text.primary' }}>{rd.city}</Typography>
                      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                        {rd.country} &middot; {rd.days} days
                      </Typography>
                    </Box>
                  </Box>
                ) : null,
              )}
            </Box>
          </Box>
        )}
      </Box>

      {dest.faqs && dest.faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: dest.faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: faq.answer,
                },
              })),
            }),
          }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'TouristTrip',
            name: `${dest.city} ${dest.days}-Day Itinerary`,
            description: dest.metaDescription,
            touristType: 'Leisure',
            itinerary: {
              '@type': 'ItemList',
              numberOfItems: dest.highlights.length,
              itemListElement: dest.highlights.map((h, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: h,
              })),
            },
          }),
        }}
      />
    </>
  );
}
