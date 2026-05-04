import { ImageResponse } from 'next/og';
import { slugToCity } from '@/lib/destinationSlug';
import { extractPlaceId } from '@/lib/placeSlug';
import { getActivity, firstImageUrl } from '@/lib/server/api';

export const alt = 'Periplo place';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface Props {
  params: { slug: string; place: string };
}

export default async function PlaceOgImage({ params }: Props) {
  const { slug, place } = params;
  const city = slugToCity(slug);
  const placeId = extractPlaceId(place);
  const activity = placeId ? await getActivity(placeId) : null;
  const image = firstImageUrl(activity?.images);
  const name = activity?.name ?? 'Place';

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
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            width={1200}
            height={630}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.5,
            }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(15,23,42,0.25) 0%, rgba(15,23,42,0.9) 100%)',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 26, fontWeight: 600, color: '#FCA5A5' }}>
            Periplo
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 500,
                color: '#FCA5A5',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
              }}
            >
              {city}
            </div>
            <div
              style={{
                fontSize: 80,
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                color: '#fff',
                maxWidth: 1040,
              }}
            >
              {name}
            </div>
          </div>
          <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.75)' }}>periploapp.com</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
