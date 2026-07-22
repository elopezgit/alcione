/**
 * Design Tokens — Alcione
 * 
 * Tokens de diseño base. Los valores en tiempo de ejecución
 * provienen de TenantConfig y se aplican mediante CSS custom properties.
 */

import { ALCIONE_CONFIG } from './tenantConfig';

export function generateTokens(config = ALCIONE_CONFIG) {
  return {
    color: {
      primary: config.colors.primary,
      'primary-hover': config.colors['primary-hover'],
      'primary-light': config.colors['primary-light'],
      'primary-bg': config.colors['primary-bg'],
      'primary-ring': config.colors['primary-ring'],
      secondary: config.colors.secondary,
      'secondary-hover': config.colors['secondary-hover'],
      surface: '#FFFFFF',
      'surface-card': '#FFFFFF',
      background: config.colors.background,
      'background-alt': config.colors['background-alt'],
      'text-primary': '#1C1917',
      'text-secondary': '#57534E',
      'text-muted': '#A8A29E',
      border: '#E7E5E4',
      'border-light': '#F5F5F4',
      'dark-bg': '#0F172A',
      'dark-surface': '#1E293B',
      'dark-border': '#334155',
      'dark-text': '#F8FAFC',
      'dark-text-muted': '#94A3B8',
      success: '#16A34A',
      'success-bg': '#DCFCE7',
      warning: '#D97706',
      'warning-bg': '#FEF3C7',
      error: '#DC2626',
      'error-bg': '#FEE2E2',
      info: '#2563EB',
      'info-bg': '#DBEAFE',
    },
    font: {
      sans: config.fonts.sans,
      display: config.fonts.display,
      mono: "'Courier New', monospace",
    },
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
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '24px',
      '2xl': '32px',
      '3xl': '48px',
    },
    radius: {
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '20px',
      '2xl': '24px',
      full: '9999px',
    },
    shadow: {
      sm: '0 1px 2px rgba(0,0,0,0.05)',
      md: '0 4px 6px rgba(0,0,0,0.07)',
      lg: '0 10px 15px rgba(0,0,0,0.10)',
      xl: '0 20px 25px rgba(0,0,0,0.15)',
      primary: `0 4px 14px ${config.colors['primary-ring']}`,
    },
  };
}

export const tokens = generateTokens();

export type ColorToken = keyof typeof tokens.color;
export type FontToken = keyof typeof tokens.font;
export type RadiusToken = keyof typeof tokens.radius;
export type ShadowToken = keyof typeof tokens.shadow;
