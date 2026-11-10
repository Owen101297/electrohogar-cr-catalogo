/**
 * Métricas del catálogo para el panel administrativo.
 *
 * Módulo puro: sin React y sin DOM. Es la única fuente de verdad de las cifras
 * que muestra el panel, de modo que el cálculo es verificable contra el
 * cálculo manual.
 *
 * Contrato: specs/004-panel-admin-tarjeta-png/contracts/stats.md
 */

import { AdvisorSettings, Product, ProductCategory, ProductStore } from '../types';
import { CATEGORY_LABELS, STORE_LABELS } from './products';

/** Un renglón de la distribución por tienda o por categoría. */
export interface DistributionGroup {
  clave: string;
  etiqueta: string;
  unidades: number;
  valor: number;
  porcentaje: number;
  porcentajeValor: number;
}

/** Todas las métricas del panel. */
export interface CatalogMetrics {
  totalProductos: number;
  valorTotal: number;
  valorLista: number;
  precioPromedio: number;
  descuentoPromedio: number;
  descuentoPromedioValor: number;
  comisionPotencial: number;
  sinDescuento: number;
  porTienda: DistributionGroup[];
  porCategoria: DistributionGroup[];
  mayorValor: Product[];
  mayorDescuento: Product[];
}

/** Una fila de la tabla de gestión. */
export interface ProductTableRow {
  producto: Product;
  busqueda: string;
  descuento: number;
}

export type SortKey = 'nombre' | 'precio' | 'descuento';
export type SortDirection = 'asc' | 'desc';

/** Copy del panel, en español costarricense. */
export const PANEL_COPY = {
  titulo: 'Panel del Catálogo',
  subtitulo: 'Resumen de tu catálogo digital y rendimiento estimado',
  metricas: {
    totalProductos: 'Productos en catálogo',
    valorTotal: 'Valor total del catálogo',
    precioPromedio: 'Precio de contado promedio',
    descuentoPromedio: 'Descuento promedio',
    comisionPotencial: 'Comisión potencial',
  },
  metricasAyuda: {
    valorTotal: 'Suma de los precios de contado',
    precioPromedio: 'Promedio del catálogo',
    descuentoPromedio: 'Promedio de los descuentos',
    comisionPotencial: 'Si vendés todo el catálogo',
  },
  distribucionTienda: 'Distribución por tienda',
  distribucionCategoria: 'Distribución por categoría',
  destacadosValor: 'Productos de mayor valor',
  destacadosDescuento: 'Mayor descuento',
  tablaTitulo: 'Gestión de productos',
  tablaBusqueda: 'Buscar por nombre, marca o SKU...',
  tablaSinResultados: 'Ningún producto coincide con la búsqueda',
  vacioTitulo: 'Tu catálogo está vacío',
  vacioBody:
    'Agregá el primer electrodoméstico y acá vas a ver las métricas de tu negocio.',
  sinDescuento: 'Ningún producto tiene descuento registrado',
  unidades: 'unidades',
} as const;

const MAX_DESTACADOS = 5;

