import { ImageResponse } from 'next/og';
import { destinations } from '@/data/destinations';
import { slugToCity } from '@/lib/destinationSlug';

export const alt = 'Periplo destination guide';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface Props {
  params: { slug: string };
}

export default async function ExploreOgImage({ params }: Props) {
  const { slug } = params;
  const dest = destinations.find((d) => d.slug === slug);
  const city = dest?.city ?? slugToCity(slug);
  const country = dest?.country ?? '';
  const heroImage = dest?.heroImage;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          position: 'relative',
          background: '#111827',
          color: '#fff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {heroImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroImage}
            alt=""
            width={1200}
            height={630}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.55,
            }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(17,24,39,0.2) 0%, rgba(17,24,39,0.85) 100%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '72px 80px',
            width: '100%',
            height: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 28, fontWeight: 600, color: '#FCA5A5' }}>
            Periplo
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {country && (
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 500,
                  color: '#FCA5A5',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                }}
              >
                {country}
              </div>
            )}
            <div
              style={{
                fontSize: 96,
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: '-0.02em',
                color: '#fff',
              }}
            >
              {city}
            </div>
            <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.85)', maxWidth: 880 }}>
              AI-powered itinerary, day by day.
            </div>
          </div>
          <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.75)' }}>periploapp.com/explore/{slug}</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
