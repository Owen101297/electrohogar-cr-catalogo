---

description: "Task list for feature 002-vista-publica-asesor"
---

# Tasks: Separar la vista pública del catálogo y la vista del asesor

**Input**: Design documents from `/specs/002-vista-publica-asesor/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/routing.md, quickstart.md

**Tests**: Las pruebas del módulo de enrutado **sí** están incluidas — es la parte más delicada
de la feature y se valida como funciones puras (decisión R-008). La verificación de las dos
pantelas se hace en navegador real siguiendo `quickstart.md`.

**Organization**: Tareas agrupadas por historia de usuario.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede ejecutarse en paralelo (archivos distintos, sin dependencias)
- **[Story]**: historia de usuario a la que pertenece la tarea

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Módulo de rutas y sesión, base de las dos pantallas

- [x] T001 Crear `src/utils/routing.ts` con `Route`, `resolveRoute`, `getPublicCatalogUrl`,
      `isAdvisorSessionActive`, `startAdvisorSession`, `endAdvisorSession`, `ADVISOR_ROUTE`,
      `ADVISOR_SESSION_KEY` y las constantes de copy del diálogo de confirmación
- [x] T002 Crear `src/utils/routing.test.ts` con los 8 casos listados en `quickstart.md`
- [x] T003 [P] Modificar `vercel.json` para añadir el rewrite `/(.*) → /index.html` y que
      `/asesor` se sirva en producción (FR-001)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Aislar las pantallas antes de modificar componentes

- [x] T004 Extraer la implementación actual de `src/App.tsx` a `src/components/AdvisorDashboard.tsx`
      (sin cambios de comportamiento), dejando `src/App.tsx` como enrutador delgado
- [x] T005 Crear `src/components/PublicHeader.tsx`: encabezado limpio con logo, marca, tagline y
      WhatsApp, sin pestañas ni enlaces de administración
- [x] T006 Crear `src/components/PublicCatalog.tsx`: pantalla pública que monta `PublicHeader`,
      `CatalogView` (solo lectura), `ProductDetailModal` (solo lectura) y `Footer` (sin enlace a
      la tarjeta)

---

## Phase 3: User Story 1 - Ver el catálogo como cliente (P1)

**Goal**: La vista pública no muestra ninguna herramienta de administración.

**Independent test**: Abrir la raíz y recorrer el catálogo buscando texto y botones de administración.

- [x] T007 [P] [US1] Añadir prop `isAdvisor: boolean` a `CatalogView` y ocultar, cuando sea
      `false`, el botón "+ Agregar Producto", el botón "Configurar Tarjeta / QR" y la insignia de
      ganancia (FR-002, FR-004)
- [x] T008 [P] [US1] Añadir prop `isAdvisor: boolean` a `ProductDetailModal` y ocultar, cuando sea
      `false`, los botones "Editar producto" y "Eliminar producto" (FR-004)
- [x] T009 [P] [US1] Añadir prop `isAdvisor: boolean` a `Footer` y ocultar, cuando sea `false`, el
      enlace "Ver Tarjeta Corporativa con QR" (FR-002, FR-005)
- [x] T010 [US1] En `src/App.tsx`, montar `<PublicCatalog/>` cuando la ruta resuelva a `public`
      (FR-001)
- [x] T011 [US1] Garantizar que la vista pública no renderice ningún modal de administración
      (diseño de tarjetas, digital, comisiones, alta/edición, confirmación, deshacer) (FR-002)
- [x] T012 [US1] Verificar que la vista pública no exponga porcentajes de ganancia ni el enlace al
      margen en ninguna zona de la página (FR-003)

**Checkpoint**: T007–T012 completos → `npm run lint` + `npm test` en verde → verificar Escenarios 1,
2 y 10 de `quickstart.md` → **commit**.

---

## Phase 4: User Story 2 - Trabajar como asesor (P1)

**Goal**: El modo asesor vive en otra ruta, exige confirmación y su sesión muere con el navegador.

**Independent test**: Entrar por `/asesor`, confirmar, usar las herramientas, cerrar el navegador y
comprobar que la sesión se cerró.

- [x] T013 [US2] Crear la pantalla de confirmación de ingreso al modo asesor (título, cuerpo en
      español CR, botón "Entrar al modo asesor" y botón "Ver el catálogo") reutilizando
      `ConfirmDialog` (FR-007)
- [x] T014 [US2] Al entrar a `/asesor` sin sesión activa, mostrar la pantalla de confirmación; al
      confirmar, iniciar la sesión y montar `<AdvisorDashboard/>`; al cancelar, navegar a la raíz
      (FR-007)
- [x] T015 [US2] Al montar `<AdvisorDashboard/>` con sesión activa, no pedir confirmación otra vez
      (FR-007, FR-008)
- [x] T016 [US2] Añadir en el modo asesor una acción visible "Salir del modo asesor" que cierre la
      sesión y vuelva a la vista pública (FR-010)
- [x] T017 [US2] Usar `getPublicCatalogUrl()` en lugar de `window.location.href` para calcular el
      destino del QR, tanto en el diseñador de tarjetas como en la tarjeta digital (FR-011)
- [x] T018 [US2] Verificar que la sesión activa en una pestaña no habilita el modo asesor en otra
      pestaña del mismo navegador (FR-016)

**Checkpoint**: T013–T018 completos → `npm run lint` + `npm test` en verde → verificar Escenarios 3,
4, 5, 6 y 7 de `quickstart.md` → **commit**.

---

## Phase 5: User Story 3 - Imprimir la tarjeta de presentación (P1)

**Goal**: La tarjeta queda lista para imprimir, con el QR apuntando al catálogo público.

**Independent test**: Generar la hoja, imprimirla y escanear el QR.

- [x] T019 [US3] En `CardStudio`, mostrar la vista previa del anverso y el reverso de la tarjeta de
      forma clara, con la acción de imprimir prominente (FR-014)
- [x] T020 [US3] Verificar que la hoja de impresión mantiene 8 tarjetas de 85 × 54 mm con marcas de
      corte y que el CSS de impresión oculta toda la navegación (FR-012, FR-013)
- [x] T021 [US3] Confirmar que el QR de la hoja y el de la tarjeta digital apuntan a la URL pública
      y que no incluyen la ruta `/asesor` (FR-011)

**Checkpoint**: T019–T021 completos → `npm run lint` + `npm test` + `npm run build` en verde →
verificar Escenarios 7, 8 y 9 de `quickstart.md` → **commit**.

---

## Phase 6: Persistence & Polish

**Purpose**: Consolidar, documentar y cerrar la feature

- [x] T022 [P] Actualizar `README.md` con las dos rutas, cómo entrar al modo asesor y el comando
      de impresión
- [x] T023 [P] Revisar que todo el copy nuevo esté en español CR con `₡` y `+506`, y que ninguna
      pantalla nueva fije colores de marca hardcodeados
- [x] T024 Ejecutar `npm run lint`, `npm test` y `npm run build` — los tres en verde
- [x] T025 Recorrer los 10 escenarios de `quickstart.md` en navegador con `npm run dev` y registrar
      el resultado en `specs/002-vista-publica-asesor/verification.md`
- [x] T026 Desplegar en Vercel y verificar en producción que `/` y `/asesor` funcionan y que `/asesor`
      no devuelve 404
- [x] T027 Marcar `specs/002-vista-publica-asesor/tasks.md` como completado y la spec como
      `Status: Complete`

---

## Dependencias

```text
Phase 1 (T001–T003)
   └── Phase 2 (T004–T006)
          ├── Phase 3 (T007–T012)  [US1 — vista pública limpia]
          ├── Phase 4 (T013–T018)  [US2 — modo asesor en /asesor]
          └── Phase 5 (T019–T021)  [US3 — tarjeta imprimible]
                 └── Phase 6 (T022–T027)

Paralelizables: T003, T007, T008, T009, T022, T023
```

## Estrategia de commit

| Commit | Tareas | Mensaje |
|---|---|---|
| 1 | T001–T003 | `feat: add routing module with advisor session` |
| 2 | T004–T006 | `refactor: split app into advisor dashboard and public catalog` |
| 3 | T007–T012 | `feat: strip all advisor tooling from the public catalog` |
| 4 | T013–T018 | `feat: add advisor mode behind its own route with session` |
| 5 | T019–T021 | `feat: polish printable business card with public catalog QR` |
| 6 | T022–T027 | `docs: document both routes and close the feature` |

## Fuera de alcance (declarado en la spec)

- Autenticación real (usuario/contraseña, backend, base de datos).
- Sincronización del catálogo entre dispositivos.
- Dominio propio (se puede agregar después en Vercel sin cambios de código).
- Personalización del anverso con la URL web impresa: el usuario confirmó que el QR es suficiente.
