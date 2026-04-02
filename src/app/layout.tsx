import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Layout } from '@/components/layout';
import { ThemeProvider } from '@/components/theme-provider';
import { absoluteUrl } from '@/lib/seo';
import { getSiteUrl, SITE_CONFIG } from '@/lib/site';
import './globals.css';

const spaceGrotesk = localFont({
  src: [
    {
      path: '../../fonts/space-grotesk/static/SpaceGrotesk-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../fonts/space-grotesk/static/SpaceGrotesk-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../fonts/space-grotesk/static/SpaceGrotesk-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../fonts/space-grotesk/static/SpaceGrotesk-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../fonts/space-grotesk/static/SpaceGrotesk-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const spaceMono = localFont({
  src: [
    {
      path: '../../fonts/space-mono/SpaceMono-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../fonts/space-mono/SpaceMono-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-space-mono',
  display: 'swap',
});

const doto = localFont({
  src: [
    {
      path: '../../fonts/doto/static/Doto-Thin.ttf',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../../fonts/doto/static/Doto-ExtraLight.ttf',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../../fonts/doto/static/Doto-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../fonts/doto/static/Doto-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../fonts/doto/static/Doto-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../fonts/doto/static/Doto-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../fonts/doto/static/Doto-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../fonts/doto/static/Doto-ExtraBold.ttf',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../../fonts/doto/static/Doto-Black.ttf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-doto',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_CONFIG.title,
    template: `%s ${SITE_CONFIG.titleSeparator} ${SITE_CONFIG.title}`,
  },
  description: SITE_CONFIG.description,
  applicationName: SITE_CONFIG.siteName,
  authors: [{ name: SITE_CONFIG.author }],
  alternates: {
    canonical: absoluteUrl('/'),
  },
  openGraph: {
    type: 'website',
    locale: SITE_CONFIG.locale,
    siteName: SITE_CONFIG.siteName,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    url: absoluteUrl('/'),
    images: [
      {
        url: absoluteUrl('/opengraph-image'),
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.siteName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    creator: SITE_CONFIG.socialHandle,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [absoluteUrl('/opengraph-image')],
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5f5' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${spaceGrotesk.variable} ${spaceMono.variable} ${doto.variable}`}
    >
      <body className="font-sans">
        <ThemeProvider defaultTheme="system" storageKey="blog-theme">
          <Layout currentYear={new Date().getFullYear()}>{children}</Layout>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
