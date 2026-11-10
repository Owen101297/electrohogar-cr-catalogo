import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildProductRows,
  computeCatalogMetrics,
  filterAndSortRows,
  normalizeText,
} from './stats';
import { AdvisorSettings, Product } from '../types';

const settings: AdvisorSettings = {
  commissionRate: 8,
  advisorModeEnabled: false,
  notes: '',
};

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    name: 'Refrigeradora LG',
    category: 'refrigeracion',
    brand: 'LG',
    store: 'Gollo',
    originalPrice: 400000,
    currentPrice: 320000,
    cashDiscountPercent: 20,
    installmentQuincenal: 15000,
    installmentMonths: 24,
    image: 'https://example.com/a.jpg',
    warrantyMonths: 12,
    sku: 'LG-001',
    specs: { details: [] },
    description: 'Descripción',
    ...overrides,
  };
}

const catalogo: Product[] = [
  makeProduct({ id: 'a', name: 'Refrigeradora LG', currentPrice: 320000, originalPrice: 400000, cashDiscountPercent: 20, store: 'Gollo', category: 'refrigeracion', sku: 'LG-001' }),
  makeProduct({ id: 'b', name: 'Lavadora Whirlpool', currentPrice: 180000, originalPrice: 200000, cashDiscountPercent: 10, store: 'EPA', category: 'lavado', sku: 'WH-002', brand: 'Whirlpool' }),
  makeProduct({ id: 'c', name: 'Cocina Mabe', currentPrice: 500000, originalPrice: 500000, cashDiscountPercent: undefined, store: 'Gollo', category: 'cocina', sku: 'MB-003', brand: 'Mabe' }),
];

// --- computeCatalogMetrics ---

test('calcula el total de productos y el valor total', () => {
  const m = computeCatalogMetrics(catalogo, settings);
  assert.equal(m.totalProductos, 3);
  assert.equal(m.valorTotal, 1000000);
  assert.equal(m.valorLista, 1100000);
});

test('calcula el precio de contado promedio', () => {
  const m = computeCatalogMetrics(catalogo, settings);
  assert.equal(m.precioPromedio, 333333);
});

test('calcula el descuento promedio solo sobre los productos que lo tienen', () => {
  const m = computeCatalogMetrics(catalogo, settings);
  assert.equal(m.descuentoPromedio, 15);
  assert.equal(m.sinDescuento, 1);
  assert.equal(m.descuentoPromedioValor, 50000);
});

test('calcula la comisión potencial con el margen configurado', () => {
  const m = computeCatalogMetrics(catalogo, { ...settings, commissionRate: 10 });
  assert.equal(m.comisionPotencial, 100000);
});

test('agrupa la distribución por tienda con unidades, valor y porcentaje', () => {
  const m = computeCatalogMetrics(catalogo, settings);
  const gollo = m.porTienda.find((g) => g.clave === 'Gollo');
  const epa = m.porTienda.find((g) => g.clave === 'EPA');

  assert.ok(gollo && epa);
  assert.equal(gollo.unidades, 2);
  assert.equal(gollo.valor, 820000);
  assert.equal(Math.round(gollo.porcentaje), 67);
  assert.equal(epa.unidades, 1);
  assert.equal(epa.valor, 180000);
  assert.equal(Math.round(epa.porcentaje), 33);
  assert.equal(Math.round(gollo.porcentajeValor), 82);
});

test('agrupa la distribución por categoría con etiquetas en español', () => {
  const m = computeCatalogMetrics(catalogo, settings);
  const refri = m.porCategoria.find((g) => g.clave === 'refrigeracion');
  assert.ok(refri);
  assert.equal(refri.etiqueta, 'Refrigeración');
  assert.equal(refri.unidades, 1);
});

test('destaca los productos de mayor valor y de mayor descuento', () => {
  const m = computeCatalogMetrics(catalogo, settings);
  assert.equal(m.mayorValor[0].id, 'c');
  assert.equal(m.mayorValor.length, 3);
  assert.equal(m.mayorDescuento[0].id, 'a');
  assert.equal(m.mayorDescuento.length, 2);
});

