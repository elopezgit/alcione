# Memoria del Proyecto — MrCerdo OS

## Última sesión (17/07/2026)
- **Tarea realizada**: Actualización del catálogo con los cortes, embutidos y precios oficiales por kg enviados por Mr. Cerdo, además de incorporación de categorías gourmet e implementación de reglas de filtrado ampliadas.
- **Agentes involucrados**: Coordinator, Software Architect, BA, Backend Expert, Frontend Expert
- **Decisiones tomadas**:
  - Crear las categorías `Ahumados & Parrilla` (`cat-ahumados-parrilla-mrcerdo`) y `Curados en Sal` (`cat-curados-sal-mrcerdo`) en `defaultCatalog.ts`, `ClientHome.tsx` y `seed_mrcerdo.sql`.
  - Incorporar la línea oficial de precios por kg ($ mil):
    - **Ahumados & Parrilla**: Choris ($22.000), Matambre ahumado ($24.000), Bondiola ahumada en medallones ($19.000), Vacío ahumado ($18.000), Costillas ($16.000).
    - **Curados en Sal**: Bondiola curada en sal ($28.000), Jamón ahumado curado en sal ($29.000), Salame de campo artesanal ($28.000), Longaniza española curada ($28.000).
  - Ampliar `filterMrCerdoCategories` y `filterMrCerdoProducts` en `defaultCatalog.ts` para que permitan keywords y prefijos de código (`PA-`, `CU-`, `VA-`, etc.) sin falsos negativos ni exclusiones no deseadas.
  - Sincronizar el archivo SQL `seed_mrcerdo.sql` para que el sembrado de base de datos coincida con la carta del cliente.

## Estado actual
- **Fase del proyecto**: Implementación / Mantenimiento
- **Sprint actual**: Catálogo Oficial y Puesta a Punto
- **Funcionalidades completadas**:
  - Storefront cliente vista catálogo + carrito + pedido vía WhatsApp
  - Admin dashboard con Kanban, POS, Analytics, Catalog Manager, Banner Manager
  - Integración con Supabase (PostgreSQL)
  - Catálogo de cortes por kg (`Ahumados & Parrilla` y `Curados en Sal`) y embutidos gourmet
- **Bloqueos activos**: Ninguno

## Historial de cambios recientes
| Fecha | Cambio | Responsable | Estado |
|---|---|---|---|
| 17/07/2026 | Integración de precios por kg y categorías Ahumados/Curados en `defaultCatalog.ts` y `ClientHome.tsx` | Coordinator | ✅ |
| 17/07/2026 | Actualización del seed SQL en `seed_mrcerdo.sql` con los cortes y precios oficiales | Coordinator | ✅ |
| 17/07/2026 | Verificación de compilación TypeScript (`tsc && vite build`) y Zero Regressions | QA Expert / Coordinator | ✅ |
| 13/07/2026 | Simplificación getEmpresa.ts (eliminar legacy supplements) | Coordinator | ✅ |
| 13/07/2026 | Limpieza ClientHome.tsx y ProductModal.tsx | Coordinator | ✅ |

## Lecciones aprendidas
- El sistema de filtrado estricto por regex (`filterMrCerdoProducts` / `filterMrCerdoCategories`) es excelente para prevenir sangrado de datos legacy de suplementos, pero requiere ampliación explícita de prefijos y keywords cuando se suman nuevas líneas de productos gourmet o cortes de carne.
- Separar "Salame de campo" y "Longaniza Española" en dos ítems individuales ($28.000/kg c/u) otorga mayor claridad en el carrito y en los pedidos de WhatsApp.

## Próximos pasos
- [x] Limpieza de código legacy de suplementos y simplificación multi-tenant
- [x] Actualización oficial de productos y precios por kg enviados por Mr. Cerdo
- [x] Actualización de memoria del proyecto y validación de build (`tsc`)
- [ ] Ejecutar el nuevo `seed_mrcerdo.sql` en la consola SQL de Supabase para reflejar los cambios en producción
- [ ] Agregar fotografías reales de los nuevos cortes ahumados y curados
- [ ] Configurar tests automatizados E2E
