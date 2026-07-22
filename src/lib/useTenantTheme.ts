/**
 * useTenantTheme — Aplica dinámicamente el tema visual del tenant
 * 
 * Inyecta:
 *  - Los estilos de Google Fonts correspondientes
 *  - Las CSS custom properties en :root para que Tailwind v4 las use
 *  - El favicon
 *  - Los meta tags del <title> y <description>
 * 
 * Se llama desde ClientHome.tsx cuando se carga la config del tenant.
 */

import { useEffect } from 'react';
import { TenantConfig } from './tenantConfig';

let styleEl: HTMLStyleElement | null = null;
let fontLinkEl: HTMLLinkElement | null = null;

export function useTenantTheme(config: TenantConfig | null) {
  useEffect(() => {
    if (!config) return;

    // ─── 1. Google Fonts ───
    if (fontLinkEl) {
      fontLinkEl.remove();
      fontLinkEl = null;
    }
    fontLinkEl = document.createElement('link');
    fontLinkEl.rel = 'stylesheet';
    fontLinkEl.href = config.fonts.importUrl;
    document.head.appendChild(fontLinkEl);

    // ─── 2. CSS Variables ───
    if (styleEl) {
      styleEl.remove();
      styleEl = null;
    }
    styleEl = document.createElement('style');
    styleEl.id = 'tenant-theme-vars';
    styleEl.textContent = `
      :root {
        --color-primary: ${config.colors.primary};
        --color-primary-hover: ${config.colors['primary-hover']};
        --color-secondary: ${config.colors.secondary};
        --color-secondary-hover: ${config.colors['secondary-hover']};
        --bg-color: ${config.colors.background};
        --bg-alt: ${config.colors['background-alt']};
        --font-sans: ${config.fonts.sans};
        --font-display: ${config.fonts.display};
      }
    `;
    document.head.appendChild(styleEl);

    // ─── 3. Favicon ───
    const existingFavicon = document.querySelector('link[rel="icon"]');
    if (existingFavicon) {
      existingFavicon.setAttribute('href', config.favicon);
    }
    const existingAppleIcon = document.querySelector('link[rel="apple-touch-icon"]');
    if (existingAppleIcon) {
      existingAppleIcon.setAttribute('href', config.favicon);
    }

    // ─── 4. Title & Meta ───
    document.title = `${config.name} | ${config.tagline}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', config.shortDescription);
    }

    // Cleanup on unmount or config change
    return () => {
      if (styleEl && styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
      if (fontLinkEl && fontLinkEl.parentNode) fontLinkEl.parentNode.removeChild(fontLinkEl);
    };
  }, [config]);
}
