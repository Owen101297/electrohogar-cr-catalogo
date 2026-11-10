# Data Model: Editar y eliminar productos del catálogo

**Feature**: 001-product-edit-delete | **Date**: 2026-11-10

## Entidades

### Product (existente — sin cambios de forma)

Definida en `src/types.ts`. **La forma del dato no cambia en esta feature**, por lo que el esquema
de `localStorage` (`electrohogar_cr_products_v2`) permanece válido y **no se requiere migración**
(constitución, principio II).

```text
Product
├── id: string                        # identidad estable; NO cambia al editar
├── name: string
├── category: ProductCategory         # refrigeracion | lavado | cocina | pantallas | pequenos
├── brand: string
├── store: ProductStore               # Gollo | EPA | Ambas
├── originalPrice: number             # precio de lista (₡)
├── currentPrice: number              # precio de contado (₡)
├── cashDiscountPercent?: number      # DERIVADO de originalPrice/currentPrice
├── installmentQuincenal: number     # cuota estimada por quincena (₡)
├── installmentMonths: number         # plazo en meses
├── image: string                     # URL
├── badge?: string                    # etiqueta promocional
├── warrantyMonths: number
├── sku: string                       # NO cambia al editar (identidad comercial)
└── specs: ProductSpecs
    ├── capacity?: string
    ├── dimensions?: string
    ├── voltage?: string
    ├── energyRating?: string
    ├── color?: string
    └── details: string[]             # bullets técnicos; PRESERVADOS en edición
```

### ProductStore (nuevo — tipo derivado)

```text
ProductStore = 'Gollo' | 'EPA' | 'Ambas'
```

Sustituye el literal inline en `Product.store` y elimina el `as any` de los `select` de tienda
(constitución, principio IV).

### ProductCategory (nuevo — tipo derivado)

```text
ProductCategory = 'refrigeracion' | 'lavado' | 'cocina' | 'pantallas' | 'pequenos'
```

Sustituye el literal inline en `Product.category` y elimina el `as any` de los `select` de categoría.

### ProductFormValues (nuevo — estado del formulario)

Representación **estringada** del formulario. Los campos numéricos se mantienen como `string`
mientras se editan para evitar saltos de cursor al escribir; se parsean al guardar.

```text
ProductFormValues
├── name: string
├── brand: string
├── store: ProductStore
├── category: ProductCategory
├── originalPriceStr: string
├── currentPriceStr: string
├── installmentQuincenalStr: string   # vacío ⇒ se calcula automáticamente
├── installmentMonths: number
├── warrantyMonths: number
├── sku: string
├── image: string
├── badge: string
├── description: string
├── capacity: string
├── dimensions: string
├── voltage: string
├── energyRating: string
└── color: string
```

### PendingDeletion (nuevo — estado efímero en memoria)

```text
PendingDeletion
├── product: Product      # el producto eliminado, íntegro
├── index: number         # posición que tenía en el catálogo
└── expiresAt: number     # timestamp de expiración (epoch ms)
```

**No se persiste.** Vive solo en memoria de la sesión (spec: "un reinicio del navegador cierra esa
posibilidad").

## Reglas de validación

Aplicadas por `validateProductForm(values)` en `src/utils/products.ts`.

| Campo | Regla | Mensaje (español CR) |
|---|---|---|
| `name` | obligatorio, no vacío tras `trim` | "Escribe el nombre del electrodoméstico." |
| `currentPriceStr` | obligatorio, dígitos ≥ 1, valor > 0 | "Escribe el precio de contado en colones." |
| `originalPriceStr` | obligatorio, dígitos ≥ 1, valor > 0 | "Escribe el precio de lista en colones." |
| `installmentQuincenalStr` | opcional; si presente, dígitos ≥ 1 y valor > 0 | "La cuota quincenal debe ser un número válido." |
| `image` | opcional; si presente debe ser URL http(s) válida | "La dirección de la foto no es válida." |
| `sku` | obligatorio, no vacío | "Escribe el código SKU del producto." |

## Reglas de derivación

Aplicadas por `buildProductFromForm(values, existing?)` en `src/utils/products.ts`.

| Regla | Comportamiento | Requisito |
|---|---|---|
| **Normalización de precios** | Si `currentPrice >= originalPrice` → `originalPrice = currentPrice` | FR-008 |
| **Descuento** | `cashDiscountPercent = round((originalPrice - currentPrice) / originalPrice * 100)`; `0` si no hay descuento → se guarda como `undefined` | FR-009 |
| **Cuota quincenal** | Si el campo quedó vacío → `round(currentPrice * 1.35 / (installmentMonths * 2))`. Si tiene valor → se respeta el capturado | FR-010 |
| **Identidad** | En edición se conservan `id` y `sku` del producto existente | FR-003 |
| **Specs bullets** | En edición se preservan `specs.details` del producto existente | R-008 |
| **Plazo** | `installmentMonths` es un entero seleccionable (6/12/18/24/36) | FR-011 |

## Transiciones de estado

```text
                 ┌──────────────┐
                 │  Catálogo    │◄────┐
                 └──────┬───────┘     │
                        │             │
        ┌───────────────┼──────────────┴───────────────┐
        │               │                              │
   crear           editar (P1)                   eliminar (P2)
        │               │                              │
        ▼               ▼                              ▼
   [Producto]      [Producto']                  PendingDeletion
   id nuevo         id igual,                    { product, index, expiresAt }
   sku capturado    campos actualizados              │
        │               │                              │
        └───────────────┴──────────────┬───────────────┘
                                       │
                          ¿deshacer dentro de 6 s?
                            sí │              │ no
                               ▼              ▼
                         [Producto]        (se descarta)
                         restaurado en
                         su posición
```

## Persistencia

| Clave | Contenido | Efecto de la feature |
|---|---|---|
| `electrohogar_cr_products_v2` | `Product[]` | Se sobreescribe con el catálogo tras cada edición/eliminación |
| `electrohogar_cr_profile_v2` | `CardProfile` | Sin cambios |
| `electrohogar_cr_settings_v2` | `AdvisorSettings` | Sin cambios |

**Sin migración**: la forma de `Product` no cambia. Los productos ya guardados por la asesora se
abren y editan sin transformación.
