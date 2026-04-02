import type { Metadata, Viewport } from 'next';
import { Doto, Space_Grotesk, Space_Mono } from 'next/font/google';
import { Layout } from '@/components/layout';
import { ThemeProvider } from '@/components/theme-provider';
import { absoluteUrl } from '@/lib/seo';
import { getSiteUrl, SITE_CONFIG } from '@/lib/site';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-space-mono',
  weight: ['400', '700'],
  display: 'swap',
});

const doto = Doto({
  subsets: ['latin'],
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
      </body>
    </html>
  );
}
