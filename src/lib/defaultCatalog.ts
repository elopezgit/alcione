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
  spiciness?: 'Sin picante' | 'Bajo' | 'Medio' | 'Alto';
  intensity?: 'Suave' | 'Media' | 'Intensa' | 'Muy Gourmet';
  smokiness?: 'Sin ahumar' | 'Leve' | 'Ahumado Natural' | 'Ahumado Intenso';
  pairing?: string;
  idealFor?: string;
  cookingTime?: string;
  conservation?: string;
  ingredients?: string[];
  weight?: string;
  curingProcess?: string;
  maturationTime?: string;
}

export const DEFAULT_CATEGORY_CHORIZOS: DefaultCategory[] = [
  {
    id: 'cat-ahumados-parrilla-mrcerdo',
    name: 'Ahumados & Parrilla',
    icon: '🥩',
    description: 'Cortes y embutidos ahumados lentamente con leña noble, ideales para parrilla y cocciones lentas.'
  },
  {
    id: 'cat-curados-sal-mrcerdo',
    name: 'Curados en Sal',
    icon: '🥓',
    description: 'Charcutería fina de maduración prolongada y curación artesanal en sal marina y especias.'
  },
  {
    id: 'cat-chorizos-mrcerdo',
    name: 'Chorizos',
    icon: '🐷',
    description: 'Chorizos artesanales 100% puro cerdo con ingredientes naturales seleccionados.'
  },
  {
    id: 'cat-salames-mrcerdo',
    name: 'Salames',
    icon: '🥖',
    description: 'Salames y longanizas de maduración lenta en cámaras con control de humedad.'
  },
  {
    id: 'cat-bondiolas-mrcerdo',
    name: 'Bondiolas',
    icon: '🍖',
    description: 'Bondiolas curadas artesanalmente con finas hierbas y especias seleccionadas.'
  },
  {
    id: 'cat-matambres-mrcerdo',
    name: 'Matambres',
    icon: '🥓',
    description: 'Matambres de cerdo arrollados tiernos, listos para hornear o dorar a la parrilla.'
  }
];

