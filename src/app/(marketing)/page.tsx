import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, Users, Search, ArrowRight } from 'lucide-react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { destinations } from '@/data/destinations';
import { blogPosts } from '@/data/blogPosts';
import { Photo } from '@/components/ui/Photo';
import { Badge } from '@/components/ui/Badge';
import { HorizontalScrollRow } from '@/components/ui/HorizontalScrollRow';
import { Hero } from '@/components/marketing/Hero';
import { Section } from '@/components/layout/Section';
import { textScale } from '@/theme/standards';

export const metadata: Metadata = {
  title: 'Periplo — AI Travel Planner',
  description:
    'Plan your perfect trip with AI. Get personalized day-by-day itineraries, activity recommendations, and real-time collaboration.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Periplo — AI Travel Planner',
    description:
      'Plan your perfect trip with AI. Get personalized day-by-day itineraries, activity recommendations, and real-time collaboration.',
    url: 'https://periploapp.com/',
    type: 'website',
    siteName: 'Periplo',
  },
};

const featuredDestinations = destinations.slice(0, 12);
const featuredPosts = blogPosts.slice(0, 3);

const features = [
  {
    title: 'AI-powered itineraries',
    description: 'Personalized day-by-day plans matched to your interests, budget, and pace.',
    Icon: Sparkles,
  },
  {
    title: 'Real-time collaboration',
    description: 'Share trips with friends and family. Edit together, see updates as they happen.',
    Icon: Users,
  },
  {
    title: 'Smart activity search',
    description: 'Discover spots, restaurants, and events curated for your destination and dates.',
    Icon: Search,
  },
];

