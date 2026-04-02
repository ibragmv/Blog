import type { ImageResponseOptions } from 'next/server';
import { getDotoFontData } from '@/lib/og-fonts';
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

function getPreviewTitleSize(title: string) {
  const length = title.length;

  if (length <= 18) {
    return 118;
  }

  if (length <= 34) {
    return 100;
  }

  if (length <= 52) {
    return 84;
  }

  return 70;
}

export async function getOgImageOptions(): Promise<ImageResponseOptions> {
  return {
    ...OG_IMAGE_SIZE,
    fonts: [
      {
        name: 'Doto',
        data: await getDotoFontData(),
        style: 'normal',
        weight: 400,
      },
    ],
  };
}

export function renderOgPreview({ title }: RenderOgPreviewOptions) {
  const siteHost = getSiteHost();
  const previewTitle = createPreviewTitle(title);
  const previewTitleSize = getPreviewTitleSize(previewTitle);

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        background: '#efede8',
        padding: '28px',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          borderRadius: 24,
          background: '#f6f4ef',
          border: '2px solid #141414',
          position: 'relative',
          overflow: 'hidden',
          padding: '28px 34px',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#5e5a54',
            fontSize: 18,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                display: 'flex',
                width: 12,
                height: 12,
                borderRadius: 9999,
                background: '#d71921',
              }}
            />
            <span>{siteHost}</span>
          </div>
          <span>[ Article ]</span>
        </div>

        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 84px 20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              maxWidth: 940,
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: '#111111',
              fontFamily: 'Doto',
              fontSize: previewTitleSize,
              lineHeight: 0.92,
              letterSpacing: '-0.07em',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {previewTitle}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            width: '100%',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 24,
            borderTop: '2px solid #141414',
            paddingTop: 18,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <span
              style={{
                display: 'flex',
                color: '#5e5a54',
                fontSize: 18,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
              }}
            >
              Nothing Transmission
            </span>
            <span
              style={{
                display: 'flex',
                color: '#141414',
                fontSize: 28,
                letterSpacing: '-0.04em',
              }}
            >
              {SITE_CONFIG.siteName}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              minWidth: 214,
              justifyContent: 'flex-end',
              gap: 10,
            }}
          >
            {Array.from({ length: 6 }, (_, index) => (
              <span
                // eslint-disable-next-line react/no-array-index-key
                key={String(index)}
                style={{
                  display: 'flex',
                  width: 18,
                  height: 18,
                  borderRadius: 9999,
                  border: '2px solid #141414',
                  background: index < 1 ? '#141414' : 'transparent',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
