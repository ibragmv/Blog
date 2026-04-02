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

export function renderOgPreview({ title }: RenderOgPreviewOptions) {
  const siteHost = getSiteHost();
  const previewTitle = createPreviewTitle(title);

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        background: '#f1f5f9',
        padding: '34px',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          borderRadius: 18,
          background: '#ffffff',
          border: '2px solid #e4e4e7',
          position: 'relative',
          overflow: 'hidden',
          padding: '26px 30px',
        }}
      >
        <div style={{ display: 'flex', width: '100%', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 22, color: '#111827' }}>
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
              width: 88,
              height: 88,
              position: 'absolute',
              top: 22,
              right: 22,
              borderRadius: 18,
              background: '#d4d4d8',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                width: 34,
                height: 34,
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
                  height: 16,
                  background: '#f8fafc',
                  position: 'absolute',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  width: 16,
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
              padding: '36px 64px 12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                maxWidth: '100%',
                background: '#000000',
                color: '#ffffff',
                fontSize: 52,
                lineHeight: 1.08,
                padding: '24px 38px',
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
  );
}
