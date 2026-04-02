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

  if (length <= 16) {
    return 130;
  }

  if (length <= 28) {
    return 110;
  }

  if (length <= 44) {
    return 88;
  }

  return 72;
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
        padding: '22px',
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
          borderRadius: 18,
          background: '#000000',
          border: '2px solid #f2f2f2',
          position: 'relative',
          overflow: 'hidden',
          padding: '30px 36px',
        }}
      >
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: 34,
            left: 40,
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              display: 'flex',
              width: 16,
              height: 16,
              borderRadius: 9999,
              background: '#d71921',
            }}
          />
          <div
            style={{
              display: 'flex',
              width: 96,
              height: 2,
              background: '#f2f2f2',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: 42,
            right: 40,
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div
              style={{
                display: 'flex',
                width: 92,
                height: 2,
                background: '#d71921',
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            position: 'absolute',
            right: -118,
            bottom: -118,
            width: 260,
            height: 260,
            borderRadius: 9999,
            border: '2px solid #2d2d2d',
          }}
        />

        <div
          style={{
            display: 'flex',
            position: 'absolute',
            left: -84,
            bottom: 82,
            width: 168,
            height: 168,
            borderRadius: 9999,
            border: '2px solid #1f1f1f',
          }}
        />

        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 92px 92px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              maxWidth: 860,
              textAlign: 'center',
              color: '#ffffff',
              fontFamily: 'Doto',
              fontSize: previewTitleSize,
              lineHeight: 0.9,
              letterSpacing: '-0.075em',
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
            position: 'absolute',
            left: 36,
            right: 36,
            bottom: 34,
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div
              style={{
                display: 'flex',
                width: 224,
                height: 2,
                background: '#f2f2f2',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div
              style={{
                display: 'flex',
                width: 52,
                height: 52,
                borderRadius: 9999,
                border: '2px solid #f2f2f2',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  width: 14,
                  height: 14,
                  borderRadius: 9999,
                  background: '#d71921',
                }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                width: 110,
                height: 2,
                background: '#f2f2f2',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