export const DEFAULT_CHORIZO_PRODUCTS: DefaultProduct[] = [
  // ==========================================
  // LÍNEA OFICIAL MR. CERDO: AHUMADOS & PARRILLA (POR KG)
  // ==========================================
  {
    id: 'prod-pa-001',
    category_id: 'cat-ahumados-parrilla-mrcerdo',
    name: 'Chorizos Artesanales (Choris)',
    description: 'Elaborados artesanalmente 100% con pura carne seleccionada de cerdo y condimentos naturales. Jugosidad y sabor incomparables para tu parrilla.',
    price: 22000,
    image_url: '/img/Catalogo/chorizos/criollo.png',
    code: 'PA-001',
    sort_order: 1,
    is_active: true,
    badge: 'POR KG • MÁS VENDIDO',
    profile: ['Parrilla', 'Jugoso', 'Puro Cerdo'],
    spiciness: 'Sin picante',
    intensity: 'Media',
    smokiness: 'Sin ahumar',
    pairing: 'Malbec Reserva o Cabernet Sauvignon',
    idealFor: 'Parrilla al carbón, leña o sartén de hierro',
    cookingTime: '25-30 minutos a fuego medio',
    conservation: 'Envasado al vacío. Mantener refrigerado (0-4°C) o en freezer.',
    ingredients: ['Carne seleccionada puro cerdo', 'Especias naturales criollas', 'Pimienta negra recién molida', 'Sal marina'],
    weight: 'Precio por Kilogramo (kg)'
  },
  {
    id: 'prod-pa-002',
    category_id: 'cat-ahumados-parrilla-mrcerdo',
    name: 'Matambre Ahumado de Cerdo',
    description: 'Matambre tierno de cerdo sometido a un ahumado lento con leña de frutales. Exquisito aroma ahumado, textura suave y una costra dorada irresistible al asarlo.',
    price: 24000,
    image_url: '/img/Catalogo/matambres/tradicional.png',
    code: 'PA-002',
    sort_order: 2,
    is_active: true,
    badge: 'POR KG • AHUMADO',
    profile: ['Ahumado', 'Tierno', 'Gourmet'],
    spiciness: 'Sin picante',
    intensity: 'Intensa',
    smokiness: 'Ahumado Natural',
    pairing: 'Syrah o Pinot Noir patagónico',
    idealFor: 'Parrilla del lado del cuero o cocción lenta al horno',
    cookingTime: '20-25 minutos a fuego medio a la parrilla',
    conservation: 'Envasado al vacío. Refrigerar o congelar.',
    ingredients: ['Matambre seleccionado de cerdo magro', 'Sal marina', 'Especias aromáticas', 'Ahumado natural con leña noble'],
    weight: 'Precio por Kilogramo (kg)'
  },
  {
    id: 'prod-pa-003',
    category_id: 'cat-ahumados-parrilla-mrcerdo',
    name: 'Bondiola Ahumada en Medallones',
    description: 'Medallones gruesos y jugosos de bondiola de cerdo ahumados en frío y caliente. Ideales para sellar a la plancha o dorar en la parrilla en pocos minutos.',
    price: 19000,
    image_url: '/img/Catalogo/bondiolas/tradicional.png',
    code: 'PA-003',
    sort_order: 3,
    is_active: true,
    badge: 'POR KG • MEDALLONES',
    profile: ['Medallones', 'Jugoso', 'Ahumado'],
    spiciness: 'Sin picante',
    intensity: 'Intensa',
    smokiness: 'Ahumado Intenso',
    pairing: 'Chardonnay con paso por madera o Cerveza IPA',
    idealFor: 'Plancha bien caliente o parrilla vuelta y vuelta',
    cookingTime: '12-15 minutos a fuego fuerte',
    conservation: 'Envasado al vacío en porciones. Refrigerar.',
    ingredients: ['Corte central de bondiola de cerdo', 'Sal marina', 'Pimienta negra en grano', 'Ahumado natural'],
    weight: 'Precio por Kilogramo (kg)'
  },
  {
    id: 'prod-pa-004',
    category_id: 'cat-ahumados-parrilla-mrcerdo',
    name: 'Vacío Ahumado de Cerdo',
    description: 'Corte noble con un delicado ahumado artesanal. Sabor penetrante, jugosidad extrema y fibras que se cortan con cuchara tras un buen asado.',
    price: 18000,
    image_url: '/img/Catalogo/catalogobase.png',
    code: 'PA-004',
    sort_order: 4,
    is_active: true,
    badge: 'POR KG • TIERNO',
    profile: ['Vacío', 'Ahumado natural', 'Fibras tiernas'],
    spiciness: 'Sin picante',
    intensity: 'Intensa',
    smokiness: 'Ahumado Natural',
    pairing: 'Malbec de altura o Bonarda tucumano',
    idealFor: 'Asado tradicional al carbón o leña',
    cookingTime: '35-40 minutos a fuego moderado',
    conservation: 'Envasado al vacío refrigerado.',
    ingredients: ['Vacío fresco de puro cerdo', 'Sal marina patagónica', 'Hierbas serranas', 'Ahumado artesanal'],
    weight: 'Precio por Kilogramo (kg)'
  },
  {
    id: 'prod-pa-005',
    category_id: 'cat-ahumados-parrilla-mrcerdo',
    name: 'Costillas de Cerdo Seleccionadas',
    description: 'Costillar de cerdo con gran cobertura de carne y marmoleo perfecto. Asadas lentamente logran un desprendimiento impecable del hueso.',
    price: 16000,
    image_url: '/img/Catalogo/catalogobase.png',
    code: 'PA-005',
    sort_order: 5,
    is_active: true,
    badge: 'POR KG • PARRILLA',
    profile: ['Costillar', 'Jugoso', 'Especial Asado'],
    spiciness: 'Sin picante',
    intensity: 'Media',
    smokiness: 'Sin ahumar',
    pairing: 'Cabernet Franc o Cerveza Amber Ale',
    idealFor: 'Asador criollo, parrilla a fuego lento u horno con barbacoa',
    cookingTime: '45-60 minutos a fuego lento del lado del hueso',
    conservation: 'Envasado al vacío. Mantener refrigerado entre 0°C y 4°C.',
    ingredients: ['Costillar seleccionado de puro cerdo', 'Sal marina'],
    weight: 'Precio por Kilogramo (kg)'
  },

  // ==========================================
  // LÍNEA OFICIAL MR. CERDO: CURADOS EN SAL (POR KG)
  // ==========================================
  {
    id: 'prod-cu-001',
    category_id: 'cat-curados-sal-mrcerdo',
    name: 'Bondiola Curada en Sal Marina',
    description: 'Curada en sal marina y madurada lentamente en cava artesanal con temperatura y humedad controladas. Vetas marmoladas que se deshacen en el paladar.',
    price: 28000,
    image_url: '/img/Catalogo/bondiolas/tradicional.png',
    code: 'CU-001',
    sort_order: 10,
    is_active: true,
    badge: 'POR KG • CURADA EN SAL',
    profile: ['Curada en sal', 'Sedosa', 'Maduración lenta'],
    spiciness: 'Sin picante',
    intensity: 'Intensa',
    smokiness: 'Sin ahumar',
    pairing: 'Pinot Noir joven o Malbec elegante',
    idealFor: 'Cortar en fetas extra finas para tablas de charcutería o carpaccio',
    curingProcess: 'Salazón seca en sal marina y curado prolongado en cava',
    maturationTime: '60 a 75 días de maduración controlada',
    conservation: 'Envasado al vacío. Refrigerar (4-8°C). Una vez abierto, envolver en film protector.',
    ingredients: ['Corte entero magro de bondiola de cerdo', 'Sal marina', 'Nuez moscada', 'Pimienta negra en grano'],
    weight: 'Precio por Kilogramo (kg)'
  },
  {
    id: 'prod-cu-002',
    category_id: 'cat-curados-sal-mrcerdo',
    name: 'Jamón Ahumado Curado en Sal',
    description: 'Pieza noble de pernil de cerdo curada artesanalmente en sal y ahumada en frío con maderas nobles. Aroma refinado, color rubí y sabor profundo.',
    price: 29000,
    image_url: '/img/Catalogo/catalogobase.png',
    code: 'CU-002',
    sort_order: 11,
    is_active: true,
    badge: 'POR KG • PREMIUM',
    profile: ['Jamón ahumado', 'Curado gourmet', 'Rubí intenso'],
    spiciness: 'Sin picante',
    intensity: 'Muy Gourmet',
    smokiness: 'Ahumado Natural',
    pairing: 'Merlot equilibrado o Espumante Extra Brut',
    idealFor: 'Tablas de picadas gourmet, tostadas de masa madre con aceite de oliva',
    curingProcess: 'Salazón tradicional, estacionamiento y ahumado lento con leña de manzano',
    maturationTime: '90 días de curación y afinado',
    conservation: 'Refrigerado envuelto en papel craft o envasado al vacío.',
    ingredients: ['Pernil magro seleccionado de puro cerdo', 'Sal marina', 'Especias aromáticas', 'Ahumado natural en frío'],
    weight: 'Precio por Kilogramo (kg)'
  },
  {
    id: 'prod-cu-003',
    category_id: 'cat-curados-sal-mrcerdo',
    name: 'Salame de Campo Artesanal',
    description: 'Salame criollo elaborado según la receta casera tradicional, con curado en sal natural y estacionamiento con flora blanca autóctona. Sabor rústico y genuino.',
    price: 28000,
    image_url: '/img/Catalogo/salames/tradicional.png',
    code: 'CU-003',
    sort_order: 12,
    is_active: true,
    badge: 'POR KG • DE CAMPO',
    profile: ['De campo', 'Estacionado', 'Tradicional'],
    spiciness: 'Sin picante',
    intensity: 'Intensa',
    smokiness: 'Sin ahumar',
    pairing: 'Malbec joven o Vermouth rosso con rodaja de naranja',
    idealFor: 'Picada criolla infaltable y sándwiches rústicos de campo',
    curingProcess: 'Curación en sal y secado lento natural en bodega',
    maturationTime: '40 a 45 días de maduración',
    conservation: 'Lugar fresco y seco (12-15°C) o refrigerado en heladera.',
    ingredients: ['Carne seleccionada de cerdo y novillo magro', 'Tocino firme de dorso', 'Sal marina', 'Pimienta en grano', 'Vino moscato'],
    weight: 'Precio por Kilogramo (kg)'
  },
  {
    id: 'prod-cu-004',
    category_id: 'cat-curados-sal-mrcerdo',
    name: 'Longaniza Española Curada',
    description: 'Auténtica longaniza estilo español curada en sal marina e infusionada con pimentón de la Vera dulce y ahumado. Sabor y color inconfundibles.',
    price: 28000,
    image_url: '/img/Catalogo/salames/tradicional.png',
    code: 'CU-004',
    sort_order: 13,
    is_active: true,
    badge: 'POR KG • ESPAÑOLA',
    profile: ['Pimentón de la Vera', 'Curada en sal', 'Tradición ibérica'],
    spiciness: 'Bajo',
    intensity: 'Intensa',
    smokiness: 'Leve',
    pairing: 'Tempranillo o Cerveza Indian Pale Ale (IPA)',
    idealFor: 'Aperitivos calientes, tapeo gourmet o consumo en rodajas finas',
    curingProcess: 'Maceración con pimentón ibérico, salazón y curado en cámara',
    maturationTime: '35 a 45 días de estacionamiento',
    conservation: 'Conservar en lugar fresco y seco o refrigerado.',
    ingredients: ['Carne magra de cerdo', 'Pimentón ahumado español', 'Sal marina', 'Ajo macerado al vino blanco'],
    weight: 'Precio por Kilogramo (kg)'
  },

  // ==========================================
  // CHORIZOS ARTESANALES GOURMET (VARIEDADES ESPECIALES)
  // ==========================================
  {
    id: 'prod-ch-001',
    category_id: 'cat-chorizos-mrcerdo',
    name: 'Chorizo Criollo Tradicional',
    description: 'El clásico argentino elaborado artesanalmente con puro cerdo y condimentos criollos naturales. Equilibrio perfecto de jugosidad y textura.',
    price: 3500,
    image_url: '/img/Catalogo/chorizos/criollo.png',
    code: 'CH-001',
    sort_order: 20,
    is_active: true,
    badge: 'TRADICIONAL',
    profile: ['Tradicional', 'Criollo', 'Jugoso'],
    spiciness: 'Bajo',
    intensity: 'Media',
    smokiness: 'Sin ahumar',
    pairing: 'Malbec Reserva o Cabernet Sauvignon',
    idealFor: 'Parrilla al carbón o leña',
    cookingTime: '25-30 minutos a fuego medio',
    conservation: 'Envasado al vacío. Hasta 30 días en heladera (0-4°C) o 6 meses en freezer.',
    ingredients: ['Carne de puro cerdo seleccionada', 'Pimienta negra en grano', 'Ajo fresco', 'Ají molido criollo', 'Sal marina'],
    weight: 'Pack x 4 unidades (~550g)'
  },
  {
    id: 'prod-ch-002',
    category_id: 'cat-chorizos-mrcerdo',
    name: 'Chorizo Tomillo, Mostaza y Miel',
    description: 'Receta gourmet agridulce y aromática. Elaborado con tomillo fresco de huerta, mostaza seleccionada y un sutil toque de miel pura.',
    price: 3800,
    image_url: '/img/Catalogo/chorizos/tomillo.png',
    code: 'CH-002',
    sort_order: 21,
    is_active: true,
    badge: 'GOURMET',
    profile: ['Dulce', 'Aromático', 'Herbal'],
    spiciness: 'Sin picante',
    intensity: 'Intensa',
    smokiness: 'Sin ahumar',
    pairing: 'Chardonnay con paso por roble o Pinot Noir joven',
    idealFor: 'Parrilla gourmet o sartén de hierro',
    cookingTime: '20-25 minutos a fuego medio-bajo',
    conservation: 'Envasado al vacío. Hasta 30 días en heladera o 6 meses en freezer.',
    ingredients: ['Carne de cerdo seleccionada', 'Tomillo fresco', 'Mostaza de grano', 'Miel pura de abejas', 'Especias aromáticas'],
    weight: 'Pack x 4 unidades (~550g)'
  },
  {
    id: 'prod-ch-003',
    category_id: 'cat-chorizos-mrcerdo',
    name: 'Chorizo Morrón y Aceitunas',
    description: 'Sabor mediterráneo incomparable con morrones asados al fuego y aceitunas verdes seleccionadas. Extremadamente jugoso y fragante.',
    price: 3800,
    image_url: '/img/Catalogo/chorizos/criollo.png',
    code: 'CH-003',
    sort_order: 22,
    is_active: true,
    badge: 'PREMIUM',
    profile: ['Mediterráneo', 'Muy jugoso', 'Levemente ahumado'],
    spiciness: 'Sin picante',
    intensity: 'Media',
    smokiness: 'Leve',
    pairing: 'Merlot equilibrado o Cerveza Amber Ale',
    idealFor: 'Parrilla tradicional y picadas tibias',
    cookingTime: '25 minutos a fuego medio',
    conservation: 'Envasado al vacío. Hasta 30 días refrigerado.',
    ingredients: ['Carne de cerdo', 'Morrones rojos asados', 'Aceitunas verdes en rodajas', 'Pimentón ahumado', 'Sal marina'],
    weight: 'Pack x 4 unidades (~550g)'
  },
  {
    id: 'prod-ch-004',
    category_id: 'cat-chorizos-mrcerdo',
    name: 'Chorizo Roquefort y Pera',
    description: 'La combinación dulce-salada más sofisticada de la charcutería. Corazón fundente de auténtico queso azul patagónico con trocitos de pera fresca.',
    price: 4200,
    image_url: '/img/Catalogo/chorizos/tomillo.png',
    code: 'CH-004',
    sort_order: 23,
    is_active: true,
    badge: 'EXCLUSIVO',
    profile: ['Queso azul', 'Contraste dulce', 'Sofisticado'],
    spiciness: 'Sin picante',
    intensity: 'Muy Gourmet',
    smokiness: 'Sin ahumar',
    pairing: 'Vino Cosecha Tardía, Gewürztraminer o Syrah',
    idealFor: 'Degustación gourmet en parrilla o plancha',
    cookingTime: '20 minutos a fuego suave para fundir el queso sin arrebatar',
    conservation: 'Envasado al vacío. Hasta 25 días en heladera.',
    ingredients: ['Puro cerdo magro', 'Queso azul tipo Roquefort', 'Pera fresca deshidratada', 'Pimienta blanca', 'Nuez moscada'],
    weight: 'Pack x 4 unidades (~550g)'
  },
  {
    id: 'prod-ch-005',
    category_id: 'cat-chorizos-mrcerdo',
    name: 'Chorizo Higo y Parmesano',
    description: 'Chorizo artesanal gourmet elaborado con higos secos seleccionados y escamas de queso Parmesano estacionado. Textura inigualable.',
    price: 4200,
    image_url: '/img/Catalogo/chorizos/criollo.png',
    code: 'CH-005',
    sort_order: 24,
    is_active: true,
    badge: 'EDICIÓN CHEF',
    profile: ['Dulce agrio', 'Queso estacionado', 'Muy gourmet'],
    spiciness: 'Sin picante',
    intensity: 'Muy Gourmet',
    smokiness: 'Sin ahumar',
    pairing: 'Cabernet Franc del Valle de Uco o Cerveza Scotch Ale',
    idealFor: 'Tablas gourmet y parrilla de autor',
    cookingTime: '20-25 minutos a fuego medio-suave',
    conservation: 'Envasado al vacío. Hasta 30 días en heladera.',
    ingredients: ['Carne seleccionada de cerdo', 'Higos turcos', 'Queso Parmesano reggiano', 'Pimienta negra recién molida'],
    weight: 'Pack x 4 unidades (~550g)'
  },
  {
    id: 'prod-ch-006',
    category_id: 'cat-chorizos-mrcerdo',
    name: 'Chorizo Español con Cheddar',
    description: 'Chorizo estilo ibérico condimentado con pimentón de la Vera e infusionado con corazón fundente de queso Cheddar madurado.',
    price: 3900,
    image_url: '/img/Catalogo/chorizos/tomillo.png',
    code: 'CH-006',
    sort_order: 25,
    is_active: true,
    badge: 'FUNDENTE',
    profile: ['Pimentón ibérico', 'Cremoso', 'Fundente'],
    spiciness: 'Bajo',
    intensity: 'Intensa',
    smokiness: 'Ahumado Natural',
    pairing: 'Tempranillo o Cerveza IPA',
    idealFor: 'Choripán gourmet, hamburguesas o parrilla',
    cookingTime: '22 minutos a fuego medio',
    conservation: 'Envasado al vacío. Hasta 30 días refrigerado.',
    ingredients: ['Carne de cerdo', 'Queso Cheddar madurado', 'Pimentón ahumado español', 'Ajo macerado en vino blanco'],
    weight: 'Pack x 4 unidades (~550g)'
  },

  // ==========================================
  // SALAMES ARTESANALES GOURMET
  // ==========================================
  {
    id: 'prod-sa-001',
    category_id: 'cat-salames-mrcerdo',
    name: 'Salame Tradicional de Colonia',
    description: 'Salame artesanal elaborado según la tradición familiar, con curación lenta en bodega natural y perfecto equilibrio magro-graso.',
    price: 4800,
    image_url: '/img/Catalogo/salames/tradicional.png',
    code: 'SA-001',
    sort_order: 30,
    is_active: true,
    badge: 'CURADO NATURAL',
    profile: ['Tradicional', 'Equilibrado', 'Madurado'],
    spiciness: 'Sin picante',
    intensity: 'Media',
    smokiness: 'Sin ahumar',
    pairing: 'Malbec joven o Vermouth rosso con rodaja de naranja',
    idealFor: 'Picadas gourmet, tablas de quesos y panes campesinos',
    curingProcess: 'Secado lento en cámara con humedad controlada',
    maturationTime: '35 a 45 días de maduración',
    conservation: 'Colgado en lugar fresco y seco (12-15°C) o refrigerado envuelto en papel craft.',
    ingredients: ['Carne seleccionada de cerdo y novillo magro', 'Tocino de dorso en dados', 'Pimienta negra en grano', 'Vino tinto moscato'],
    weight: 'Pieza entera (~320g)'
  },
  {
    id: 'prod-sa-002',
    category_id: 'cat-salames-mrcerdo',
    name: 'Salame Picado Grueso Artesanal',
    description: 'El clásico salame de picado visible, textura firme y pronunciado sabor a especias y clavo de olor. Ideal para cortar en fetas finas.',
    price: 4900,
    image_url: '/img/Catalogo/salames/tradicional.png',
    code: 'SA-002',
    sort_order: 31,
    is_active: true,
    badge: 'PICADO GRUESO',
    profile: ['Firme', 'Especiado', 'Rústico'],
    spiciness: 'Bajo',
    intensity: 'Intensa',
    smokiness: 'Sin ahumar',
    pairing: 'Bonarda tucumano o Cerveza Pilsen',
    idealFor: 'Picada criolla y sándwiches gourmet en pan ciabatta',
    curingProcess: 'Estacionamiento natural con flora blanca autóctona',
    maturationTime: '40 días',
    conservation: 'Lugar fresco y seco o heladera.',
    ingredients: ['Carne de cerdo 80%', 'Tocino firme en cubos 20%', 'Especias criollas', 'Ajo'],
    weight: 'Pieza entera (~350g)'
  },

  // ==========================================
  // BONDIOLAS GOURMET (PIEZAS FETEADAS / MEDIAS)
  // ==========================================
  {
    id: 'prod-bo-001',
    category_id: 'cat-bondiolas-mrcerdo',
    name: 'Bondiola Curada Tradicional (Pieza Media)',
    description: 'Bondiola de cerdo madurada lentamente con sal marina y especias criollas. Textura sedosa y vetas marmoladas que se deshacen en el paladar.',
    price: 7500,
    image_url: '/img/Catalogo/bondiolas/tradicional.png',
    code: 'BO-001',
    sort_order: 40,
    is_active: true,
    badge: 'ARTESANAL',
    profile: ['Sedosa', 'Curación lenta', 'Delicada'],
    spiciness: 'Sin picante',
    intensity: 'Media',
    smokiness: 'Sin ahumar',
    pairing: 'Malbec elegante o Pinot Noir',
    idealFor: 'Cortar súper fina en carpaccio o sándwiches gourmet con rúcula',
    curingProcess: 'Salazón seca artesanal y maduración en cava',
    maturationTime: '60 a 75 días de curado controlado',
    conservation: 'Envasado al vacío. Una vez abierta, envolver en film en heladera.',
    ingredients: ['Corte entero de bondiola de cerdo magra', 'Sal marina', 'Nuez moscada', 'Pimienta negra'],
    weight: 'Pieza media (~450g)'
  },
  {
    id: 'prod-bo-002',
    category_id: 'cat-bondiolas-mrcerdo',
    name: 'Bondiola Ahumada al Nogal (Pieza Media)',
    description: 'Ahumada con astillas de madera de nogal del norte argentino. Aroma profundo, color ámbar y jugosidad inconfundible.',
    price: 7900,
    image_url: '/img/Catalogo/bondiolas/tradicional.png',
    code: 'BO-002',
    sort_order: 41,
    is_active: true,
    badge: 'AHUMADA AL NOGAL',
    profile: ['Madera de nogal', 'Aromática', 'Marmolada'],
    spiciness: 'Sin picante',
    intensity: 'Intensa',
    smokiness: 'Ahumado Intenso',
    pairing: 'Cabernet Franc o Cerveza Bock',
    idealFor: 'Tablas de ahumados premium y bruschettas de masa madre',
    curingProcess: 'Curado en seco y ahumado natural en frío por 18 horas',
    maturationTime: '60 días',
    conservation: 'Envasado al vacío. Refrigerar.',
    ingredients: ['Bondiola de cerdo seleccionada', 'Ahumado con nogal', 'Especias aromáticas'],
    weight: 'Pieza media (~450g)'
  },

  // ==========================================
  // MATAMBRES ARROLLADOS GOURMET
  // ==========================================
  {
    id: 'prod-ma-001',
    category_id: 'cat-matambres-mrcerdo',
    name: 'Matambre Arrollado Tradicional',
    description: 'Matambre de cerdo tierno relleno con zanahoria asada, morrón colorado, huevo de campo y condimentos criollos. Listo para cortar o dorar.',
    price: 8200,
    image_url: '/img/Catalogo/matambres/tradicional.png',
    code: 'MA-001',
    sort_order: 50,
    is_active: true,
    badge: 'RECETA CASERA',
    profile: ['Casero', 'Tierno', 'Relleno criollo'],
    spiciness: 'Sin picante',
    intensity: 'Media',
    smokiness: 'Sin ahumar',
    pairing: 'Malbec o Bonarda de cuerpo medio',
    idealFor: 'Entrada fría clásica o calentar a la parrilla/horno hasta dorar',
    cookingTime: '15 minutos a horno fuerte para gratinar o servir frío',
    conservation: 'Envasado al vacío. Refrigerar (0-4°C) hasta 20 días.',
    ingredients: ['Matambre de cerdo tierno', 'Morrones asados', 'Zanahoria fresca', 'Especias verdes naturales'],
    weight: 'Arrollado grande (~800g)'
  },
  {
    id: 'prod-ma-002',
    category_id: 'cat-matambres-mrcerdo',
    name: 'Matambre al Tomillo, Mostaza y Miel',
    description: 'Marinado en mostaza antigua, tomillo fresco y glaseado con miel. Al hornearlo o asarlo, logra un laqueado dorado irresistible.',
    price: 8600,
    image_url: '/img/Catalogo/matambres/tradicional.png',
    code: 'MA-002',
    sort_order: 51,
    is_active: true,
    badge: 'LAQUEADO GOURMET',
    profile: ['Glaseado miel', 'Aromático', 'Dulce-salado'],
    spiciness: 'Sin picante',
    intensity: 'Muy Gourmet',
    smokiness: 'Sin ahumar',
    pairing: 'Chardonnay reserva o Cerveza Golden Ale',
    idealFor: 'Asado gourmet o pieza central al horno con papas rústicas',
    cookingTime: '25 minutos al horno a 180°C pincelando con sus jugos',
    conservation: 'Envasado al vacío. Refrigerar.',
    ingredients: ['Matambre seleccionado de cerdo', 'Mostaza en grano', 'Miel pura', 'Tomillo serrano'],
    weight: 'Pieza entera macerada (~800g)'
  }
];

