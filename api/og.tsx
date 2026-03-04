import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default function handler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'Build. Ship. Iterate.';

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
              github.com/ibragmv
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
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}

