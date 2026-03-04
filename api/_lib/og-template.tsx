import { ImageResponse } from '@vercel/og';

export const defaultAlt = 'Ibragim Ibragimov';
export const defaultSize = {
  width: 1200,
  height: 630,
};
export const defaultContentType = 'image/png';

export function buildOgImage(title: string) {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
          position: 'relative',
        }}
      >
        {/* Top Left Branding */}
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: 60,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              backgroundColor: 'black',
              marginRight: 12,
            }}
          />
          <span
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: 'black',
              fontFamily: 'sans-serif',
            }}
          >
            ibragim.dev
          </span>
        </div>

        {/* Main Content Box */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'black',
            padding: '40px 60px',
          }}
        >
          <span
            style={{
              fontSize: 60,
              fontWeight: 'bold',
              color: 'white',
              fontFamily: 'sans-serif',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </span>
        </div>
      </div>
    ),
    {
      ...defaultSize,
    }
  );
}
