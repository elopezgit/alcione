/**
 * MrCerdo Design System — Tokens
 * 
 * Fuente única de verdad para colores, tipografía, espaciado,
 * sombras y bordes. Todas las variantes (cliente, POS, admin)
 * se derivan de estos tokens base.
 */

export const tokens = {
  /* ─── Paleta Principal ─── */
  color: {
    // Rojo MrCerdo (primary)
    primary: '#A12C25',
    'primary-hover': '#8B231E',
    'primary-light': '#D9381E',
    'primary-bg': 'rgba(161,44,37,0.10)',
    'primary-ring': 'rgba(161,44,37,0.25)',

    // Secundario (ámbar/dorado)
    secondary: '#D97706',
    'secondary-hover': '#B45309',
    'secondary-bg': 'rgba(217,119,6,0.10)',

    // Neutros
    surface: '#FFFFFF',
    'surface-card': '#FFFFFF',
    background: '#FAF8F5',      // marfil claro
    'background-alt': '#F5F0EB', // marfil más intenso
    'text-primary': '#1C1917',   // stone-900
    'text-secondary': '#57534E', // stone-600
    'text-muted': '#A8A29E',     // stone-400
    border: '#E7E5E4',           // stone-200
    'border-light': '#F5F5F4',  // stone-100

    // POS / Admin (fondos oscuros)
    'dark-bg': '#0F172A',        // slate-900
    'dark-surface': '#1E293B',   // slate-800
    'dark-border': '#334155',   // slate-700
    'dark-text': '#F8FAFC',     // slate-50
    'dark-text-muted': '#94A3B8', // slate-400

    // Semántica
    success: '#16A34A',
    'success-bg': '#DCFCE7',
    warning: '#D97706',
    'warning-bg': '#FEF3C7',
    error: '#DC2626',
    'error-bg': '#FEE2E2',
    info: '#2563EB',
    'info-bg': '#DBEAFE',
  },

  /* ─── Tipografía ─── */
  font: {
    sans: "'Outfit', sans-serif",
    display: "'Russo One', sans-serif",
    mono: "'Courier New', monospace",
  },

  /* ─── Tamaños de fuente ─── */
  fontSize: {
    xs: '10px',
    sm: '12px',
    base: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
  },

  /* ─── Espaciado ─── */
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
  },

  /* ─── Bordes ─── */
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    full: '9999px',
  },

  /* ─── Sombras ─── */
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.07)',
    lg: '0 10px 15px rgba(0,0,0,0.10)',
    xl: '0 20px 25px rgba(0,0,0,0.15)',
    primary: '0 4px 14px rgba(161,44,37,0.25)',
  },
} as const;

export type ColorToken = keyof typeof tokens.color;
export type FontToken = keyof typeof tokens.font;
export type RadiusToken = keyof typeof tokens.radius;
export type ShadowToken = keyof typeof tokens.shadow;
