import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default function handler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'Ibragim Ibragimov';

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
            backgroundColor: '#e4e4e7', // zinc-200 (light gray)
            fontFamily: 'sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#18181b', // zinc-950 (dark)
              borderRadius: '24px',
              width: '85%',
              height: '85%',
              padding: '40px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
            }}
          >
            {/* Branding top-left */}
            <div
              style={{
                position: 'absolute',
                top: '40px',
                left: '40px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#f97316', // orange-500
                }}
              />
              <span
                style={{
                  fontSize: 20,
                  color: '#a1a1aa', // zinc-400
                  fontWeight: 500,
                }}
              >
                ibragmv.vercel.app
              </span>
            </div>

            {/* Title */}
            <span
              style={{
                fontSize: 64,
                fontWeight: 'bold',
                color: '#ffffff',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                textAlign: 'center',
                maxWidth: '90%',
              }}
            >
              {title}
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, max-age=3600, immutable',
        },
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
