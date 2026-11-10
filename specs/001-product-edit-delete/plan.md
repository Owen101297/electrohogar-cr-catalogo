# Implementation Plan: Editar y eliminar productos del catálogo

**Branch**: `001-product-edit-delete` | **Date**: 2026-11-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-product-edit-delete/spec.md`

## Summary

Extender el catálogo para que la asesora pueda **editar** y **eliminar** productos ya publicados,
hoy imposibles: solo existe el alta. La solución reutiliza el formulario de alta existente
convirtiéndolo en un formulario único de alta/edición (modo dual), extrae la lógica de negocio de
productos a un módulo puro y testeable (`src/utils/products.ts`), y añade eliminación con
confirmación explícita más una acción de "Deshacer" de corta duración.

Decisiones técnicas clave:

- **Un solo formulario** (`ProductFormModal`) con modo `create`/`edit`, en lugar de duplicar la
  lista de campos en dos componentes (evita que ambas listas diverjan).
- **Lógica de producto en módulo puro** (`src/utils/products.ts`): normalización de precios,
  cálculo de descuento, cálculo de cuota quincenal y validación. Es la única forma de garantizar
  que las reglas de la spec (FR-007 a FR-010) se apliquen igual en alta, edición y en los tests.
- **Sin dependencias nuevas**: se usa `node:test` + `tsx` (ya presente como devDependency) para las
  pruebas unitarias de lógica pura. `tsc --noEmit --strict` pasa limpio hoy, así que se puede
  endurecer el proyecto a modo estricto.
- **Deshacer** con estado en memoria y temporizador de 6 s, no con servicio externo.

## Technical Context

**Language/Version**: TypeScript 5.9+ (TS 7.0.2 en devDependencies), React 19.0.1, Node 26.x (local)

**Primary Dependencies**: `react` 19, `react-dom` 19, `vite` 8, `@tailwindcss/vite` 4, `lucide-react`
0.546, `qrcode` 1.5.4, `motion` 12. Sin dependencias nuevas.

**Storage**: `localStorage` del navegador bajo claves versionadas `electrohogar_cr_*_v2`. Sin backend,
sin base de datos, sin autenticación.

**Testing**: `node:test` ejecutado vía `tsx` (ya es devDependency) + `tsc --noEmit --strict`.
Sin framework de test nuevo (principio V, YAGNI).

**Target Platform**: Navegador moderno en móvil (uso puerta a puerta) y escritorio. PWA estática.

**Project Type**: Aplicación web SPA (frontend-only)

**Performance Goals**: 60 fps en scroll del catálogo con 100+ productos; abrir/guardar un formulario
< 100 ms de respuesta perceived; catálogo persistente que restaura < 500 ms tras recargar.

**Constraints**:
- Sin backend, sin auth, sin base de datos (constitución: Stack y Restricciones Técnicas).
- Sin PII de personas naturales: solo datos de empresa/marca.
- Los datos de negocio en español costarricense, precios en ₡ (`es-CR`), teléfonos `+506`.
- La app debe seguir funcionando sin conexión (imágenes remotas con fallback local).
- El esquema de `localStorage` no cambia: `Product` no muta de forma → sin migración.

**Scale/Scope**: 1 feature, 3 historias de usuario, ~15 requisitos funcionales. Catálogo típico de
10–100 productos.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Riesgo para esta feature | Veredicto |
|---|---|---|
| I. Español CR como idioma de producto | Todos los textos nuevos (validación, confirmación, deshacer, estado vacío) deben estar en español CR con ₡ y +506 | ✅ Cumple — textsCentralizados en `src/utils/products.ts` (constantes) y en los componentes |
| II. Local-first y tipado centralizado | La feature muta el catálogo persistido | ✅ Cumple — se reusa la clave `electrohogar_cr_products_v2`; `Product` no cambia de forma, sin migración; todo estado nuevo vive en `App.tsx` (ya existente) |
| III. Marca por configuración, no código muerto | Riesgo de hardcodear colores al añadir UI nueva | ✅ Cumple — se reutilizan `activePalette` y las clases Tailwind ya presentes; cero hex literales nuevos fuera de `palettes.ts` |
| IV. Tipado estricto y verificación | `as any` en selects es deuda heredada; la feature no debe propagarla | ✅ Cumple — los `select` nuevos usan un tipo explícito exported (`ProductStore`, `ProductCategory`) sin casts; la feature incluye endurecer `tsconfig` a `strict` |
| V. YAGNI y reutilización de `utils/` | tempted a duplicar lógica de precios/WhatsApp en el formulario de edición | ✅ Cumple — toda la lógica de producto (parseo de precios, descuento, cuota, validación) vive en `src/utils/products.ts` y se reutiliza desde `formatters.ts` y desde ambos modos del formulario |

**Complejidad introducida**: ninguna. No hay sección de Complexity Tracking porque no hay
violaciones que justificar.

**Decisión sobre `tsconfig`**: el plan añade `"strict": true`. Verificado que `tsc --noEmit --strict`
pasa con **0 errores** sobre el código actual, por lo que endurecer el proyecto no rompe nada
existente y hace que el principio IV sea realmente exigible (hoy `strict` no está activo en
`tsconfig.json`, lo que hace que el principio sea aspiracional).

## Project Structure

### Documentation (this feature)

```text
specs/001-product-edit-delete/
├── plan.md              # Este archivo
├── spec.md              # Especificación (/speckit.specify)
├── research.md          # Phase 0: decisiones de investigación
├── data-model.md        # Phase 1: modelo de datos
├── quickstart.md        # Phase 1: guía de validación
├── contracts/
│   └── products.md      # Phase 1: contrato de la API interna de productos
├── checklists/
│   └── requirements.md  # Checklist de calidad de la spec
└── tasks.md             # Phase 2: tareas (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── types.ts                       # MODIFICADO: + ProductStore, ProductCategory, ProductFormValues
├── data/
│   ├── initialProducts.ts         # sin cambios
│   └── palettes.ts                # sin cambios
├── utils/
│   ├── formatters.ts              # MODIFICADO: reutiliza products.ts; + formatPercent
│   ├── products.ts                # NUEVO: lógica pura de producto (parseo, validación, descuento, cuota)
│   └── products.test.ts           # NUEVO: pruebas unitarias (node:test)
├── components/
│   ├── ProductFormModal.tsx       # NUEVO: formulario único alta/edición (reemplaza AddProductModal)
│   ├── AddProductModal.tsx        # ELIMINADO: su lógica vive ahora en ProductFormModal
│   ├── ProductDetailModal.tsx     # MODIFICADO: botones Editar / Eliminar + plazo real
│   ├── ConfirmDialog.tsx          # NUEVO: diálogo de confirmación de eliminación
│   ├── UndoToast.tsx              # NUEVO: aviso con acción "Deshacer"
│   ├── CatalogView.tsx            # MODIFICADO: estado vacío + acceso a edición
│   ├── CardStudio.tsx             # sin cambios
│   ├── DigitalCardModal.tsx       # sin cambios
│   ├── CommissionCalculatorModal.tsx  # sin cambios
│   ├── Navbar.tsx                 # sin cambios
│   ├── Footer.tsx                 # sin cambios
│   └── QRCodeRenderer.tsx         # sin cambios
└── App.tsx                        # MODIFICADO: estado de edición/deshacer + handlers
```

**Structure Decision**: Estructura existente de SPA con `components/` + `utils/` + `data/`. No se
introduce capas nuevas ni subcarpetas. El módulo puro `utils/products.ts` sigue la convención ya
presente de `utils/formatters.ts` (constitución II y V).

## Complexity Tracking

> Sin violaciones. La feature no introduce dependencias, ni capas, ni abstracciones nuevas más allá
> del módulo puro de productos, que es la forma mínima de testear las reglas de precio.

---

## Fase 0 → Fase 1

Ver `research.md` (decisiones y alternativas), `data-model.md` (entidades y reglas de validación),
`contracts/products.md` (contrato interno) y `quickstart.md` (guía de validación ejecutable).
