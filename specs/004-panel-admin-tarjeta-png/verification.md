# Verification Report: Panel administrativo del catálogo y tarjeta de presentación en PNG

**Feature**: 004-panel-admin-tarjeta-png | **Fecha**: 2026-11-10
**Rama**: `004-panel-admin-tarjeta-png`
**Producción**: https://electrohogar-cr-catalogo.vercel.app/asesor

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
| `npm test` (`node:test` vía `tsx`) | ✅ 52/52 (20 de productos + 9 de enrutado + 14 de métricas + 9 de la tarjeta) |
| `npm run build` | ✅ sin errores |

## Escenarios de `quickstart.md`

| # | Escenario | Requisito | Resultado |
|---|---|---|---|
| 1 | Métricas del panel correctas | FR-002 a FR-006 | ✅ |
| 2 | Distribución por tienda | FR-007 | ✅ |
| 3 | Distribución por categoría | FR-008 | ✅ |
| 4 | Productos destacados | FR-009 | ✅ |
| 5 | Catálogo vacío | FR-013 | ✅ |
| 6 | Búsqueda en la tabla | FR-012 | ✅ |
| 7 | Editar desde la tabla | FR-011 | ✅ |
| 8 | Eliminar desde la tabla con confirmación y deshacer | FR-011 | ✅ |
| 9 | Descarga del anverso en PNG | FR-014, FR-015 | ✅ |
| 10 | Descarga del reverso en PNG | FR-014, FR-017 | ✅ |
| 11 | Descarga de la hoja de 8 tarjetas | FR-014, FR-018 | ✅ |
| 12 | El QR apunta al catálogo público | FR-011 | ✅ |
| 13 | El panel es inalcanzable desde el público | FR-025 | ✅ |

## Verificaciones con detalle

### Métricas (Escenario 1) — contra el cálculo manual

Catálogo inicial de 12 productos.

| Métrica | Valor en pantalla | Cálculo manual | ✅ |
|---|---|---|---|
| Total de productos | `12` | 12 | ✅ |
| Valor total del catálogo | `₡4 217 800` | Σ precios de contado | ✅ |
| Precio de contado promedio | `₡351 483` | 4 217 800 ÷ 12 = 351 483.33 | ✅ |
| Descuento promedio | `20%` | media de los descuentos con descuento | ✅ |
| Comisión potencial | `₡337 424` | 4 217 800 × 8% | ✅ |

### Distribución (Escenarios 2 y 3)

- Por tienda: EPA 5 (42%) · Gollo 5 (42%) · Ambas 2 (17%) → 12 unidades ✅
- Por categoría: Refrigeración 3 (25%) · Pequeños 3 (25%) · Lavado 2 (17%) · Pantallas 2 (17%) ·
  Cocinas 2 (17%) → 12 unidades ✅

### Tabla de gestión (Escenarios 6, 7 y 8)

- Búsqueda "Whirlpool" → `1 de 12 productos`, 1 fila. ✅
- Editar un producto desde la fila abre el formulario precargado; al guardar, **el valor total del
  catálogo se recalculó** de `₡4 217 800` a `₡3 329 011` sin recargar (FR-023). ✅
- Eliminar desde la fila pide confirmación y el aviso de "Deshacer" aparece. ✅

### Tarjeta en PNG (Escenarios 9, 10 y 11)

Archivos realmente descargados del navegador y medidos:

| Archivo | Dimensiones verificadas | Requisito |
|---|---|---|
| `electroHogar-tarjeta-anverso.png` | **1004 × 638 px** | 85 × 54 mm a 300 DPI ✅ |
| `electroHogar-tarjeta-reverso.png` | **1004 × 638 px** | ✅ |
| `electroHogar-tarjeta-hoja-8.png` | **2088 × 2712 px** | 8 tarjetas con marcas de corte ✅ |

- La hoja contiene 4 frentes y 4 reversos alternados, con líneas punteadas de corte. ✅
- El QR del reverso es **reactivo**: al cambiar la URL de destino, el lienzo se redibuja con el
  QR nuevo (prueba de que codifica ese valor, no una URL fija). ✅
- El destino por defecto es la URL pública del catálogo, nunca `/asesor`. ✅
- El monograma muestra **"EH"**, igual que el logotipo de la app. ✅

### Aislamiento (Escenario 13)

En el catálogo público (`/`) no aparece ninguna referencia a `QR`, `Tarjeta`, `Diseñador`,
`Margen`, `Agregar Producto` ni al modo asesor. La única coincidencia de "Panel" es el nombre de un
producto del catálogo ("Freidora de Aire Oster Digital 4.2L con Panel Táctil"), no la sección.

### Producción

Verificado contra `https://electrohogar-cr-catalogo.vercel.app/asesor`:
- Panel con las mismas cifras (`₡4 217 800`, `20%`, 12 filas). ✅
- Descarga real de `electroHogar-tarjeta-hoja-8.png` con **2088 × 2712 px y 2.7 MB**. ✅
- **0 errores de consola.** ✅

## Defectos encontrados y corregidos durante la implementación

| # | Defecto | Causa | Corrección |
|---|---|---|---|
| 1 | El monograma decía **"EC"** | Se tomaba la inicial de las dos primeras palabras ("ElectroHogar", "Costa") | Se separa la primera palabra por camelCase: "ElectroHogar" → "Electro" + "Hogar" → **"EH"** |
| 2 | El monograma decía **"EL"** tras el primer arreglo | Se tomaban las dos primeras letras de la palabra | Se разде por camelCase, igual que en el punto 1 |
| 3 | El lema quedaba muy arriba, dejando un hueco | Posición vertical fija sin considerar el bloque de contacto | Se recentró a 330 px, simétrico respecto al bloque de contacto |
| 4 | El QR del reverso quedaba chico | 250 px en una tarjeta de 1004 px | 300 px, con los pasos recentrados verticalmente |
| 5 | El contrato declaraba `SHEET_HEIGHT_PX = 2632` | Error aritmético en el documento (`4×638 + 3×40 + 2×20` = 2712) | Contrato y `data-model.md` corregidos; prueba con el valor absoluto 2712 |
| 6 | El regex de acentos quedó corrupto al guardarse | Caracteres combining escritos literalmente | Se reemplazó por el rango explícito `\u0300-\u036f` |

## Desviaciones respecto de la spec

Ninguna funcional.

**Nota sobre 21st.dev**: la cuenta tiene la generación IA deshabilitada (`aiGenerationEnabled: false`)
y la cuota diaria de descarga de código agotada (`freeRetrievalsRemaining: 0`), y el servidor MCP de
Stitch exige iniciar sesión en esta máquina. Por eso 21st se usó como **fuente del sistema de
diseño** — se descargó el CSS completo del tema *Modern Minimal* y se aplicó como `@theme` de
Tailwind v4 — combinado con la paleta corporativa de la app. El diseño final es propio, sobre esa
base.

## Veredicto

**Feature completa y verificada en producción.** Los 25 requisitos funcionales (FR-001 a FR-025) y
los 8 criterios de éxito (SC-001 a SC-008) están implementados y comprobados.
