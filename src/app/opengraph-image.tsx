import { ImageResponse } from 'next/og';
import { SITE_CONFIG } from '@/lib/site';

export const alt = SITE_CONFIG.siteName;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #020617 0%, #111827 48%, #0f172a 100%)',
        color: '#f8fafc',
        padding: '58px 64px',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          maxWidth: '86%',
        }}
      >
        <div
          style={{ fontSize: 26, letterSpacing: 3, textTransform: 'uppercase', color: '#7dd3fc' }}
        >
          Personal blog
        </div>
        <div style={{ fontSize: 84, lineHeight: 1, fontWeight: 700 }}>{SITE_CONFIG.siteName}</div>
        <div style={{ fontSize: 32, lineHeight: 1.35, color: '#cbd5e1' }}>
          Essays, notes, and a bilingual writing archive powered by Next.js and Convex.
        </div>
      </div>

      <div style={{ display: 'flex', fontSize: 24, color: '#94a3b8' }}>ibragimov.dev</div>
    </div>,
    size
  );
}
