import type { MetadataRoute } from 'next';
import { RSS_ICON_PATH } from '@/lib/rss';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ibragim Ibragimov',
    short_name: 'Ibragim',
    description: 'Personal blog and notes by Ibragim Ibragimov.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#09090b',
    icons: [
      {
        src: RSS_ICON_PATH,
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/vercel.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
