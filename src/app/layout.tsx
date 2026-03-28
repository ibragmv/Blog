import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Layout } from '@/components/layout';
import { ThemeProvider } from '@/components/theme-provider';
import { absoluteUrl } from '@/lib/seo';
import { getSiteUrl, SITE_CONFIG } from '@/lib/site';
import './globals.css';

const themeInitScript = `
(() => {
  try {
    const storageKey = 'blog-theme';
    const storedTheme = localStorage.getItem(storageKey);
    const theme = storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system'
      ? storedTheme
      : 'system';
    const resolvedTheme = theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      : theme;
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolvedTheme);
    document.documentElement.style.colorScheme = resolvedTheme;
  } catch {}
})();
`;

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
    icon: [
      { url: '/icon', type: 'image/png' },
      { url: '/vercel.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon',
    apple: '/icon',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="font-sans">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <ThemeProvider defaultTheme="system" storageKey="blog-theme">
          <Layout currentYear={new Date().getFullYear()}>{children}</Layout>
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
