# Research: Editar y eliminar productos del catálogo

**Feature**: 001-product-edit-delete | **Date**: 2026-11-10

## R-001: ¿Cómo se evita duplicar la lógica de precios entre alta y edición?

**Decisión**: Extraer toda la lógica de producto a un módulo puro `src/utils/products.ts` con
funciones sin estado, y hacer que tanto el alta como la edición las consuman.

**Rationale**: La spec exige (FR-008, FR-009, FR-010) que el descuento, la normalización de
precios y la cuota quincenal se apliquen **igual** en alta y en edición. Si cada formulario
calcula por su cuenta, las reglas divergen — el fallo clásico. Un módulo puro además es
testeable sin DOM: es lo que permite verificar FR-007..FR-010 con `node:test`.

**Alternativas consideradas**:
- *Dejar el cálculo dentro del componente y duplicarlo en el de edición*: descartado, viola el
  principio V de la constitución (reutilización) y hace las reglas imposibles de verificar.
- *Usar un reducer global o librería de estado*: descartado, contradice el principio II (local-first
  sin store global nuevo) y es YAGNI para dos operaciones.

## R-002: ¿Un formulario único o dos componentes separados?

**Decisión**: Un solo componente `ProductFormModal` con prop `mode: 'create' | 'edit'` y un prop
opcional `product` que, en modo edición, precarga los campos.

**Rationale**: La spec (supuestos) pide explícitamente "un formulario de edición reutiliza el
formulario de alta de productos ya existente, de modo que ambas pantallas se comporten igual y no
se mantienen dos listas de campos que puedan divergir". El formulario de alta actual
(`AddProductModal`) ya cubre ~7 de los ~13 campos; reutilizarlo evita reescribir validaciones y
listas de campos, y garantiza que un campo nuevo aparezca en ambos modos a la vez.

**Alternativas consideradas**:
- *`AddProductModal` y `EditProductModal` separados*: descartado, duplica ~200 líneas y la lista
  de campos.
- *Convertir `AddProductModal` en modo dual sin renombrarlo*: descartado, el nombre queda
  engañoso cuando el componente también edita. Se renombra a `ProductFormModal` para que el
  nombre describa el comportamiento real.

## R-003: ¿Cómo se implementa "Deshacer" (US3)?

**Decisión**: Estado en memoria en `App.tsx`: `{ product, index, expiresAt }` con un
`temporizador` de 6 segundos. Al expirar, el estado se descarta.

**Rationale**: La spec define el periodo como "breve (segundos)" y asume que el deshacer solo
funciona "en la misma sesión de navegación; un reinicio del navegador cierra esa posibilidad".
Eso es exactamente un estado en memoria con timeout — no requiere persistencia ni servicio.

**Alternativas consideradas**:
- *Persistir el producto eliminado en `localStorage`*: descartado, complica la forma del dato
  persistido y contradice el supuesto explícito de la spec.
- *Pila de múltiples eliminaciones (Ctrl+Z estilo editor)*: descartado, YAGNI. La spec pide
  deshacer "un producto eliminado" con "una acción de deshacer"; una sola ranura es suficiente y
  más simple de entender.

## R-004: ¿Dónde vive la confirmación de eliminación?

**Decisión**: Un componente genérico `ConfirmDialog` reutilizable, no lógica inline en
`ProductDetailModal`.

**Rationale**: FR-005 exige confirmación que muestre el **nombre exacto** del producto. Un
componente genérico con slots de contenido permite usarlo aquí sin acoplarlo al dominio de
producto, y mantiene `ProductDetailModal` enfocado en presentar el producto.

**Alternativas consideradas**:
- *`window.confirm()`*: descartado — no es estilizable, rompe la identidad visual de la app
  (principio III) y no permite mostrar el nombre con el formato de la app.
- *Modal de confirmación dentro de `ProductDetailModal`*: descartado, mezcla dos responsabilidades
  y hace el componente más grande y difícil de leer.

## R-005: ¿Cómo se garantiza la persistencia de ediciones/eliminaciones (FR-006)?

**Decisión**: Nada nuevo. Las ediciones y eliminaciones se aplican sobre el mismo array `products`
en `App.tsx`, que ya se serializa a `localStorage` en un `useEffect` existente.

**Rationale**: `Product` no cambia de forma, así que el esquema `electrohogar_cr_products_v2` sigue
siendo válido y **no se requiere migración** (principio II). Reutilizar el mecanismo existente
elimina toda una clase de bugs de sincronización.

**Riesgo considerado**: la spec (edge case) menciona dos pestañas abiertas del navegador. La
sincronización entre pestañas queda fuera del alcance declarado en los Supuestos de la spec, pero
se mitiga de forma barata: `localStorage` dispara el evento `storage` en otras pestañas del mismo
origen, así que añadir un listener que recarga `products` cubre el caso sin arquitectura extra.

