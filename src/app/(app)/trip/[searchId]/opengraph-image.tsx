import { ImageResponse } from 'next/og';
import { getTrip, firstImageUrl } from '@/lib/server/api';

export const alt = 'Periplo trip itinerary';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface Props {
  params: { searchId: string };
}

export default async function TripOgImage({ params }: Props) {
  const { searchId } = params;
  const trip = await getTrip(searchId);
  const destination = trip?.destination ?? 'Your trip';
  const dayCount = trip?.travel_plan?.length ?? 0;
  const heroImage = trip?.activities?.length ? firstImageUrl(trip.activities[0].images as never) : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          position: 'relative',
          background: '#0f172a',
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
              opacity: 0.45,
            }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, rgba(196,96,58,0.55) 0%, rgba(15,23,42,0.85) 70%)',
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {dayCount > 0 && (
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 500,
                  color: '#FCA5A5',
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                }}
              >
                {dayCount}-day itinerary
              </div>
            )}
            <div
              style={{
                fontSize: 96,
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                color: '#fff',
              }}
            >
              {destination}
            </div>
            <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.85)', maxWidth: 920 }}>
              Day-by-day plan, built with AI.
            </div>
          </div>
          <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.75)' }}>periploapp.com</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
