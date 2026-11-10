# Contrato: Render de la tarjeta y exportación PNG

**Feature**: 004-panel-admin-tarjeta-png | **Date**: 2026-11-10

Contrato del módulo `src/utils/cardImage.ts`. La tarjeta se dibuja sobre un lienzo (canvas); el
mismo código produce la vista previa y el archivo PNG, de modo que **lo que se ve es lo que se
descarga** (FR-019).

---

## Constantes

| Constante | Valor | Significado |
|---|---|---|
| `CARD_WIDTH_MM` | `85` | Ancho de la tarjeta (3.5") |
| `CARD_HEIGHT_MM` | `54` | Alto de la tarjeta (2") |
| `DPI` | `300` | Resolución de impresión |
| `CARD_WIDTH_PX` | `1004` | `round(85 / 25.4 × 300)` |
| `CARD_HEIGHT_PX` | `638` | `round(54 / 25.4 × 300)` |
| `SHEET_COLUMNS` | `2` | Tarjetas por fila en la hoja |
| `SHEET_ROWS` | `4` | Filas en la hoja |
| `SHEET_GAP_PX` | `40` | Separación entre tarjetas |
| `SHEET_MARGIN_PX` | `20` | Margen exterior de la hoja |
| `SHEET_WIDTH_PX` | `2088` | `2 × 1004 + 40` |
| `SHEET_HEIGHT_PX` | `2712` | `4 × 638 + 3 × 40 + 2 × 20` |

## `drawBusinessCard(ctx, options, side)`

Dibuja **una** cara de la tarjeta en el contexto 2D.

- **Parámetros**: `ctx: CanvasRenderingContext2D`, `options: CardRenderOptions`,
  `side: 'front' | 'back'`.
- El lienzo se asume ya dimensionado por el llamador; la función usa
  `CARD_WIDTH_PX × CARD_HEIGHT_PX` como sistema de coordenadas.
- **No lanza** si falta la imagen del QR: en el reverso, si `qrDataUrl` está vacío, dibuja un
  marcador de "QR no disponible" en lugar de fallar.

Contenido por cara:

| Cara | Contenido |
|---|---|
| `front` | Franja de acento, "Costa Rica 🇨🇷", monograma + nombre de marca, tagline, lema, divisor, WhatsApp `+506`, zona de cobertura, "Entrega a Domicilio" |
| `back` | Franja de acento, "Catálogo Digital 24/7", código QR, 3 pasos numerados, "Garantía de Fábrica", WhatsApp `+506` |

## `renderCardPreview(canvas, options)`

Pinta la vista previa de la tarjeta en un `<canvas>` de la pantalla.

- Escala el contexto según `devicePixelRatio` para que se vea nítida, pero el tamaño lógico sigue
  siendo el de la tarjeta.
- Dibuja el anverso y, opcionalmente, el reverso si se pide el volteo.

## `renderCardSheet(options)`

Pinta la hoja completa de 8 tarjetas (4 frentes + 4 reversos alternados) con marcas de corte.

- Devuelve el `<canvas>` con `SHEET_WIDTH_PX × SHEET_HEIGHT_PX`.
- Las marcas de corte son líneas punteadas alrededor de cada tarjeta.

## `downloadCanvasAsPng(canvas, filename)`

Descarga el lienzo como archivo PNG.

- Usa `canvas.toDataURL('image/png')` y un enlace temporal con `download`.
- **Nombre de archivo sugerido**: `electroHogar-tarjeta-anverso.png`,
  `electroHogar-tarjeta-reverso.png`, `electroHogar-tarjeta-hoja-8.png`.
- **Lanza** un error con mensaje en español si la descarga no puede iniciarse; el llamador lo
  captura y ofrece la impresión como alternativa (FR-022).

## `CardRenderOptions`

```text
CardRenderOptions
├── brandName: string
├── serviceTagline: string
├── slogan: string
├── phone: string
├── coverage: string
├── qrDataUrl: string          # PNG base64 del QR; '' si no está disponible
├── palette: ColorPalette      # primary, primaryDark, secondary, accentGreen
└── showBack?: boolean         # solo para la vista previa
```

## Consideraciones de tipografía

- Las fuentes se cargan desde `index.html` (Montserrat para títulos, Inter para texto). Antes de
  dibujar se espera a `document.fonts.ready` para que el PNG no salga con la fuente de respaldo.
- Si la fuente no está disponible, el lienzo usa la genérica y el resultado sigue siendo legible.

## Dependencia de imagen

El QR se genera con la librería `qrcode` (ya instalada) y se pasa como data URL. El módulo
`cardImage.ts` **no** genera el QR: solo lo dibuja. Esto mantiene el módulo testeable sin DOM y
evita duplicar la dependencia.
