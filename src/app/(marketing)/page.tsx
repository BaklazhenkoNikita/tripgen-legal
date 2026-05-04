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
import { Hero } from '@/components/marketing/Hero';

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

const featuredDestinations = destinations.slice(0, 6);
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
      <Box component="section" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 7, md: 9 } }}>
        <Box sx={{ mx: 'auto', maxWidth: 1152 }}>
          <Typography
            component="h2"
            sx={{
              textAlign: 'center',
              fontWeight: 600,
              fontSize: { xs: '1.75rem', sm: '2.25rem' },
              letterSpacing: '-0.01em',
              color: 'text.primary',
            }}
          >
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
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'text.disabled',
                    boxShadow: 'var(--tg-shadow-card-hover)',
                  },
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      height: 44,
                      width: 44,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 1.5,
                      bgcolor: 'rgba(var(--tg-palette-primary-mainChannel) / 0.12)',
                      color: 'primary.main',
                    }}
                  >
                    <Icon size={20} aria-hidden />
                  </Box>
                  <Typography
                    component="h3"
                    sx={{ mt: 2.5, fontSize: 18, fontWeight: 600, color: 'text.primary' }}
                  >
                    {title}
                  </Typography>
                  <Typography sx={{ mt: 1, fontSize: 14, lineHeight: 1.6, color: 'text.secondary' }}>
                    {description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Featured destinations */}
      <Box
        component="section"
        sx={{
          borderBlock: '1px solid var(--tg-palette-divider)',
          bgcolor: 'background.paper',
          px: { xs: 2, sm: 3 },
          py: { xs: 7, md: 9 },
        }}
      >
        <Box sx={{ mx: 'auto', maxWidth: 1280 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 1.5 }}>
            <Box>
              <Typography
                component="h2"
                sx={{ fontWeight: 600, fontSize: { xs: '1.75rem', sm: '2.25rem' }, color: 'text.primary' }}
              >
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
                fontSize: 14,
                fontWeight: 500,
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
              mx: { xs: -2, sm: -3 },
              px: { xs: 2, sm: 3 },
              pr: { xs: 2, sm: 3, lg: 6 },
              pt: 1,
              pb: 1,
              display: 'flex',
              gap: 2.5,
              overflowX: 'auto',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {featuredDestinations.map((dest) => (
              <Box
                key={dest.slug}
                component={Link}
                href={`/explore/${dest.slug}`}
                sx={{
                  flex: '0 0 auto',
                  width: { xs: 260, sm: 280, md: 300 },
                  display: 'block',
                  overflow: 'hidden',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.2s',
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
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <Box sx={{ p: 2.5 }}>
                  <Typography
                    component="h3"
                    sx={{ fontSize: 18, fontWeight: 600, color: 'text.primary', transition: 'color 0.2s' }}
                  >
                    {dest.city}
                    <Box component="span" sx={{ color: 'text.disabled' }}>, {dest.country}</Box>
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Blog preview */}
      <Box component="section" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 7, md: 9 } }}>
        <Box sx={{ mx: 'auto', maxWidth: 1280 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 1.5 }}>
            <Box>
              <Typography
                component="h2"
                sx={{ fontWeight: 600, fontSize: { xs: '1.75rem', sm: '2.25rem' }, color: 'text.primary' }}
              >
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
                fontSize: 14,
                fontWeight: 500,
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
                <Photo
                  src={post.heroImage}
                  alt={post.title}
                  aspect="16/9"
                  rounded="lg"
                  zoomOnHover
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <Box sx={{ mt: 2 }}>
                  <Badge tone="accent" size="sm">{post.category}</Badge>
                  <Typography
                    component="h3"
                    sx={{ mt: 1, fontSize: 18, fontWeight: 600, lineHeight: 1.3, color: 'text.primary', transition: 'color 0.2s' }}
                  >
                    {post.title}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: 14,
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
      </Box>

      {/* MCP connector callout (legal-merge addition) */}
      <Box component="section" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 5, md: 6 } }}>
        <Box sx={{ mx: 'auto', maxWidth: 720, textAlign: 'center' }}>
          <Typography
            component="span"
            sx={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'primary.main',
            }}
          >
            New
          </Typography>
          <Typography
            component="h3"
            variant="h3"
            sx={{
              mt: 1.5,
              fontSize: { xs: '1.5rem', sm: '1.75rem' },
              lineHeight: 1.2,
              color: 'text.primary',
            }}
          >
            Connect Periplo to Claude or ChatGPT
          </Typography>
          <Typography
            sx={{
              mt: 1.5,
              fontSize: 16,
              lineHeight: 1.6,
              color: 'text.secondary',
            }}
          >
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
              fontSize: 14,
              fontWeight: 600,
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            See how it works
            <ArrowRight size={14} aria-hidden />
          </Box>
        </Box>
      </Box>

      {/* CTA */}
      <Box component="section" sx={{ px: { xs: 2, sm: 3 }, py: 6 }}>
        <Box
          sx={{
            mx: 'auto',
            maxWidth: 1024,
            overflow: 'hidden',
            borderRadius: 4,
            background:
              'linear-gradient(135deg, var(--tg-palette-primary-main) 0%, var(--tg-palette-primary-dark) 60%, #9b1d3a 100%)',
            px: 3,
            py: 7,
            textAlign: 'center',
            color: '#fff',
            boxShadow: 'var(--tg-shadow-primary-button-hover)',
          }}
        >
          <Typography
            component="h2"
            sx={{ fontWeight: 600, fontSize: { xs: '1.75rem', sm: '2.25rem' } }}
          >
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
              bgcolor: '#fff',
              color: 'primary.main',
              px: 3,
              py: 1.25,
              borderRadius: 999,
              fontSize: 16,
              boxShadow: 'none',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.92)' },
            }}
          >
            Start planning — it&apos;s free
          </Button>
        </Box>
      </Box>

      {/* Trust line (legal-merge addition) */}
      <Typography
        sx={{
          color: 'text.secondary',
          fontSize: 12,
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
