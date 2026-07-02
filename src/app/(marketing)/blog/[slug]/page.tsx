import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { blogPosts } from '@/data/blogPosts';
import { breadcrumbListJsonLd, stringifyJsonLd } from '@/lib/seo/jsonld';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.metaDescription,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      url: `/blog/${slug}`,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      images: [{ url: post.heroImage, width: 800, height: 500 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.metaDescription,
      images: [post.heroImage],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const relatedPosts = post.relatedSlugs
    .map((s) => blogPosts.find((p) => p.slug === s))
    .filter(Boolean);

  const breadcrumbLd = stringifyJsonLd(
    breadcrumbListJsonLd([
      { name: 'Home', url: '/' },
      { name: 'Blog', url: '/blog' },
      { name: post.title, url: `/blog/${slug}` },
    ]),
  );

  return (
    <>
      <Box sx={{ position: 'relative', height: '40vh', minHeight: 280, overflow: 'hidden', bgcolor: 'common.black' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <Box
          component="img"
          src={post.heroImage}
          alt={post.title}
          sx={{ position: 'absolute', inset: 0, height: '100%', width: '100%', objectFit: 'cover', opacity: 0.65 }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.78), rgba(0,0,0,0.15) 55%, transparent 80%)',
          }}
        />
        <Box
          sx={{
            position: 'relative',
            mx: 'auto',
            display: 'flex',
            height: '100%',
            maxWidth: 768,
            flexDirection: 'column',
            justifyContent: 'flex-end',
            px: { xs: 2, sm: 3 },
            pb: 4,
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
            {post.category}
          </Typography>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              mt: 1,
              color: 'common.white',
              textShadow: '0 2px 12px rgba(0,0,0,0.5)',
            }}
          >
            {post.title}
          </Typography>
          <Box
            sx={{
              mt: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              fontSize: 13,
              color: 'rgba(255,255,255,0.82)',
              textShadow: '0 1px 4px rgba(0,0,0,0.5)',
            }}
          >
            <span>{post.author}</span>
            <span>&middot;</span>
            <span>{post.date}</span>
            <span>&middot;</span>
            <span>{post.readTime}</span>
          </Box>
        </Box>
      </Box>

      <Box
        component="article"
        sx={{
          mx: 'auto',
          maxWidth: 768,
          px: { xs: 2, sm: 3 },
          py: 5,
          '& h2': { fontSize: '1.5rem', fontWeight: 700, color: 'text.primary' },
          '& p': { lineHeight: 1.75, color: 'text.primary' },
          '& a': { color: 'primary.main', textDecoration: 'underline' },
        }}
      >
        {post.sections.map((section, i) => (
          <Box component="section" key={i} sx={{ mt: i > 0 ? 5 : 0 }}>
            <Typography component="h2" sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'text.primary' }}>
              {section.heading}
            </Typography>
            <Typography
              sx={{
                mt: 1.5,
                whiteSpace: 'pre-line',
                lineHeight: 1.75,
                color: 'text.primary',
              }}
            >
              {section.content}
            </Typography>
          </Box>
        ))}

        <Box sx={{ mt: 5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {post.tags.map((tag) => (
            <Box
              component="span"
              key={tag}
              sx={{
                borderRadius: 999,
                bgcolor: 'action.hover',
                px: 1.5,
                py: 0.5,
                fontSize: 12,
                fontWeight: 500,
                color: 'text.secondary',
              }}
            >
              {tag}
            </Box>
          ))}
        </Box>

        {relatedPosts.length > 0 && (
          <Box component="section" sx={{ mt: 6, borderTop: '1px solid', borderColor: 'divider', pt: 5 }}>
            <Typography component="h2" sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'text.primary' }}>
              Related Articles
            </Typography>
            <Box
              sx={{
                mt: 3,
                display: 'grid',
                gap: 3,
                gridTemplateColumns: { sm: 'repeat(2, 1fr)' },
              }}
            >
              {relatedPosts.map((rp) =>
                rp ? (
                  <Box
                    component={Link}
                    key={rp.slug}
                    href={`/blog/${rp.slug}`}
                    className="group"
                    sx={{ textDecoration: 'none' }}
                  >
                    <Box
                      sx={{
                        aspectRatio: '16/10',
                        overflow: 'hidden',
                        borderRadius: 1.5,
                        bgcolor: 'action.hover',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <Box
                        component="img"
                        src={rp.heroImage}
                        alt={rp.title}
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
                    <Typography
                      sx={{
                        mt: 1,
                        fontWeight: 500,
                        color: 'text.primary',
                        transition: 'color 200ms',
                        '.group:hover &': { color: 'primary.dark' },
                      }}
                    >
                      {rp.title}
                    </Typography>
                    <Typography sx={{ mt: 0.5, fontSize: 12, color: 'text.secondary' }}>{rp.readTime}</Typography>
                  </Box>
                ) : null,
              )}
            </Box>
          </Box>
        )}
      </Box>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.metaDescription,
            image: post.heroImage,
            datePublished: post.date,
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `https://periploapp.com/blog/${slug}`,
            },
            author: {
              '@type': 'Organization',
              name: post.author,
            },
            publisher: {
              '@type': 'Organization',
              name: 'Periplo',
              url: 'https://periploapp.com',
              logo: {
                '@type': 'ImageObject',
                url: 'https://periploapp.com/favicon-512x512.png',
              },
            },
          }),
        }}
      />
      {breadcrumbLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: breadcrumbLd }}
        />
      )}
    </>
  );
}
