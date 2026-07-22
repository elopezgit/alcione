# Memoria del Proyecto — ALCIONE (Deco & Hogar)

## Última sesión (21/07/2026) — Setup inicial de Alcione

### Resumen
Se creó el proyecto **Alcione** desde una copia base. Se eliminaron todos los rastros del tenant anterior (MrCerdo) y se configuró la plataforma como un eCommerce 100% dedicado a **decoración del hogar**.

### Tareas realizadas

**Configuración inicial del proyecto:**
1. ✅ **Identidad visual completa**: Definida paleta de colores (teal/dorado), tipografía (Playfair Display + Inter), estilo elegante y luminoso.
2. ✅ **`src/lib/tenantConfig.ts`**: Configuración central con datos de Alcione (colores, fuentes, contacto, catálogo default, filtros).
3. ✅ **`src/lib/defaultCatalog.ts`**: Catálogo completo con 9 categorías y 18 productos demo de decoración.
4. ✅ **`src/lib/design-tokens.ts`**: Tokens de diseño generados desde la configuración de Alcione.
5. ✅ **`src/lib/useTenantTheme.ts`**: Hook que inyecta Google Fonts, CSS variables y favicon dinámicamente.
6. ✅ **`src/index.css`**: Tema Tailwind v4 con colores de Alcione como default.
7. ✅ **Enrutamiento**: `App.tsx` redirige `/` a `/alcione`.
8. ✅ **Splash screen**: Pantalla de bienvenida con logo, badge "DECO AL MEJOR PRECIO ❤️" y etiquetas.
9. ✅ **Header dinámico**: Logo, nombre, tagline y color primario desde configuración.
10. ✅ **Catálogo cliente**: Búsqueda, categorías con colores, keywords, banners, carrito.
11. ✅ **Modal de producto**: Detalle con precio, cantidad, notas y branding Alcione.
12. ✅ **Panel admin**: Adaptado con colores y texto de Alcione.

**Base de datos:**
13. ✅ **`sql/seed_alcione.sql`**: Seed SQL para crear empresa, 9 categorías, 3 banners y 18 productos en Supabase.
14. ✅ **`public/img/Catalogo/alcione/`**: Carpeta para imágenes de productos.

**Limpieza de código legacy:**
15. ✅ Eliminados todos los catálogos y filtros de MrCerdo de `defaultCatalog.ts`.
16. ✅ Eliminadas todas las referencias a colores, logo y branding de MrCerdo.
17. ✅ Actualizados todos los componentes del admin que importaban filtros viejos.
18. ✅ Cambiados defaults en `ProductModal.tsx`, `index.html` y `AdminDashboard.tsx`.

### Validación
- `tsc --noEmit` → **0 errores**
- `vite build` → **0 errores** (solo warning de chunk size)

### Estado actual
- **Fase del proyecto**: Setup inicial — Desarrollo activo
- **Bloqueos activos**: Ninguno

### Próximos pasos
- [x] Ejecutar `seed_alcione.sql` en la consola SQL de Supabase (¡Completado y con columnas defensivas!)
- [x] Configurar repositorio remoto a `https://github.com/elopezgit/alcione.git` y hacer primer push
- [ ] Agregar fotografías reales de productos en `public/img/Catalogo/alcione/`
- [ ] Configurar número de WhatsApp real de Alcione (actualmente usa canal de WP)
- [ ] Configurar Instagram de Alcione
- [ ] Agregar más productos al catálogo según disponibilidad real
- [ ] Configurar tests automatizados E2E

### Pendientes a futuro
- Refactorizar el panel admin para usar colores dinámicos desde tenantConfig en lugar de valores hardcodeados
- Implementar subida de imágenes desde el admin

