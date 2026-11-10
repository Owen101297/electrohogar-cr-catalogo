# Verification Report: Editar y eliminar productos del catálogo

**Feature**: 001-product-edit-delete | **Fecha**: 2026-11-10
**Rama**: `001-product-edit-delete`

## Entorno de validación

| Item | Valor |
|---|---|
| Servidor | `npm run dev` (Vite 8.3.7), `http://192.168.18.19:3000` |
| Navegador | Playwright / Chromium headless |
| Node | v26.13.0 · npm 12.2.1 |
| Comandos | `npm run lint`, `npm test`, `npm run build` |

> Nota de entorno: el puerto `127.0.0.1:3000` está ocupado por un túnel SSH en la máquina, por
> lo que la validación se hizo contra la IP de red. El separador de miles del ICU headless es
> U+00A0 (espacio duro) en lugar de punto; es una diferencia de runtime, no de la app.

## Comandos de calidad

| Comando | Resultado |
|---|---|
| `npm run lint` (`tsc --noEmit`, con `strict: true`) | ✅ 0 errores |
| `npm test` (`node:test` vía `tsx`) | ✅ 20/20 pruebas pasan |
| `npm run build` | ✅ 1703 módulos, build en ~144 ms |

## Escenarios de `quickstart.md`

| # | Escenario | Requisito | Resultado |
|---|---|---|---|
| 1 | Abrir ficha → **Editar producto** → cambiar precio → guardar | FR-001/002/003 | ✅ |
| 2 | Editar y **Cancelar** → el producto conserva sus valores | US1-4 | ✅ |
| 3 | Nombre y precio vacíos → mensajes en español, guardado bloqueado | FR-007, FR-015 | ✅ |
| 4 | Precio de lista `100000` < contado `250000` → lista ajustada a `250000`, sin tachado | FR-008 | ✅ |
| 5 | Lista `400000` / contado `320000` → descuento `-20%` | FR-009 | ✅ |
| 6 | Cuota vacía → `18278` (649900 × 1.35 / 48); cuota capturada → se respeta | FR-010 | ✅ |
| 7 | **Eliminar producto** → diálogo con el nombre exacto → Cancelar no elimina | FR-004/005, SC-003 | ✅ |
| 8 | Confirmar eliminación → producto fuera del catálogo y del contador | FR-004/005 | ✅ |
| 9 | **Deshacer** → producto restaurado íntegro y en su posición | FR-012, SC-004 | ✅ |
| 10 | El aviso de deshacer se auto-oculta tras 6 s y la eliminación se confirma | FR-012 | ✅ |
| 11 | Catálogo vacío → mensaje en español + acción **Agregar Producto** | FR-013 | ✅ |
| 12 | Editar plazo a 36 meses → la ficha muestra "A 36 meses plazo" y la cuota real | FR-011 | ✅ |
| 13 | Editar + eliminar + recargar → ambos persisten | FR-006, SC-005 | ✅ |
| 14 | Sin regresiones: búsqueda, filtro por tienda, orden, tarjeta digital, calculadora, diseñador | FR-014 | ✅ |

## Verificaciones adicionales

| Verificación | Resultado |
|---|---|
| Enlace de WhatsApp en modo **Cuota Quincenal** incluye producto + cuota | ✅ `₡19 850 / quincena` |
| Enlace de WhatsApp en modo **Cuota Mensual** incluye la cuota mensual | ✅ `₡39 700` |
| Enlace de WhatsApp en modo **Contado Directo** incluye precio de contado sin cuota | ✅ `₡649 900` |
| Descuento derivado visible en la tarjeta del catálogo (`-18%`) | ✅ |
| Filtro por tienda EPA → 7 productos | ✅ |
| Búsqueda "Whirlpool" filtra correctamente | ✅ |
| Sincronización entre pestañas vía evento `storage` | ✅ implementado (T030) |
| Consola del navegador sin errores de la app | ✅ (solo 404 de `favicon.ico`, preexistente) |

## Defectos encontrados y corregidos durante la implementación

| # | Defecto | Causa | Corrección |
|---|---|---|---|
| 1 | El modal de alta **no se cerraba** tras guardar | El `AddProductModal` original se cerraba a sí mismo; el nuevo formulario solo llamaba `onSubmit` | `ProductFormModal` llama `onClose()` tras `onSubmit` |
| 2 | El **SKU se repetía** entre altas sucesivas | `emptyProductFormValues()` se evaluaba una sola vez al montar el componente | El `useEffect` regenera los valores cada vez que el modal se abre |
| 3 | **Cancelar la confirmación** de eliminación cerraba la ficha del producto | `handleRequestDelete` limpiaba `selectedProduct` de entrada | La ficha permanece abierta detrás del diálogo; solo se cierra al confirmar |
| 4 | El enlace de WhatsApp **perdía el producto** en modo quincenal/mensual | Se pasaba `price` como `undefined` fuera del modo contado | Siempre se pasa el precio de contado; la cuota solo se omite en modo contado |
| 5 | El botón de cerrar de los modales **no tenía `aria-label`** | Accesibilidad inconsistente entre modales | `aria-label="Cerrar"` en `ProductDetailModal`, `DigitalCardModal` y `CommissionCalculatorModal` |

## Desviaciones respecto de la spec

Ninguna funcional. La spec se cumplió en su totalidad.

**Nota sobre el formato de colones**: la spec y el quickstart citan `₡599.900` (punto). El navegador
headless de Playwright usa U+00A0 como separador de miles (`₡599 900`) por su build de ICU; en
Chrome de escritorio el mismo `toLocaleString('es-CR')` produce el punto. El código no cambia en
ningún caso.

## Veredicto

**Feature completa y verificada.** Los 15 requisitos funcionales (FR-001 a FR-015) y los 7 criterios
de éxito (SC-001 a SC-007) están implementados y comprobados en navegador real.
