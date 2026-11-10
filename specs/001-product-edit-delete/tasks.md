---

description: "Task list for feature 001-product-edit-delete"
---

# Tasks: Editar y eliminar productos del catálogo

**Input**: Design documents from `/specs/001-product-edit-delete/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/products.md,
quickstart.md

**Tests**: Las pruebas unitarias de la lógica de producto **sí** están incluidas — la spec exige
reglas de precio verificables (FR-007 a FR-010) y el plan las hace ejecutables con `node:test`
vía `tsx`, sin dependencias nuevas.

**Organization**: Tareas agrupadas por historia de usuario, de modo que cada historia se pueda
implementar, probar y entregar de forma independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede ejecutarse en paralelo (archivos distintos, sin dependencias)
- **[Story]**: historia de usuario a la que pertenece la tarea

## Path Conventions

- **Single project**: `src/` en la raíz del repo
- Rutas de la feature: `specs/001-product-edit-delete/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Tipos compartidos y endurecimiento del tipado

- [x] T001 [P] Exportar `ProductStore` y `ProductCategory` en `src/types.ts` y usarlos en la
      interface `Product` (elimina los `as any` de los `select` de tienda y categoría)
- [x] T002 Exportar `ProductFormValues` y `ProductFormErrors` en `src/types.ts`
- [x] T003 Activar `"strict": true` en `tsconfig.json` y confirmar que `npm run lint` sigue
      pasando con 0 errores

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Módulo puro de lógica de producto. Ninguna historia puede implementarse sin esto.

**Criterio de completitud**: `npm run lint` y `npm test` en verde, y el módulo cubriendo
`contracts/products.md`.

- [x] T004 Crear `src/utils/products.ts` con `parseColones`, `calculateDiscountPercent`,
      `estimateQuincenalInstallment` (fórmula `precio * 1.35 / (meses * 2)`)
- [x] T005 [P] Añadir a `src/utils/products.ts` las constantes de copy en español
      (`PRODUCT_FORM_VALIDATION_MESSAGES`, `DELETE_CONFIRM_*`, `UNDO_DELETE_*`,
      `EMPTY_CATALOG_*`)
- [x] T006 Implementar `validateProductForm` en `src/utils/products.ts` según la tabla de
      `data-model.md` (mensajes en español CR)
- [x] T007 Implementar `emptyProductFormValues` y `productToFormValues` (pre-carga todos los
      campos, FR-002)
- [x] T008 Implementar `buildProductFromForm` con normalización de precios (FR-008), descuento
      derivado (FR-009), cuota quincenal capturada o calculada (FR-010) y preservación de
      `id`/`sku`/`specs.details` en edición (FR-003)
- [x] T009 Crear `src/utils/products.test.ts` con las 10 pruebas listadas en `quickstart.md`
      (tabla "Pruebas unitarias")
- [x] T010 Añadir el script `"test": "tsx --test src/utils/*.test.ts"` a `package.json`

---

## Phase 3: User Story 1 - Corregir un producto ya publicado (P1)

**Goal**: Abrir la edición de cualquier producto, cambiar sus valores y verlos aplicados de
inmediato en el catálogo y en la ficha.

**Independent test**: Abrir la ficha de un producto, editar el precio, guardar, y verificar que
catálogo, ficha y enlace de WhatsApp muestran el valor nuevo.

- [x] T011 [P] [US1] Crear `src/components/ProductFormModal.tsx` con props `mode`
      (`'create' | 'edit'`), `product?`, `onSubmit`, `onClose` — formulario único para alta y
      edición (decisión R-002)
- [x] T012 [US1] Implementar la precarga del formulario en modo edición vía
      `productToFormValues` (FR-002) y los defaults de alta vía `emptyProductFormValues`
- [x] T013 [US1] Renderizar los 13 campos del formulario con etiquetas en español CR, `₡` en los
      campos de precio y `+506` en el teléfono (FR-015)
- [x] T014 [US1] Mostrar los mensajes de `validateProductForm` bajo cada campo y bloquear el
      guardado mientras haya errores (FR-007)
- [x] T015 [US1] Construir el producto con `buildProductFromForm` y emitirlo por `onSubmit` al
      guardar (FR-003)
- [x] T016 [US1] Renombrar `src/components/AddProductModal.tsx` → `src/components/ProductFormModal.tsx`
      migrando su lógica de alta al modo `create`, y eliminar el archivo original
- [x] T017 [US1] En `src/App.tsx`: añadir estado `editingProduct`, handler `handleUpdateProduct`
      que reemplaza el producto por `id` conservando el orden del catálogo
- [x] T018 [US1] En `src/components/ProductDetailModal.tsx`: añadir botón **"Editar producto"**
      y la prop `onEditProduct` (FR-001)
- [x] T019 [US1] En `src/components/ProductDetailModal.tsx`: derivar plazo y cuota de
      `product.installmentMonths` / `product.installmentQuincenal` en lugar del estado fijo
      `selectedTermMonths` (FR-011, decisión R-010)
- [x] T020 [US1] En `src/components/ProductDetailModal.tsx`: incluir el precio de contado en el
      enlace de WhatsApp cuando la modalidad es "Contado Directo" (el valor enviado hoy es la
      cuota mensual)

**Checkpoint**: T011–T020 completos → `npm run lint` + `npm test` en verde → verificar
Escenarios 1, 2, 3, 4, 5, 6, 11 y 12 de `quickstart.md` → **commit**.

