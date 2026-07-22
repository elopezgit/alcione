-- ============================================================
-- SEED ALCIONE — Deco & Hogar
-- ============================================================
-- Siembra la empresa, categorías, productos y banners de Alcione.
--
-- Ejecutar en la consola SQL de Supabase:
--   1. schema.sql (si no se ejecutó antes)
--   2. este archivo
-- ============================================================

-- Asegurar que la tabla banners y otras tablas tienen todas las columnas necesarias (para bases de datos existentes):
ALTER TABLE banners ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS subtitle text;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS link text;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon text;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS code text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

DO $$
DECLARE
  v_emp_id uuid;
  cat_platos uuid;
  cat_vasos uuid;
  cat_cortinas uuid;
  cat_lamparas uuid;
  cat_acolchados uuid;
  cat_espejos uuid;
  cat_manteles uuid;
  cat_canastos uuid;
  cat_cuadros uuid;
BEGIN
  -- ============================================================
  -- 1. EMPRESA: Alcione
  -- ============================================================
  INSERT INTO empresas (slug, name, phone, instagram_url, maps_url, logo_url, is_active)
  VALUES
    ('alcione', 'Alcione', NULL, 'https://www.instagram.com/alcione.deco', NULL, '/img/logo/logoalcione.jpg', true)
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    logo_url = EXCLUDED.logo_url;

  SELECT id INTO v_emp_id FROM empresas WHERE slug = 'alcione' LIMIT 1;

  -- ============================================================
  -- 2. LIMPIAR datos previos del tenant Alcione
  -- ============================================================
  DELETE FROM products  WHERE empresa_id = v_emp_id;
  DELETE FROM banners   WHERE empresa_id = v_emp_id;
  DELETE FROM categories WHERE empresa_id = v_emp_id;

  -- ============================================================
  -- 3. CATEGORÍAS
  -- ============================================================
  INSERT INTO categories (empresa_id, name, icon, sort_order) VALUES
    (v_emp_id, 'Platos', '🍽️', 1),
    (v_emp_id, 'Vasos & Copas', '🥂', 2),
    (v_emp_id, 'Cortinas', '🪟', 3),
    (v_emp_id, 'Lámparas', '💡', 4),
    (v_emp_id, 'Acolchados', '🛏️', 5),
    (v_emp_id, 'Espejos', '🪞', 6),
    (v_emp_id, 'Manteles', '🏡', 7),
    (v_emp_id, 'Canastos', '🧺', 8),
    (v_emp_id, 'Cuadros', '🖼️', 9);

  SELECT id INTO cat_platos     FROM categories WHERE empresa_id = v_emp_id AND name = 'Platos' LIMIT 1;
  SELECT id INTO cat_vasos      FROM categories WHERE empresa_id = v_emp_id AND name = 'Vasos & Copas' LIMIT 1;
  SELECT id INTO cat_cortinas   FROM categories WHERE empresa_id = v_emp_id AND name = 'Cortinas' LIMIT 1;
  SELECT id INTO cat_lamparas   FROM categories WHERE empresa_id = v_emp_id AND name = 'Lámparas' LIMIT 1;
  SELECT id INTO cat_acolchados FROM categories WHERE empresa_id = v_emp_id AND name = 'Acolchados' LIMIT 1;
  SELECT id INTO cat_espejos    FROM categories WHERE empresa_id = v_emp_id AND name = 'Espejos' LIMIT 1;
  SELECT id INTO cat_manteles   FROM categories WHERE empresa_id = v_emp_id AND name = 'Manteles' LIMIT 1;
  SELECT id INTO cat_canastos   FROM categories WHERE empresa_id = v_emp_id AND name = 'Canastos' LIMIT 1;
  SELECT id INTO cat_cuadros    FROM categories WHERE empresa_id = v_emp_id AND name = 'Cuadros' LIMIT 1;

  -- ============================================================
  -- 4. BANNERS
  -- ============================================================
  INSERT INTO banners (empresa_id, image_url, title, subtitle, sort_order, is_active) VALUES
    (v_emp_id, '/img/Catalogo/alcione/banner1.jpg', 'DECO AL MEJOR PRECIO', 'Transformá tu hogar con estilo', 1, true),
    (v_emp_id, '/img/Catalogo/alcione/banner2.jpg', 'NUEVA TEMPORADA', 'Platos, vasos, copas y más', 2, true),
    (v_emp_id, '/img/Catalogo/alcione/banner3.jpg', 'COMPLETÁ TU HOGAR', 'Cortinas, acolchados, cuadros y deco', 3, true);

  -- ============================================================
  -- 5. PRODUCTOS — Deco & Hogar
  -- ============================================================
  INSERT INTO products (empresa_id, category_id, name, description, price, image_url, code, sort_order, is_active) VALUES
    -- PLATOS
    (v_emp_id, cat_platos, 'Juego de Platos Cerámica Blanca',
     'Set de 12 piezas: 4 platos llanos, 4 hondos y 4 playos. Cerámica de alta resistencia con terminación esmaltada brillante.',
     12500, '/img/Catalogo/alcione/platos-blancos.jpg', 'PL-001', 1, true),
    (v_emp_id, cat_platos, 'Plato Playo Decorativo Floral',
     'Plato playo de porcelana con diseño floral pintado a mano. Ideal para servir o decorar.',
     3500, '/img/Catalogo/alcione/plato-floral.jpg', 'PL-002', 2, true),

    -- VASOS & COPAS
    (v_emp_id, cat_vasos, 'Juego de Copas Vino Cristal',
     'Set de 6 copas para vino tinto en cristal transparente. Base estable y diseño clásico elegante.',
     9800, '/img/Catalogo/alcione/copas-vino.jpg', 'VA-001', 10, true),
    (v_emp_id, cat_vasos, 'Vaso de Vidrio Soplado Artesanal',
     'Vaso artesanal de vidrio soplado, pieza única con burbujas características. Ideal para aguas y cocktails.',
     4200, '/img/Catalogo/alcione/vaso-artesanal.jpg', 'VA-002', 11, true),

    -- CORTINAS
    (v_emp_id, cat_cortinas, 'Cortina Blackout Dormitorio',
     'Panel blackout de 250x200cm. Bloquea la luz solar total. Ideal para dormitorios. Color gris perla.',
     15000, '/img/Catalogo/alcione/cortina-blackout.jpg', 'CO-001', 20, true),
    (v_emp_id, cat_cortinas, 'Visillo Algodón Estampado',
     'Visillo de algodón natural con estampado botánico. 150x200cm. Deja pasar la luz con privacidad.',
     6800, '/img/Catalogo/alcione/visillo-algodon.jpg', 'CO-002', 21, true),

    -- LÁMPARAS
    (v_emp_id, cat_lamparas, 'Lámpara de Mesa Nórdica',
     'Lámpara de escritorio con base de madera y pantalla de lino beige. Luz cálida LED incluida.',
     18500, '/img/Catalogo/alcione/lampara-mesa.jpg', 'LA-001', 30, true),
    (v_emp_id, cat_lamparas, 'Velador Moderno Dorado',
     'Velador de metal dorado cepillado con pantalla de tela blanca. Altura 55cm.',
     22000, '/img/Catalogo/alcione/velador-dorado.jpg', 'LA-002', 31, true),

    -- ACOLCHADOS
    (v_emp_id, cat_acolchados, 'Acolchado Plumón Queen',
     'Acolchado relleno de plumón sintético hipoalergénico. Funda de algodón percal. Medida queen (240x260cm).',
     32000, '/img/Catalogo/alcione/acolchado-queen.jpg', 'AC-001', 40, true),
    (v_emp_id, cat_acolchados, 'Colcha Ligera Verano',
     'Colcha fresca de algodón tejido para temporada de verano. Diseño geométrico en tonos arena y blanco.',
     18500, '/img/Catalogo/alcione/colcha-verano.jpg', 'AC-002', 41, true),

    -- ESPEJOS
    (v_emp_id, cat_espejos, 'Espejo Pared Marco Dorado',
     'Espejo decorativo de pared con marco de yeso dorado envejecido. Medidas 80x120cm.',
     28000, '/img/Catalogo/alcione/espejo-dorado.jpg', 'ES-001', 50, true),
    (v_emp_id, cat_espejos, 'Espejo Redondo Moderno',
     'Espejo redondo de 60cm con marco fino de aluminio negro. Estilo minimalista contemporáneo.',
     15500, '/img/Catalogo/alcione/espejo-redondo.jpg', 'ES-002', 51, true),

    -- MANTELES
    (v_emp_id, cat_manteles, 'Mantel Rectangular Algodón',
     'Mantel de algodón 100% natural. 150x220cm. Color crudo natural con ribete a contraste.',
     9500, '/img/Catalogo/alcione/mantel-algodon.jpg', 'MA-001', 60, true),
    (v_emp_id, cat_manteles, 'Camino de Mesa Bordado',
     'Camino de mesa de lino bordado a mano con flores silvestres. 40x180cm.',
     5800, '/img/Catalogo/alcione/camino-mesa.jpg', 'MA-002', 61, true),

    -- CANASTOS
    (v_emp_id, cat_canastos, 'Canasto Mimbre Organizador',
     'Canasto rectangular de mimbre natural con asas. Ideal para organizar ropa, juguetes o revistas. 40x30x25cm.',
     7500, '/img/Catalogo/alcione/canasto-mimbre.jpg', 'CA-001', 70, true),
    (v_emp_id, cat_canastos, 'Panera Mimbre Redonda',
     'Panera decorativa de mimbre tejido a mano con forro de tela estampada. Diámetro 25cm.',
     4200, '/img/Catalogo/alcione/panera-mimbre.jpg', 'CA-002', 71, true),

    -- CUADROS
    (v_emp_id, cat_cuadros, 'Set 3 Cuadros Abstractos',
     'Set de 3 láminas abstractas en lienzo con bastidor. Tamaños 30x40cm cada una. Paleta de tonos tierra.',
     16500, '/img/Catalogo/alcione/cuadros-abstractos.jpg', 'CU-001', 80, true),
    (v_emp_id, cat_cuadros, 'Lámina Botánica Vintage',
     'Lámina impresa en papel de algodón 300gr con ilustración botánica vintage. Marco de madera reciclada incluido.',
     7500, '/img/Catalogo/alcione/lamina-botanica.jpg', 'CU-002', 81, true);

  RAISE NOTICE '✅ Alcione seed completado: 18 productos en 9 categorías.';
END $$;
