import type { Metadata } from 'next';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { blogPosts } from '@/data/blogPosts';
import { Photo } from '@/components/ui/Photo';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'Blog — Travel Guides & Tips',
  description:
    'Read our travel guides, destination tips, and planning advice to make the most of your next trip.',
};

export default function BlogListPage() {
  const [hero, ...rest] = blogPosts;

  return (
    <Box sx={{ mx: 'auto', maxWidth: 1280, px: { xs: 2, sm: 3 }, py: 7 }}>
      <Box component="header">
        <Badge tone="accent" size="md">Travel guides</Badge>
        <Typography
          component="h1"
          sx={{
            mt: 2,
            fontFamily: 'var(--font-display, inherit)',
            fontSize: '3rem',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'text.primary',
          }}
        >
          The blog
        </Typography>
        <Typography
          sx={{
            mt: 1.5,
            maxWidth: 672,
            fontSize: 17,
            lineHeight: 1.6,
            color: 'text.secondary',
          }}
        >
          Guides, tips, and inspiration for your next adventure.
        </Typography>
      </Box>

      {hero ? (
        <Box
          component={Link}
          href={`/blog/${hero.slug}`}
          className="group"
          sx={{
            mt: 6,
            display: 'grid',
            gap: 4,
            overflow: 'hidden',
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            gridTemplateColumns: { md: 'repeat(2, 1fr)' },
            textDecoration: 'none',
          }}
        >
          <Photo src={hero.heroImage} alt={hero.title} aspect="3/2" zoomOnHover sizes="(max-width: 768px) 100vw, 50vw" />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              p: { xs: 4, md: 5 },
            }}
          >
            <Box>
              <Badge tone="accent" size="sm">{hero.category}</Badge>
            </Box>
            <Typography
              component="h2"
              sx={{
                mt: 1.5,
                fontFamily: 'var(--font-display, inherit)',
                fontSize: '1.875rem',
                fontWeight: 600,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                color: 'text.primary',
                transition: 'color 200ms',
                '.group:hover &': { color: 'primary.main' },
              }}
            >
              {hero.title}
            </Typography>
            <Typography
              sx={{
                mt: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                fontSize: 15,
                lineHeight: 1.6,
                color: 'text.secondary',
              }}
            >
              {hero.excerpt}
            </Typography>
            <Typography sx={{ mt: 2, fontSize: 12, color: 'text.disabled' }}>
              {hero.date} · {hero.readTime}
            </Typography>
          </Box>
        </Box>
      ) : null}

      <Box
        sx={{
          mt: 6,
          display: 'grid',
          gap: 4,
          gridTemplateColumns: { md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
        }}
      >
        {rest.map((post) => (
          <Box
            component={Link}
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group"
            sx={{ textDecoration: 'none', display: 'block' }}
          >
            <Photo
              src={post.heroImage}
              alt={post.title}
              aspect="16/10"
              rounded="lg"
              zoomOnHover
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 12, color: 'text.disabled' }}>
                <Badge tone="accent" size="sm">{post.category}</Badge>
                <span>{post.date}</span>
                <span>·</span>
                <span>{post.readTime}</span>
              </Box>
              <Typography
                component="h2"
                sx={{
                  mt: 1,
                  fontFamily: 'var(--font-display, inherit)',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  lineHeight: 1.35,
                  color: 'text.primary',
                  transition: 'color 200ms',
                  '.group:hover &': { color: 'primary.main' },
                }}
              >
                {post.title}
              </Typography>
              <Typography
                sx={{
                  mt: 0.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  fontSize: 14,
                  color: 'text.secondary',
                }}
              >
                {post.excerpt}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
