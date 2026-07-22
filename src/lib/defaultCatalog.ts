/**
 * defaultCatalog.ts — Catálogo Default de Alcione
 * 
 * Define las categorías y productos de respaldo (fallback) que se
 * muestran cuando no hay datos en Supabase, y las funciones de
 * filtrado para el catálogo de decoración del hogar.
 */

export interface DefaultCategory {
  id: string;
  name: string;
  icon?: string;
  image_url?: string;
  description?: string;
}

export interface DefaultProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url: string;
  code: string;
  sort_order: number;
  is_active: boolean;
  badge?: string;
  profile?: string[];
  [key: string]: any;
}

// ===================================================================
// ALCIONE — Deco & Hogar (Catálogo Default VIP Luxury)
// ===================================================================

export const DEFAULT_CATEGORIES_ALCIONE: DefaultCategory[] = [
  {
    id: 'cat-platos-alcione',
    name: 'Platos',
    icon: '',
    image_url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80',
    description: 'Vajilla completa, platos llanos, hondos y porcelana fina de alta resistencia.'
  },
  {
    id: 'cat-vasos-alcione',
    name: 'Vasos & Copas',
    icon: '',
    image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
    description: 'Copas de cristal para vino, champagne, cristalería de diseño y vasos artesanales.'
  },
  {
    id: 'cat-cortinas-alcione',
    name: 'Cortinas',
    icon: '',
    image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    description: 'Paneles blackout, visillos de lino natural y textiles arquitectónicos.'
  },
  {
    id: 'cat-lamparas-alcione',
    name: 'Lámparas',
    icon: '',
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    description: 'Iluminación contemporánea, lámparas de pie, mesa y colgantes de diseño.'
  },
  {
    id: 'cat-acolchados-alcione',
    name: 'Acolchados',
    icon: '',
    image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
    description: 'Edredones, plumones king & queen y textiles premium para dormitorios.'
  },
  {
    id: 'cat-espejos-alcione',
    name: 'Espejos',
    icon: '',
    image_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    description: 'Espejos decorativos de pared y cuerpo entero con marcos finos dorados y negros.'
  },
  {
    id: 'cat-manteles-alcione',
    name: 'Manteles',
    icon: '',
    image_url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80',
    description: 'Manteles de lino y algodón, caminos de mesa y textil de alta costura para mesa.'
  },
  {
    id: 'cat-canastos-alcione',
    name: 'Canastos',
    icon: '',
    image_url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80',
    description: 'Cestas organizadoras artesanales de fibras naturales y mimbre selecto.'
  },
  {
    id: 'cat-cuadros-alcione',
    name: 'Cuadros',
    icon: '',
    image_url: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80',
    description: 'Obras de arte, láminas botánicas y series abstractas enmarcadas para galería interior.'
  },
];

