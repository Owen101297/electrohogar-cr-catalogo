import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildProductFromForm,
  calculateDiscountPercent,
  emptyProductFormValues,
  estimateQuincenalInstallment,
  parseColones,
  productToFormValues,
  validateProductForm,
} from './products';
import { Product } from '../types';

const baseValues = () => ({
  ...emptyProductFormValues(),
  name: 'Refrigeradora LG No Frost 15 Pies',
  sku: 'LG-LT41WPP',
  originalPriceStr: '400000',
  currentPriceStr: '320000',
  installmentQuincenalStr: '15000',
});

const sampleProduct = (): Product => ({
  id: 'prod-ref-02',
  name: 'Refrigeradora LG No Frost Top Mount 15 Pies DoorCooling+',
  category: 'refrigeracion',
  brand: 'LG',
  store: 'EPA',
  originalPrice: 489900,
  currentPrice: 399900,
  cashDiscountPercent: 18,
  installmentQuincenal: 12200,
  installmentMonths: 24,
  image: 'https://example.com/lg.jpg',
  badge: 'Disponible en EPA',
  warrantyMonths: 12,
  sku: 'LG-LT41WPP',
  specs: {
    capacity: '15 Pies Cúbicos (423 Litros)',
    dimensions: '168 cm Alto x 70 cm Ancho x 73 cm Prof.',
    voltage: '110-120V / 60Hz',
    energyRating: 'Smart Inverter A++',
    color: 'Platino / Acero Cepillado',
    details: ['Feature original A', 'Feature original B'],
  },
  description: 'Excelente opción para casas y apartamentos en Costa Rica.',
});

// --- parseColones -------------------------------------------------------

test('parseColones ignora el símbolo de colones y los separadores de miles', () => {
  assert.equal(parseColones('₡649.900'), 649900);
  assert.equal(parseColones('1,299,000'), 1299000);
  assert.equal(parseColones('  250 000 '), 250000);
});

test('parseColones devuelve 0 cuando no hay dígitos', () => {
  assert.equal(parseColones('abc'), 0);
  assert.equal(parseColones(''), 0);
  assert.equal(parseColones('₡'), 0);
});

// --- calculateDiscountPercent -------------------------------------------

test('calculateDiscountPercent devuelve 0 si no hay descuento', () => {
  assert.equal(calculateDiscountPercent(400000, 320000), 20);
  assert.equal(calculateDiscountPercent(400000, 400000), 0);
  assert.equal(calculateDiscountPercent(400000, 500000), 0);
  assert.equal(calculateDiscountPercent(0, 0), 0);
});

// --- estimateQuincenalInstallment ---------------------------------------

test('estimateQuincenalInstallment sigue la regla de 24 meses', () => {
  // 649900 * 1.35 / 48 = 18278
  assert.equal(estimateQuincenalInstallment(649900, 24), 18278);
});

test('estimateQuincenalInstallment no divide entre cero', () => {
  assert.equal(estimateQuincenalInstallment(100000, 0), 67500);
});

// --- validateProductForm -------------------------------------------------

test('validateProductForm rechaza el nombre vacío', () => {
  const values = { ...baseValues(), name: '   ' };
  const errors = validateProductForm(values);
  assert.equal(errors.name, 'Escribe el nombre del electrodoméstico.');
});

test('validateProductForm rechaza el precio de contado no numérico', () => {
  const values = { ...baseValues(), currentPriceStr: 'mucho' };
  const errors = validateProductForm(values);
  assert.equal(errors.currentPriceStr, 'Escribe el precio de contado en colones.');
});

test('validateProductForm rechaza el precio de lista vacío', () => {
  const values = { ...baseValues(), originalPriceStr: '' };
  const errors = validateProductForm(values);
  assert.equal(errors.originalPriceStr, 'Escribe el precio de lista en colones.');
});

test('validateProductForm rechaza un SKU vacío y una URL de foto inválida', () => {
  const errors = validateProductForm({ ...baseValues(), sku: '', image: 'no-es-url' });
  assert.equal(errors.sku, 'Escribe el código SKU del producto.');
  assert.equal(errors.image, 'La dirección de la foto no es válida.');
});

test('validateProductForm acepta un formulario válido sin errores', () => {
  const errors = validateProductForm(baseValues());
  assert.deepEqual(errors, {});
});

