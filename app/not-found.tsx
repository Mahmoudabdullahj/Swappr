import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 24,
      background: 'var(--bg-base, #f5f5f7)', fontFamily: 'var(--font-display, sans-serif)',
      padding: '0 24px', textAlign: 'center',
    }}>
      <div style={{
        background: '#c8e63c', borderRadius: 20, width: 72, height: 72,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, fontWeight: 900, color: '#111',
      }}>
        SW
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h1 style={{ margin: 0, fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, color: '#111', letterSpacing: -1 }}>
          Page not found
        </h1>
        <p style={{ margin: 0, fontSize: 17, color: '#666', maxWidth: 380, lineHeight: 1.5 }}>
          This listing may have been removed, or the link might be wrong.
        </p>
      </div>

      <Link href="/" style={{
        display: 'inline-block', background: '#111', color: '#fff',
        padding: '12px 28px', borderRadius: 100, fontWeight: 700,
        fontSize: 15, textDecoration: 'none', letterSpacing: -0.3,
      }}>
        Back to Baddel
      </Link>
    </div>
  );
}
