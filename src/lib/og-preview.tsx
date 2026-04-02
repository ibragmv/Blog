import type { ImageResponseOptions } from 'next/server';
import { getDotoFontData } from '@/lib/og-fonts';
import { SITE_CONFIG } from '@/lib/site';

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
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
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
            <div
              style={{
                display: 'flex',
                width: 72,
                height: 2,
                background: '#2f2f2f',
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              width: 96,
              height: 2,
              background: '#2f2f2f',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 84px 12px',
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
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
            borderTop: '2px solid #343434',
            paddingTop: 18,
          }}
        >
          <div
            style={{
              display: 'flex',
              width: 132,
              height: 2,
              background: '#2f2f2f',
            }}
          />
          <div
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                width: 10,
                height: 10,
                borderRadius: 9999,
                background: '#f5f5f5',
              }}
            />
            <div
              style={{
                display: 'flex',
                width: 54,
                height: 2,
                background: '#2f2f2f',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
