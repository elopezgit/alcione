-- ============================================================
-- SEED MR CERDO — Embutidos Gourmet Artesanales
-- ============================================================
-- Limpia datos previos y siembra solo los 9 productos reales.
--
-- Ejecutar en la consola SQL de Supabase:
--   1. schema.sql
--   2. cleanup_mrcerdo.sql (opcional, si hay datos sucios)
--   3. este archivo
-- ============================================================

DO $$
DECLARE
  v_emp_id uuid;
  cat_chorizos uuid;
BEGIN
  -- ============================================================
  -- 1. EMPRESA: MrCerdo
  -- ============================================================
  INSERT INTO empresas (slug, name, phone, instagram_url, maps_url, logo_url, is_active)
  VALUES
    ('mrcerdo', 'MrCerdo', '5493816045706', 'https://www.instagram.com/mrcerdo.26', NULL, '/img/logo/logoMrCerdo.jpg', true)
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    instagram_url = EXCLUDED.instagram_url,
    logo_url = EXCLUDED.logo_url;

  SELECT id INTO v_emp_id FROM empresas WHERE slug = 'mrcerdo' LIMIT 1;

  -- ============================================================
  -- 2. LIMPIAR datos previos del tenant MrCerdo
  -- ============================================================
  DELETE FROM products  WHERE empresa_id = v_emp_id;
  DELETE FROM banners   WHERE empresa_id = v_emp_id;
  DELETE FROM categories WHERE empresa_id = v_emp_id;

  -- ============================================================
  -- 3. CATEGORÍAS (Ahumados & Parrilla, Curados en Sal, Chorizos)
  -- ============================================================
  DECLARE
    cat_ahumados uuid;
    cat_curados uuid;
    cat_chorizos_id uuid;
  BEGIN
    INSERT INTO categories (empresa_id, name, icon) VALUES
      (v_emp_id, 'Ahumados & Parrilla', '🥩'),
      (v_emp_id, 'Curados en Sal', '🥓'),
      (v_emp_id, 'Chorizos', '🐷');

    SELECT id INTO cat_ahumados FROM categories WHERE empresa_id = v_emp_id AND name = 'Ahumados & Parrilla' LIMIT 1;
    SELECT id INTO cat_curados FROM categories WHERE empresa_id = v_emp_id AND name = 'Curados en Sal' LIMIT 1;
    SELECT id INTO cat_chorizos_id FROM categories WHERE empresa_id = v_emp_id AND name = 'Chorizos' LIMIT 1;

    -- ============================================================
    -- 4. BANNERS
    -- ============================================================
    INSERT INTO banners (empresa_id, image_url, link, is_active, sort_order) VALUES
      (v_emp_id, '/img/Banner/bannertupedido.png', NULL, true, 1);

    -- ============================================================
    -- 5. PRODUCTOS — Línea oficial Por kg + Gourmet
    -- ============================================================
    INSERT INTO products (empresa_id, category_id, name, description, price, image_url, code, sort_order, is_active) VALUES
      -- Ahumados & Parrilla (Por kg)
      (v_emp_id, cat_ahumados, 'Chorizos Artesanales (Choris)', 'Elaborados artesanalmente 100% con pura carne seleccionada de cerdo y condimentos naturales. Jugosidad y sabor incomparables para tu parrilla.', 22000, '/img/Catalogo/chorizos/criollo.png', 'PA-001', 1, true),
      (v_emp_id, cat_ahumados, 'Matambre Ahumado de Cerdo', 'Matambre tierno de cerdo sometido a un ahumado lento con leña de frutales. Exquisito aroma ahumado, textura suave y una costra dorada irresistible.', 24000, '/img/Catalogo/matambres/tradicional.png', 'PA-002', 2, true),
      (v_emp_id, cat_ahumados, 'Bondiola Ahumada en Medallones', 'Medallones gruesos y jugosos de bondiola de cerdo ahumados en frío y caliente. Ideales para sellar a la plancha o dorar en la parrilla en pocos minutos.', 19000, '/img/Catalogo/bondiolas/tradicional.png', 'PA-003', 3, true),
      (v_emp_id, cat_ahumados, 'Vacío Ahumado de Cerdo', 'Corte noble con un delicado ahumado artesanal. Sabor penetrante, jugosidad extrema y fibras que se cortan con cuchara tras un buen asado.', 18000, '/img/Catalogo/catalogobase.png', 'PA-004', 4, true),
      (v_emp_id, cat_ahumados, 'Costillas de Cerdo Seleccionadas', 'Costillar de cerdo con gran cobertura de carne y marmoleo perfecto. Asadas lentamente logran un desprendimiento impecable del hueso.', 16000, '/img/Catalogo/catalogobase.png', 'PA-005', 5, true),

      -- Curados en Sal (Por kg)
      (v_emp_id, cat_curados, 'Bondiola Curada en Sal Marina', 'Curada en sal marina y madurada lentamente en cava artesanal con temperatura y humedad controladas. Vetas marmoladas que se deshacen en el paladar.', 28000, '/img/Catalogo/bondiolas/tradicional.png', 'CU-001', 10, true),
      (v_emp_id, cat_curados, 'Jamón Ahumado Curado en Sal', 'Pieza noble de pernil de cerdo curada artesanalmente en sal y ahumada en frío con maderas nobles. Aroma refinado, color rubí y sabor profundo.', 29000, '/img/Catalogo/catalogobase.png', 'CU-002', 11, true),
      (v_emp_id, cat_curados, 'Salame de Campo Artesanal', 'Salame criollo elaborado según la receta casera tradicional, con curado en sal natural y estacionamiento con flora blanca autóctona. Sabor rústico y genuino.', 28000, '/img/Catalogo/salames/tradicional.png', 'CU-003', 12, true),
      (v_emp_id, cat_curados, 'Longaniza Española Curada', 'Auténtica longaniza estilo español curada en sal marina e infusionada con pimentón de la Vera dulce y ahumado. Sabor y color inconfundibles.', 28000, '/img/Catalogo/salames/tradicional.png', 'CU-004', 13, true),

      -- Chorizos Gourmet Especiales
      (v_emp_id, cat_chorizos_id, 'Chorizo Tomillo, Mostaza y Miel', 'Dulce y aromático. El equilibrio perfecto. Chorizo artesanal gourmet elaborado con tomillo fresco, mostaza seleccionada y un toque de miel pura.', 3800, '/img/Catalogo/chorizos/tomillo.png', 'CH-002', 21, true),
      (v_emp_id, cat_chorizos_id, 'Chorizo Morrón y Aceituna', 'Sabroso y colorido. Con un toque mediterráneo. Chorizo artesanal con morrón asado al fuego y aceitunas verdes seleccionadas.', 3800, '/img/Catalogo/chorizos/criollo.png', 'CH-003', 22, true),
      (v_emp_id, cat_chorizos_id, 'Chorizo Roquefort y Pera', 'Intenso y sofisticado. Un clásico gourmet. Chorizo artesanal relleno con auténtico queso roquefort y trozos de pera fresca.', 4200, '/img/Catalogo/chorizos/tomillo.png', 'CH-004', 23, true),
      (v_emp_id, cat_chorizos_id, 'Chorizo Higo y Parmesano', 'Agridulce y sabroso. Una combinación única. Chorizo artesanal gourmet elaborado con higos secos seleccionados y queso parmesano.', 4200, '/img/Catalogo/chorizos/criollo.png', 'CH-005', 24, true),
      (v_emp_id, cat_chorizos_id, 'Chorizo Español con Cheddar', 'Clásico y fundente. El sabor que todos aman. Chorizo artesanal estilo español con corazón de queso cheddar fundido.', 3900, '/img/Catalogo/chorizos/tomillo.png', 'CH-006', 25, true),
      (v_emp_id, cat_chorizos_id, 'Chorizo Criollo Tradicional', 'Tradicional y bien criollo. Puro sabor. Receta tradicional argentina elaborada 100% con puro cerdo y especias criollas.', 3500, '/img/Catalogo/chorizos/criollo.png', 'CH-001', 20, true);
  END;

  RAISE NOTICE '✅ MrCerdo seed completado: 3 categorías y productos oficiales por kg actualizados.';
END $$;
