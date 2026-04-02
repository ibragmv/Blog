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
        background: '#000000',
        padding: '24px',
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
          borderRadius: 22,
          background: '#000000',
          border: '2px solid #2a2a2a',
          position: 'relative',
          overflow: 'hidden',
          padding: '30px 34px',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#b1b1b1',
            fontSize: 20,
            letterSpacing: '0.16em',
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
              color: '#fafafa',
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
            borderTop: '2px solid #343434',
            paddingTop: 20,
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
                color: '#9f9f9f',
                fontSize: 20,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
              }}
            >
              Nothing Transmission
            </span>
            <span
              style={{
                display: 'flex',
                color: '#f3f3f3',
                fontSize: 30,
                letterSpacing: '-0.04em',
              }}
            >
              {SITE_CONFIG.siteName}
            </span>
          </div>
          <span
            style={{
              display: 'flex',
              color: '#9f9f9f',
              fontSize: 20,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            [ Signal ]
          </span>
        </div>
      </div>
    </div>
  );
}
