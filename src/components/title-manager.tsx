import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@/components/theme-provider';
import { SITE_CONFIG } from '@/config';

const ROUTES_TITLES: Record<string, string> = {
  '/': 'Home',
  '/blog': 'Blog',
  '/links': 'Links',
  '/login': 'Login',
  '/admin': 'Admin',
  '/admin/new': 'New Post',
};

export function TitleManager() {
  const location = useLocation();
  const { theme } = useTheme();

  useEffect(() => {
    const updateFavicon = async () => {
      const linkId = 'dynamic-favicon';
      let link = document.getElementById(linkId) as HTMLLinkElement;

      if (!link) {
        link = document.createElement('link');
        link.id = linkId;
        link.rel = 'icon';
        document.head.appendChild(link);
      }

      if (SITE_CONFIG.logo) {
        try {
          // Fetch the SVG content
          const response = await fetch(SITE_CONFIG.logo);
          let svgContent = await response.text();

          // Determine color based on theme
          // Note: 'system' theme resolution is handled by the ThemeProvider,
          // but here we might need to check system preference if theme is 'system'
          let color = '#18181b'; // zinc-900 (dark)

          const isDark =
            theme === 'dark' ||
            (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

          if (isDark) {
            color = '#f4f4f5'; // zinc-100 (light)
          }

          // Replace currentColor or stroke/fill with the calculated color
          // This is a simple replacement; for complex SVGs this might need refinement
          if (svgContent.includes('currentColor')) {
            svgContent = svgContent.replace(/currentColor/g, color);
          } else {
            // If no currentColor, try to inject fill/stroke style
            // This assumes a simple icon
            svgContent = svgContent.replace(
              '<svg',
              `<svg style="fill: ${color}; stroke: ${color};"`
            );
          }

          // Encode as data URI
          const encodedSvg = encodeURIComponent(svgContent);
          link.href = `data:image/svg+xml,${encodedSvg}`;
          link.type = 'image/svg+xml';
        } catch (e) {
          console.error('Failed to load or process logo SVG:', e);
          // Fallback to direct link
          link.href = SITE_CONFIG.logo;
        }
      }
    };

    updateFavicon();
  }, [theme]);

  useEffect(() => {
    // Set the Page Title
    let pageTitle = ROUTES_TITLES[location.pathname];

    if (!pageTitle) {
      if (location.pathname.startsWith('/blog/')) {
        return;
      } else if (location.pathname.startsWith('/admin/edit/')) {
        pageTitle = 'Edit Post';
      }
    }

    if (pageTitle) {
      document.title = `${pageTitle} ${SITE_CONFIG.titleSeparator} ${SITE_CONFIG.title}`;
    } else if (location.pathname === '/') {
      document.title = SITE_CONFIG.title;
    }
  }, [location]);

  return null;
}
