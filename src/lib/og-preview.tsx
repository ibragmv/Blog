import { getSiteHost, getSiteUrl, SITE_CONFIG } from '@/lib/site';

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const;

type RenderOgPreviewOptions = {
  title: string;
  path: string;
};

function createPreviewTitle(title: string) {
  const normalizedTitle = title.trim();
  return normalizedTitle || SITE_CONFIG.siteName;
}

export function renderOgPreview({ title, path }: RenderOgPreviewOptions) {
  const siteHost = getSiteHost();
  const previewTitle = createPreviewTitle(title);
  const absolutePreviewUrl = new URL(path, getSiteUrl()).toString();

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        background: '#1e293b',
        color: '#f8fafc',
        padding: '28px 32px 34px',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', fontSize: 24, color: '#60a5fa', marginBottom: 18 }}>
        {absolutePreviewUrl}
      </div>

      <div
        style={{
          display: 'flex',
          flex: 1,
          borderRadius: 24,
          border: '6px solid #9dd77b',
          background: '#2c3c40',
          padding: '20px 18px 18px',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, color: '#9dd77b' }}>
            {SITE_CONFIG.siteName}
          </div>
          <div style={{ display: 'flex', fontSize: 26, color: '#f1f5f9' }}>{previewTitle}</div>
        </div>

        <div
          style={{
            display: 'flex',
            flex: 1,
            borderRadius: 10,
            background: '#f8fafc',
            padding: '28px 34px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', width: '100%', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: 18, color: '#111827' }}>
              <div
                style={{
                  display: 'flex',
                  width: 16,
                  height: 16,
                  background: '#020617',
                  marginRight: 12,
                }}
              />
              {siteHost}
            </div>

            <div
              style={{
                display: 'flex',
                width: 92,
                height: 92,
                position: 'absolute',
                top: 18,
                right: 18,
                borderRadius: 18,
                background: '#d4d4d8',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  width: 36,
                  height: 36,
                  borderRadius: 9999,
                  border: '4px solid #f8fafc',
                  position: 'relative',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    width: 4,
                    height: 18,
                    background: '#f8fafc',
                    position: 'absolute',
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    width: 18,
                    height: 4,
                    background: '#f8fafc',
                    position: 'absolute',
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px 48px 18px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  maxWidth: '100%',
                  background: '#000000',
                  color: '#ffffff',
                  fontSize: 46,
                  lineHeight: 1.12,
                  padding: '24px 34px',
                  textAlign: 'center',
                  whiteSpace: 'pre-wrap',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {previewTitle}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
