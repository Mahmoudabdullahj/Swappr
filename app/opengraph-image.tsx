import { ImageResponse } from 'next/og';

export const runtime     = 'edge';
export const alt         = 'Swaparr — Trade What You Have';
export const size        = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div style={{
        background: '#f5f5f7', width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 28,
        fontFamily: 'sans-serif',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{
            background: '#c8e63c', borderRadius: 20, width: 88, height: 88,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, fontWeight: 900, color: '#111',
          }}>SW</div>
          <span style={{ fontSize: 56, fontWeight: 900, color: '#111', letterSpacing: -2 }}>
            Swaparr
          </span>
        </div>
        <p style={{ fontSize: 30, color: '#444', textAlign: 'center', maxWidth: 720, margin: 0, lineHeight: 1.3 }}>
          Trade What You Have. Get What You Need.
        </p>
        <p style={{ fontSize: 20, color: '#888', margin: 0 }}>
          Local barter marketplace · Amman, Jordan
        </p>
      </div>
    ),
    { ...size },
  );
}
