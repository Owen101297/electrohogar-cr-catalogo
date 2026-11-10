# Quickstart: Editar y eliminar productos del catálogo

**Feature**: 001-product-edit-delete | **Date**: 2026-11-10

Guía de validación ejecutable. Cada escenario corresponde a un requisito de la spec.

## Prerrequisitos

```bash
cd /Users/owen/Downloads/electrohogar-costa-rica---catálogo-&-tarjetas
npm install --legacy-peer-deps --cache /private/var/folders/_j/mfw289q57z7cly6843mvk47c0000gn/T/opencode/npm-cache
```

> `bun` no está instalado en esta máquina; se usa `npm`. El flag `--legacy-peer-deps` es necesario
> por el conflicto de peer `esbuild` entre `tsx` y `vite@8`.

## Comandos de verificación

| Comando | Qué verifica |
|---|---|
| `npm run lint` | Tipado estricto sin errores (`tsc --noEmit`) |
| `npm test` | Pruebas unitarias de la lógica de producto (`node:test` vía `tsx`) |
| `npm run build` | Build de producción sin errores |

## Validar la feature

```bash
npm run dev
```

Abre `http://localhost:3000` en el navegador.

---

## Escenario 1 — Editar un producto (P1, FR-001/002/003, SC-001/SC-002)

1. En el catálogo, pulsá **"Ver Ficha Técnica y Cuotas"** en cualquier producto.
2. En la ficha, pulsá **"Editar producto"**.
3. Verificá que el formulario aparece **precargado** con el nombre, marca, tienda, categoría,
   precios, cuota quincenal, plazo, garantía, SKU, imagen, etiqueta, descripción y
   especificaciones de ese producto.
4. Cambiá el **precio de contado** a `599900` y la **cuota quincenal** a `19000`.
5. Pulsá **"Guardar Cambios"**.
6. Verificá:
   - la ficha se cierra,
   - el catálogo muestra `₡599.900` en la tarjeta del producto,
   - al reabrir la ficha, el precio nuevo persiste y el plazo muestra el plazo real del producto.

**Esperado**: el mismo producto (mismo SKU, mismo `id`), con los valores nuevos, en el catálogo, en
la ficha y en el enlace de WhatsApp.

## Escenario 2 — Cancelar una edición no aplica cambios (US1, acceptance 4)

1. Abrí la ficha de un producto → **"Editar producto"**.
2. Cambiá el nombre a `"Producto Temporal"`.
3. Pulsá **"Cancelar"**.
4. Verificá que el catálogo sigue mostrando el nombre original.

**Esperado**: ningún cambio aplicado.

## Escenario 3 — Validación en español (FR-007, FR-015)

1. Abrí **"+ Agregar Producto"**.
2. Borrá el nombre → intentá guardar.
3. Verificá el mensaje: *"Escribe el nombre del electrodoméstico."*
4. Borrá el precio de contado → intentá guardar.
5. Verificá el mensaje: *"Escribe el precio de contado en colones."*

**Esperado**: mensajes en español, bajo el campo correspondiente, y el guardado bloqueado.

## Escenario 4 — Normalización de precios (FR-008, FR-009)

1. En el formulario de edición, poné **precio de lista `100000`** y **precio de contado `250000`**.
2. Guardá.
3. Verificá que el precio de lista quedó en `250000` (igual al de contado), que **no** aparece precio
   tachado y que **no** se muestra etiqueta de descuento.

**Esperado**: nunca existe "precio de lista" menor que el "precio de contado".

## Escenario 5 — Descuento derivado (FR-009)

1. Editá un producto: precio de lista `400000`, precio de contado `320000`.
2. Guardá y verificá la tarjeta del catálogo.

**Esperado**: badge `-20%` (y "−20% Descuento" en la ficha).

## Escenario 6 — Cuota quincenal automática vs. capturada (FR-010)

1. Editá un producto y **borrá** la cuota quincenal → guardá.
   **Esperado**: la cuota se calcula sola (`precio * 1.35 / (meses * 2)`).
2. Editá el mismo producto y escribí una cuota explícita (`12345`) → guardá.
   **Esperado**: se respeta exactamente `12345`, no se recalcula.

## Escenario 7 — Eliminar con confirmación (P2, FR-004/FR-005, SC-003)

1. Abrí la ficha de un producto → **"Eliminar producto"**.
2. Verificá que el diálogo muestra el **nombre exacto** del producto.
3. Pulsá **"Cancelar"** → el producto sigue en el catálogo.
4. Repetí y pulsá **"Sí, eliminar"**.
5. Verificá que el producto desaparece del catálogo y que el contador de productos mostrados baja
   en uno.

**Esperado**: sin confirmación explícita nunca se elimina nada.

## Escenario 8 — Deshacer eliminación (P3, FR-012, SC-004)

1. Eliminá un producto.
2. En los segundos siguientes, pulsá **"Deshacer"** en el aviso que aparece abajo.
3. Verificá que el producto vuelve **en la misma posición** y con todos sus valores intactos.

**Esperado**: restauración completa e inmediata.

## Escenario 9 — Persistencia tras recargar (FR-006, SC-005)

1. Editá un producto (precio `599900`) y eliminá otro.
2. Recargá el navegador (F5).
3. Verificá que la edición sigue vigente y el producto eliminado no reaparece.

**Esperado**: el estado se conserva (clave `electrohogar_cr_products_v2`).

## Escenario 10 — Catálogo vacío (FR-013)

1. Eliminá todos los productos uno por uno.
2. Verificá que aparece un estado vacío en español con la acción **"Agregar Producto"**, no una
   pantalla en blanco.

**Esperado**: mensaje *"Tu catálogo está vacío"* + acción para agregar.

## Escenario 11 — Plazo y cuota reales en la ficha (FR-011)

1. Editá un producto y poné el plazo en **36 meses** y la cuota en `25000`.
2. Guardá, abrí la ficha.
3. Verificá que la ficha muestra el plazo **36** y la cuota `₡25.000`, no un "24 meses" fijo.

**Esperado**: la ficha refleja los datos guardados.

## Escenario 12 — Sin regresiones (FR-014)

1. Recorré el flujo completo de un cliente: catálogo → buscar → filtrar por tienda y categoría →
   ordenar → ver ficha → pedir por WhatsApp → abrir tarjeta digital → diseñador de tarjetas.

**Esperado**: todo funciona exactamente igual que antes de la feature.

## Pruebas unitarias

```bash
npm test
```

Cubren, en `src/utils/products.test.ts`:

| Caso | Requisito |
|---|---|
| `parseColones` ignora `₡`, separadores y letras | Contrato |
| `calculateDiscountPercent` devuelve 0 si no hay descuento | FR-009 |
| `estimateQuincenalInstallment` coincide con la regla de 24 meses | FR-010 |
| `validateProductForm` rechaza nombre vacío | FR-007 |
| `validateProductForm` rechaza precio no numérico | FR-007 |
| `buildProductFromForm` normaliza lista < contado | FR-008 |
| `buildProductFromForm` deriva el descuento | FR-009 |
| `buildProductFromForm` respeta la cuota capturada | FR-010 |
| `buildProductFromForm` conserva `id`, `sku` y `specs.details` en edición | FR-003 |
| `productToFormValues` precarga todos los campos | FR-002 |
