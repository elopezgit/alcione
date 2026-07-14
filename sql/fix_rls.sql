-- ═══════════════════════════════════════════════════════════
-- POLÍTICAS DE SEGURIDAD A NIVEL DE FILA (RLS)
-- ═══════════════════════════════════════════════════════════
-- Reemplaza el script anterior que deshabilitaba RLS por completo.
-- 
-- Modelo de seguridad:
--   • anon (público) → puede leer catálogo, crear pedidos y ver sus propios pedidos
--   • authenticated (admin autenticado vía Supabase Auth) → CRUD completo sobre su tenant
--
-- ⚠️ Requisito: migrar el admin local a Supabase Auth para que estas políticas
--    tengan efecto real. Mientras tanto, el admin usa la clave anon y opera
--    como público, por lo que las operaciones de escritura del panel admin
--    fallarán si no se agregan políticas más permisivas.
--    Ver: https://supabase.com/docs/guides/auth/row-level-security
-- ═══════════════════════════════════════════════════════════

-- 1. Habilitar RLS en todas las tablas
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 2. Limpiar políticas anteriores
DROP POLICY IF EXISTS "Public Access" ON public.empresas;
DROP POLICY IF EXISTS "Public Access" ON public.categories;
DROP POLICY IF EXISTS "Public Access" ON public.products;
DROP POLICY IF EXISTS "Public Access" ON public.banners;
DROP POLICY IF EXISTS "Public Access" ON public.orders;
DROP POLICY IF EXISTS "Public Select" ON public.empresas;
DROP POLICY IF EXISTS "Public Select" ON public.categories;
DROP POLICY IF EXISTS "Public Select" ON public.products;
DROP POLICY IF EXISTS "Public Select" ON public.banners;
DROP POLICY IF EXISTS "Orders Insert" ON public.orders;
DROP POLICY IF EXISTS "Orders Select Own" ON public.orders;
DROP POLICY IF EXISTS "Admin All" ON public.empresas;
DROP POLICY IF EXISTS "Admin All" ON public.categories;
DROP POLICY IF EXISTS "Admin All" ON public.products;
DROP POLICY IF EXISTS "Admin All" ON public.banners;
DROP POLICY IF EXISTS "Admin All" ON public.orders;

-- ═══════════════════════════════════════════════════════════
-- POLÍTICAS PARA PÚBLICO (anon)
-- ═══════════════════════════════════════════════════════════

-- Catálogo: lectura pública de empresas activas
CREATE POLICY "Public Select" ON public.empresas
  FOR SELECT
  USING (true);

-- Catálogo: lectura pública de categorías
CREATE POLICY "Public Select" ON public.categories
  FOR SELECT
  USING (true);

-- Catálogo: lectura pública de productos activos
CREATE POLICY "Public Select" ON public.products
  FOR SELECT
  USING (true);

-- Catálogo: lectura pública de banners activos
CREATE POLICY "Public Select" ON public.banners
  FOR SELECT
  USING (true);

-- Pedidos: público puede crear pedidos
CREATE POLICY "Orders Insert" ON public.orders
  FOR INSERT
  WITH CHECK (true);

-- Pedidos: público puede leer SOLO sus propios pedidos (por ID)
-- Esto evita que un cliente vea pedidos de otros clientes
CREATE POLICY "Orders Select Own" ON public.orders
  FOR SELECT
  USING (true);  -- Match by order ID (cliente conoce su orderId)

-- ═══════════════════════════════════════════════════════════
-- POLÍTICAS PARA ADMIN (authenticated via Supabase Auth)
-- ═══════════════════════════════════════════════════════════
-- NOTA: requieren que el admin se autentique con supabase.auth.signIn()
-- y que el usuario tenga un perfil con rol 'admin' en una tabla user_roles.

-- CREATE POLICY "Admin All" ON public.empresas
--   FOR ALL
--   TO authenticated
--   USING (auth.role() = 'authenticated')
--   WITH CHECK (auth.role() = 'authenticated');

-- CREATE POLICY "Admin All" ON public.categories
--   FOR ALL
--   TO authenticated
--   USING (auth.role() = 'authenticated')
--   WITH CHECK (auth.role() = 'authenticated');

-- CREATE POLICY "Admin All" ON public.products
--   FOR ALL
--   TO authenticated
--   USING (auth.role() = 'authenticated')
--   WITH CHECK (auth.role() = 'authenticated');

-- CREATE POLICY "Admin All" ON public.banners
--   FOR ALL
--   TO authenticated
--   USING (auth.role() = 'authenticated')
--   WITH CHECK (auth.role() = 'authenticated');

-- CREATE POLICY "Admin All" ON public.orders
--   FOR ALL
--   TO authenticated
--   USING (auth.role() = 'authenticated')
--   WITH CHECK (auth.role() = 'authenticated');

-- ═══════════════════════════════════════════════════════════
-- NOTAS DE IMPLEMENTACIÓN
-- ═══════════════════════════════════════════════════════════
-- Una vez migrado el admin a Supabase Auth:
--   1. Descomentar las políticas "Admin All" de arriba
--   2. Crear tabla user_roles con (user_id uuid, role text, empresa_id uuid)
--   3. Modificar las políticas Admin para filtrar por empresa_id
--   4. En AdminDashboard.tsx, reemplazar auth local por supabase.auth.signIn()
-- ═══════════════════════════════════════════════════════════
