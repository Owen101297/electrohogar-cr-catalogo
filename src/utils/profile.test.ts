import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_PHONE,
  isSamePhone,
  migrateProfilePhone,
  normalizePhone,
} from './profile';
import { CardProfile } from '../types';

const baseProfile = (): CardProfile => ({
  brandName: 'ElectroHogar Costa Rica',
  serviceTagline: 'Catálogo Oficial de Electrodomésticos & Entrega a Domicilio',
  phone: '6168-2892',
  email: 'ventas@electrohogarcr.com',
  slogan: 'Los mejores precios de Gollo y EPA en la puerta de su hogar',
  coverage: 'San José, Alajuela, Heredia, Cartago y envíos a todo Costa Rica',
  paletteId: 'sapphire-gold',
  minimalistStyle: 'modern-clean',
  showStoresLogos: true,
  services: ['Entrega coordinada a domicilio'],
});

test('normalizePhone deja solo los dígitos', () => {
  assert.equal(normalizePhone('+506 6168-2892'), '50661682892');
  assert.equal(normalizePhone('6168-2892'), '61682892');
  assert.equal(normalizePhone(''), '');
});

test('isSamePhone ignora formato y prefijo del país', () => {
  assert.ok(isSamePhone('6168-2892', '61682892'));
  assert.ok(isSamePhone('6168-2892', '+506 6168 2892'));
  assert.ok(isSamePhone('+50661682892', '61682892'));
  assert.ok(!isSamePhone('6168-2892', '8888-1234'));
});

test('migrateProfilePhone reemplaza el teléfono anterior', () => {
  const migrated = migrateProfilePhone({ ...baseProfile(), phone: '8888-1234' });
  assert.equal(migrated.phone, DEFAULT_PHONE);
});

test('migrateProfilePhone reconoce el teléfono anterior con o sin formato', () => {
  for (const legacy of ['8888-1234', '88881234', '+506 8888-1234', '50688881234']) {
    const migrated = migrateProfilePhone({ ...baseProfile(), phone: legacy });
    assert.equal(migrated.phone, DEFAULT_PHONE, `no migró: ${legacy}`);
  }
});

test('migrateProfilePhone conserva el resto del perfil', () => {
  const original: CardProfile = {
    ...baseProfile(),
    phone: '8888-1234',
    brandName: 'Mi Empresa',
    slogan: 'Mi lema',
    coverage: 'Heredia y Alajuela',
    paletteId: 'dark-luxury',
  };

  const migrated = migrateProfilePhone(original);

  assert.equal(migrated.phone, DEFAULT_PHONE);
  assert.equal(migrated.brandName, 'Mi Empresa');
  assert.equal(migrated.slogan, 'Mi lema');
  assert.equal(migrated.coverage, 'Heredia y Alajuela');
  assert.equal(migrated.paletteId, 'dark-luxury');
  // El perfil original no se muta.
  assert.equal(original.phone, '8888-1234');
});

test('migrateProfilePhone respeta un teléfono editado a mano', () => {
  const original = { ...baseProfile(), phone: '2222-3333' };
  const migrated = migrateProfilePhone(original);
  assert.equal(migrated.phone, '2222-3333');
  assert.equal(migrated, original);
});

test('migrateProfilePhone es idempotente', () => {
  const once = migrateProfilePhone({ ...baseProfile(), phone: '8888-1234' });
  const twice = migrateProfilePhone(once);
  assert.equal(twice.phone, DEFAULT_PHONE);
  assert.equal(twice, once);
});