export const DEFAULT_PRODUCTS_ALCIONE: DefaultProduct[] = [
  // ─── PLATOS ───
  {
    id: 'alc-pl-001',
    category_id: 'cat-platos-alcione',
    name: 'Juego de Platos Cerámica Blanca',
    description: 'Set de 12 piezas de porcelana y cerámica esmaltada de alta durabilidad. Terminación brillante y tacto seda.',
    price: 12500,
    image_url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80',
    code: 'PL-001',
    sort_order: 1,
    is_active: true,
    badge: 'COLECCIÓN 12 PZS',
    profile: ['Cerámica fina', 'Esmaltado', 'Blanco puro'],
  },
  {
    id: 'alc-pl-002',
    category_id: 'cat-platos-alcione',
    name: 'Plato Playo Porcelana Floral',
    description: 'Plato playo decorativo de porcelana con motivos botánicos ilustrados a mano y filete dorado sutil.',
    price: 3500,
    image_url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    code: 'PL-002',
    sort_order: 2,
    is_active: true,
    badge: 'EDICIÓN ESPECIAL',
    profile: ['Porcelana', 'Motivo botánico', 'Pintado a mano'],
  },
  // ─── VASOS & COPAS ───
  {
    id: 'alc-va-001',
    category_id: 'cat-vasos-alcione',
    name: 'Juego de Copas de Cristal de Bohemia',
    description: 'Set de 6 copas para vino tinto elaboradas en cristal transparente de alta sonoridad y brillo impecable.',
    price: 9800,
    image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
    code: 'VA-001',
    sort_order: 10,
    is_active: true,
    badge: 'CRISTAL x6',
    profile: ['Cristal labrado', 'Sonoridad premium', '660 ml'],
  },
  {
    id: 'alc-va-002',
    category_id: 'cat-vasos-alcione',
    name: 'Vaso de Vidrio Soplado Artesanal',
    description: 'Pieza única elaborada mediante técnica de vidrio soplado tradicional. Textura orgánica y peso equilibrado.',
    price: 4200,
    image_url: '/img/Catalogo/alcione/vaso-artesanal.jpg',
    code: 'VA-002',
    sort_order: 11,
    is_active: true,
    badge: 'ARTESANAL',
    profile: ['Vidrio soplado', 'Pieza única', '350 ml'],
  },
  // ─── CORTINAS ───
  {
    id: 'alc-co-001',
    category_id: 'cat-cortinas-alcione',
    name: 'Panel Blackout Texturado Premium',
    description: 'Cortina de aislamiento lumínico y térmico con textura tipo lino pesado en tono gris perla. 250x200 cm.',
    price: 15000,
    image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    code: 'CO-001',
    sort_order: 20,
    is_active: true,
    badge: 'BLACKOUT TOTAL',
    profile: ['Aislante térmico', 'Caída pesada', '250x200 cm'],
  },
  {
    id: 'alc-co-002',
    category_id: 'cat-cortinas-alcione',
    name: 'Visillo de Lino Natural Translúcido',
    description: 'Textil ligero en lino orgánico color marfil. Filtra la luz solar aportando calidez e intimidad arquitectónica.',
    price: 6800,
    image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80',
    code: 'CO-002',
    sort_order: 21,
    is_active: true,
    badge: 'LINO NATURAL',
    profile: ['Lino orgánico', 'Translúcido', '150x200 cm'],
  },
  // ─── LÁMPARAS ───
  {
    id: 'alc-la-001',
    category_id: 'cat-lamparas-alcione',
    name: 'Lámpara de Mesa Base Cerámica & Lino',
    description: 'Lámpara escultórica con base de cerámica mate artesanal y pantalla cilíndrica en lino natural. Iluminación cálida.',
    price: 18500,
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    code: 'LA-001',
    sort_order: 30,
    is_active: true,
    badge: 'DISEÑO DE AUTOR',
    profile: ['Cerámica mate', 'Pantalla de lino', 'Luz cálida LED'],
  },
  {
    id: 'alc-la-002',
    category_id: 'cat-lamparas-alcione',
    name: 'Velador Arquitectónico en Latón Dorado',
    description: 'Luminaria de escritorio minimalista en latón cepillado con brazo orientable. Elegancia atemporal para estudios y mesas de luz.',
    price: 22000,
    image_url: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=800&q=80',
    code: 'LA-002',
    sort_order: 31,
    is_active: true,
    badge: 'LATÓN DORADO',
    profile: ['Latón cepillado', 'Minimalista', '55 cm'],
  },
  // ─── ACOLCHADOS ───
  {
    id: 'alc-ac-001',
    category_id: 'cat-acolchados-alcione',
    name: 'Plumón King Size en Algodón Percal 400 Hilos',
    description: 'Edredón de máxima suavidad relleno con fibras de plumón sintético hipoalergénico de alta densidad. Tacto hotel 5 estrellas.',
    price: 32000,
    image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
    code: 'AC-001',
    sort_order: 40,
    is_active: true,
    badge: 'HOTEL LUXURY',
    profile: ['Percal 400 hilos', 'Plumón hipoalergénico', 'King Size'],
  },
  {
    id: 'alc-ac-002',
    category_id: 'cat-acolchados-alcione',
    name: 'Cover de Verano en Algodón Waffle',
    description: 'Cubrecama ligero con textura waffle en algodón peinado natural. Frescura y prestancia visual para media estación.',
    price: 18500,
    image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
    code: 'AC-002',
    sort_order: 41,
    is_active: true,
    badge: 'TEXTURA WAFFLE',
    profile: ['Algodón peinado', 'Transpirable', 'Queen Size'],
  },
  // ─── ESPEJOS ───
  {
    id: 'alc-es-001',
    category_id: 'cat-espejos-alcione',
    name: 'Espejo de Pared Clásico Marco Dorado Envejecido',
    description: 'Espejo biselado de gran formato con marco tallado estilo imperial en dorado antiguo. Pieza central para recibidores o salas.',
    price: 28000,
    image_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    code: 'ES-001',
    sort_order: 50,
    is_active: true,
    badge: 'PIEZA CENTRAL',
    profile: ['Marco tallado', 'Cristal biselado', '80x120 cm'],
  },
  {
    id: 'alc-es-002',
    category_id: 'cat-espejos-alcione',
    name: 'Espejo Redondo Minimalista de Pie o Pared',
    description: 'Espejo de 60 cm con marco ultra delgado en aluminio anodizado negro mate. Geometría perfecta y claridad óptica.',
    price: 15500,
    image_url: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80',
    code: 'ES-002',
    sort_order: 51,
    is_active: true,
    badge: 'MINIMALISTA',
    profile: ['Aluminio negro mate', 'Claridad HD', 'Diámetro 60 cm'],
  },
  // ─── MANTELES ───
  {
    id: 'alc-ma-001',
    category_id: 'cat-manteles-alcione',
    name: 'Mantel de Lino & Algodón Natural 250x150',
    description: 'Mantel de confección artesanal en mezcla de lino europeo y algodón orgánico. Caída noble y resistencia al lavado.',
    price: 9500,
    image_url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80',
    code: 'MA-001',
    sort_order: 60,
    is_active: true,
    badge: 'LINO EUROPEO',
    profile: ['Mezcla lino-algodón', '250x150 cm', 'Color crudo'],
  },
  {
    id: 'alc-ma-002',
    category_id: 'cat-manteles-alcione',
    name: 'Camino de Mesa Bordado a Mano sobre Lino',
    description: 'Camino de mesa artesanal con delicados bordados en hilos de seda mate sobre base de lino crudo. 40x180 cm.',
    price: 5800,
    image_url: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80',
    code: 'MA-002',
    sort_order: 61,
    is_active: true,
    badge: 'ALTA COSTURA',
    profile: ['Bordado artesanal', 'Base lino', '40x180 cm'],
  },
  // ─── CANASTOS ───
  {
    id: 'alc-ca-001',
    category_id: 'cat-canastos-alcione',
    name: 'Set de Cestas de Mimbre & Fibras Naturales',
    description: 'Cestas organizadoras tejidas con fibras de seagrass y mimbre seleccionado. Aportan calidez orgánica y funcionalidad impecable.',
    price: 7500,
    image_url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80',
    code: 'CA-001',
    sort_order: 70,
    is_active: true,
    badge: 'FIBRAS NATURALES',
    profile: ['Tejido artesanal', 'Seagrass orgánico', 'Estructura firme'],
  },
  {
    id: 'alc-ca-002',
    category_id: 'cat-canastos-alcione',
    name: 'Cesto Arquitectónico de Almacenamiento Tejido',
    description: 'Cesto de gran capacidad con asas laterales en cuero natural. Perfecto para mantas, almohadones en salas de estar o dormitorios.',
    price: 4200,
    image_url: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80',
    code: 'CA-002',
    sort_order: 71,
    is_active: true,
    badge: 'ASAS DE CUERO',
    profile: ['Yute trenzado', 'Asas cuero genuino', 'Diámetro 40 cm'],
  },
  // ─── CUADROS ───
  {
    id: 'alc-cu-001',
    category_id: 'cat-cuadros-alcione',
    name: 'Díptico de Arte Abstracto en Lienzo Texturado',
    description: 'Par de lienzos con texturas acrílicas en paleta de tonos arena, terracota y blanco roto. Bastidor de madera de galería.',
    price: 16500,
    image_url: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80',
    code: 'CU-001',
    sort_order: 80,
    is_active: true,
    badge: 'SERIE DÍPTICO',
    profile: ['Lienzo texturado', 'Bastidor galería', '2 x 50x70 cm'],
  },
  {
    id: 'alc-cu-002',
    category_id: 'cat-cuadros-alcione',
    name: 'Lámina Botánica Ilustrada con Marco de Roble',
    description: 'Impresión Giclée sobre papel de algodón 310 gr con ilustración botánica clásica. Enmarcada en madera de roble natural con cristal.',
    price: 7500,
    image_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    code: 'CU-002',
    sort_order: 81,
    is_active: true,
    badge: 'ROBLE NATURAL',
    profile: ['Papel algodón 310gr', 'Impresión Giclée', 'Marco roble + cristal'],
  },
];

