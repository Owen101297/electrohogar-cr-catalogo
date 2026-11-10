# Data Model: Panel administrativo del catálogo y tarjeta de presentación en PNG

**Feature**: 004-panel-admin-tarjeta-png | **Date**: 2026-11-10

## Entidades

### CatalogMetrics (nuevo — derivado, no persistido)

Agregación del catálogo. Se recalcula en cada cambio; nunca se guarda.

```text
CatalogMetrics
├── totalProductos: number
├── valorTotal: number              # Σ currentPrice, en colones
├── valorLista: number              # Σ originalPrice, en colones
├── precioPromedio: number          # valorTotal / totalProductos (0 si no hay productos)
├── descuentoPromedio: number       # promedio de cashDiscountPercent (0 si no hay)
├── descuentoPromedioValor: number  # promedio en colones del ahorro (0 si no hay)
├── comisionPotencial: number       # valorTotal × commissionRate / 100
├── porTienda: DistributionGroup[]
├── porCategoria: DistributionGroup[]
├── mayorValor: Product[]           # hasta 5, de mayor a menor valor
├── mayorDescuento: Product[]       # hasta 5, de mayor a menor descuento
└── sinDescuento: number            # productos sin descuento
```

### DistributionGroup (nuevo — derivado)

Un renglón de la distribución por tienda o categoría.

```text
DistributionGroup
├── clave: string          # id de tienda o categoría
├── etiqueta: string       # nombre legible en español CR
├── unidades: number       # cantidad de productos
├── valor: number          # Σ currentPrice, en colones
├── porcentaje: number     # unidades / totalProductos × 100
└── porcentajeValor: number # valor / valorTotal × 100
```

### Tabla de gestión (nuevo — derivado)

Vista densa del catálogo para la asesora.

```text
TablaGestionFila
├── producto: Product
├── busqueda: string      # texto normalizado para filtrar (nombre + marca + sku)
└── descuento: number     # cashDiscountPercent ?? 0
```

Ordenamiento: `nombre` | `precio` | `descuento`, en ambos sentidos.

### Tarjeta de presentación (existente — se reconstruye en canvas)

Pieza de 85 × 54 mm con dos caras. La spec exige la misma geometría en pantalla y en PNG.

```text
Tarjeta (anverso)                    Tarjeta (reverso)
├── Franja de acento superior         ├── Franja de acento superior
├── Etiqueta "Costa Rica 🇨🇷"         ├── "Catálogo Digital 24/7"
├── Marca (monograma + nombre)        ├── Código QR
├── Tagline del servicio              ├── 3 pasos: escanear / elegir / pedir
├── Lema comercial                    ├── "Garantía de Fábrica"
├── Divisor                           └── WhatsApp +506
├── WhatsApp +506
├── Zona de cobertura
└── "Entrega a Domicilio"
```

### Parámetros de render (nuevo)

Todo lo que el dibujo necesita, en un solo objeto para que la vista previa y el PNG usen
exactamente los mismos valores.

```text
CardRenderOptions
├── brandName: string
├── serviceTagline: string
├── slogan: string
├── phone: string
├── coverage: string
├── qrDataUrl: string        # PNG en base64 del código QR
├── palette: ColorPalette    # primary, primaryDark, secondary, accentGreen
├── fontFamily: string       // sans
├── headingFont: string      // serif o heading
└── scale: number            // 1 = 85×54mm a 300dpi
```

## Reglas de cálculo

| Regla | Comportamiento | Requisito |
|---|---|---|
| `valorTotal` | Σ de `currentPrice` de todos los productos | FR-003 |
| `valorLista` | Σ de `originalPrice` | FR-003 |
| `precioPromedio` | `valorTotal / totalProductos`; `0` si `totalProductos === 0` | FR-004 |
| `descuentoPromedio` | Promedio de `cashDiscountPercent` de los productos que lo tienen; `0` si ninguno | FR-005 |
| `comisionPotencial` | `valorTotal * (commissionRate / 100)` | FR-006 |
| `porTienda` / `porCategoria` | Agrupación por `store` / `category`, con unidades, valor y porcentajes | FR-007, FR-008 |
| Porcentajes | `unidades / totalProductos * 100` y `valor / valorTotal * 100`; `0` si el denominador es `0` | FR-007, FR-008 |
| `mayorValor` | Hasta 5 productos ordenados por `currentPrice` descendente | FR-009 |
| `mayorDescuento` | Hasta 5 productos con descuento, ordenados por `cashDiscountPercent` descendente | FR-009 |
| `sinDescuento` | Cantidad de productos sin `cashDiscountPercent` | FR-005 |
| Catálogo vacío | Todas las métricas en `0`, listas vacías, sin `NaN` ni `Infinity` | FR-013 |
| Recálculo | Se recalcula en cada alta, edición o eliminación | FR-023 |

## Geometría de la tarjeta

Constantes en `src/utils/cardImage.ts`.

| Constante | Valor | Nota |
|---|---|---|
| `CARD_WIDTH_MM` | `85` | 3.5" estándar |
| `CARD_HEIGHT_MM` | `54` | 2" estándar |
| `DPI` | `300` | resolución de impresión |
| `CARD_WIDTH_PX` | `1004` | `round(85 / 25.4 × 300)` |
| `CARD_HEIGHT_PX` | `638` | `round(54 / 25.4 × 300)` |
| `SHEET_COLUMNS` | `2` | tarjetas por fila en la hoja |
| `SHEET_ROWS` | `4` | filas en la hoja |
| `SHEET_GAP_PX` | `40` | separación entre tarjetas |
| `SHEET_WIDTH_PX` | `2088` | `2 × 1004 + 40` |
| `SHEET_HEIGHT_PX` | `2712` | `4 × 638 + 3 × 40 + 2 × 20` (20 de margen) |

La hoja de impresión conserva 4 frentes y 4 reversos alternados.

## Persistencia

| Almacén | Clave | Efecto |
|---|---|---|
| `localStorage` | `electrohogar_cr_products_v2` | Sin cambios: el panel lee y escribe los mismos productos |
| `localStorage` | `electrohogar_cr_profile_v2` | Sin cambios |
| `localStorage` | `electrohogar_cr_settings_v2` | Sin cambios: el margen alimenta `comisionPotencial` |
| `sessionStorage` | `electrohogar_cr_admin_session` | Sin cambios: sigue gobernando el acceso al panel |

**Sin migración**: ninguna forma persistida cambia.
