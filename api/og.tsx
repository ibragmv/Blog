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
            backgroundColor: '#18181b', // zinc-950
            color: '#e4e4e7', // zinc-200
            fontFamily: 'sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#27272a', // zinc-800
              borderRadius: '24px',
              padding: '60px 80px',
              boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.5)',
              maxWidth: '80%',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                fontSize: 64,
                fontWeight: 'bold',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
              }}
            >
              {title}
            </span>
            {title !== 'Ibragim Ibragimov' && (
              <span
                style={{
                  fontSize: 24,
                  marginTop: 24,
                  color: '#a1a1aa', // zinc-400
                  fontWeight: 500,
                }}
              >
                ibragmv.vercel.app
              </span>
            )}
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
