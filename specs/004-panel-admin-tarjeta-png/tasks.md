---

description: "Task list for feature 004-panel-admin-tarjeta-png"
---

# Tasks: Panel administrativo del catálogo y tarjeta de presentación en PNG

**Input**: Design documents from `/specs/004-panel-admin-tarjeta-png/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/stats.md,
contracts/card-image.md, quickstart.md

**Tests**: Las pruebas de las métricas y de la geometría de la tarjeta **sí** están incluidas: las
cifras del panel deben coincidir con el cálculo manual (SC-001) y el PNG debe tener la resolución
de impresión (SC-005). Se validan con `node:test` vía `tsx`, sin dependencias nuevas.

**Organization**: Tareas agrupadas por historia de usuario.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede ejecutarse en paralelo (archivos distintos, sin dependencias)
- **[Story]**: historia de usuario a la que pertenece la tarea

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Tokens de diseño y base del panel

- [x] T001 [P] Aplicar en `src/index.css` el sistema de tokens basado en 21st.dev (tema
      *Modern Minimal*: colores neutros, `--radius: 0.375rem`, Inter + Source Serif 4 +
      JetBrains Mono) como `@theme` de Tailwind v4, combinado con la paleta corporativa de la app
- [x] T002 [P] Crear `src/components/admin/MetricCard.tsx`: tarjeta de métrica reutilizable
      (etiqueta, valor en colones o porcentaje, icono y detalle)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Módulo puro de métricas. Ninguna historia del panel puede implementarse sin esto.

- [x] T003 Crear `src/utils/stats.ts` con `computeCatalogMetrics`, `buildProductRows` y
      `filterAndSortRows` según `contracts/stats.md`
- [x] T004 [P] Añadir a `src/utils/stats.ts` las constantes de copy del panel en español CR
- [x] T005 Crear `src/utils/stats.test.ts` con los casos de métricas: total, valor total, precio
      promedio, descuento promedio, comisión potencial, distribuciones, destacados, catálogo
      vacío sin NaN, filtro y orden de la tabla
- [x] T006 [P] Crear `src/utils/cardImage.ts` con las constantes de geometría, `drawBusinessCard`,
      `renderCardPreview`, `renderCardSheet` y `downloadCanvasAsPng` (FR-014 a FR-019)
- [x] T007 [P] Crear `src/utils/cardImage.test.ts` con las pruebas de dimensiones, hoja de 8
      tarjetas y nombres de archivo

---

## Phase 3: User Story 1 - Ver el estado de mi catálogo (P1)

**Goal**: El panel muestra las métricas del negocio.

**Independent test**: Abrir el panel con un catálogo conocido y comprobar las cifras contra el
cálculo manual.

- [x] T008 [P] [US1] Crear `src/components/admin/DistributionChart.tsx`: barras horizontales con
      unidades, valor en colones y porcentaje (FR-007, FR-008)
- [x] T009 [P] [US1] Crear `src/components/admin/HighlightedProducts.tsx`: listas de productos con
      mayor valor y mayor descuento (FR-009)
- [x] T010 [US1] Crear `src/components/admin/AdminPanel.tsx`: layout del panel con las tarjetas de
      métrica, las distribuciones y los destacados (FR-001 a FR-009)
- [x] T011 [US1] Estado vacío del panel en español con la acción de agregar producto cuando el
      catálogo no tiene productos (FR-013)
- [x] T012 [US1] En `src/components/AdvisorDashboard.tsx`: añadir la tercera pestaña "Panel" y
      cablear `advisorSettings` al cálculo de la comisión potencial (FR-006, FR-023)
- [x] T013 [US1] En `src/components/Navbar.tsx`: añadir la pestaña "Panel" con su icono

**Checkpoint**: T008–T013 completos → `npm run lint` + `npm test` en verde → verificar Escenarios
1, 2, 3, 4 y 5 de `quickstart.md` → **commit**.

---

## Phase 4: User Story 2 - Gestionar el catálogo desde una tabla (P1)

**Goal**: Tabla de gestión con búsqueda, orden, edición y eliminación.

**Independent test**: Buscar un producto en la tabla, editarlo y eliminarlo.

- [x] T014 [US2] Crear `src/components/admin/ProductTable.tsx`: tabla con imagen, nombre, marca,
      tienda, precio de contado y descuento, con acciones de editar y eliminar (FR-010, FR-011)
- [x] T015 [US2] Implementar el buscador y los controles de orden en la tabla, con el texto
      normalizado (FR-012)
- [x] T016 [US2] Conectar la tabla con los handlers de edición y eliminación ya existentes en
      `AdvisorDashboard`, incluyendo la confirmación y el aviso de deshacer (FR-011)
- [x] T017 [US2] Verificar que las métricas del panel se recalculan al editar o eliminar desde la
      tabla (FR-023)

**Checkpoint**: T014–T017 completos → `npm run lint` + `npm test` en verde → verificar Escenarios 6,
7 y 8 de `quickstart.md` → **commit**.

---

## Phase 5: User Story 3 - Descargar la tarjeta en PNG (P1)

**Goal**: La tarjeta se descarga como PNG de 300 DPI.

**Independent test**: Descargar el PNG y abrirlo: dimensiones correctas y QR escaneable.

- [x] T018 [US3] En `src/components/CardStudio.tsx`: reemplazar la vista previa en DOM por el
      lienzo con `renderCardPreview`, conservando el volteo frente/reverso (FR-019)
- [x] T019 [US3] Generar el QR como data URL para el lienzo, apuntando a la URL pública del
      catálogo (FR-017)
- [x] T020 [US3] Añadir las descargas de PNG: anverso, reverso y hoja de 8 tarjetas, con nombres
      de archivo en español (FR-014, FR-015, FR-018)
- [x] T021 [US3] Advertir en español cuando falta el teléfono de WhatsApp antes de permitir la
      descarga (FR-021)
- [x] T022 [US3] Capturar el fallo de descarga y ofrecer la impresión como alternativa, en español
      (FR-022)
- [x] T023 [US3] Mantener la impresión en papel de la hoja de 8 tarjetas, ahora alimentada por el
      mismo render de canvas (FR-018)

**Checkpoint**: T018–T023 completos → `npm run lint` + `npm test` + `npm run build` en verde →
verificar Escenarios 9, 10, 11 y 12 de `quickstart.md` → **commit**.

---

## Phase 6: Persistence & Polish

**Purpose**: Consolidar, documentar y cerrar la feature

- [x] T024 [P] Verificar que el panel y el diseñador son inalcanzables desde el catálogo público
      (FR-025)
- [x] T025 [P] Revisar que todo el copy nuevo esté en español CR con `₡` y `+506`
- [x] T026 Ejecutar `npm run lint`, `npm test` y `npm run build` — los tres en verde
- [x] T027 Recorrer los 12 escenarios de `quickstart.md` en navegador y registrar el resultado en
      `specs/004-panel-admin-tarjeta-png/verification.md`
- [x] T028 Desplegar en Vercel y verificar en producción que `/asesor` muestra el panel y que la
      descarga del PNG funciona
- [x] T029 Marcar `tasks.md` como completado y la spec como `Status: Complete`

---

## Dependencias

```text
Phase 1 (T001–T002)
   └── Phase 2 (T003–T007)  [bloqueante]
          ├── Phase 3 (T008–T013)  [US1 — panel]
          ├── Phase 4 (T014–T017)  [US2 — tabla de gestión]
          └── Phase 5 (T018–T023)  [US3 — PNG]
                 └── Phase 6 (T024–T029)

Paralelizables: T001, T002, T004, T006, T007, T008, T009, T024, T025
```

## Estrategia de commit

| Commit | Tareas | Mensaje |
|---|---|---|
| 1 | T001–T007 | `feat: add catalog metrics module, card canvas renderer and design tokens` |
| 2 | T008–T013 | `feat: add administrative dashboard to advisor mode` |
| 3 | T014–T017 | `feat: add product management table to the admin panel` |
| 4 | T018–T023 | `feat: render business card on canvas and export PNG at 300 DPI` |
| 5 | T024–T029 | `docs: verify panel and PNG export in production` |

## Fuera de alcance (declarado en la spec)

- Exportar el catálogo completo como PDF o CSV.
- Historial de ventas y metas guardadas (las proyecciones siguen siendo estimadas a partir del
  margen).
- Subir un logotipo como archivo: el monograma de marca se compone en el lienzo.
- Envío de la tarjeta por WhatsApp desde el panel.
