import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  CARD_FILENAMES,
  CARD_HEIGHT_MM,
  CARD_HEIGHT_PX,
  CARD_WIDTH_MM,
  CARD_WIDTH_PX,
  DPI,
  SHEET_COLUMNS,
  SHEET_GAP_PX,
  SHEET_HEIGHT_PX,
  SHEET_MARGIN_PX,
  SHEET_ROWS,
  SHEET_WIDTH_PX,
} from './cardImage';

test('la tarjeta mide 3.5" x 2" en milímetros', () => {
  assert.equal(CARD_WIDTH_MM, 85);
  assert.equal(CARD_HEIGHT_MM, 54);
});

test('la tarjeta se exporta a 300 DPI con más de 1000 px de ancho', () => {
  assert.equal(DPI, 300);
  assert.equal(CARD_WIDTH_PX, 1004);
  assert.equal(CARD_HEIGHT_PX, 638);
  assert.ok(CARD_WIDTH_PX >= 1000, 'SC-005: al menos 1000 px de ancho');
});

test('la resolución equivale a 300 DPI reales', () => {
  const expectedWidth = Math.round((85 / 25.4) * 300);
  assert.equal(CARD_WIDTH_PX, expectedWidth);
});

test('la hoja completa tiene 8 tarjetas en 2 columnas por 4 filas', () => {
  assert.equal(SHEET_COLUMNS, 2);
  assert.equal(SHEET_ROWS, 4);
  assert.equal(SHEET_COLUMNS * SHEET_ROWS, 8);
});

test('la hoja completa reserva el espacio de las 8 tarjetas, las separaciones y el margen', () => {
  const expectedWidth =
    SHEET_COLUMNS * CARD_WIDTH_PX +
    (SHEET_COLUMNS - 1) * SHEET_GAP_PX +
    SHEET_MARGIN_PX * 2;
  const expectedHeight =
    SHEET_ROWS * CARD_HEIGHT_PX +
    (SHEET_ROWS - 1) * SHEET_GAP_PX +
    SHEET_MARGIN_PX * 2;

  assert.equal(SHEET_WIDTH_PX, expectedWidth);
  assert.equal(SHEET_HEIGHT_PX, expectedHeight);
  assert.ok(SHEET_WIDTH_PX > CARD_WIDTH_PX, 'la hoja es más ancha que una tarjeta');
  assert.ok(SHEET_HEIGHT_PX > CARD_HEIGHT_PX, 'la hoja es más alta que una tarjeta');
});

test('la hoja tiene las dimensiones exactas para imprenta', () => {
  // Verificado contra el PNG real descargado del navegador.
  assert.equal(SHEET_WIDTH_PX, 2088);
  assert.equal(SHEET_HEIGHT_PX, 2712);
});

test('los nombres de archivo PNG son descriptivos', () => {
  assert.equal(CARD_FILENAMES.front, 'electroHogar-tarjeta-anverso.png');
  assert.equal(CARD_FILENAMES.back, 'electroHogar-tarjeta-reverso.png');
  assert.equal(CARD_FILENAMES.sheet, 'electroHogar-tarjeta-hoja-8.png');
  for (const name of Object.values(CARD_FILENAMES)) {
    assert.ok(name.endsWith('.png'));
  }
});