/** Normaliza texto para búsquedas: minúsculas y sin acentos. */
export function normalizeText(value: string): string {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Calcula todas las métricas del panel.
 * Nunca lanza ante un catálogo vacío: devuelve ceros y listas vacías.
 */
export function computeCatalogMetrics(
  products: Product[],
  settings: AdvisorSettings
): CatalogMetrics {
  const totalProductos = products.length;

  let valorTotal = 0;
  let valorLista = 0;
  let sumaDescuentos = 0;
  let sumaAhorro = 0;
  let conDescuento = 0;

  for (const p of products) {
    valorTotal += p.currentPrice;
    valorLista += p.originalPrice;
    if (typeof p.cashDiscountPercent === 'number' && p.cashDiscountPercent > 0) {
      sumaDescuentos += p.cashDiscountPercent;
      sumaAhorro += Math.max(0, p.originalPrice - p.currentPrice);
      conDescuento += 1;
    }
  }

  const comisionPotencial =
    Math.round(valorTotal * (settings.commissionRate / 100));

  const porTienda = buildDistribution(
    products,
    (p) => p.store,
    STORE_LABELS as Record<ProductStore, string>,
    valorTotal
  );

  const porCategoria = buildDistribution(
    products,
    (p) => p.category,
    CATEGORY_LABELS as Record<ProductCategory, string>,
    valorTotal
  );

  const mayorValor = [...products]
    .sort((a, b) => b.currentPrice - a.currentPrice)
    .slice(0, MAX_DESTACADOS);

  const mayorDescuento = products
    .filter((p) => typeof p.cashDiscountPercent === 'number' && p.cashDiscountPercent > 0)
    .sort((a, b) => (b.cashDiscountPercent ?? 0) - (a.cashDiscountPercent ?? 0))
    .slice(0, MAX_DESTACADOS);

  return {
    totalProductos,
    valorTotal,
    valorLista,
    precioPromedio:
      totalProductos > 0 ? Math.round(valorTotal / totalProductos) : 0,
    descuentoPromedio:
      conDescuento > 0 ? Math.round(sumaDescuentos / conDescuento) : 0,
    descuentoPromedioValor:
      conDescuento > 0 ? Math.round(sumaAhorro / conDescuento) : 0,
    comisionPotencial,
    sinDescuento: totalProductos - conDescuento,
    porTienda,
    porCategoria,
    mayorValor,
    mayorDescuento,
  };
}

function buildDistribution(
  products: Product[],
  keyOf: (p: Product) => string,
  labels: Record<string, string>,
  valorTotal: number
): DistributionGroup[] {
  const accumulator = new Map<string, { unidades: number; valor: number }>();

  for (const p of products) {
    const key = keyOf(p);
    const current = accumulator.get(key) ?? { unidades: 0, valor: 0 };
    current.unidades += 1;
    current.valor += p.currentPrice;
    accumulator.set(key, current);
  }

  const total = products.length;

  return [...accumulator.entries()]
    .map(([clave, { unidades, valor }]) => ({
      clave,
      etiqueta: labels[clave] ?? clave,
      unidades,
      valor,
      porcentaje: total > 0 ? (unidades / total) * 100 : 0,
      porcentajeValor: valorTotal > 0 ? (valor / valorTotal) * 100 : 0,
    }))
    .sort((a, b) =>
      b.unidades !== a.unidades
        ? b.unidades - a.unidades
        : b.valor - a.valor
    );
}

/** Construye las filas de la tabla de gestión. */
export function buildProductRows(products: Product[]): ProductTableRow[] {
  return products.map((producto) => ({
    producto,
    busqueda: normalizeText(
      [
        producto.name,
        producto.brand,
        producto.sku,
        producto.category,
        CATEGORY_LABELS[producto.category] ?? '',
        STORE_LABELS[producto.store] ?? '',
      ].join(' ')
    ),
    descuento: producto.cashDiscountPercent ?? 0,
  }));
}

/** Filtra y ordena las filas de la tabla de gestión. */
export function filterAndSortRows(
  rows: ProductTableRow[],
  options: {
    query: string;
    sortBy: SortKey;
    sortDir: SortDirection;
  }
): ProductTableRow[] {
  const { query, sortBy, sortDir } = options;
  const needle = normalizeText(query).trim();

  const filtered =
    needle === ''
      ? [...rows]
      : rows.filter((row) => row.busqueda.includes(needle));

  const direction = sortDir === 'asc' ? 1 : -1;

  // Se usa un índice como desempate para que el orden sea estable.
  const indexed = filtered.map((row, index) => ({ row, index }));

  indexed.sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'nombre') {
      comparison = normalizeText(a.row.producto.name).localeCompare(
        normalizeText(b.row.producto.name),
        'es'
      );
    } else if (sortBy === 'precio') {
      comparison = a.row.producto.currentPrice - b.row.producto.currentPrice;
    } else {
      comparison = a.row.descuento - b.row.descuento;
    }

    if (comparison === 0) return a.index - b.index;
    return comparison * direction;
  });

  return indexed.map((entry) => entry.row);
}
