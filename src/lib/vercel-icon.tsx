import { ImageResponse } from 'next/og';

export const VERCEL_ICON_BACKGROUND = '#000000';
export const VERCEL_ICON_FOREGROUND = '#FFFFFF';

export function createVercelIconResponse(size: { width: number; height: number }) {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: VERCEL_ICON_BACKGROUND,
      }}
    >
      <svg
        width={Math.round(size.width * 0.625)}
        height={Math.round(size.height * 0.625)}
        viewBox="0 0 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Vercel icon</title>
        <path d="M160 48L280 256H40L160 48Z" fill={VERCEL_ICON_FOREGROUND} />
      </svg>
    </div>,
    size
  );
}