export function filterMrCerdoCategories(cats: any[]): any[] {
  if (!cats || !Array.isArray(cats)) return DEFAULT_CATEGORY_CHORIZOS;
  const filtered = cats.filter(c => {
    const name = (c.name || '').trim().toLowerCase();
    // Exclude any supplement categories
    if (/proteín|creatin|suplement|pre-entren|vitamin|amino|quemador|ganador|barra|shaker|ropa|accesor/i.test(name)) {
      return false;
    }
    return ['chorizos', 'salames', 'bondiolas', 'matambres', 'combos', 'parrilla', 'embutidos', 'ahumados', 'curados', 'cortes'].some(allowed => name.includes(allowed));
  });
  return filtered.length > 0 ? filtered : DEFAULT_CATEGORY_CHORIZOS;
}

export function filterMrCerdoProducts(prods: any[]): any[] {
  if (!prods || !Array.isArray(prods)) return DEFAULT_CHORIZO_PRODUCTS;
  const filtered = prods.filter(p => {
    const code = (p.code || '').toUpperCase();
    const text = `${p.name || ''} ${p.description || ''}`.toLowerCase();
    // Exclude any supplement products
    if (/protein|proteína|whey|creatin|nutrition|lisa mayorista|suplement|pre-entreno|bcaa|glutamin|gainer|lbs|star nutrition/i.test(text)) {
      return false;
    }
    return code.startsWith('CH-') ||
           code.startsWith('SA-') ||
           code.startsWith('BO-') ||
           code.startsWith('MA-') ||
           code.startsWith('PA-') ||
           code.startsWith('CU-') ||
           code.startsWith('VA-') ||
           code.startsWith('CO-') ||
           code.startsWith('JA-') ||
           code.startsWith('LO-') ||
           /chorizo|salame|bondiola|matambre|embutido|cerdo|criollo|morrón|tomillo|roquefort|higo|cheddar|ahumado|curado|vacio|vacío|costillas|jamón|jamon|longaniza|medallones/i.test(text);
  });
  return filtered.length > 0 ? filtered : DEFAULT_CHORIZO_PRODUCTS;
}

