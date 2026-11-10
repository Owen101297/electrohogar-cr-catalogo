# Quickstart: Separar la vista pública del catálogo y la vista del asesor

**Feature**: 002-vista-publica-asesor | **Date**: 2026-11-10

Guía de validación ejecutable.

## Prerrequisitos

```bash
cd /Users/owen/Downloads/electrohogar-costa-rica---catálogo-&-tarjetas
npm install --legacy-peer-deps --cache /private/var/folders/_j/mfw289q57z7cly6843mvk47c0000gn/T/opencode/npm-cache
```

> `bun` no está instalado; se usa `npm`. El flag `--legacy-peer-deps` es necesario por el conflicto
> de peer `esbuild` entre `tsx` y `vite@8`. El mismo flag se usa en el build de Vercel
> (`vercel.json` → `installCommand`).

## Comandos de verificación

| Comando | Qué verifica |
|---|---|
| `npm run lint` | Tipado estricto sin errores |
| `npm test` | Pruebas unitarias (enrutado y sesión de asesor) |
| `npm run build` | Build de producción |

## Validar la feature

```bash
npm run dev
```

> El puerto `127.0.0.1:3000` puede estar ocupado por un túnel SSH en la máquina. El dev server
> imprime la URL de red (`Network:`) que sí funciona. Vite sirve `index.html` para cualquier ruta,
> así que `/asesor` funciona en local sin configuración extra.

---

## Escenario 1 — La vista pública está limpia (US1, FR-001/002/003/004/005, SC-001/SC-002)

1. Abrí `http://<host>:<puerto>/` (la raíz, sin parámetros).
2. Revisá **toda** la página de arriba abajo.

**Esperado — NO debe existir**:
- Ningún texto con "QR", "Tarjeta", "Tarjeta Digital" ni "Diseñador".
- Ninguna pestaña de navegación con pestañas.
- El texto "%", "Margen" o "Ganancia" en ninguna parte.
- Los botones "+ Agregar Producto", "Editar producto", "Eliminar producto".
- El enlace "Ver Tarjeta Corporativa con QR" del pie de página.
- Ningún enlace, botón o texto que lleve al modo asesor.

**Esperado — SÍ debe funcionar**:
- Buscar un producto por nombre, marca o SKU.
- Filtrar por tienda (Gollo / EPA) y por categoría.
- Ordenar por Destacados / Mayor Descuento / Menor Precio / Mayor Precio.
- Abrir la ficha técnica y ver precios, cuotas, especificaciones y garantía.
- El botón "Pedir por WhatsApp" (abre `wa.me` con el producto).
- El enlace de WhatsApp del encabezado.

## Escenario 2 — La ficha pública no permite administrar (US1-3, FR-004)

1. En la vista pública, abrí la ficha de cualquier producto.
2. Revisá el bloque inferior de la ficha.

**Esperado**: aparecen el botón de WhatsApp y el texto "Se enviará un mensaje pre-llenado…", pero
**no** aparecen "Editar producto" ni "Eliminar producto".

## Escenario 3 — El modo asesor exige confirmación (US2-1, FR-007)

1. Abrí `http://<host>:<puerto>/asesor`.
2. **Esperado**: aparece una pantalla de confirmación "Acceso del asesor" con dos acciones:
   "Entrar al modo asesor" y "Ver el catálogo".
3. Pulsá **"Ver el catálogo"**.
   **Esperado**: vuelve a la vista pública limpia, sin herramientas.
4. Abrí `/asesor` otra vez y pulsá **"Entrar al modo asesor"**.
   **Esperado**: entra a la interfaz completa de administración.

## Escenario 4 — El modo asesor tiene todas las herramientas (US2, FR-009)

1. Ya en modo asesor, verificá que están disponibles:
   - La pestaña "Diseñador de Tarjeta con QR".
   - El botón "Tarjeta Digital".
   - El enlace del margen ("8% Margen…") en la barra superior.
   - "+ Agregar Producto" en el catálogo.
   - "Editar producto" y "Eliminar producto" en la ficha técnica.

**Esperado**: todo presente y funcional, igual que antes del cambio.

## Escenario 5 — La sesión se cierra al cerrar el navegador (US2-4, FR-008, SC-005)

1. Entrá al modo asesor y confirma que estás dentro.
2. **Cerrá el navegador por completo** (no solo la pestaña).
3. Volvé a abrirlo y entrá a `/asesor`.

**Esperado**: vuelve a pedir la confirmación de ingreso — la sesión se cerró con el navegador.

> Para verificarlo de forma automatizada: en las herramientas de navegador, borrar el
> almacenamiento de sesión (`sessionStorage.clear()`) equivale al cierre del navegador.

## Escenario 6 — Dos pestañas: la pública sigue limpia (US2, FR-016, edge case)

1. En una pestaña, entra al modo asesor.
2. Abre una **segunda pestaña** en la raíz `/`.

**Esperado**: la segunda pestaña muestra el catálogo público limpio, sin herramientas, aunque la
primera tenga la sesión de asesor activa.

## Escenario 7 — El QR apunta al catálogo público (US3, FR-011, SC-006)

1. En modo asesor, abrí "Diseñador de Tarjeta con QR".
2. Verificá el campo "Enlace web del Catálogo (Destino del QR)".

**Esperado**: el valor es la URL **pública** (raíz del sitio), por ejemplo
`https://electrohogar-cr-catalogo.vercel.app/`. **Nunca** debe terminar en `/asesor`.

3. Abrí la "Tarjeta Digital" y verificá el mismo destino.

## Escenario 8 — La hoja imprime 8 tarjetas con marcas de corte (US3, FR-012/013/014, SC-007)

1. En el diseñador de tarjetas, pulsá **"Imprimir Hoja (8x Tarjetas)"**.
2. En el diálogo de impresión: papel A4, orientación horizontal, **márgenes en "Ninguno"**, y
   **activar "Gráficos de fondo"**.

**Esperado**: una hoja con 8 tarjetas (4 frentes + 4 reversos alternados), cada una de 85 × 54 mm
con su marca de corte punteada, el anverso con marca y WhatsApp, y el reverso con el QR.

3. Verificá que **no** se imprimen la barra superior, las pestañas ni el pie de página.

## Escenario 9 — El QR impreso abre el catálogo (US3-2, SC-006)

1. Descargá o imprimí una tarjeta y escaneá el QR con el teléfono.
2. **Esperado**: se abre el catálogo público con los productos y sus precios en colones.

## Escenario 10 — Rutas desconocidas no revelan el modo asesor (edge case)

1. Abrí `http://<host>:<puerto>/cualquier/cosa`.
2. **Esperado**: se muestra el catálogo público limpio. No hay mensaje de error ni mención del
   modo asesor.

## Pruebas unitarias

```bash
npm test
```

Cubren, en `src/utils/routing.test.ts`:

| Caso | Requisito |
|---|---|
| `/` resuelve a `public` | FR-001 |
| `/asesor` y `/asesor/` resuelven a `advisor` | FR-001 |
| `/ruta/desconocida` resuelve a `public` | edge case |
| `getPublicCatalogUrl()` devuelve `origin + '/'` | FR-011 |
| `getPublicCatalogUrl()` no devuelve `/asesor` | FR-011 |
| La sesión se activa, se lee y se cierra correctamente | FR-007, FR-008 |
| `isAdvisorSessionActive()` es `false` sin sesión | FR-008 |
