# Contrato: Métricas del catálogo

**Feature**: 004-panel-admin-tarjeta-png | **Date**: 2026-11-10

Contrato del módulo `src/utils/stats.ts`. Es la **única** fuente de verdad de las cifras del panel.

---

## `computeCatalogMetrics(products: Product[], settings: AdvisorSettings): CatalogMetrics`

Calcula todas las métricas del panel a partir del catálogo.

- **Entrada**: el catálogo completo y los ajustes del asesor (de donde sale el margen).
- **Salida**: un objeto `CatalogMetrics` con todas las métricas calculadas.
- **Nunca lanza** ante un catálogo vacío: devuelve ceros y listas vacías.
- **Nunca produce `NaN` ni `Infinity`**: todo denominador se protege.

Contrato por métrica:

| Métrica | Regla |
|---|---|
| `totalProductos` | `products.length` |
| `valorTotal` | `Σ products.currentPrice` |
| `valorLista` | `Σ products.originalPrice` |
| `precioPromedio` | `totalProductos > 0 ? valorTotal / totalProductos : 0` |
| `descuentoPromedio` | Media de `cashDiscountPercent` de los productos que lo tienen; `0` si ninguno |
| `descuentoPromedioValor` | Media de `(originalPrice - currentPrice)` de los productos que lo tienen; `0` si ninguno |
| `comisionPotencial` | `valorTotal * (settings.commissionRate / 100)` |
| `sinDescuento` | Cantidad de productos sin `cashDiscountPercent` |
| `porTienda` | Una entrada por tienda presente, con `unidades`, `valor`, `porcentaje` y `porcentajeValor` |
| `porCategoria` | Una entrada por categoría presente, con las mismas medidas |
| `mayorValor` | Hasta 5 productos, ordenados por `currentPrice` descendente |
| `mayorDescuento` | Hasta 5 productos **con** descuento, ordenados por `cashDiscountPercent` descendente |

**Orden de los grupos**: por `unidades` descendente y, a igualdad, por `valor` descendente. Es
determinista: la misma entrada produce la misma salida.

## `buildProductRows(products: Product[]): ProductTableRow[]`

Construye las filas de la tabla de gestión.

- Una fila por producto, en el mismo orden que el catálogo.
- `busqueda` es el texto normalizado en minúsculas de `nombre + ' ' + brand + ' ' + sku`.

## `filterAndSortRows(rows, { query, sortBy, sortDir })`

Filtra y ordena las filas de la tabla.

| Parámetro | Comportamiento |
|---|---|
| `query` | Vacío ⇒ todas las filas. Con texto ⇒ solo las filas cuyo `busqueda` contiene el texto (minúsculas, sin acentos) |
| `sortBy` | `'nombre' \| 'precio' \| 'descuento'` |
| `sortDir` | `'asc' \| 'desc'` |

**Normalización de texto**: se minúsculas y se eliminan los acentos (`á → a`), para que "refrigeradora"
encuentre "Refrigeración" y viceversa.

**Estabilidad**: en empate de la clave de orden, se conserva el orden original del catálogo.

---

## Copy del panel

| Constante | Texto |
|---|---|
| `PANEL_TITULO` | "Panel del Catálogo" |
| `PANEL_SUBTITULO` | "Resumen de tu catálogo digital y rendimiento estimado" |
| `METRIC_LABELS.totalProductos` | "Productos en catálogo" |
| `METRIC_LABELS.valorTotal` | "Valor total del catálogo" |
| `METRIC_LABELS.precioPromedio` | "Precio de contado promedio" |
| `METRIC_LABELS.descuentoPromedio` | "Descuento promedio" |
| `METRIC_LABELS.comisionPotencial` | "Comisión potencial" |
| `PANEL_DISTRIBUCION_TIENDA` | "Distribución por tienda" |
| `PANEL_DISTRIBUCION_CATEGORIA` | "Distribución por categoría" |
| `PANEL_DESTACADOS_VALOR` | "Productos de mayor valor" |
| `PANEL_DESTACADOS_DESCUENTO` | "Mayor descuento" |
| `PANEL_TABLA_TITULO` | "Gestión de productos" |
| `PANEL_TABLA_BUSQUEDA` | "Buscar por nombre, marca o SKU..." |
| `PANEL_VACIO_TITULO` | "Tu catálogo está vacío" |
| `PANEL_VACIO_BODY` | "Agregá el primer electrodoméstico y acá vas a ver las métricas de tu negocio." |
| `PANEL_SIN_DESCUENTO` | "Ningún producto tiene descuento registrado" |
