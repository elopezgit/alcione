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
  icon: string;
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
// ALCIONE — Deco & Hogar (Catálogo Default)
// ===================================================================

export const DEFAULT_CATEGORIES_ALCIONE: DefaultCategory[] = [
  {
    id: 'cat-platos-alcione',
    name: 'Platos',
    icon: '🍽️',
    description: 'Vajilla completa, platos llanos, hondos y juegos de cerámica para tu mesa.'
  },
  {
    id: 'cat-vasos-alcione',
    name: 'Vasos & Copas',
    icon: '🥂',
    description: 'Vasos, copas de vino, copas de agua y juegos de cristalería elegante.'
  },
  {
    id: 'cat-cortinas-alcione',
    name: 'Cortinas',
    icon: '🪟',
    description: 'Cortinas blackout, visillos, paneles y cortinas enrollables para toda tu casa.'
  },
  {
    id: 'cat-lamparas-alcione',
    name: 'Lámparas',
    icon: '💡',
    description: 'Lámparas de mesa, techo, pie y veladores modernos para cada ambiente.'
  },
  {
    id: 'cat-acolchados-alcione',
    name: 'Acolchados',
    icon: '🛏️',
    description: 'Acolchados, edredones y colchas para cama matrimonial, queen y king.'
  },
  {
    id: 'cat-espejos-alcione',
    name: 'Espejos',
    icon: '🪞',
    description: 'Espejos decorativos de pared y piso con marcos modernos y clásicos.'
  },
  {
    id: 'cat-manteles-alcione',
    name: 'Manteles',
    icon: '🏡',
    description: 'Manteles rectangulares, redondos, caminos de mesa e individuales.'
  },
  {
    id: 'cat-canastos-alcione',
    name: 'Canastos',
    icon: '🧺',
    description: 'Canastos de mimbre, organizadores, paneras y cestas de almacenamiento.'
  },
  {
    id: 'cat-cuadros-alcione',
    name: 'Cuadros',
    icon: '🖼️',
    description: 'Cuadros decorativos, láminas, lienzos y sets de arte para tus paredes.'
  },
];

