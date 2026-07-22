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
    (v_emp_id, 'Platos', '', 1),
    (v_emp_id, 'Vasos & Copas', '', 2),
    (v_emp_id, 'Cortinas', '', 3),
    (v_emp_id, 'Lámparas', '', 4),
    (v_emp_id, 'Acolchados', '', 5),
    (v_emp_id, 'Espejos', '', 6),
    (v_emp_id, 'Manteles', '', 7),
    (v_emp_id, 'Canastos', '', 8),
    (v_emp_id, 'Cuadros', '', 9);

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
    (v_emp_id, 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80', 'COLECCIÓN EXCLUSIVA 2026', 'Piezas de diseño y arte interior para espacios extraordinarios', 1, true),
    (v_emp_id, 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80', 'CRISTALERÍA & VAJILLA FINA', 'La excelencia en cada detalle para tu mesa', 2, true),
    (v_emp_id, 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80', 'TEXTILES & ILUMINACIÓN', 'Calidez y sofisticación para dormitorios y salas de estar', 3, true);

  -- ============================================================
  -- 5. PRODUCTOS — Deco & Hogar
  -- ============================================================
  INSERT INTO products (empresa_id, category_id, name, description, price, image_url, code, sort_order, is_active) VALUES
    -- PLATOS
    (v_emp_id, cat_platos, 'Juego de Platos Cerámica Blanca',
     'Set de 12 piezas de porcelana y cerámica esmaltada de alta durabilidad. Terminación brillante y tacto seda.',
     12500, 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80', 'PL-001', 1, true),
    (v_emp_id, cat_platos, 'Plato Playo Porcelana Floral',
     'Plato playo decorativo de porcelana con motivos botánicos ilustrados a mano y filete dorado sutil.',
     3500, 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80', 'PL-002', 2, true),

    -- VASOS & COPAS
    (v_emp_id, cat_vasos, 'Juego de Copas de Cristal de Bohemia',
     'Set de 6 copas para vino tinto elaboradas en cristal transparente de alta sonoridad y brillo impecable.',
     9800, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80', 'VA-001', 10, true),
    (v_emp_id, cat_vasos, 'Vaso de Vidrio Soplado Artesanal',
     'Pieza única elaborada mediante técnica de vidrio soplado tradicional. Textura orgánica y peso equilibrado.',
     4200, 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80', 'VA-002', 11, true),

    -- CORTINAS
    (v_emp_id, cat_cortinas, 'Panel Blackout Texturado Premium',
     'Cortina de aislamiento lumínico y térmico con textura tipo lino pesado en tono gris perla. 250x200 cm.',
     15000, 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', 'CO-001', 20, true),
    (v_emp_id, cat_cortinas, 'Visillo de Lino Natural Translúcido',
     'Textil ligero en lino orgánico color marfil. Filtra la luz solar aportando calidez e intimidad arquitectónica.',
     6800, 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80', 'CO-002', 21, true),

    -- LÁMPARAS
    (v_emp_id, cat_lamparas, 'Lámpara de Mesa Base Cerámica & Lino',
     'Lámpara escultórica con base de cerámica mate artesanal y pantalla cilíndrica en lino natural. Iluminación cálida.',
     18500, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80', 'LA-001', 30, true),
    (v_emp_id, cat_lamparas, 'Velador Arquitectónico en Latón Dorado',
     'Luminaria de escritorio minimalista en latón cepillado con brazo orientable. Elegancia atemporal para estudios y mesas de luz.',
     22000, 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=800&q=80', 'LA-002', 31, true),

    -- ACOLCHADOS
    (v_emp_id, cat_acolchados, 'Plumón King Size en Algodón Percal 400 Hilos',
     'Edredón de máxima suavidad relleno con fibras de plumón sintético hipoalergénico de alta densidad. Tacto hotel 5 estrellas.',
     32000, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80', 'AC-001', 40, true),
    (v_emp_id, cat_acolchados, 'Cover de Verano en Algodón Waffle',
     'Cubrecama ligero con textura waffle en algodón peinado natural. Frescura y prestancia visual para media estación.',
     18500, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80', 'AC-002', 41, true),

    -- ESPEJOS
    (v_emp_id, cat_espejos, 'Espejo de Pared Clásico Marco Dorado Envejecido',
     'Espejo biselado de gran formato con marco tallado estilo imperial en dorado antiguo. Pieza central para recibidores o salas.',
     28000, 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80', 'ES-001', 50, true),
    (v_emp_id, cat_espejos, 'Espejo Redondo Minimalista de Pie o Pared',
     'Espejo de 60 cm con marco ultra delgado en aluminio anodizado negro mate. Geometría perfecta y claridad óptica.',
     15500, 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80', 'ES-002', 51, true),

    -- MANTELES
    (v_emp_id, cat_manteles, 'Mantel de Lino & Algodón Natural 250x150',
     'Mantel de confección artesanal en mezcla de lino europeo y algodón orgánico. Caída noble y resistencia al lavado.',
     9500, 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80', 'MA-001', 60, true),
    (v_emp_id, cat_manteles, 'Camino de Mesa Bordado a Mano sobre Lino',
     'Camino de mesa artesanal con delicados bordados en hilos de seda mate sobre base de lino crudo. 40x180 cm.',
     5800, 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80', 'MA-002', 61, true),

    -- CANASTOS
    (v_emp_id, cat_canastos, 'Set de Cestas de Mimbre & Fibras Naturales',
     'Cestas organizadoras tejidas con fibras de seagrass y mimbre seleccionado. Aportan calidez orgánica y funcionalidad impecable.',
     7500, 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80', 'CA-001', 70, true),
    (v_emp_id, cat_canastos, 'Cesto Arquitectónico de Almacenamiento Tejido',
     'Cesto de gran capacidad con asas laterales en cuero natural. Perfecto para mantas, almohadones en salas de estar o dormitorios.',
     4200, 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80', 'CA-002', 71, true),

    -- CUADROS
    (v_emp_id, cat_cuadros, 'Díptico de Arte Abstracto en Lienzo Texturado',
     'Par de lienzos con texturas acrílicas en paleta de tonos arena, terracota y blanco roto. Bastidor de madera de galería.',
     16500, 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80', 'CU-001', 80, true),
    (v_emp_id, cat_cuadros, 'Lámina Botánica Ilustrada con Marco de Roble',
     'Impresión Giclée sobre papel de algodón 310 gr con ilustración botánica clásica. Enmarcada en madera de roble natural con cristal.',
     7500, 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80', 'CU-002', 81, true);

  RAISE NOTICE '✅ Alcione seed VIP Luxury completado: 18 productos en 9 categorías.';
END $$;
