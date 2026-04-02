import { getSiteHost, SITE_CONFIG } from '@/lib/site';

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const;

type RenderOgPreviewOptions = {
  title: string;
};

function createPreviewTitle(title: string) {
  const normalizedTitle = title.trim();
  return normalizedTitle || SITE_CONFIG.siteName;
}

function getTitleFontSize(title: string) {
  const length = title.length;

  if (length > 88) {
    return 58;
  }

  if (length > 60) {
    return 68;
  }

  if (length > 36) {
    return 80;
  }

  return 92;
}

export function renderOgPreview({ title }: RenderOgPreviewOptions) {
  const siteHost = getSiteHost();
  const previewTitle = createPreviewTitle(title);
  const titleFontSize = getTitleFontSize(previewTitle);
  const activeSegments = Math.min(11, Math.max(4, Math.ceil(previewTitle.length / 8)));
  const segments = Array.from({ length: 12 }, (_, index) => index);

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        background: '#000000',
        padding: '28px',
        color: '#ffffff',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#000000',
          border: '1px solid #222222',
          borderRadius: 16,
          position: 'relative',
          overflow: 'hidden',
          padding: '34px 38px 32px',
        }}
      >
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            inset: 0,
            opacity: 0.18,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.14) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
            backgroundPosition: '8px 8px',
          }}
        />

        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: 28,
            right: 28,
            width: 110,
            height: 110,
            border: '1px solid #333333',
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              width: 12,
              height: 12,
              borderRadius: 999,
              background: '#d71921',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            position: 'absolute',
            left: 38,
            right: 38,
            bottom: 118,
            height: 1,
            background: '#222222',
          }}
        />

        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: 20,
            left: 20,
            width: 18,
            height: 18,
            borderTop: '1px solid #333333',
            borderLeft: '1px solid #333333',
          }}
        />

        <div
          style={{
            display: 'flex',
            position: 'absolute',
            right: 20,
            bottom: 20,
            width: 18,
            height: 18,
            borderRight: '1px solid #333333',
            borderBottom: '1px solid #333333',
          }}
        />

        <div
          style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontSize: 17,
                lineHeight: 1,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#999999',
                fontFamily: 'monospace',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  width: 14,
                  height: 14,
                  border: '1px solid #666666',
                }}
              />
              Article
            </div>

            <div
              style={{
                display: 'flex',
                fontSize: 20,
                lineHeight: 1.3,
                color: '#e8e8e8',
                maxWidth: 420,
              }}
            >
              Monochrome preview for essays, notes, and long-form posts.
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 10,
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              color: '#666666',
              fontSize: 15,
              letterSpacing: '0.12em',
            }}
          >
            <div style={{ display: 'flex' }}>OG / 1200x630</div>
            <div style={{ display: 'flex', color: '#999999' }}>{siteHost}</div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            position: 'relative',
            paddingTop: 26,
            paddingBottom: 34,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              maxWidth: 850,
              gap: 18,
            }}
          >
            <div
              style={{
                display: 'flex',
                fontFamily: 'monospace',
                fontSize: 17,
                lineHeight: 1,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#999999',
              }}
            >
              {siteHost} / blog
            </div>

            <div
              style={{
                display: 'flex',
                fontSize: titleFontSize,
                lineHeight: 0.92,
                letterSpacing: '-0.05em',
                color: '#ffffff',
                fontWeight: 500,
                maxWidth: '100%',
              }}
            >
              {previewTitle}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div
              style={{
                display: 'flex',
                fontFamily: 'monospace',
                fontSize: 15,
                lineHeight: 1,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#666666',
              }}
            >
              Reading Signal
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {segments.map((segment) => (
                <div
                  key={segment}
                  style={{
                    display: 'flex',
                    width: 26,
                    height: 10,
                    background: segment < activeSegments ? '#ffffff' : '#222222',
                  }}
                />
              ))}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 10,
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: 54,
                lineHeight: 0.9,
                letterSpacing: '-0.05em',
                color: '#ffffff',
                fontFamily: 'monospace',
              }}
            >
              01
            </div>
            <div
              style={{
                display: 'flex',
                fontFamily: 'monospace',
                fontSize: 15,
                lineHeight: 1,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#999999',
              }}
            >
              Ibragim Ibragimov
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
