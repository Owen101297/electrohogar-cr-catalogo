import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  ADVISOR_ROUTE,
  ADVISOR_SESSION_KEY,
  endAdvisorSession,
  getPublicCatalogUrl,
  isAdvisorSessionActive,
  resolveRoute,
  startAdvisorSession,
} from './routing';

/**
 * Simula un `sessionStorage` en memoria para poder probar el ciclo de vida de
 * la sesión sin navegador.
 */
function installFakeSessionStorage() {
  const store = new Map<string, string>();
  const fake: Storage = {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    key: (index: number) => [...store.keys()][index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };

  const target = globalThis as unknown as { window: Record<string, unknown> };
  target.window = {
    ...target.window,
    sessionStorage: fake,
    location: {
      origin: 'https://electrohogar-cr-catalogo.vercel.app',
      pathname: '/',
    },
  };

  return fake;
}

const originalWindow = (globalThis as { window?: unknown }).window;

test('resolveRoute devuelve public para la raíz', () => {
  assert.equal(resolveRoute('/'), 'public');
  assert.equal(resolveRoute('/index.html'), 'public');
  assert.equal(resolveRoute(''), 'public');
});

test('resolveRoute devuelve advisor para /asesor con o sin barra final', () => {
  assert.equal(resolveRoute('/asesor'), 'advisor');
  assert.equal(resolveRoute('/asesor/'), 'advisor');
  assert.equal(resolveRoute('/ASESOR'), 'advisor');
});

test('resolveRoute devuelve public para rutas desconocidas', () => {
  assert.equal(resolveRoute('/cualquier/cosa'), 'public');
  assert.equal(resolveRoute('/asesor/otra'), 'public');
  assert.equal(resolveRoute('/admin'), 'public');
});

test('ADVISOR_ROUTE es la ruta interna del modo asesor', () => {
  assert.equal(ADVISOR_ROUTE, '/asesor');
});

test('getPublicCatalogUrl devuelve el origen con barra final', () => {
  installFakeSessionStorage();
  assert.equal(
    getPublicCatalogUrl(),
    'https://electrohogar-cr-catalogo.vercel.app/'
  );
});

test('getPublicCatalogUrl nunca devuelve la ruta interna de asesor', () => {
  installFakeSessionStorage();
  (globalThis as { window: { location: { pathname: string } } }).window.location.pathname =
    '/asesor';
  const url = getPublicCatalogUrl();
  assert.ok(!url.includes('/asesor'), `la URL pública no debe incluir /asesor: ${url}`);
});

test('la sesión de asesor se activa, se lee y se cierra', () => {
  installFakeSessionStorage();

  assert.equal(isAdvisorSessionActive(), false);

  startAdvisorSession();
  assert.equal(isAdvisorSessionActive(), true);
  assert.equal(
    (globalThis as { window: { sessionStorage: Storage } }).window.sessionStorage.getItem(
      ADVISOR_SESSION_KEY
    ),
    '1'
  );

  endAdvisorSession();
  assert.equal(isAdvisorSessionActive(), false);
});

test('la sesión es idempotente al activar y al cerrar', () => {
  installFakeSessionStorage();

  startAdvisorSession();
  startAdvisorSession();
  assert.equal(isAdvisorSessionActive(), true);

  endAdvisorSession();
  endAdvisorSession();
  assert.equal(isAdvisorSessionActive(), false);
});

test('sin almacenamiento de sesión la sesión nunca queda activa', () => {
  const target = globalThis as unknown as { window: Record<string, unknown> };
  target.window = { ...target.window, sessionStorage: undefined };
  assert.equal(isAdvisorSessionActive(), false);
  startAdvisorSession();
  assert.equal(isAdvisorSessionActive(), false);
  endAdvisorSession();
});

test.after(() => {
  (globalThis as { window?: unknown }).window = originalWindow;
});
