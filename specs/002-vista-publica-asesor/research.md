# Research: Separar la vista pública del catálogo y la vista del asesor

**Feature**: 002-vista-publica-asesor | **Date**: 2026-11-10

## R-001: ¿Cómo se separan las dos pantallas?

**Decisión**: Enrutado manual por `window.location.pathname`, resuelto en el arranque. La ruta
raíz monta `<PublicCatalog/>`; la ruta `/asesor` monta `<AdvisorDashboard/>`.

**Rationale**: La app es de una sola pantalla con estado interno (`currentView`), sin rutas ni
enlaces profundos. Instalar `react-router` para tener exactamente dos rutas sería una dependencia
nueva para resolver un problema de un solo `if` (principio V, YAGNI). El pathname además da URLs
limpias y compartibles: la asesora puede tener `/asesor` en un marcador y el QR apunta a `/`.

**Alternativas consideradas**:
- *`react-router-dom`*: descartado, dependencia nueva para dos rutas.
- *Un botón que alterna el modo en la misma URL*: descartado — el usuario pidió explícitamente
  "otra pantalla, otra pagina", y un toggle en la misma URL dejaría el modo asesor a un clic de
  distancia del cliente.
- *Un parámetro `?admin=1`*: descartado — el usuario pidió que sea "otro link"; además el
  parámetro se comparte en los enlaces y el historial del navegador.

## R-002: ¿Cómo se sirve `/asesor` en un hosting estático?

**Decisión**: Rewrite en Vercel: `rewrites: [{ source: "/(.*)", destination: "/index.html" }]`.

**Rationale**: Vite genera un SPA de una sola página. Sin rewrite, `/asesor` devuelve 404 aunque
el bundle exista. Con el rewrite, cualquier ruta devuelve `index.html` y el enrutado del lado del
cliente decide qué montar. Es la solución estándar para SPA en Vercel y no requiere cambiar el
build.

**Alternativas consideradas**:
- *Carpeta `/asesor/index.html` con un segundo bundle*: descartado, duplica el bundle y obliga a
  mantener dos `index.html`.
- *Hash routing (`/#/asesor`)*: descartado, la ruta queda en el fragmento y se ve en la barra de
  direcciones del cliente; menos limpio y menos compartible.

## R-003: ¿Dónde vive la sesión de asesor?

**Decisión**: `sessionStorage`, clave `electrohogar_cr_admin_session`.

**Rationale**: El requisito es que la sesión se desactive al cerrar el navegador. `sessionStorage`
tiene exactamente ese ciclo de vida: se borra cuando se cierra la pestaña/navegador. Además es
**por pestaña**: si la asesora tiene el modo asesor abierto en una pestaña y mira el catálogo
público en otra, la sesión no se filtra entre ellas — esto resuelve FR-016 de forma nativa, sin
lógica adicional.

**Alternativas consideradas**:
- *`localStorage`*: descartado — persiste al cerrar el navegador (viola FR-008) y se comparte
  entre pestañas (viola FR-016).
- *Un token en la URL con expiración*: descartado — el estado de sesión quedaría en el historial
  y en los enlaces.
- *Cookie*: descartado — requiere servidor para invalidarla, y la app no tiene backend.

**Nota de constitución**: el principio II manda el estado de *dominio* a `localStorage`. La sesión
de asesor no es estado de dominio sino estado efímero de sesión, y la spec exige que muera con el
navegador. Guardarla en `localStorage` incumpliría FR-008. Queda documentado aquí.

## R-004: ¿Cómo se evita que un cliente entre al modo asesor por error?

**Decisión**: Al abrir `/asesor`, si no hay sesión activa, se muestra una pantalla de confirmación
explícita ("¿Entrar al modo asesor?") con un botón de entrada y otro de cancelar que devuelve al
catálogo público.

**Rationale**: FR-007 pide confirmación explícita. Un cliente curioso que teclee o adivina la ruta
no debe encontrarse la interfaz de administración; debe ver una pantalla de confirmación que le
haga desistir. No es una contraseña (la spec lo aclara): es una barrera contra el ingreso
accidental, suficiente para el caso de uso real.

**Alternativas consideradas**:
- *Contraseña / PIN*: descartado — la spec dice que no es autenticación; además obligaría a la
  asesora a recordar y rotar un secreto.
- *Mostrar la interfaz de asesor directamente*: descartado — un cliente que encontrara la ruta
  vería las herramientas de Immediately.

## R-005: ¿Se duplican `CatalogView` y `ProductDetailModal`?

**Decisión**: No. Se reutilizan con una prop `isAdvisor: boolean`.

**Rationale**: La cuadrícula del catálogo es idéntica en ambas pantallas (mismos productos, mismos
filtros). Lo que cambia son tres cosas: si se puede agregar producto, si se puede editar/eliminar
desde la ficha y si se muestra la ganancia. Una prop booleana explícita cubre las tres con menos
código que dos componentes completos, y garantiza que ambas pantallas compartan la misma lógica de
filtro y orden (que es donde un fork se desincronizaría).

**Alternativas consideradas**:
- *`PublicCatalogView` duplicado*: descartado — ~450 líneas duplicadas que divergirían con
  cualquier cambio futuro.
- *Un único componente que decide por contexto global*: descartado — el contexto implícito hace
  imposible razonar sobre qué pantalla se está renderizando.

## R-006: ¿Cómo se garantiza que el QR apunte al catálogo público?

**Decisión**: Se calcula una URL pública explícita a partir del `origin` del sitio, en lugar de
usar `window.location.href`.

**Rationale**: El código actual usa `window.location.href.split('#')[0]`. Dentro de `/asesor` eso
da la ruta interna, y el QR terminaría llevando al cliente a una pantalla de confirmación de
asesor (FR-011). La URL pública se deriva del origen: `origin + '/'`, que es la raíz del catálogo
en cualquier despliegue.

**Alternativas consideradas**:
- *Hardcodear `https://electrohogar-cr-catalogo.vercel.app`*: descartado — rompe los entornos
  locales y futuros dominios propios.
- *Variable de entorno de Vite*: descartado — mismo problema, y añade configuración de build.

## R-007: ¿Dónde vive la URL del catálogo?

**Decisión**: En `src/utils/routing.ts`, una función `getPublicCatalogUrl()` que devuelve
`${window.location.origin}/`.

**Rationale**: La necesitan tres sitios: `AppRouter` (para el perfil), `CardStudio` (QR
imprimible), `DigitalCardModal` (QR en pantalla). Centralizarla evita que uno de ellos se quede
con la URL vieja y genere un QR incorrecto — que es un fallo silencioso y costoso (el cliente
escanea y no abre el catálogo).

## R-008: ¿Cómo se prueba el enrutado sin navegador?

**Decisión**: `src/utils/routing.test.ts` con `node:test`, probando las funciones puras de
`routing.ts`: detección de ruta, construcción de la URL pública y construcción/lectura de la
sesión (con un `sessionStorage` simulado en memoria).

**Rationale**: La lógica de rutas es el corazón de la feature y es susceptible de errores de
borde (ruta con barra final, ruta desconocida, query strings). Probarla como funciones puras es
barato y evita depender del navegador para la parte más delicada.

**Alternativas consideradas**:
- *Probar solo en navegador con Playwright*: necesario pero insuficiente — no cubre los bordes de
  parsing de ruta.
- *Sin pruebas unitarias*: descartado, el enrutado es exactamente donde un error pasa desapercibido.