/* ─── Filtros de Alcione ─── */
export function filterAlcioneCategories(cats: any[]): any[] {
  if (!cats || !Array.isArray(cats)) return DEFAULT_CATEGORIES_ALCIONE;
  const filtered = cats.filter(c => {
    const name = (c.name || '').trim().toLowerCase();
    // Allow only home deco categories
    return ['platos', 'vasos', 'copas', 'cortinas', 'lámpara', 'lampara', 'acolchado', 'espejo', 'mantel', 'canasto', 'cuadro', 'deco', 'hogar', 'decoración', 'decoracion', 'textil', 'iluminación', 'iluminacion', 'vajilla', 'cristalería', 'cristaleria', 'mimbre', 'organizador'].some(allowed => name.includes(allowed));
  });
  return filtered.length > 0 ? filtered : DEFAULT_CATEGORIES_ALCIONE;
}

export function filterAlcioneProducts(prods: any[]): any[] {
  if (!prods || !Array.isArray(prods)) return DEFAULT_PRODUCTS_ALCIONE;
  const filtered = prods.filter(p => {
    const code = (p.code || '').toUpperCase();
    const text = `${p.name || ''} ${p.description || ''}`.toLowerCase();
    // Allow home deco products by code prefix
    return code.startsWith('PL-') ||
           code.startsWith('VA-') ||
           code.startsWith('CO-') ||
           code.startsWith('LA-') ||
           code.startsWith('AC-') ||
           code.startsWith('ES-') ||
           code.startsWith('MA-') ||
           code.startsWith('CA-') ||
           code.startsWith('CU-') ||
           /plato|vaso|copa|cortina|lámpara|lampara|acolchado|espejo|mantel|canasto|cuadro|vajilla|decoración|decoracion|deco|hogar|velador|visillo|blackout|cristal|vidrio|mimbre|lienzo|lámina|lamina|cerámica|ceramica/i.test(text);
  });
  return filtered.length > 0 ? filtered : DEFAULT_PRODUCTS_ALCIONE;
}