export function filterMrCerdoOrders(orders: any[]): any[] {
  if (!orders || !Array.isArray(orders)) return [];
  return orders.filter(o => {
    if (!o.items || !Array.isArray(o.items) || o.items.length === 0) return true;
    const hasUnrelatedItem = o.items.some((item: any) => {
      const text = `${item.name || ''} ${item.description || ''}`.toLowerCase();
      return /protein|proteína|whey|creatin|nutrition|lisa mayorista|suplement|pre-entreno|bcaa|glutamin|gainer|lbs|star nutrition|titan fuel/i.test(text);
    });
    return !hasUnrelatedItem;
  });
}

export function filterMrCerdoBanners(banners: any[]): any[] {
  const defaultBanners = [
    { id: 'b1', image_url: '/img/banner/banner1.jpg', is_active: true, sort_order: 1 },
    { id: 'b2', image_url: '/img/banner/banner2.jpg', is_active: true, sort_order: 2 },
    { id: 'b3', image_url: '/img/banner/banner3.jpg', is_active: true, sort_order: 3 },
  ];
  if (!banners || !Array.isArray(banners) || banners.length === 0) return defaultBanners;
  const filtered = banners.filter(b => {
    const text = `${b.image_url || ''} ${b.link || ''}`.toLowerCase();
    return !/titan|suplement|fitness|protein|creatin/i.test(text);
  });
  return filtered.length > 0 ? filtered : defaultBanners;
}
