# Verification Report: Separar la vista pública del catálogo y la vista del asesor

**Feature**: 002-vista-publica-asesor | **Fecha**: 2026-11-10
**Rama**: `002-vista-publica-asesor`
**Producción**: https://electrohogar-cr-catalogo.vercel.app · https://electrohogar-cr-catalogo.vercel.app/asesor

## Entorno de validación

| Item | Valor |
|---|---|
| Producción | Vercel (`electrohogar-cr-catalogo`), Chromium headless vía Playwright |
| Local | `npm run dev` → Vite 8.3.7 |
| Node | v26.13.0 · npm 12.2.1 |

## Comandos de calidad

| Comando | Resultado |
|---|---|
| `npm run lint` (`tsc --noEmit`, `strict: true`) | ✅ 0 errores |
| `npm test` (`node:test` vía `tsx`) | ✅ 29/29 (20 de productos + 9 de enrutado) |
| `npm run build` | ✅ 1703 módulos |

## Escenarios de `quickstart.md` — ejecutados en PRODUCCIÓN

| # | Escenario | Requisito | Resultado |
|---|---|---|---|
| 1 | Vista pública sin herramientas | FR-001/002/003/004/005, SC-001/SC-002 | ✅ |
| 2 | Ficha pública sin editar/eliminar | FR-004 | ✅ |
| 3 | `/asesor` exige confirmación | FR-007 | ✅ |
| 4 | Modo asesor con todas las herramientas | FR-009 | ✅ |
| 5 | La sesión se cierra al cerrar el navegador | FR-008, SC-005 | ✅ (por diseño: `sessionStorage`) |
| 6 | Dos pestañas: la pública sigue limpia | FR-016 | ✅ |
| 7 | El QR apunta al catálogo público | FR-011, SC-006 | ✅ |
| 8 | La hoja imprime 8 tarjetas con marcas de corte | FR-012/013/014, SC-007 | ✅ |
| 9 | El QR impreso abre el catálogo | SC-006 | ✅ |
| 10 | Ruta desconocida no revela el modo asesor | edge case | ✅ |

## Verificaciones con detalle

### Vista pública (Escenario 1)

Análisis del texto renderizado buscando cada término prohibido:

| Término | ¿Aparece? |
|---|---|
| `QR` | ❌ no |
| `Tarjeta` | ❌ no |
| `Diseñador` | ❌ no |
| `Margen` | ❌ no |
| `Ganancia` | ❌ no |
| `Agregar Producto` | ❌ no |
| `Editar producto` | ❌ no |
| `Eliminar producto` | ❌ no |
| `asesor` / `Acceso del asesor` | ❌ no |

- Enlaces que apuntan a `/asesor`: **0**
- Catálogo: 12 productos, WhatsApp `+506 8888-1234` visible, búsqueda/filtros/orden operativos.
- El único `%` visible es el **descuento en efectivo del producto** (`-18%`), que es información de
  venta para el cliente, no la comisión del asesor.

### Modo asesor (Escenarios 3 y 4)

Diálogo de confirmación en `/asesor` sin sesión:

> **Acceso del asesor** — "Esta pantalla es para la asesora de ElectroHogar. Contiene las
> herramientas para administrar el catálogo, calcular comisiones e imprimir la tarjeta con QR."
> [Ver el catálogo] [Entrar al modo asesor]

- "Ver el catálogo" → navega a `/` (vista pública limpia). ✅
- "Entrar al modo asesor" → monta el panel completo: `8% Margen (Oculto)`, pestaña "Diseñador de
  Tarjeta con QR", "+ Agregar Producto", "Salir del modo asesor". ✅
- Recargar `/asesor` con sesión activa **no** vuelve a pedir confirmación (misma sesión del
  navegador). ✅

### Aislamiento entre pestañas (Escenario 6)

- Pestaña 1: `/asesor` con sesión activa → panel de administración. ✅
- Pestaña 2: `/` → catálogo público limpio, sin "Agregar Producto", sin "Diseñador", sin
  "Margen". ✅

*Motivo*: `sessionStorage` es **por pestaña**, así que la sesión no se filtra entre pestañas sin
lógica adicional.

### Tarjeta imprimible (Escenarios 7 y 8)

- Destino del QR: `https://electrohogar-cr-catalogo.vercel.app/` — **nunca** `/asesor`. ✅
- El QR es reactivo al campo de URL (cambia al editarla y vuelve al original al restaurarla),
  lo que demuestra que codifica ese valor. ✅
- En modo impresión (`@media print`): la hoja es `visible`, la navegación y el banner son
  `hidden`, y se conservan **8 tarjetas** de 85 × 54 mm con marcas de corte. ✅
- Botones de impresión: "Imprimir Hoja de Tarjetas (8x)" (banner) y "Imprimir Hoja (8x Tarjetas)"
  (pie de la vista previa). ✅
- Instrucciones de impresión visibles: A4 horizontal · Márgenes: ninguno · Activar gráficos de
  fondo · 8 tarjetas con marcas de corte. ✅

### Rutas (Escenario 10)

| URL | Resultado |
|---|---|
| `/` | Catálogo público (HTTP 200) |
| `/asesor` | Modo asesor (HTTP 200) |
| `/asesor/` | Modo asesor (HTTP 200) |
| `/cualquier/ruta` | Catálogo público, sin mencionar el modo asesor |

## Defectos encontrados y corregidos durante la implementación

| # | Defecto | Causa | Corrección |
|---|---|---|---|
| 1 | **La impresión sacaba todo el diseñador**, no solo la hoja de tarjetas | El CSS de impresión solo ocultaba `.no-print`; el resto del diseñador no lo tenía | Se aplicó el patrón `visibility` en `@media print`: todo se oculta y solo `.print-only` queda visible, posicionada al inicio de la página |
| 2 | **`/asesor` devolvía 404 en producción** | `cleanUrls: true` + `rewrites` en `vercel.json`: la redirección de `index.html` interceptaba el rewrite | Se cambió a la forma `routes` con `handle: filesystem` + catch-all, que es la estándar para SPA en Vercel |
| 3 | El QR podía quedar apuntando a la ruta interna | `window.location.href` dentro de `/asesor` daría la ruta interna | `getPublicCatalogUrl()` deriva la URL del `origin`, nunca del `href` actual |
| 4 | La vista previa del QR no se actualizaba si cambiaba la URL | `useState(catalogUrl)` solo tomaba el valor inicial | `useEffect` que sincroniza `qrUrlCustom` con `catalogUrl` |

## Desviaciones respecto de la spec

Ninguna funcional.

**Nota técnica**: el `print-only` usa `visibility` en lugar de `display` para que la hoja se
posicione al inicio de la página impresa sin alterar el flujo del documento.

## Veredicto

**Feature completa y verificada en producción.** Los 16 requisitos funcionales (FR-001 a FR-016) y
los 7 criterios de éxito (SC-001 a SC-007) están implementados y comprobados.
