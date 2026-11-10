# Implementation Plan: Panel administrativo del catálogo y tarjeta de presentación en PNG

**Branch**: `004-panel-admin-tarjeta-png` | **Date**: 2026-11-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-panel-admin-tarjeta-png/spec.md`

## Summary

Dos entregables en el modo asesor:

1. **Panel administrativo del catálogo digital** (`/asesor` → pestaña "Panel"): métricas del
   negocio (total de productos, valor del catálogo, precio y descuento promedio, comisión
   potencial), distribución por tienda y categoría, productos destacados y una tabla densa de
   gestión con búsqueda, orden, edición y eliminación.

2. **Tarjeta de presentación en PNG** con estilo profesional minimalista: el anverso (marca y
   WhatsApp) y el reverso (QR al catálogo), descargables como PNG de 300 DPI, con la hoja completa
   de 8 tarjetas.

Decisiones técnicas clave:

- **Métricas en módulo puro** (`src/utils/stats.ts`): todos los cálculos del panel son funciones
  sin estado, testeables con `node:test` sin DOM. Es la única forma de garantizar que las cifras
  del panel coinciden con el cálculo manual (SC-001).
- **Tarjeta sobre canvas**: el mismo código de dibujo produce la vista previa y el PNG
  (`canvas.toDataURL('image/png')`). Garantiza que **lo que se ve es lo que se descarga** (FR-019)
  y evita una dependencia de conversión DOM→imagen (principio V, YAGNI).
- **300 DPI**: 85 × 54 mm ⇒ 1004 × 638 px por tarjeta; la hoja de 8 ⇒ 2048 × 1296 px.
- **Diseño con base 21st.dev**: el sistema de tokens (colores, radios, tipografía) del tema
  *Modern Minimal* de 21st, combinado con la paleta corporativa de ElectroHogar. Los tokens se
  aplican como variables CSS de Tailwind v4.
- **Sin dependencia nueva**: canvas nativo y la librería `qrcode` ya instalada.

## Technical Context

**Language/Version**: TypeScript 7.0.2, React 19.0.1, Node 26.x

**Primary Dependencies**: `react` 19, `vite` 8, `@tailwindcss/vite` 4, `lucide-react` 0.546,
`qrcode` 1.5.4. **Sin dependencias nuevas.**

**Storage**: `localStorage` (catálogo, perfil, ajustes) — sin cambios.

**Testing**: `node:test` vía `tsx` + `tsc --noEmit` con `strict: true` + verificación en navegador.

**Target Platform**: Navegador moderno. El canvas 2D está soportado en todos los navegadores
actuales; en móvil genera el PNG en memoria sin servidor.

**Project Type**: Aplicación web SPA con dos rutas.

**Performance Goals**: El panel calcula sus métricas en menos de 50 ms para 500 productos; la
descarga del PNG de la hoja completa tarda menos de 2 s.

**Constraints**:
- Sin backend, sin base de datos, sin autenticación.
- Sin PII de personas naturales.
- Español costarricense, precios en ₡, teléfonos `+506`.
- La tarjeta sigue siendo 85 × 54 mm imprimible con marcas de corte.
- El panel es inalcanzable desde el catálogo público (FR-025).

**Scale/Scope**: 1 feature, 3 historias, 25 requisitos. Affected: 1 vista nueva, 1 módulo puro
nuevo, 1 módulo de canvas nuevo, 3 componentes nuevos, tokens de diseño.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Riesgo | Veredicto |
|---|---|---|
| I. Español CR como idioma de producto | Etiquetas del panel, mensajes de error de descarga, textos de la tarjeta | ✅ Cumple — todo el copy en español CR con ₡ y +506 |
| II. Local-first y tipado centralizado | El panel lee el mismo `localStorage`; ¿se introduce un store nuevo? | ✅ Cumple — se reutiliza `useCatalogData()`; las métricas son derivadas, no persistidas |
| III. Marca por configuración | La tarjeta y el panel usan colores | ✅ Cumple — la tarjeta se colorea desde `activePalette`; los tokens 21st son la base neutra y la paleta de marca los sobrescribe |
| IV. Tipado estricto | APIs de canvas y métricas nuevas | ✅ Cumple — todo tipado, sin `any`, sin casts inseguros |
| V. YAGNI y reutilización de `utils/` | ¿Duplicar cálculos de precio? ¿Dependencia para exportar PNG? | ✅ Cumple — `stats.ts` y `cardImage.ts` son módulos puros nuevos; se reutiliza `formatColones` y `calculateCommission`; sin dependencias nuevas |

**Complejidad introducida**: ninguna.

## Project Structure

### Documentation (this feature)

```text
specs/004-panel-admin-tarjeta-png/
├── plan.md              # Este archivo
├── spec.md              # Especificación
├── research.md          # Decisiones de diseño
├── data-model.md        # Métricas y entidades
├── quickstart.md        # Guía de validación
├── contracts/
│   ├── stats.md         # Contrato de las métricas
│   └── card-image.md    # Contrato del render de la tarjeta
├── checklists/
│   └── requirements.md  # Checklist de calidad de la spec
├── tasks.md             # Tareas de implementación
└── verification.md      # Reporte de validación
```

### Source Code (repository root)

```text
src/
├── utils/
│   ├── stats.ts             # NUEVO: métricas puras del catálogo
│   ├── stats.test.ts        # NUEVO: pruebas de las métricas
│   ├── cardImage.ts         # NUEVO: dibujo de la tarjeta en canvas + export PNG
│   ├── cardImage.test.ts    # NUEVO: pruebas de dimensiones y composición
│   ├── products.ts          # sin cambios
│   ├── formatters.ts        # sin cambios
│   └── routing.ts           # sin cambios
├── components/
│   ├── admin/
│   │   ├── AdminPanel.tsx        # NUEVO: layout + KPIs del panel
│   │   ├── MetricCard.tsx        # NUEVO: tarjeta de métrica
│   │   ├── DistributionChart.tsx # NUEVO: barras de distribución
│   │   ├── HighlightedProducts.tsx # NUEVO: productos destacados
│   │   └── ProductTable.tsx      # NUEVO: tabla de gestión
│   ├── AdvisorDashboard.tsx  # MODIFICADO: tercera pestaña "Panel"
│   ├── Navbar.tsx             # MODIFICADO: pestaña del panel
│   ├── CardStudio.tsx         # MODIFICADO: vista previa en canvas + descargas PNG
│   └── ...                    # resto sin cambios
├── index.css                 # MODIFICADO: tokens de diseño (base 21st)
└── ...                       # resto sin cambios
```

**Structure Decision**: Se mantiene la estructura existente. Los componentes del panel viven en
`components/admin/` porque son un grupo cohesivo de 5 piezas; el módulo de canvas y el de métricas
son `utils/` puros, siguiendo la convención de `utils/formatters.ts` y `utils/products.ts`.

## Complexity Tracking

> Sin violaciones.

---

## Fase 0 → Fase 1

Ver `research.md`, `data-model.md`, `contracts/stats.md`, `contracts/card-image.md` y
`quickstart.md`.
