import { useEffect } from 'react';
import { SITE_CONFIG } from '@/config';

export function FontLoader() {
  useEffect(() => {
    const fontName = SITE_CONFIG.displayFont;
    if (!fontName) return;

    const linkId = 'dynamic-font-link';
    const styleId = 'dynamic-font-style';

    // Remove existing elements if they exist (useful for updates)
    document.getElementById(linkId)?.remove();
    document.getElementById(styleId)?.remove();

    // 1. Load the font from Google Fonts
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    // Replace spaces with + for the URL
    const fontUrlName = fontName.replace(/\s+/g, '+');
    // Request multiple weights to ensure bold/regular work
    link.href = `https://fonts.googleapis.com/css2?family=${fontUrlName}:wght@400;500;600;700;800;900&display=swap`;
    document.head.appendChild(link);

    // 2. Update the CSS variable to use the new font
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      :root {
        --font-display: "${fontName}", sans-serif;
      }
    `;
    document.head.appendChild(style);

    // Cleanup function
    return () => {
      // We generally don't want to remove the font on unmount as it might cause flash,
      // but strictly speaking we could. For now, we leave it.
    };
  }, []);

  return null;
}
