import { ImageResponse } from 'next/og';

export function createSiteIconResponse(size: { width: number; height: number }) {
  const strokeWidth = Math.max(10, Math.round(size.width * 0.06));
  const logoSize = Math.round(size.width * 0.54);

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #18181b 0%, #09090b 100%)',
      }}
    >
      <svg
        width={logoSize}
        height={logoSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Site icon</title>
        <path
          d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
          stroke="#f97316"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>,
    size
  );
}
