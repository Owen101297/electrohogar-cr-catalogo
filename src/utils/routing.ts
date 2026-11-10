/**
 * Enrutado de la aplicación y sesión de asesor.
 *
 * La app sirve dos experiencias distintas:
 *   - `/`        → catálogo público (lo que ve el cliente)
 *   - `/asesor`  → interfaz de administración (uso interno de la asesora)
 *
 * Este módulo es la única fuente de verdad sobre rutas, URL pública y sesión.
 * Contrato: specs/002-vista-publica-asesor/contracts/routing.md
 */

/** Pantalla que se monta, derivada del pathname actual. */
export type Route = 'public' | 'advisor';

/** Ruta interna del modo asesor. No se enlaza desde ningún lugar del sitio público. */
export const ADVISOR_ROUTE = '/asesor';

/** Clave de la sesión de asesor en sessionStorage (se descarta al cerrar el navegador). */
export const ADVISOR_SESSION_KEY = 'electrohogar_cr_admin_session';

/** Copy del diálogo de confirmación de ingreso al modo asesor. */
export const ADVISOR_GATE_COPY = {
  title: 'Acceso del asesor',
  body: 'Esta pantalla es para la asesora de ElectroHogar. Contiene las herramientas para administrar el catálogo, calcular comisiones e imprimir la tarjeta con QR.',
  enter: 'Entrar al modo asesor',
  cancel: 'Ver el catálogo',
  exit: 'Salir del modo asesor',
} as const;

/**
 * Resuelve la pantalla a montar a partir del pathname.
 *
 * Las rutas desconocidas caen en 'public' para no revelar la existencia del
 * modo asesor (edge case de la spec).
 */
export function resolveRoute(pathname: string): Route {
  const normalized = (pathname ?? '').trim().toLowerCase();
  const withoutSlash = normalized.replace(/\/+$/, '');

  if (withoutSlash === ADVISOR_ROUTE) return 'advisor';
  return 'public';
}

/**
 * URL pública del catálogo: el destino del código QR.
 *
 * Se deriva del origen, nunca del href actual: dentro de /asesor el href
 * apuntaría a la ruta interna, que es justo lo que FR-011 prohíbe.
 */
export function getPublicCatalogUrl(): string {
  if (typeof window === 'undefined') return '/';
  return `${window.location.origin}/`;
}

/** Almacenamiento de sesión, o `null` si el navegador no lo expone. */
function getSessionStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.sessionStorage ?? null;
  } catch {
    // Modo privado de algunos navegadores bloquea el acceso.
    return null;
  }
}

/** Indica si esta pestaña tiene una sesión de asesor activa. */
export function isAdvisorSessionActive(): boolean {
  const storage = getSessionStorage();
  if (!storage) return false;
  try {
    return storage.getItem(ADVISOR_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

/** Inicia la sesión de asesor. Idempotente. */
export function startAdvisorSession(): void {
  const storage = getSessionStorage();
  if (!storage) return;
  try {
    storage.setItem(ADVISOR_SESSION_KEY, '1');
  } catch {
    // Sin almacenamiento disponible el modo asesor no puede activarse.
  }
}

/** Cierra la sesión de asesor. Idempotente y nunca lanza. */
export function endAdvisorSession(): void {
  const storage = getSessionStorage();
  if (!storage) return;
  try {
    storage.removeItem(ADVISOR_SESSION_KEY);
  } catch {
    // Nada que hacer: la sesión ya no existe.
  }
}
