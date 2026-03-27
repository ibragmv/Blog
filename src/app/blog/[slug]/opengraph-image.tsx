import { ImageResponse } from 'next/og';
import { buildDescription } from '@/lib/seo';
import { getPublishedPostBySlug } from '@/lib/server/data';
import { SITE_CONFIG } from '@/lib/site';

export const alt = SITE_CONFIG.siteName;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  const title = post?.title || 'Post not found';
  const description = buildDescription(post?.content);

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        background:
          'radial-gradient(circle at top left, rgba(59,130,246,0.25), transparent 36%), linear-gradient(135deg, #0a0a0a 0%, #111827 50%, #1f2937 100%)',
        color: '#f8fafc',
        padding: '58px 64px',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 24,
            letterSpacing: 2,
            textTransform: 'uppercase',
            opacity: 0.85,
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 9999,
              background: '#38bdf8',
            }}
          />
          {SITE_CONFIG.siteName}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            maxWidth: '88%',
          }}
        >
          <div style={{ fontSize: 68, lineHeight: 1.04, fontWeight: 700 }}>{title}</div>
          <div style={{ fontSize: 30, lineHeight: 1.35, color: '#cbd5e1' }}>{description}</div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 24,
          color: '#94a3b8',
        }}
      >
        <div>/blog/{slug}</div>
        <div>ibragimov.dev</div>
      </div>
    </div>,
    size
  );
}
