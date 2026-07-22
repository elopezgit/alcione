/**
 * tenantConfig.ts — Configuración de Alcione (Deco & Hogar)
 * 
 * Fuente única de verdad para la configuración visual, de catálogo,
 * filtros y datos de contacto de Alcione.
 */

/* ─── Tipos Compartidos ─── */
import { DefaultCategory, DefaultProduct } from './defaultCatalog';
export type { DefaultCategory, DefaultProduct };


export interface Banner {
  id: string;
  image_url: string;
  title?: string;
  subtitle?: string;
  link?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface TenantConfig {
  slug: string;
  name: string;
  tagline: string;
  shortDescription: string;
  logo: string;
  favicon: string;
  primaryColor: string;
  colors: {
    primary: string;
    'primary-hover': string;
    'primary-light': string;
    'primary-bg': string;
    'primary-ring': string;
    secondary: string;
    'secondary-hover': string;
    background: string;
    'background-alt': string;
  };
  fonts: {
    sans: string;
    display: string;
    importUrl: string;
  };
  cartStorageKey: string;
  defaultCategories: DefaultCategory[];
  defaultProducts: DefaultProduct[];
  fallbackBanners: Banner[];
  filterCategories: (cats: any[]) => any[];
  filterProducts: (prods: any[]) => any[];
  categoryColors: Record<string, { from: string; to: string; shadow: string }>;
  categoryKeywordsMap: Record<string, string[]>;
  contact: {
    phone?: string;
    whatsapp?: string;
    whatsappMessage?: string;
    instagram?: string;
    address?: string;
    maps_url?: string;
    hours?: string;
    hours_saturday?: string;
    alias?: string;
    cbu?: string;
  };
  searchPlaceholder: string;
  splash: {
    badge: string;
    tags: string[];
    ctaText: string;
    footerText: string;
  };
}

/* ===================================================================
   ALCIONE — Deco & Hogar
   =================================================================== */
import {
  DEFAULT_CATEGORIES_ALCIONE,
  DEFAULT_PRODUCTS_ALCIONE,
  filterAlcioneCategories,
  filterAlcioneProducts,
} from './defaultCatalog';

const ALCIONE_CATEGORY_COLORS: Record<string, { from: string; to: string; shadow: string }> = {
  'Platos': { from: '#1A5B6B', to: '#2C7A8A', shadow: 'rgba(26,91,107,0.25)' },
  'Vasos & Copas': { from: '#7E5C8A', to: '#9B7EA8', shadow: 'rgba(126,92,138,0.25)' },
  'Cortinas': { from: '#C87D6B', to: '#D99B8A', shadow: 'rgba(200,125,107,0.25)' },
  'Lámparas': { from: '#D4A76A', to: '#E2C08A', shadow: 'rgba(212,167,106,0.25)' },
  'Acolchados': { from: '#4A7C6F', to: '#6B9E8F', shadow: 'rgba(74,124,111,0.25)' },
  'Espejos': { from: '#8A8A8A', to: '#A8A8A8', shadow: 'rgba(138,138,138,0.25)' },
  'Manteles': { from: '#B87B5D', to: '#D49A7A', shadow: 'rgba(184,123,93,0.25)' },
  'Canastos': { from: '#9B7B4E', to: '#B89B6E', shadow: 'rgba(155,123,78,0.25)' },
  'Cuadros': { from: '#5C4A72', to: '#7E6A96', shadow: 'rgba(92,74,114,0.25)' },
};

const ALCIONE_KEYWORDS_MAP: Record<string, string[]> = {
  'Platos': ['Vajilla', 'Juego', 'Plato playo', 'Plato hondo', 'Cerámica'],
  'Vasos & Copas': ['Copa vino', 'Vaso', 'Jarra', 'Cristal', 'Vidrio'],
  'Cortinas': ['Blackout', 'Visillo', 'Panel', 'Enrollar', 'Ondulada'],
  'Lámparas': ['Mesa', 'Techo', 'Pie', 'Velador', 'Led'],
  'Acolchados': ['Matrimonial', 'Queen', 'King', 'Pluma', 'Verano'],
  'Espejos': ['Pared', 'Piso', 'Decorativo', 'Marco dorado', 'Marco blanco'],
  'Manteles': ['Rectangular', 'Redondo', 'Camino', 'Individual', 'Juego'],
  'Canastos': ['Mimbre', 'Organizador', 'Panera', 'Almacenamiento'],
  'Cuadros': ['Lienzo', 'Lámina', 'Set', 'Abstracto', 'Naturaleza'],
  'todas': ['Vajilla', 'Copa', 'Vaso', 'Cortina', 'Lámpara', 'Acolchado', 'Espejo', 'Mantel', 'Canasto', 'Cuadro', 'Decorativo'],
};

const ALCIONE_BANNERS: Banner[] = [
  { id: 'al-b1', image_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80', title: 'COLECCIÓN EXCLUSIVA 2026', subtitle: 'Piezas de diseño y arte interior para espacios extraordinarios' },
  { id: 'al-b2', image_url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80', title: 'CRISTALERÍA & VAJILLA FINA', subtitle: 'La excelencia en cada detalle para tu mesa' },
  { id: 'al-b3', image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80', title: 'TEXTILES & ILUMINACIÓN', subtitle: 'Calidez y sofisticación para dormitorios y salas de estar' },
];

export const ALCIONE_CONFIG: TenantConfig = {
  slug: 'alcione',
  name: 'ALCIONE',
  tagline: 'Deco & Hogar',
  shortDescription: 'Alta decoración e interiorismo contemporáneo. Platos, vasos, cortinas, lámparas, acolchados, espejos, manteles, canastos, cuadros y más.',
  logo: '/img/logo/logoalcione.jpg',
  favicon: '/img/logo/logoalcione.jpg',
  primaryColor: '#1A5B6B',
  colors: {
    primary: '#1A5B6B',
    'primary-hover': '#144A58',
    'primary-light': '#2C8A9E',
    'primary-bg': 'rgba(26,91,107,0.10)',
    'primary-ring': 'rgba(26,91,107,0.25)',
    secondary: '#D4A76A',
    'secondary-hover': '#C49555',
    background: '#FEFCF8',
    'background-alt': '#F8F4EE',
  },
  fonts: {
    sans: "'Inter', sans-serif",
    display: "'Playfair Display', serif",
    importUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400&display=swap",
  },
  cartStorageKey: 'alcione_cart',
  defaultCategories: DEFAULT_CATEGORIES_ALCIONE,
  defaultProducts: DEFAULT_PRODUCTS_ALCIONE,
  fallbackBanners: ALCIONE_BANNERS,
  filterCategories: filterAlcioneCategories,
  filterProducts: filterAlcioneProducts,
  categoryColors: ALCIONE_CATEGORY_COLORS,
  categoryKeywordsMap: ALCIONE_KEYWORDS_MAP,
  contact: {
    whatsapp: 'channel/0029VbBegZHLdQeVlBpsdd1g',
    whatsappMessage: '¡Hola Alcione! Quisiera consultar por productos de decoración.',
    address: 'San Lorenzo 1415 - SMT',
    hours: 'Lunes a viernes 10 a 13 y 17 a 20 hs',
    hours_saturday: 'Sábados 10 a 13 hs',
  },
  searchPlaceholder: 'Buscar platos, vasos, cortinas, lámparas, espejos...',
  splash: {
    badge: 'EXCLUSIVIDAD & DISEÑO INTERIOR',
    tags: ['Vajilla & Mesa Fina', 'Textiles & Cortinas', 'Iluminación de Diseño'],
    ctaText: 'EXPLORAR COLECCIÓN',
    footerText: 'Tocá en cualquier lugar para ingresar a la experiencia',
  },
};

/**
 * Obtiene la configuración de Alcione. 
 * Se mantiene la interfaz getTenantConfig(slug) por compatibilidad 
 * con código existente, pero siempre devuelve Alcione.
 */
export function getTenantConfig(_slug?: string): TenantConfig {
  return ALCIONE_CONFIG;
}

/**
 * Obtiene la lista de slugs disponibles.
 */
export function getActiveTenantSlugs(): string[] {
  return ['alcione'];
}