test('validateProductForm acepta la cuota quincenal vacía (se calcula sola)', () => {
  const errors = validateProductForm({
    ...baseValues(),
    installmentQuincenalStr: '',
  });
  assert.equal(errors.installmentQuincenalStr, undefined);
});

// --- buildProductFromForm ------------------------------------------------

test('buildProductFromForm normaliza el precio de lista cuando queda menor que el de contado', () => {
  const product = buildProductFromForm({
    ...baseValues(),
    originalPriceStr: '100000',
    currentPriceStr: '250000',
  });
  assert.equal(product.currentPrice, 250000);
  assert.equal(product.originalPrice, 250000);
  assert.equal(product.cashDiscountPercent, undefined);
});

test('buildProductFromForm deriva el descuento en efectivo', () => {
  const product = buildProductFromForm({
    ...baseValues(),
    originalPriceStr: '400000',
    currentPriceStr: '320000',
  });
  assert.equal(product.cashDiscountPercent, 20);
});

test('buildProductFromForm respeta la cuota quincenal capturada', () => {
  const product = buildProductFromForm({
    ...baseValues(),
    installmentQuincenalStr: '12345',
  });
  assert.equal(product.installmentQuincenal, 12345);
});

test('buildProductFromForm estima la cuota quincenal cuando el campo está vacío', () => {
  const product = buildProductFromForm({
    ...baseValues(),
    currentPriceStr: '649900',
    installmentQuincenalStr: '',
    installmentMonths: 24,
  });
  assert.equal(product.installmentQuincenal, 18278);
});

test('buildProductFromForm conserva id, sku y specs.details al editar', () => {
  const existing = sampleProduct();
  const product = buildProductFromForm(
    {
      ...productToFormValues(existing),
      currentPriceStr: '599900',
      originalPriceStr: '489900',
    },
    existing
  );

  assert.equal(product.id, existing.id);
  assert.equal(product.sku, existing.sku);
  assert.deepEqual(product.specs.details, existing.specs.details);
  assert.equal(product.currentPrice, 599900);
  assert.equal(product.name, existing.name);
});

test('buildProductFromForm genera id y sku nuevos al crear', () => {
  const product = buildProductFromForm(baseValues());
  assert.ok(product.id.length > 0);
  assert.equal(product.sku, 'LG-LT41WPP');
  assert.deepEqual(product.specs.details, []);
});

test('buildProductFromForm limpia los espacios del nombre', () => {
  const product = buildProductFromForm({ ...baseValues(), name: '  Horno  ' });
  assert.equal(product.name, 'Horno');
});

// --- productToFormValues --------------------------------------------------

test('productToFormValues precarga todos los campos del producto', () => {
  const existing = sampleProduct();
  const values = productToFormValues(existing);

  assert.equal(values.name, existing.name);
  assert.equal(values.brand, existing.brand);
  assert.equal(values.store, existing.store);
  assert.equal(values.category, existing.category);
  assert.equal(values.currentPriceStr, '399900');
  assert.equal(values.originalPriceStr, '489900');
  assert.equal(values.installmentQuincenalStr, '12200');
  assert.equal(values.installmentMonths, 24);
  assert.equal(values.warrantyMonths, 12);
  assert.equal(values.sku, existing.sku);
  assert.equal(values.image, existing.image);
  assert.equal(values.badge, existing.badge);
  assert.equal(values.description, existing.description);
  assert.equal(values.capacity, existing.specs.capacity);
  assert.equal(values.dimensions, existing.specs.dimensions);
  assert.equal(values.voltage, existing.specs.voltage);
  assert.equal(values.energyRating, existing.specs.energyRating);
  assert.equal(values.color, existing.specs.color);
});

test('productToFormValues y buildProductFromForm hacen round-trip sin pérdida', () => {
  const existing = sampleProduct();
  const product = buildProductFromForm(productToFormValues(existing), existing);

  assert.equal(product.name, existing.name);
  assert.equal(product.brand, existing.brand);
  assert.equal(product.store, existing.store);
  assert.equal(product.category, existing.category);
  assert.equal(product.currentPrice, existing.currentPrice);
  assert.equal(product.originalPrice, existing.originalPrice);
  assert.equal(product.installmentQuincenal, existing.installmentQuincenal);
  assert.equal(product.installmentMonths, existing.installmentMonths);
  assert.equal(product.warrantyMonths, existing.warrantyMonths);
  assert.equal(product.cashDiscountPercent, existing.cashDiscountPercent);
});