---

## Phase 4: User Story 2 - Quitar un producto por error (P2)

**Goal**: Eliminar un producto del catálogo previa confirmación explícita que muestre su nombre.

**Independent test**: Agregar un producto de prueba, eliminarlo con confirmación, y verificar que
desaparece del catálogo, del contador y de la búsqueda.

- [x] T021 [P] [US2] Crear `src/components/ConfirmDialog.tsx` genérico (decisión R-004) con
      `isOpen`, `title`, `message`, `confirmLabel`, `cancelLabel`, `onConfirm`, `onClose`
- [x] T022 [US2] En `src/components/ProductDetailModal.tsx`: añadir botón **"Eliminar producto"**
      con icono de papelera y la prop `onDeleteProduct` (FR-004)
- [x] T023 [US2] En `src/App.tsx`: estado `productToDelete` + handler `handleDeleteProduct` que
      quita el producto del array por `id`
- [x] T024 [US2] En `src/App.tsx`: renderizar `ConfirmDialog` con el nombre exacto del producto
      en el mensaje (FR-005, SC-003) y cancelar sin efectos
- [x] T025 [US2] En `src/components/CatalogView.tsx`: estado vacío diferenciado cuando
      `products.length === 0` con el mensaje y la acción de agregar (FR-013)

**Checkpoint**: T021–T025 completos → `npm run lint` + `npm test` en verde → verificar Escenarios 7
y 10 de `quickstart.md` → **commit**.

---

## Phase 5: User Story 3 - Deshacer una eliminación equivocada (P3)

**Goal**: Recuperar un producto eliminado hace segundos, con todos sus valores intactos.

**Independent test**: Eliminar un producto, pulsar "Deshacer" dentro del periodo disponible y
verificar que vuelve al catálogo con sus valores.

- [x] T026 [P] [US3] Crear `src/components/UndoToast.tsx` que recibe `message`, `actionLabel`,
      `onAction` y `onDismiss`, y se auto-oculta tras un temporizador
- [x] T027 [US3] En `src/App.tsx`: estado `pendingDeletion` (`{ product, index, expiresAt }`) que
      se arma al eliminar y se descarta al expirar (decisión R-003)
- [x] T028 [US3] En `src/App.tsx`: handler `handleUndoDelete` que reinserta el producto en su
      posición original (FR-012, SC-004)
- [x] T029 [US3] En `src/App.tsx`: renderizar `UndoToast` cuando hay `pendingDeletion` y limpiar
      el temporizador al desmontar

**Checkpoint**: T026–T029 completos → `npm run lint` + `npm test` en verde → verificar Escenario 8
de `quickstart.md` → **commit**.

---

## Phase 6: Persistence & Polish

**Purpose**: Consolidar el comportamiento entre sesiones y cerrar los huecos de la spec

- [x] T030 [P] En `src/App.tsx`: escuchar el evento `storage` de `localStorage` para recargar
      `products` cuando otra pestaña modifica el catálogo (edge case de la spec, decisión R-005)
- [x] T031 [P] Verificar que el alta de productos sigue funcionando idéntica tras el renombrado
      de `AddProductModal` → `ProductFormModal` (FR-014, sin regresiones)
- [x] T032 [P] Revisar que todo el copy nuevo esté en español CR con `₡` y `+506`, y que ningún
      componente nuevo fije colores de marca hardcodeados (principios I y III)
- [x] T033 Ejecutar `npm run lint`, `npm test` y `npm run build` — los tres en verde
- [x] T034 Recorrer los 12 escenarios de `quickstart.md` en el navegador con `npm run dev` y
      registrar el resultado en `specs/001-product-edit-delete/verification.md`
- [x] T035 Actualizar `specs/001-product-edit-delete/checklists/requirements.md` con el estado
      final y `specs/001-product-edit-delete/spec.md` a `Status: Complete`

---

## Dependencias

```text
Phase 1 (T001–T003)
   └── Phase 2 (T004–T010)  [bloqueante: sin lógica de producto no hay formulario]
          ├── Phase 3 (T011–T020)  [US1 — P1]
          ├── Phase 4 (T021–T025)  [US2 — P2, depende de T022]
          └── Phase 5 (T026–T029)  [US3 — P3, depende de T023]
                 └── Phase 6 (T030–T035)

Paralelizables dentro de cada fase:
  - T005, T009, T021, T026, T030, T031, T032
```

## Estrategia de commit

Un commit por historia completada, para que cada historia sea un incremento entregable:

| Commit | Tareas | Mensaje |
|---|---|---|
| 1 | T001–T010 | `feat: add strict types and pure product logic module` |
| 2 | T011–T020 | `feat: allow editing existing catalog products` |
| 3 | T021–T025 | `feat: allow deleting catalog products with confirmation` |
| 4 | T026–T029 | `feat: allow undoing a product deletion` |
| 5 | T030–T035 | `chore: cross-tab sync, verification and spec closure` |

## Fuera de alcance (declarado en la spec)

- Sincronización entre dispositivos / backend / autenticación.
- Reordenar productos manualmente (dragging).
- Edición de los bullets `specs.details` (se preservan; decisión R-008).
- Selector de plazo interactivo en la ficha (decisión R-010).
- Galerías de imágenes múltiples por producto.
