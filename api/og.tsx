import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default function handler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'Ibragim Ibragimov';
    const date = searchParams.get('date');

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            backgroundColor: '#09090b', // zinc-950
            padding: '40px 80px',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 60,
              fontStyle: 'normal',
              fontWeight: 'bold',
              color: 'white',
              lineHeight: 1.2,
              marginBottom: 20,
              fontFamily: 'sans-serif',
            }}
          >
            {title}
          </div>
          {date && (
            <div
              style={{
                fontSize: 30,
                color: '#a1a1aa', // zinc-400
                fontFamily: 'sans-serif',
              }}
            >
              {date}
            </div>
          )}
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              left: 80,
              fontSize: 24,
              color: '#52525b', // zinc-600
              fontFamily: 'sans-serif',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            ibragim.dev
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