## R-006: ¿Qué stack de pruebas se usa?

**Decisión**: `node:test` (runner nativo de Node 26) ejecutado con `tsx`, que **ya es**
devDependency del proyecto. Sin framework nuevo.

**Rationale**: Principio V (YAGNI): vitest/jest serían dependencias nuevas whose only value here
is running unit tests over pure functions — `node:test` cubre exactamente eso. Verificado que
`npx tsx --test <archivo>` funciona en esta máquina. Además permite testear las reglas de precio
—la parte con más riesgo de error silencioso— sin DOM.

**Alternativas consideradas**:
- *Vitest*: descartado, dependencia nueva (Vite 8 + vitest 4 requiere resolver peers que ya dan
  conflicto con `tsx`/`esbuild`).
- *Sin tests, solo `tsc`*: descartado, `tsc` no detecta la lógica de negocio incorrecta (p. ej. un
  descuento que da 33% en vez de 18%).

## R-007: ¿Se endurece `tsconfig` a `strict`?

**Decisión**: Sí — añadir `"strict": true` a `tsconfig.json` como parte de esta feature.

**Rationale**: El principio IV de la constitución exige compilar en modo estricto, pero hoy
`tsconfig.json` **no tiene `strict` activo**, así que el principio es aspiracional. Verificado
que `npx tsc --noEmit --strict` pasa con **0 errores** sobre el código actual: activarlo no rompe
nada existente y convierte el principio en exigible de verdad. La feature además elimina los
`as any` de los `select` (deuda técnica que la constitución señala explícitamente como "deuda a
eliminar, no un patrón a replicar") introducing los tipos `ProductStore` y `ProductCategory`.

**Alternativas consideradas**:
- *No tocar tsconfig*: descartado, deja el principio IV sin respaldo y la deuda de `as any`
  propagándose al código nuevo.

## R-008: ¿Cómo se manejan las especificaciones del producto (capacidad, voltaje, etc.)?

**Decisión**: El formulario expone los 5 campos de especificación (capacidad, dimensiones, voltaje,
eficiencia, color) y la descripción, pero **no** la lista `specs.details` (los bullets técnicos).
En edición, si el producto no tiene bullets, se conservan los existentes; si se editan, se
recalculan a partir de los valores clave.

**Rationale**: FR-002 exige que el formulario esté precargado con **todos** los valores actuales
"incluidas especificaciones". Editar bullets en un textarea multilínea agrega complejidad de
parseo sin valor real para la asesora: los bullets describen características del modelo
específico, no datos que ella capture en la tienda. Se preservan tal cual para no perder
información, y la spec lo cubre con FR-003 ("el producto MUST conservar su identidad").

**Alternativas consideradas**:
- *Textarea con un bullet por línea*: descartado, agrega parseo/validación de un dato que la
  asesora no captura en el punto de venta.
- *Permitir editarlos igual*: la spec lo deja abierto; se eligió preservarlos porque el
  requerimiento de "no perder información" pesa más que la de "editar todo", y FR-002 se satisface
  mostrando los valores precargados y preservados.

## R-009: ¿Cómo se resuelve la normalización precio-contado ≥ precio-lista (FR-008)?

**Decisión**: Al guardar, si `currentPrice >= originalPrice`, se fija `originalPrice = currentPrice`.
El descuento queda en 0 y no se renderiza etiqueta de precio tachado.

**Rationale**: Es la única forma de que la relación entre ambos precios sea siempre coherente sin
interacción del usuario. La alternativa (permitir y solo ocultar el tachado) deja datos
contradictorios persistidos, que reaparecerían en una futura edición.

**Alternativas consideradas**:
- *Mostrar error al usuario y no permitir guardar*: descartado, es un error del usuario recuperable
  de forma más amable normalizando en silencio y mostrando el valor corregido en el formulario.

## R-010: ¿Cómo se garantiza FR-011 (el plazo y la cuota mostrados son los reales)?

**Decisión**: `ProductDetailModal` deja de usar el estado local `selectedTermMonths` (hoy fijo en
24 y nunca cambiable) y pasa a derivar plazo y cuotas de `product.installmentMonths` y
`product.installmentQuincenal`.

**Rationale**: Es un bug real: la ficha técnica muestra "A 24 meses plazo" sea cual sea el plazo
real del producto. FR-011 lo exige explícitamente. Derivar del producto elimina el estado
imposible y hace la información veraz.

**Alternativas consideradas**:
- *Convertir `selectedTermMonths` en un selector interactivo*: descartado — implicaría recalcular
  la cuota quincenal (que es un dato capturado, no derivado), lo que excede el alcance de la
  feature y contradice FR-010.
