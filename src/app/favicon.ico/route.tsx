import { ImageResponse } from 'next/og';

const size = {
  width: 48,
  height: 48,
};

export function GET() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000000',
      }}
    >
      <svg
        width="30"
        height="30"
        viewBox="0 0 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Vercel favicon</title>
        <path d="M160 48L280 256H40L160 48Z" fill="#FFFFFF" />
      </svg>
    </div>,
    size
  );
}
