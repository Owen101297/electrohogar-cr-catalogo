# Implementation Plan: Separar la vista pública del catálogo y la vista del asesor

**Branch**: `002-vista-publica-asesor` | **Date**: 2026-11-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-vista-publica-asesor/spec.md`

## Summary

Convertir la aplicación en dos experiencias separadas por ruta:

- **`/`** → **catálogo público**: lo que ve el cliente que escanea el QR. Solo consulta y contacto
  por WhatsApp. Cero herramientas de administración, cero porcentajes de ganancia, cero enlaces al
  modo asesor.
- **`/asesor`** → **interfaz de administración**: la app actual completa (alta/edición/baja de
  productos, comisiones, diseñador de tarjetas con QR, vista digital).

La separación no es "ocultar botones": son dos pantallas distintas, con componentes distintos. El
enrutado se resuelve con el *pathname* de la URL, sin instalar router. Vercel sirve ambas rutas
desde el mismo build (rewrite `/(.*) → /index.html`).

Decisiones clave:

- **Sin router**: la app es de una sola página; el pathname decide qué pantalla se monta. Evita
  una dependencia nueva (principio V, YAGNI).
- **Sesión de asesor en `sessionStorage`**: se descarta al cerrar el navegador (FR-008), y a
  diferencia de `localStorage` **no** se comparte entre pestañas del mismo navegador — lo que
  cumple FR-016 de forma nativa.
- **Confirmación explícita al entrar** (FR-007): evita que un cliente que teclee la ruta entre por
  accidente.
- **QR siempre al catálogo público**: el generador de QR toma una URL pública explícita, nunca el
  `window.location.href` actual (que dentro de `/asesor` apuntaría a la ruta interna).
- **Reutilización de `CatalogView` y `ProductDetailModal`**: se les añade una prop `isAdvisor` en
  lugar de duplicarlos. Menos código y una sola lista de campos que mantener.

## Technical Context

**Language/Version**: TypeScript 7.0.2, React 19.0.1, Node 26.x

**Primary Dependencies**: `react` 19, `react-dom` 19, `vite` 8, `@tailwindcss/vite` 4,
`lucide-react` 0.546, `qrcode` 1.5.4. **Sin dependencias nuevas.**

**Storage**: `localStorage` (`electrohogar_cr_*_v2`) para catálogo, perfil y comisiones;
`sessionStorage` para la sesión de asesor.

**Testing**: `node:test` vía `tsx` (ya presente) + `tsc --noEmit` con `strict: true` + verificación
funcional en navegador con Playwright.

**Target Platform**: Navegador moderno, móvil y escritorio. SPA servida por Vercel.

**Project Type**: Aplicación web SPA con dos rutas.

**Performance Goals**: La pantalla pública carga el catálogo completo sin bloquear; el cambio de
pantalla no recarga la página.

**Constraints**:
- Sin backend, sin base de datos, sin autenticación (constitución).
- Sin PII de personas naturales.
- Español costarricense, precios en ₡, teléfonos `+506`.
- La tarjeta imprimible sigue siendo 85 × 54 mm con marcas de corte.
- El build de Vercel usa `npm install --legacy-peer-deps` (conflictivo con `esbuild`/`vite@8`).

**Scale/Scope**: 1 feature, 3 historias, 16 requisitos. Affected: enrutado, 5 componentes, config
de despliegue.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Riesgo | Veredicto |
|---|---|---|
| I. Español CR como idioma de producto | Textos nuevos de las dos pantallas y del diálogo de confirmación | ✅ Cumple — todos los textos en español CR con ₡ y +506 |
| II. Local-first y tipado centralizado | Se introduce `sessionStorage` además de `localStorage` | ✅ Cumple — `sessionStorage` es almacenamiento local del navegador, no un backend; `Product` no cambia de forma, sin migración |
| III. Marca por configuración | Las dos pantallas deben respetar la paleta activa | ✅ Cumple — ambas reciben `activePalette` y derivan sus colores de ella; cero hex literales nuevos |
| IV. Tipado estricto | Props nuevas y enrutado manual | ✅ Cumple — `isAdvisor: boolean` explícito en todas las props; sin `any` |
| V. YAGNI y reutilización | ¿Duplicar `CatalogView` para la vista pública? | ✅ Cumple — se reutiliza con una prop `isAdvisor` en vez de duplicar; sin router y sin dependencias nuevas |

**Complejidad introducida**: ninguna. Sin sección de Complexity Tracking.

**Nota sobre `sessionStorage`**: la constitución exige que el estado de dominio viva en
`localStorage`. La sesión de asesor **no es estado de dominio** — es estado efímero de sesión que
por requisito funcional (FR-008) debe morir con el navegador. Usar `localStorage` para eso
incumpliría FR-008. Por eso va en `sessionStorage`, y la decisión queda documentada en
`research.md` (R-003).

## Project Structure

### Documentation (this feature)

```text
specs/002-vista-publica-asesor/
├── plan.md              # Este archivo
├── spec.md              # Especificación
├── research.md          # Decisiones de diseño
├── data-model.md        # Entidades y estados
├── quickstart.md        # Guía de validación
├── contracts/           # Contrato de rutas y sesión
├── checklists/
│   └── requirements.md  # Checklist de calidad de la spec
├── tasks.md             # Tareas de implementación
└── verification.md      # Reporte de validación en navegador
```

### Source Code (repository root)

```text
src/
├── main.tsx                     # sin cambios: monta <App/>
├── App.tsx                      # MODIFICADO: enruta por pathname → AppRouter
├── AppRouter.tsx                # NUEVO: decide pantalla pública vs asesor
├── types.ts                     # sin cambios
├── data/                        # sin cambios
├── utils/
│   ├── formatters.ts            # sin cambios
│   ├── products.ts              # sin cambios
│   ├── products.test.ts         # sin cambios
│   ├── routing.ts               # NUEVO: rutas, detección de modo, sesión de asesor
│   └── routing.test.ts          # NUEVO: pruebas de rutas y sesión
├── components/
│   ├── PublicCatalog.tsx        # NUEVO: pantalla pública (cliente)
│   ├── AdvisorDashboard.tsx     # NUEVO: pantalla de administración (extrae la app actual)
│   ├── PublicHeader.tsx         # NUEVO: encabezado limpio del catálogo público
│   ├── CatalogView.tsx          # MODIFICADO: prop isAdvisor
│   ├── ProductDetailModal.tsx   # MODIFICADO: prop isAdvisor
│   ├── Footer.tsx               # MODIFICADO: prop isAdvisor (quita el enlace a la tarjeta)
│   ├── Navbar.tsx               # sin cambios (solo se usa en modo asesor)
│   ├── CardStudio.tsx           # MODIFICADO: QR a URL pública + vista previa e impresión
│   ├── DigitalCardModal.tsx     # MODIFICADO: QR a URL pública
│   ├── ConfirmDialog.tsx        # sin cambios
│   ├── UndoToast.tsx            # sin cambios
│   ├── ProductFormModal.tsx     # sin cambios
│   ├── CommissionCalculatorModal.tsx  # sin cambios
│   └── QRCodeRenderer.tsx       # sin cambios
└── index.css                    # sin cambios

vercel.json                     # MODIFICADO: rewrite SPA para /asesor
```

**Structure Decision**: Se mantiene la estructura existente (`components/`, `utils/`). Se añaden tres
componentes nuevos de pantalla (`PublicCatalog`, `AdvisorDashboard`, `PublicHeader`) porque las dos
experiencias son estructuralmente distintas y duplicar el JSX de la app actual dentro de `App.tsx`
haría ese archivo inmanejable. `App.tsx` queda como un enrutador delgado.

## Complexity Tracking

> Sin violaciones.

---

## Fase 0 → Fase 1

Ver `research.md`, `data-model.md`, `contracts/routing.md` y `quickstart.md`.
