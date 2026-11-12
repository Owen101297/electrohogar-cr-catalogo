/**
 * Migraciones del perfil de la tarjeta.
 *
 * El perfil vive en `localStorage`, así que cambiar un valor por defecto no
 * afecta a quien ya tiene el perfil guardado en el navegador. Estas funciones
 * actualizan en sitio los datos que quedaron atrás cuando el negocio cambia
 * un dato de la tarjeta, sin tocar el resto de la información editada a mano.
 *
 * Contrato: specs/004-panel-admin-tarjeta-png/contracts/card-image.md
 */

import { CardProfile } from '../types';

/** Teléfono local (8 dígitos) con el que se imprime la tarjeta. */
export const DEFAULT_PHONE = '6168-2892';

/**
 * Teléfonos que se reemplazan automáticamente por el actual.
 *
 * Se guardan sin formato: la comparación normaliza a dígitos, de modo que
 * `8888-1234`, `88881234`, `+506 8888-1234` y `50688881234` cuentan como el
 * mismo número.
 */
const LEGACY_PHONES = ['88881234'];

/** Normaliza un teléfono a sus dígitos, sin prefijo ni signos. */
export function normalizePhone(phone: string): string {
  return (phone ?? '').replace(/[^0-9]/g, '');
}

/** Compara dos teléfonos ignorando formato, prefijo y guiones. */
export function isSamePhone(a: string, b: string): boolean {
  const digitsA = normalizePhone(a);
  const digitsB = normalizePhone(b);
  if (!digitsA || !digitsB) return false;
  // `506` es el prefijo de Costa Rica: se ignora para comparar el local.
  const localA = digitsA.startsWith('506') ? digitsA.slice(3) : digitsA;
  const localB = digitsB.startsWith('506') ? digitsB.slice(3) : digitsB;
  return localA === localB;
}

/**
 * Reemplaza un teléfono anterior por el actual, conservando el resto del
 * perfil (marca, lema, cobertura, paleta, etc.).
 *
 * Si el teléfono guardado ya es el actual, o si la asesora lo editó a mano,
 * el perfil se devuelve tal cual.
 */
export function migrateProfilePhone(
  profile: CardProfile,
  currentPhone: string = DEFAULT_PHONE
): CardProfile {
  const stored = profile.phone ?? '';

  if (isSamePhone(stored, currentPhone)) return profile;

  const isLegacy = LEGACY_PHONES.some((legacy) => isSamePhone(stored, legacy));
  if (!isLegacy) return profile;

  return { ...profile, phone: currentPhone };
}
