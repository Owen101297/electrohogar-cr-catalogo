# Research: Panel administrativo del catálogo y tarjeta de presentación en PNG

**Feature**: 004-panel-admin-tarjeta-png | **Date**: 2026-11-10

## R-001: ¿Cómo se calcula el panel?

**Decisión**: Módulo puro `src/utils/stats.ts` con funciones sin estado que reciben `Product[]` y
`AdvisorSettings` y devuelven un objeto `CatalogMetrics`.

**Rationale**: SC-001 exige que las cifras coincidan con el cálculo manual. La única forma de
garantizarlo es que el cálculo esté en un sitio único, sin estado y verificable con pruebas
unitarias. Un componente que calcula "en el render" sería imposible de testear y propaga
divisiones por cero a cada vista.

**Alternativas consideradas**:
- *Calcular dentro del componente con `useMemo`*: descartado, ataría las reglas a la vista y
  haría las pruebas dependientes del DOM.
- *Una librería de analítica*: descartado, dependencia nueva para aritmética básica.

## R-002: ¿Cómo se genera el PNG?

**Decisión**: Dibujar la tarjeta sobre un `<canvas>` 2D con el mismo código que produce la vista
previa, y exportar con `canvas.toDataURL('image/png')`.

**Rationale**: Es la única forma de garantizar FR-019 (lo que se ve es lo que se descarga) **sin
dependencias nuevas**. Convierten el DOM a imagen (`html-to-image`, `dom-to-image`) el resultado
depende de fuentes cargadas, de imágenes externas y del soporte del navegador, y el PNG resultante
rara vez coincide exactamente con la vista previa. Con canvas, la vista previa **es** el PNG: se
muestra el mismo lienzo que se descarga.

**Alternativas consideradas**:
- *`html-to-image`*: descartado — dependencia nueva (principio V), y la calidad del resultado
  depende de que las fuentes web ya estén cargadas, con el riesgo de texto con la fuente
  equivocada en el archivo exportado.
- *Generar el PNG en un servidor*: descartado — no hay backend y la app es local-first.
- *SVG → PNG*: posible, pero obliga a duplicar el diseño en dos Representations.

## R-003: ¿Qué resolución de exportación?

**Decisión**: 300 DPI. 85 mm ⇒ 1004 px de ancho, 54 mm ⇒ 638 px de alto por tarjeta. La hoja de
8 tarjetas ⇒ 2048 × 1296 px.

**Rationale**: 300 DPI es el estándar de imprenta para tarjetas de presentación. SC-005 pide al
menos 1000 px de ancho, que es exactamente lo que da 300 DPI. El canvas se escala con
`devicePixelRatio` en pantalla para verse nítido, pero el PNG se genera siempre a la resolución
de impresión.

**Alternativas consideradas**:
- *72 DPI (tamaño de pantalla)*: insuficiente para imprimir; el QR quedaría borroso.
- *600 DPI*: duplica el tamaño del archivo sin ganancia perceptible en una tarjeta de presentación
  estándar.

## R-004: ¿Cómo se dibuja el QR en el canvas?

**Decisión**: Generar el QR con la librería `qrcode` ya instalada (`toDataURL`), cargarlo como
`Image` y dibujarlo en el lienzo con `drawImage`.

**Rationale**: `qrcode` ya está en el proyecto y produce un PNG en base64. Cargarlo como imagen
es la forma más fiable de dibujarlo con nitidez y con el color de la marca. El módulo
`QRCodeRenderer` ya hace exactamente esta conversión a data URL.

**Alternativas consideradas**:
- *Redibujar los módulos del QR a mano*: descartado, es reinventar un algoritmo de corrección de
  errores.
- *Usar `QRCodeRenderer` (React) y capturar el DOM*: descartado, es el camino que R-002 descarta.

## R-005: ¿De dónde sale el diseño?

**Decisión**: Sistema de tokens basado en el tema *Modern Minimal* de 21st.dev (colores neutros,
radios de 0.375 rem, Inter + Source Serif 4 + JetBrains Mono), combinado con la paleta
corporativa de ElectroHogar ya definida en `src/data/palettes.ts`.

**Rationale**: La cuenta de 21st tiene la generación IA deshabilitada y la cuota diaria de
descarga de código agotada, así que no es posible traer un bloque generado. Sí es posible usar
21st como **fuente del sistema de diseño**: el tema aporta la estructura neutra y la app aporta la
identidad de marca. Los tokens se aplican como variables CSS de Tailwind v4 (`@theme`), de modo que
el panel y la tarjeta comparten el mismo lenguaje visual y la constitución (principio III) se
respeta: la tarjeta se colorea desde `activePalette`, no desde tokens fijos.

**Alternativas consideradas**:
- *Pedir un diseño a Stitch*: descartado, el servidor MCP de Stitch exige iniciar sesión en esta
  máquina y no hay token configurado.
- *Diseñar todo a mano sin referencia*: descartado, el usuario pidió explícitamente usar 21st.

## R-006: ¿El panel es una ruta nueva o una pestaña?

**Decisión**: Una **tercera pestaña** dentro de `/asesor`, junto al catálogo y al diseñador de
tarjetas.

**Rationale**: El acceso del asesor ya está protegido por la ruta `/asesor` y la sesión. Una ruta
nueva (`/asesor/panel`) exigiría duplicar la lógica de confirmación de sesión y sumaría una URL
que la asesora tendría que recordar. Una pestaña es un clic, y SC-002 pide que el panel se
encuentre en un solo clic.

**Alternativas consideradas**:
- *Ruta `/asesor/panel`*: descartado, duplica el control de sesión.
- *Sustituir el catálogo por el panel*: descartado, la asesora necesita ambas cosas y alternar
  entre vistas.

## R-007: ¿El panel reemplaza la cuadrícula del catálogo?

**Decisión**: No. El panel **añade** una tabla de gestión densa; la cuadrícula visual se queda como
está.

**Rationale**: Son dos formas de ver lo mismo: la cuadrícula sirve para el cliente final (fotos,
precios, WhatsApp) y la tabla para la asesora (muchos productos, edición rápida). La spec define
la tabla como parte del panel (FR-010), no como reemplazo.

## R-008: ¿Cómo se calculan las métricas cuando el catálogo está vacío?

**Decisión**: `stats.ts` devuelve ceros y listas vacías sin lanzar; el componente muestra un estado
vacío con la acción de agregar producto.

**Rationale**: Evitar el error "NaN" o "Infinity" en pantalla. El caso del catálogo vacío es
real: la asesora abre el panel antes de capturar nada. Se cubre en las pruebas.

## R-009: ¿Qué pasa si la descarga falla?

**Decisión**: Capturar el error de la descarga y mostrar un aviso en español que ofrezca imprimir
como alternativa.

**Rationale**: FR-022. Algunos navegadores y entornos restringidos bloquean descargas
programáticas. La asesora necesita una salida, y la impresión ya existe.

**Alternativas consideradas**:
- *No avisar y fallar en silencio*: descartado, la asesora creería que se descargó.