/**
 * Resuelve y garantiza una fotografía arquitectónica de lujo para el producto,
 * interceptando rutas locales viejas o vacías.
 */
export function resolveProductImage(product: any): string {
  if (!product) return 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80';
  if (product.image_url && product.image_url.startsWith('http')) {
    return product.image_url;
  }
  const match = DEFAULT_PRODUCTS_ALCIONE.find(p => 
    (product.code && p.code === product.code) ||
    (product.name && p.name.toLowerCase() === product.name.toLowerCase())
  );
  if (match && match.image_url && match.image_url.startsWith('http')) {
    return match.image_url;
  }
  return product.image_url || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80';
}

/**
 * Resuelve y garantiza una fotografía de alta gama para cada categoría.
 */
export function resolveCategoryImage(category: any): string {
  if (!category) return 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80';
  if (category.image_url && category.image_url.startsWith('http')) {
    return category.image_url;
  }
  const match = DEFAULT_CATEGORIES_ALCIONE.find(c => 
    (category.name && c.name.toLowerCase() === category.name.toLowerCase()) ||
    (category.id && c.id === category.id)
  );
  if (match && match.image_url && match.image_url.startsWith('http')) {
    return match.image_url;
  }
  return category.image_url || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80';
}

/**
 * Resuelve y garantiza una fotografía de alta gama para cada banner promocional.
 */
export function resolveBannerImage(banner: any, index: number = 0): string {
  const vipBanners = [
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80'
  ];
  if (!banner) return vipBanners[index % vipBanners.length];
  if (banner.image_url && typeof banner.image_url === 'string' && banner.image_url.startsWith('http')) {
    return banner.image_url;
  }
  const idx = typeof banner.sort_order === 'number' && banner.sort_order > 0 ? banner.sort_order - 1 : index;
  return vipBanners[idx % vipBanners.length];
}

