import { ImageResponse } from 'next/og';

export const alt = 'Periplo — AI Travel Planner';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: 'linear-gradient(135deg, #C4603A 0%, #9b1d3a 100%)',
          color: '#fff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 32, fontWeight: 600 }}>
          Periplo
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              maxWidth: 920,
            }}
          >
            AI Travel Planner — itineraries built around what you love.
          </div>
          <div style={{ fontSize: 28, opacity: 0.9, maxWidth: 920 }}>
            Day-by-day plans, smart activity search, real-time collaboration.
          </div>
        </div>
        <div style={{ fontSize: 22, opacity: 0.85 }}>periploapp.com</div>
      </div>
    ),
    { ...size },
  );
}