export default function LandingPage() {
  return (
    <>
      <Hero />

      {/* Features */}
      <Section width="content">
        <Box>
          <Typography variant="h2" sx={{ textAlign: 'center', color: 'text.primary' }}>
            Why Periplo?
          </Typography>
          <Typography
            sx={{ mx: 'auto', mt: 1.5, maxWidth: 480, textAlign: 'center', color: 'text.secondary' }}
          >
            Designed to spend less time researching, more time experiencing.
          </Typography>
          <Box
            sx={{
              mt: 4.5,
              display: 'grid',
              gap: 2.5,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            }}
          >
            {features.map(({ title, description, Icon }) => (
              <Box
                key={title}
                component="article"
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  p: 3.5,
                  boxShadow: 'var(--tg-shadow-card)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'text.disabled',
                    boxShadow: 'var(--tg-shadow-card-hover)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      height: 48,
                      width: 48,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 2,
                      bgcolor: 'rgba(var(--tg-palette-primary-mainChannel) / 0.12)',
                      color: 'primary.main',
                    }}
                  >
                    <Icon size={22} aria-hidden strokeWidth={1.75} />
                  </Box>
                  <Typography
                    component="h3"
                    sx={{ mt: 2.5, ...textScale.title, color: 'text.primary' }}
                  >
                    {title}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                    {description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Section>

      {/* Featured destinations */}
      <Section
        sx={{
          borderBlock: '1px solid var(--tg-palette-divider)',
          bgcolor: 'background.paper',
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 1.5 }}>
            <Box>
              <Typography variant="h2" component="h2" sx={{ color: 'text.primary' }}>
                Popular destinations
              </Typography>
              <Typography sx={{ mt: 1, color: 'text.secondary' }}>
                Hand-picked starting points for your next trip.
              </Typography>
            </Box>
            <Box
              component={Link}
              href="/explore"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                ...textScale.label,
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              View all
              <ArrowRight size={14} aria-hidden />
            </Box>
          </Box>
          <Box sx={{ mt: 4 }}>
            <HorizontalScrollRow ariaLabel="Popular destinations">
              {featuredDestinations.map((dest) => (
                <Box
                  key={dest.slug}
                  component={Link}
                  href={`/explore/${dest.slug}`}
                  sx={{
                    flex: {
                      xs: '0 0 70%',
                      sm: '0 0 240px',
                      md: '0 0 280px',
                    },
                    scrollSnapAlign: 'start',
                    display: 'block',
                    overflow: 'hidden',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    textDecoration: 'none',
                    color: 'inherit',
                    boxShadow: 'var(--tg-shadow-card)',
                    transition: 'all 0.2s',
                    outline: 'none',
                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor: 'primary.main',
                      outlineOffset: 2,
                    },
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      borderColor: 'text.disabled',
                      boxShadow: 'var(--tg-shadow-card-hover)',
                      '& h3': { color: 'primary.main' },
                    },
                  }}
                >
                  <Photo
                    src={dest.heroImage}
                    alt={`${dest.city}, ${dest.country}`}
                    aspect="16/9"
                    zoomOnHover
                    sizes="(max-width: 640px) 70vw, (max-width: 1024px) 240px, 280px"
                  />
                  <Box sx={{ p: 2 }}>
                    <Typography
                      component="h3"
                      sx={{ ...textScale.label, fontSize: '1rem', color: 'text.primary', transition: 'color 0.2s' }}
                    >
                      {dest.city}
                      <Box component="span" sx={{ color: 'text.disabled', fontWeight: 400 }}>, {dest.country}</Box>
                    </Typography>
                  </Box>
                </Box>
              ))}
            </HorizontalScrollRow>
          </Box>
        </Box>
      </Section>

      {/* Blog preview */}
      <Section>
        <Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 1.5 }}>
            <Box>
              <Typography variant="h2" component="h2" sx={{ color: 'text.primary' }}>
                Travel guides
              </Typography>
              <Typography sx={{ mt: 1, color: 'text.secondary' }}>
                Curated reads to plan smarter.
              </Typography>
            </Box>
            <Box
              component={Link}
              href="/blog"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                ...textScale.label,
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              View all
              <ArrowRight size={14} aria-hidden />
            </Box>
          </Box>
          <Box
            sx={{
              mt: 4,
              display: 'grid',
              gap: 4,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            }}
          >
            {featuredPosts.map((post) => (
              <Box
                key={post.slug}
                component={Link}
                href={`/blog/${post.slug}`}
                sx={{
                  display: 'block',
                  textDecoration: 'none',
                  color: 'inherit',
                  '&:hover h3': { color: 'primary.main' },
                }}
              >
                <Box
                  sx={{
                    overflow: 'hidden',
                    borderRadius: 'var(--radius-lg, 12px)',
                    '& img': {
                      filter: 'saturate(0.94) contrast(1.02)',
                      transition: 'filter 0.3s',
                    },
                  }}
                >
                  <Photo
                    src={post.heroImage}
                    alt={post.title}
                    aspect="16/9"
                    rounded="lg"
                    zoomOnHover
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Badge tone="accent" size="sm">{post.category}</Badge>
                  <Typography
                    component="h3"
                    sx={{ mt: 1, ...textScale.title, color: 'text.primary', transition: 'color 0.2s' }}
                  >
                    {post.title}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.75,
                      ...textScale.support,
                      color: 'text.secondary',
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2,
                      overflow: 'hidden',
                    }}
                  >
                    {post.excerpt}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Section>

      {/* MCP connector callout (legal-merge addition) */}
      <Section width="prose" containerSx={{ textAlign: 'center' }}>
        <Box>
          <Typography
            component="span"
            sx={{
              ...textScale.meta,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'primary.main',
            }}
          >
            New
          </Typography>
          <Typography variant="h3" component="h3" sx={{ mt: 1.5, color: 'text.primary' }}>
            Connect Periplo to Claude or ChatGPT
          </Typography>
          <Typography sx={{ mt: 1.5, color: 'text.secondary' }}>
            Bring real-time travel planning into your AI tools — itineraries, places, and prices,
            on demand.
          </Typography>
          <Box
            component={Link}
            href="/legal/mcp"
            sx={{
              mt: 2,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              ...textScale.label,
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            See how it works
            <ArrowRight size={14} aria-hidden />
          </Box>
        </Box>
      </Section>

      {/* CTA */}
      <Section width="content" sx={{ pt: 0 }}>
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 4,
            backgroundColor: 'var(--tg-palette-primary-dark)',
            backgroundImage:
              'radial-gradient(circle at 18% 22%, rgba(255,255,255,0.16) 0%, transparent 55%), linear-gradient(135deg, var(--tg-palette-primary-main) 0%, var(--tg-palette-primary-dark) 100%)',
            px: 3,
            py: 7,
            textAlign: 'center',
            color: 'common.white',
            boxShadow: 'var(--tg-shadow-primary-button-hover)',
          }}
        >
          <Box
            component="img"
            src="/assets/logo-icon.png"
            alt=""
            aria-hidden
            sx={{
              position: 'absolute',
              top: { xs: 'auto', sm: '50%' },
              bottom: { xs: -40, sm: 'auto' },
              right: { xs: -30, sm: -40 },
              transform: { xs: 'none', sm: 'translateY(-50%)' },
              width: { xs: 160, sm: 220 },
              height: 'auto',
              opacity: 0.07,
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          />
          <Box sx={{ position: 'relative' }}>
            <Typography variant="h2" component="h2">
              Ready for your next adventure?
            </Typography>
            <Typography sx={{ mx: 'auto', mt: 1.5, maxWidth: 480, color: 'rgba(255,255,255,0.92)' }}>
              Create a personalized itinerary in minutes. No credit card needed.
            </Typography>
            <Button
              component={Link}
              href="/trip"
              variant="contained"
              size="large"
              endIcon={<ArrowRight size={16} />}
              sx={{
                mt: 4,
                bgcolor: 'common.white',
                color: 'primary.main',
                px: 3,
                py: 1.25,
                borderRadius: 999,
                boxShadow: '0 1px 2px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.12)',
                '&:hover': {
                  bgcolor: 'common.white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.10), 0 12px 28px rgba(0,0,0,0.16)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s',
              }}
            >
              Start planning — it&apos;s free
            </Button>
          </Box>
        </Box>
      </Section>

      {/* Trust line (legal-merge addition) */}
      <Typography
        sx={{
          ...textScale.meta,
          color: 'text.secondary',
          textAlign: 'center',
          mb: 4,
          px: 2,
        }}
      >
        By using Periplo you agree to our{' '}
        <Box
          component={Link}
          href="/legal/privacy"
          sx={{
            color: 'inherit',
            textDecoration: 'underline',
            '&:hover': { color: 'primary.main' },
          }}
        >
          Privacy Policy
        </Box>{' '}
        and{' '}
        <Box
          component={Link}
          href="/legal/terms"
          sx={{
            color: 'inherit',
            textDecoration: 'underline',
            '&:hover': { color: 'primary.main' },
          }}
        >
          Terms
        </Box>
        .
      </Typography>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Periplo',
            url: 'https://periploapp.com',
            description: 'AI-powered travel planning for personalized itineraries.',
            applicationCategory: 'TravelApplication',
            operatingSystem: 'Web',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }),
        }}
      />
    </>
  );
}
