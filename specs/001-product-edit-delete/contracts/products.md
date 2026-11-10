# Contrato interno: Módulo de productos

**Feature**: 001-product-edit-delete | **Date**: 2026-11-10

Contrato de la API interna de `src/utils/products.ts`. Es la **única** fuente de verdad para las
reglas de precio, cuota y validación. Ningún componente debe reimplementar estas reglas
(constitución, principio V).

---

## `parseColones(raw: string): number`

Convierte una entrada de usuario en un número de colones.

- **Entrada**: texto que puede contener separadores de miles, espacios, signos `₡` u otros
  caracteres no numéricos.
- **Salida**: entero ≥ 0. Si no hay dígitos, devuelve `0`.
- **Ejemplo**: `"₡649.900"` → `649900`; `"1,299,000"` → `1299000`; `"abc"` → `0`.

## `formatColones(amount: number): string`

Formato de colones costarricense. Ya existe en `src/utils/formatters.ts`; se mantiene sin cambios.
`formatColones(649900)` → `"₡649.900"`.

## `calculateDiscountPercent(originalPrice: number, currentPrice: number): number`

Porcentaje de descuento en efectivo, redondeado al entero más cercano.

- Si `originalPrice <= 0` → `0`.
- Si `currentPrice >= originalPrice` → `0`.
- Si no → `round((originalPrice - currentPrice) / originalPrice * 100)`.

## `estimateQuincenalInstallment(currentPrice: number, installmentMonths: number): number`

Cuota quincenal estimada cuando la asesora no captura una.

- Fórmula: `round(currentPrice * 1.35 / (installmentMonths * 2))`.
- `installmentMonths` se normaliza a un mínimo de `1` para evitar división por cero.
- `estimateQuincenalInstallment(649900, 24)` → `18278` (`649900 * 1.35 / 48`).
- Coincide con la regla que usa hoy el formulario de alta (`precio * 1.35 / 48` para 24 meses).

## `validateProductForm(values: ProductFormValues): ProductFormErrors`

Valida el estado del formulario. Devuelve un objeto con los mensajes de error indexados por campo.
Un campo con string vacío significa "sin error".

```text
ProductFormErrors = {
  name?: string
  currentPriceStr?: string
  originalPriceStr?: string
  installmentQuincenalStr?: string
  sku?: string
  image?: string
}
```

Si no hay errores, devuelve `{}`.

## `buildProductFromForm(values: ProductFormValues, existing?: Product): Product`

Construye el `Product` final a partir del estado del formulario.

- **Con `existing` (modo edición)**: conserva `existing.id`, `existing.sku` y
  `existing.specs.details`. Aplica el resto de campos desde el formulario.
- **Sin `existing` (modo alta)**: genera `id` y `sku` nuevos.

Aplica, en este orden:

1. Parseo de precios (`currentPrice`, `originalPrice`).
2. **Normalización (FR-008)**: si `currentPrice >= originalPrice` → `originalPrice = currentPrice`.
3. **Descuento (FR-009)**: `cashDiscountPercent` derivado; `undefined` si es `0`.
4. **Cuota (FR-010)**: usa el valor capturado; si está vacío, `estimateQuincenalInstallment`.
5. Specs: capacidad, dimensiones, voltaje, eficiencia y color desde el formulario; `details`
   preservados del producto existente.

## `productToFormValues(product: Product): ProductFormValues`

Invierte la transformación: precarga el formulario con los valores actuales de un producto.
Usada por `ProductFormModal` en modo edición (FR-002).

- `originalPriceStr` / `currentPriceStr` / `installmentQuincenalStr` se forman con el número como
  texto plano (sin separadores), para que el campo sea editable sin artefactos de formato.

## `emptyProductFormValues(): ProductFormValues`

Valores iniciales para el modo alta, con los mismos defaults que usa hoy el formulario existente:
tienda `Gollo`, categoría `refrigeracion`, plazo `24` meses, garantía `12` meses, precio de
contado `299000`, precio de lista `349000`.

## Constantes de copy

Textos de UI centralizados para mantener un único lugar donde revisar el español:

| Constante | Texto |
|---|---|
| `PRODUCT_FORM_VALIDATION_MESSAGES` | Mensajes de validación de la tabla en `data-model.md` |
| `DELETE_CONFIRM_TITLE` | "Eliminar producto del catálogo" |
| `DELETE_CONFIRM_QUESTION` | "¿Seguro que querés eliminar **{name}** del catálogo? Esta acción se puede deshacer por unos segundos." |
| `DELETE_CONFIRM_BUTTON` | "Sí, eliminar" |
| `DELETE_CANCEL_BUTTON` | "Cancelar" |
| `UNDO_DELETE_LABEL` | "Producto eliminado" |
| `UNDO_DELETE_ACTION` | "Deshacer" |
| `EMPTY_CATALOG_TITLE` | "Tu catálogo está vacío" |
| `EMPTY_CATALOG_BODY` | "Agregá el primer electrodoméstico de Gollo o EPA y compartilo con tus clientes por WhatsApp." |
| `EMPTY_CATALOG_ACTION` | "Agregar Producto" |

---

## Contrato de eventos del formulario

`ProductFormModal` expone:

```text
onSubmit(product: Product)   # el producto ya construido y validado
onClose()                    # descarte sin cambios
```

El componente **no** toca `localStorage` ni el estado global. Recibe el producto inicial y devuelve
el producto final. Esto mantiene el componente testeable y el estado en un solo lugar (`App.tsx`).