export const DEFAULT_PRODUCTS_ALCIONE: DefaultProduct[] = [
  // ─── PLATOS ───
  {
    id: 'alc-pl-001',
    category_id: 'cat-platos-alcione',
    name: 'Juego de Platos Cerámica Blanca',
    description: 'Set de 12 piezas: 4 platos llanos, 4 hondos y 4 playos. Cerámica de alta resistencia con terminación esmaltada brillante.',
    price: 12500,
    image_url: '/img/Catalogo/alcione/platos-blancos.jpg',
    code: 'PL-001',
    sort_order: 1,
    is_active: true,
    badge: 'SET 12 PZS',
    profile: ['Cerámica', 'Blanco', 'Esmaltado'],
  },
  {
    id: 'alc-pl-002',
    category_id: 'cat-platos-alcione',
    name: 'Plato Playo Decorativo Floral',
    description: 'Plato playo de porcelana con diseño floral pintado a mano. Ideal para servir o decorar.',
    price: 3500,
    image_url: '/img/Catalogo/alcione/plato-floral.jpg',
    code: 'PL-002',
    sort_order: 2,
    is_active: true,
    badge: 'DECORATIVO',
    profile: ['Porcelana', 'Floral', 'Pintado a mano'],
  },
  // ─── VASOS & COPAS ───
  {
    id: 'alc-va-001',
    category_id: 'cat-vasos-alcione',
    name: 'Juego de Copas Vino Cristal',
    description: 'Set de 6 copas para vino tinto en cristal transparente. Base estable y diseño clásico elegante.',
    price: 9800,
    image_url: '/img/Catalogo/alcione/copas-vino.jpg',
    code: 'VA-001',
    sort_order: 10,
    is_active: true,
    badge: 'SET X6',
    profile: ['Cristal', 'Vino tinto', 'Clásico'],
  },
  {
    id: 'alc-va-002',
    category_id: 'cat-vasos-alcione',
    name: 'Vaso de Vidrio Soplado Artesanal',
    description: 'Vaso artesanal de vidrio soplado, pieza única con burbujas características. Ideal para aguas y cocktails.',
    price: 4200,
    image_url: '/img/Catalogo/alcione/vaso-artesanal.jpg',
    code: 'VA-002',
    sort_order: 11,
    is_active: true,
    badge: 'ARTESANAL',
    profile: ['Vidrio soplado', 'Artesanal', 'Único'],
  },
  // ─── CORTINAS ───
  {
    id: 'alc-co-001',
    category_id: 'cat-cortinas-alcione',
    name: 'Cortina Blackout Dormitorio',
    description: 'Panel blackout de 250x200cm. Bloquea la luz solar total. Ideal para dormitorios. Color gris perla.',
    price: 15000,
    image_url: '/img/Catalogo/alcione/cortina-blackout.jpg',
    code: 'CO-001',
    sort_order: 20,
    is_active: true,
    badge: 'BLACKOUT',
    profile: ['Aislante', 'Total oscuridad', 'Gris perla'],
  },
  {
    id: 'alc-co-002',
    category_id: 'cat-cortinas-alcione',
    name: 'Visillo Algodón Estampado',
    description: 'Visillo de algodón natural con estampado botánico. 150x200cm. Deja pasar la luz con privacidad.',
    price: 6800,
    image_url: '/img/Catalogo/alcione/visillo-algodon.jpg',
    code: 'CO-002',
    sort_order: 21,
    is_active: true,
    badge: 'ESTAMPADO',
    profile: ['Algodón', 'Botánico', 'Luminoso'],
  },
  // ─── LÁMPARAS ───
  {
    id: 'alc-la-001',
    category_id: 'cat-lamparas-alcione',
    name: 'Lámpara de Mesa Nórdica',
    description: 'Lámpara de escritorio con base de madera y pantalla de lino beige. Luz cálida LED incluida.',
    price: 18500,
    image_url: '/img/Catalogo/alcione/lampara-mesa.jpg',
    code: 'LA-001',
    sort_order: 30,
    is_active: true,
    badge: 'NÓRDICO',
    profile: ['Madera', 'Lino', 'Luz cálida'],
  },
  {
    id: 'alc-la-002',
    category_id: 'cat-lamparas-alcione',
    name: 'Velador Moderno Dorado',
    description: 'Velador de metal dorado cepillado con pantalla de tela blanca. Altura 55cm.',
    price: 22000,
    image_url: '/img/Catalogo/alcione/velador-dorado.jpg',
    code: 'LA-002',
    sort_order: 31,
    is_active: true,
    badge: 'MODERNO',
    profile: ['Metal dorado', '55cm', 'Elegante'],
  },
  // ─── ACOLCHADOS ───
  {
    id: 'alc-ac-001',
    category_id: 'cat-acolchados-alcione',
    name: 'Acolchado Plumón Queen',
    description: 'Acolchado relleno de plumón sintético hipoalergénico. Funda de algodón percal. Medida queen (240x260cm).',
    price: 32000,
    image_url: '/img/Catalogo/alcione/acolchado-queen.jpg',
    code: 'AC-001',
    sort_order: 40,
    is_active: true,
    badge: 'QUEEN',
    profile: ['Plumón sintético', 'Hipoalergénico', 'Algodón'],
  },
  {
    id: 'alc-ac-002',
    category_id: 'cat-acolchados-alcione',
    name: 'Colcha Ligera Verano',
    description: 'Colcha fresca de algodón tejido para temporada de verano. Diseño geométrico en tonos arena y blanco.',
    price: 18500,
    image_url: '/img/Catalogo/alcione/colcha-verano.jpg',
    code: 'AC-002',
    sort_order: 41,
    is_active: true,
    badge: 'VERANO',
    profile: ['Algodón', 'Ligera', 'Geométrico'],
  },
  // ─── ESPEJOS ───
  {
    id: 'alc-es-001',
    category_id: 'cat-espejos-alcione',
    name: 'Espejo Pared Marco Dorado',
    description: 'Espejo decorativo de pared con marco de yeso dorado envejecido. Medidas 80x120cm.',
    price: 28000,
    image_url: '/img/Catalogo/alcione/espejo-dorado.jpg',
    code: 'ES-001',
    sort_order: 50,
    is_active: true,
    badge: 'MARCO DORADO',
    profile: ['Yeso dorado', '80x120cm', 'Decorativo'],
  },
  {
    id: 'alc-es-002',
    category_id: 'cat-espejos-alcione',
    name: 'Espejo Redondo Moderno',
    description: 'Espejo redondo de 60cm con marco fino de aluminio negro. Estilo minimalista contemporáneo.',
    price: 15500,
    image_url: '/img/Catalogo/alcione/espejo-redondo.jpg',
    code: 'ES-002',
    sort_order: 51,
    is_active: true,
    badge: 'MINIMAL',
    profile: ['Aluminio negro', '60cm', 'Minimalista'],
  },
  // ─── MANTELES ───
  {
    id: 'alc-ma-001',
    category_id: 'cat-manteles-alcione',
    name: 'Mantel Rectangular Algodón',
    description: 'Mantel de algodón 100% natural. 150x220cm. Color crudo natural con ribete a contraste.',
    price: 9500,
    image_url: '/img/Catalogo/alcione/mantel-algodon.jpg',
    code: 'MA-001',
    sort_order: 60,
    is_active: true,
    badge: 'ALGODÓN',
    profile: ['100% algodón', '150x220cm', 'Crudo'],
  },
  {
    id: 'alc-ma-002',
    category_id: 'cat-manteles-alcione',
    name: 'Camino de Mesa Bordado',
    description: 'Camino de mesa de lino bordado a mano con flores silvestres. 40x180cm.',
    price: 5800,
    image_url: '/img/Catalogo/alcione/camino-mesa.jpg',
    code: 'MA-002',
    sort_order: 61,
    is_active: true,
    badge: 'BORDADO',
    profile: ['Lino', 'Bordado a mano', 'Flores'],
  },
  // ─── CANASTOS ───
  {
    id: 'alc-ca-001',
    category_id: 'cat-canastos-alcione',
    name: 'Canasto Mimbre Organizador',
    description: 'Canasto rectangular de mimbre natural con asas. Ideal para organizar ropa, juguetes o revistas. 40x30x25cm.',
    price: 7500,
    image_url: '/img/Catalogo/alcione/canasto-mimbre.jpg',
    code: 'CA-001',
    sort_order: 70,
    is_active: true,
    badge: 'ORGANIZADOR',
    profile: ['Mimbre natural', '40x30cm', 'Con asas'],
  },
  {
    id: 'alc-ca-002',
    category_id: 'cat-canastos-alcione',
    name: 'Panera Mimbre Redonda',
    description: 'Panera decorativa de mimbre tejido a mano con forro de tela estampada. Diámetro 25cm.',
    price: 4200,
    image_url: '/img/Catalogo/alcione/panera-mimbre.jpg',
    code: 'CA-002',
    sort_order: 71,
    is_active: true,
    badge: 'PANERA',
    profile: ['Tejido a mano', '25cm', 'Forro estampado'],
  },
  // ─── CUADROS ───
  {
    id: 'alc-cu-001',
    category_id: 'cat-cuadros-alcione',
    name: 'Set 3 Cuadros Abstractos',
    description: 'Set de 3 láminas abstractas en lienzo con bastidor. Tamaños 30x40cm cada una. Paleta de tonos tierra.',
    price: 16500,
    image_url: '/img/Catalogo/alcione/cuadros-abstractos.jpg',
    code: 'CU-001',
    sort_order: 80,
    is_active: true,
    badge: 'SET X3',
    profile: ['Abstracto', 'Lienzo', 'Tonos tierra'],
  },
  {
    id: 'alc-cu-002',
    category_id: 'cat-cuadros-alcione',
    name: 'Lámina Botánica Vintage',
    description: 'Lámina impresa en papel de algodón 300gr con ilustración botánica vintage. Marco de madera reciclada incluido.',
    price: 7500,
    image_url: '/img/Catalogo/alcione/lamina-botanica.jpg',
    code: 'CU-002',
    sort_order: 81,
    is_active: true,
    badge: 'VINTAGE',
    profile: ['Botánica', 'Papel algodón', 'Marco incluido'],
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