test('un catálogo vacío produce ceros sin NaN ni Infinity', () => {
  const m = computeCatalogMetrics([], settings);
  assert.equal(m.totalProductos, 0);
  assert.equal(m.valorTotal, 0);
  assert.equal(m.precioPromedio, 0);
  assert.equal(m.descuentoPromedio, 0);
  assert.equal(m.comisionPotencial, 0);
  assert.deepEqual(m.porTienda, []);
  assert.deepEqual(m.porCategoria, []);
  assert.deepEqual(m.mayorValor, []);
  assert.deepEqual(m.mayorDescuento, []);

  for (const value of Object.values(m)) {
    if (typeof value === 'number') {
      assert.ok(Number.isFinite(value), `valor no finito: ${value}`);
    }
  }
});

test('un solo producto da 100 por ciento en la distribución', () => {
  const m = computeCatalogMetrics([catalogo[0]], settings);
  assert.equal(m.porTienda.length, 1);
  assert.equal(m.porTienda[0].porcentaje, 100);
  assert.equal(m.porTienda[0].porcentajeValor, 100);
  assert.equal(m.precioPromedio, 320000);
});

// --- tabla de gestión ---

test('buildProductRows crea una fila por producto con su texto de búsqueda', () => {
  const rows = buildProductRows(catalogo);
  assert.equal(rows.length, 3);
  assert.equal(rows[0].descuento, 20);
  assert.equal(rows[2].descuento, 0);
  assert.ok(rows[0].busqueda.includes('refrigeradora lg'));
  assert.ok(rows[0].busqueda.includes('lg-001'));
});

test('la búsqueda ignora mayúsculas y acentos', () => {
  const rows = buildProductRows(catalogo);
  assert.equal(filterAndSortRows(rows, { query: 'REFRIGERADORA', sortBy: 'nombre', sortDir: 'asc' }).length, 1);
  assert.equal(filterAndSortRows(rows, { query: 'refrigeracion', sortBy: 'nombre', sortDir: 'asc' }).length, 1);
});

test('la búsqueda por marca y por SKU encuentra el producto', () => {
  const rows = buildProductRows(catalogo);
  assert.equal(filterAndSortRows(rows, { query: 'whirlpool', sortBy: 'nombre', sortDir: 'asc' })[0].producto.id, 'b');
  assert.equal(filterAndSortRows(rows, { query: 'MB-003', sortBy: 'nombre', sortDir: 'asc' })[0].producto.id, 'c');
});

test('una búsqueda sin resultados devuelve una tabla vacía', () => {
  const rows = buildProductRows(catalogo);
  assert.equal(filterAndSortRows(rows, { query: 'zzzz', sortBy: 'nombre', sortDir: 'asc' }).length, 0);
});

test('ordena por precio y por descuento, en ambos sentidos', () => {
  const rows = buildProductRows(catalogo);

  const asc = filterAndSortRows(rows, { query: '', sortBy: 'precio', sortDir: 'asc' });
  assert.deepEqual(asc.map((r) => r.producto.id), ['b', 'a', 'c']);

  const desc = filterAndSortRows(rows, { query: '', sortBy: 'precio', sortDir: 'desc' });
  assert.deepEqual(desc.map((r) => r.producto.id), ['c', 'a', 'b']);

  const porDescuento = filterAndSortRows(rows, { query: '', sortBy: 'descuento', sortDir: 'desc' });
  assert.deepEqual(porDescuento.map((r) => r.producto.id), ['a', 'b', 'c']);
});

test('ordena por nombre en español', () => {
  const rows = buildProductRows(catalogo);
  const asc = filterAndSortRows(rows, { query: '', sortBy: 'nombre', sortDir: 'asc' });
  assert.equal(asc[0].producto.name, 'Cocina Mabe');
  assert.equal(asc[2].producto.name, 'Refrigeradora LG');
});

// --- utilidades ---

test('normalizeText quita acentos y pasa a minúsculas', () => {
  assert.equal(normalizeText('Refrigeración ÁÉÍÓÚ Ñ'), 'refrigeracion aeiou n');
});
