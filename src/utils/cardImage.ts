/**
 * Render de la tarjeta de presentación sobre canvas.
 *
 * El mismo código produce la vista previa y el archivo PNG, de modo que lo que
 * se ve en pantalla es exactamente lo que se descarga (FR-019). Se dibuja a
 * 300 DPI para que el PNG sirva para imprenta.
 *
 * Diseño: corporate de alto contraste. Frente con degradado de marca, curva
 * dorada y bloque orgánico de acento; reverso partido en bloque de marca con
 * el QR y bloque de datos con iconos circulares.
 *
 * Contrato: specs/004-panel-admin-tarjeta-png/contracts/card-image.md
 */

import { ColorPalette } from '../types';

/** Ancho de la tarjeta en milímetros (3.5"). */
export const CARD_WIDTH_MM = 85;
/** Alto de la tarjeta en milímetros (2"). */
export const CARD_HEIGHT_MM = 54;
/** Resolución de impresión. */
export const DPI = 300;

const MM_PER_INCH = 25.4;

/** Ancho de la tarjeta en píxeles a 300 DPI. */
export const CARD_WIDTH_PX = Math.round((CARD_WIDTH_MM / MM_PER_INCH) * DPI); // 1004
/** Alto de la tarjeta en píxeles a 300 DPI. */
export const CARD_HEIGHT_PX = Math.round((CARD_HEIGHT_MM / MM_PER_INCH) * DPI); // 638

/** Tarjetas por fila en la hoja. */
export const SHEET_COLUMNS = 2;
/** Filas en la hoja. */
export const SHEET_ROWS = 4;
/** Separación entre tarjetas. */
export const SHEET_GAP_PX = 40;
/** Margen exterior de la hoja. */
export const SHEET_MARGIN_PX = 20;

/** Ancho de la hoja completa. */
export const SHEET_WIDTH_PX = SHEET_COLUMNS * CARD_WIDTH_PX + (SHEET_COLUMNS - 1) * SHEET_GAP_PX + SHEET_MARGIN_PX * 2; // 2088
/** Alto de la hoja completa. */
export const SHEET_HEIGHT_PX = SHEET_ROWS * CARD_HEIGHT_PX + (SHEET_ROWS - 1) * SHEET_GAP_PX + SHEET_MARGIN_PX * 2; // 2712

export type CardSide = 'front' | 'back';

/** Todo lo que el dibujo necesita, en un solo objeto. */
export interface CardRenderOptions {
  brandName: string;
  serviceTagline: string;
  slogan: string;
  phone: string;
  coverage: string;
  /** URL pública del catálogo, impresa en el reverso. */
  website: string;
  /** PNG en base64 del código QR. Cadena vacía si no está disponible. */
  qrDataUrl: string;
  palette: ColorPalette;
}

export const CARD_FILENAMES = {
  front: 'electroHogar-tarjeta-anverso.png',
  back: 'electroHogar-tarjeta-reverso.png',
  sheet: 'electroHogar-tarjeta-hoja-8.png',
} as const;

const FONT_HEADING = "'Montserrat', 'Inter', sans-serif";
const FONT_BODY = "'Inter', 'Montserrat', sans-serif";

/** Negro del bloque de datos del reverso. */
const INK = '#141414';

/** Ajusta el contexto al tamaño del lienzo y aplica el escalado. */
function prepareContext(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scale: number
): void {
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, width, height);
}

/** Ajusta un texto largo al ancho disponible, recortando con puntos suspensivos. */
function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let result = text;
  while (result.length > 1 && ctx.measureText(`${result}…`).width > maxWidth) {
    result = result.slice(0, -1);
  }
  return `${result}…`;
}

/** Dibuja texto en una sola línea, recortado al ancho dado. */
function drawLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  options: { font: string; color: string; align?: CanvasTextAlign }
): void {
  ctx.save();
  ctx.font = options.font;
  ctx.fillStyle = options.color;
  ctx.textAlign = options.align ?? 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(fitText(ctx, text, maxWidth), x, y);
  ctx.restore();
}

/**
 * Dibuja texto espaciado entre letras (letter-spacing), que es lo que da el
 * aire de marca del diseño de referencia.
 */
function drawTracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
  options: { font: string; color: string; align?: CanvasTextAlign }
): void {
  ctx.save();
  ctx.font = options.font;
  ctx.fillStyle = options.color;
  ctx.textBaseline = 'alphabetic';

  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total =
    widths.reduce((sum, w) => sum + w, 0) + spacing * Math.max(0, chars.length - 1);

  let cursor = x;
  if (options.align === 'center') cursor = x - total / 2;
  if (options.align === 'right') cursor = x - total;

  ctx.textAlign = 'left';
  chars.forEach((char, index) => {
    ctx.fillText(char, cursor, y);
    cursor += widths[index] + spacing;
  });
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Traza una curva orgánica (tipo "blob") usando curvas cuadráticas.
 * `points` son pares [x, y] normalizados (0..1) sobre el ancho y alto dados.
 */
function drawBlob(
  ctx: CanvasRenderingContext2D,
  originX: number,
  originY: number,
  width: number,
  height: number,
  points: Array<[number, number]>
): void {
  const p = points.map(([px, py]) => [originX + px * width, originY + py * height]);
  ctx.beginPath();
  ctx.moveTo(p[0][0], p[0][1]);
  for (let i = 0; i < p.length; i += 1) {
    const current = p[i];
    const next = p[(i + 1) % p.length];
    const midX = (current[0] + next[0]) / 2;
    const midY = (current[1] + next[1]) / 2;
    ctx.quadraticCurveTo(current[0], current[1], midX, midY);
  }
  ctx.closePath();
}

/**
 * Símbolo de marca: monograma "EH" geométrico construido con dos triángulos,
 * al estilo del emblema de la referencia.
 */
function drawBrandMark(
  ctx: CanvasRenderingContext2D,
  options: CardRenderOptions,
  centerX: number,
  centerY: number,
  size: number
): void {
  const gold = options.palette.secondary;
  const half = size / 2;

  // Triángulo izquierdo (apunta hacia arriba)
  ctx.save();
  ctx.fillStyle = gold;
  ctx.beginPath();
  ctx.moveTo(centerX - half * 0.92, centerY + half * 0.62);
  ctx.lineTo(centerX - half * 0.28, centerY - half * 0.72);
  ctx.lineTo(centerX - half * 0.28, centerY + half * 0.62);
  ctx.closePath();
  ctx.fill();

  // Triángulo derecho (apunta hacia arriba, más alto)
  ctx.beginPath();
  ctx.moveTo(centerX + half * 0.18, centerY + half * 0.62);
  ctx.lineTo(centerX + half * 0.78, centerY - half * 0.72);
  ctx.lineTo(centerX + half * 0.78, centerY + half * 0.62);
  ctx.closePath();
  ctx.fill();

  // travesaño dorado que une ambos triángulos
  ctx.fillStyle = gold;
  ctx.fillRect(centerX - half * 0.28, centerY - half * 0.14, half * 1.06, size * 0.05);
  ctx.restore();
}

/** Carga una imagen y la dibuja. Si falla, no lanza. */
function drawImage(
  ctx: CanvasRenderingContext2D,
  src: string,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<void> {
  return new Promise((resolve) => {
    if (!src) {
      resolve();
      return;
    }
    const image = new Image();
    image.onload = () => {
      try {
        ctx.drawImage(image, x, y, width, height);
      } catch {
        // Si el dibujo falla, la tarjeta se genera sin la imagen.
      }
      resolve();
    };
    image.onerror = () => resolve();
    image.src = src;
  });
}

/** Icono circular dorado con un glifo simple, como los datos de la referencia. */
function drawDataIcon(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  kind: 'phone' | 'globe' | 'pin',
  gold: string
): void {
  ctx.save();
  ctx.strokeStyle = gold;
  ctx.fillStyle = gold;
  ctx.lineWidth = Math.max(2, radius * 0.16);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (kind === 'phone') {
    // Teléfono: handset curvo
    ctx.beginPath();
    ctx.moveTo(centerX - radius * 0.42, centerY - radius * 0.5);
    ctx.quadraticCurveTo(
      centerX - radius * 0.1,
      centerY - radius * 0.1,
      centerX + radius * 0.16,
      centerY + radius * 0.2
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX - radius * 0.3, centerY + radius * 0.3, radius * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + radius * 0.34, centerY - radius * 0.34, radius * 0.16, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'globe') {
    // Globo terráqueo
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radius * 0.22, radius * 0.5, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX - radius * 0.5, centerY);
    ctx.lineTo(centerX + radius * 0.5, centerY);
    ctx.stroke();
  } else {
    // Ubicación: marcador
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + radius * 0.5);
    ctx.quadraticCurveTo(
      centerX - radius * 0.5,
      centerY - radius * 0.05,
      centerX,
      centerY - radius * 0.5
    );
    ctx.quadraticCurveTo(
      centerX + radius * 0.5,
      centerY - radius * 0.05,
      centerX,
      centerY + radius * 0.5
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX, centerY - radius * 0.12, radius * 0.14, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Dibuja el anverso: marca, lema y contacto. */
export async function drawBusinessCard(
  ctx: CanvasRenderingContext2D,
  options: CardRenderOptions,
  side: CardSide
): Promise<void> {
  const W = CARD_WIDTH_PX;
  const H = CARD_HEIGHT_PX;
  const gold = options.palette.secondary;

  if (side === 'front') {
    // --- Fondo con degradado de marca ---
    const gradient = ctx.createLinearGradient(0, 0, W * 0.4, H);
    gradient.addColorStop(0, options.palette.primary);
    gradient.addColorStop(1, options.palette.primaryDark);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    // --- Bloque orgánico dorado (esquina inferior derecha) ---
    ctx.save();
    ctx.fillStyle = gold;
    drawBlob(ctx, W * 0.76, H * 0.50, W * 0.38, H * 0.62, [
      [0.2, 0.02],
      [0.78, 0.0],
      [1.0, 0.36],
      [0.9, 0.74],
      [0.4, 1.0],
      [0.0, 0.72],
    ]);
    ctx.fill();
    ctx.restore();

    // --- Curva dorada entrando por la esquina superior izquierda ---
    ctx.save();
    ctx.strokeStyle = gold;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-10, 118);
    ctx.bezierCurveTo(90, 74, 108, 40, 168, 4);
    ctx.stroke();
    ctx.restore();

    // --- Símbolo de marca ---
    const markSize = 104;
    drawBrandMark(ctx, options, W / 2, 178, markSize);

    // --- Nombre de marca con letter-spacing amplio ---
    const words = options.brandName.split(/\s+/).filter(Boolean);
    const headline = words.length > 1 ? words[0] : options.brandName;
    drawTracked(ctx, headline.toUpperCase(), W / 2, 296, 11, {
      font: `900 46px ${FONT_HEADING}`,
      color: '#FFFFFF',
      align: 'center',
    });

    // --- Subtítulo con líneas doradas a los lados ---
    const sub = (words.length > 1 ? words.slice(1).join(' ') : options.serviceTagline)
      .toUpperCase()
      .slice(0, 22);
    ctx.save();
    ctx.font = `700 17px ${FONT_BODY}`;
    const subWidth = ctx.measureText(sub).width + 6 * Math.max(0, sub.length - 1);
    ctx.restore();
    drawTracked(ctx, sub, W / 2, 334, 6, {
      font: `700 17px ${FONT_BODY}`,
      color: gold,
      align: 'center',
    });

    const lineY = 360;
    const halfLine = 70;
    ctx.save();
    ctx.strokeStyle = gold;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - halfLine - subWidth / 2 - 20, lineY);
    ctx.lineTo(W / 2 - subWidth / 2 - 20, lineY);
    ctx.moveTo(W / 2 + subWidth / 2 + 20, lineY);
    ctx.lineTo(W / 2 + halfLine + subWidth / 2 + 20, lineY);
    ctx.stroke();
    ctx.restore();

    // --- Tagline ---
    drawLine(ctx, options.serviceTagline, W / 2, 406, 600, {
      font: `500 19px ${FONT_BODY}`,
      color: 'rgba(191,219,254,0.95)',
      align: 'center',
    });

    // --- Pie: WhatsApp y cobertura a la izquierda ---
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(58, H - 108);
    ctx.lineTo(700, H - 108);
    ctx.stroke();
    ctx.restore();

    drawLine(ctx, `+506 ${options.phone}`, 58, H - 62, 420, {
      font: `800 24px ${FONT_BODY}`,
      color: options.palette.accentGreen,
    });
    drawLine(ctx, options.coverage, 58, H - 30, 620, {
      font: `400 16px ${FONT_BODY}`,
      color: 'rgba(191,219,254,0.9)',
    });

    return;
  }

  // ================= REVERSO =================
  // Bloque izquierdo de marca (orgánico) + bloque derecho de datos.

  // --- Fondo negro general ---
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, H);

  // --- Bloque de marca con curva orgánica ---
  ctx.save();
  ctx.fillStyle = options.palette.primary;
  drawBlob(ctx, -W * 0.07, -H * 0.06, W * 0.47, H * 1.12, [
    [0.42, 0.0],
    [0.86, 0.06],
    [1.0, 0.4],
    [0.94, 0.72],
    [0.5, 0.98],
    [0.06, 0.94],
    [0.0, 0.42],
  ]);
  ctx.fill();
  ctx.restore();

  // --- Línea dorada que separa las dos caras ---
  ctx.save();
  ctx.strokeStyle = gold;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(W * 0.44, -10);
  ctx.bezierCurveTo(W * 0.4, H * 0.3, W * 0.46, H * 0.66, W * 0.42, H + 10);
  ctx.stroke();
  ctx.restore();

  // --- Lado de marca: símbolo + nombre + tagline ---
  drawBrandMark(ctx, options, W * 0.19, 96, 66);
  drawTracked(ctx, 'ELECTROHOGAR', W * 0.19, 168, 4, {
    font: `900 22px ${FONT_HEADING}`,
    color: '#FFFFFF',
    align: 'center',
  });
  drawLine(ctx, 'COSTA RICA', W * 0.19, 192, 240, {
    font: `700 13px ${FONT_BODY}`,
    color: gold,
    align: 'center',
  });

  // --- QR enmarcado en oro ---
  const qrSize = 190;
  const qrX = W * 0.19 - qrSize / 2;
  const qrY = 250;
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 10);
  ctx.fill();
  ctx.restore();
  await drawImage(ctx, options.qrDataUrl, qrX, qrY, qrSize, qrSize);
  ctx.save();
  ctx.strokeStyle = gold;
  ctx.lineWidth = 3;
  roundRect(ctx, qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 10);
  ctx.stroke();
  ctx.restore();

  if (!options.qrDataUrl) {
    drawLine(ctx, 'QR', qrX + qrSize / 2, qrY + qrSize / 2 + 14, qrSize - 20, {
      font: `800 34px ${FONT_HEADING}`,
      color: '#9CA3AF',
      align: 'center',
    });
  }

  drawLine(ctx, 'Escaneá el catálogo', W * 0.19, 480, 300, {
    font: `600 15px ${FONT_BODY}`,
    color: 'rgba(255,255,255,0.85)',
    align: 'center',
  });

  // ================= LADO DE DATOS =================
  const dataX = W * 0.56;

  drawLine(ctx, 'ElectroHogar Costa Rica', dataX, 120, W - dataX - 58, {
    font: `800 26px ${FONT_HEADING}`,
    color: '#FFFFFF',
  });
  drawLine(ctx, 'Catálogo de electrodomésticos', dataX, 150, W - dataX - 58, {
    font: `500 17px ${FONT_BODY}`,
    color: gold,
  });

  // Línea dorada corta bajo el encabezado
  ctx.save();
  ctx.strokeStyle = gold;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(dataX, 176);
  ctx.lineTo(dataX + 62, 176);
  ctx.stroke();
  ctx.restore();

  // Datos con iconos circulares unidos por una línea vertical
  const rows: Array<{ icon: 'phone' | 'globe' | 'pin'; text: string }> = [
    { icon: 'phone', text: `+506 ${options.phone}` },
    { icon: 'globe', text: options.website.replace(/^https?:\/\//, '').replace(/\/$/, '') },
    { icon: 'pin', text: options.coverage },
  ];

  const rowStart = 236;
  const rowGap = 84;
  const iconX = dataX + 20;

  ctx.save();
  ctx.strokeStyle = gold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(iconX, rowStart + 42);
  ctx.lineTo(iconX, rowStart + rowGap * (rows.length - 1) + 42);
  ctx.stroke();
  ctx.restore();

  rows.forEach((row, index) => {
    const y = rowStart + index * rowGap;

    ctx.save();
    ctx.fillStyle = gold;
    ctx.beginPath();
    ctx.arc(iconX, y + 42, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    drawDataIcon(ctx, iconX, y + 42, 18, row.icon, INK);

    drawLine(ctx, row.text, iconX + 40, y + 50, W - iconX - 98, {
      font: `600 18px ${FONT_BODY}`,
      color: '#FFFFFF',
    });
  });

  // --- Líneas doradas de esquina (detalle del diseño de referencia) ---
  ctx.save();
  ctx.strokeStyle = gold;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(W - 150, 46);
  ctx.lineTo(W - 58, 46);
  ctx.moveTo(W - 150, H - 46);
  ctx.lineTo(W - 58, H - 46);
  ctx.stroke();
  ctx.restore();
}

/**
 * Pinta la vista previa de la tarjeta en un lienzo de pantalla.
 * Aplica `devicePixelRatio` para que se vea nítida.
 */
export async function renderCardPreview(
  canvas: HTMLCanvasElement,
  options: CardRenderOptions,
  side: CardSide = 'front'
): Promise<void> {
  const ratio = Math.min(window.devicePixelRatio || 1, 3);
  const displayWidth = 460;
  const displayHeight = Math.round((displayWidth * CARD_HEIGHT_PX) / CARD_WIDTH_PX);

  canvas.width = Math.round(displayWidth * ratio);
  canvas.height = Math.round(displayHeight * ratio);
  canvas.style.width = `${displayWidth}px`;
  canvas.style.height = `${displayHeight}px`;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const scale = canvas.width / CARD_WIDTH_PX;
  prepareContext(ctx, CARD_WIDTH_PX, CARD_HEIGHT_PX, scale);
  await drawBusinessCard(ctx, options, side);
}

/**
 * Pinta la hoja completa de 8 tarjetas (4 frentes y 4 reversos alternados)
 * con las marcas de corte.
 */
export async function renderCardSheet(
  options: CardRenderOptions
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = SHEET_WIDTH_PX;
  canvas.height = SHEET_HEIGHT_PX;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, SHEET_WIDTH_PX, SHEET_HEIGHT_PX);

  for (let row = 0; row < SHEET_ROWS; row += 1) {
    for (let col = 0; col < SHEET_COLUMNS; col += 1) {
      const index = row * SHEET_COLUMNS + col;
      const side: CardSide = index % 2 === 0 ? 'front' : 'back';
      const x = SHEET_MARGIN_PX + col * (CARD_WIDTH_PX + SHEET_GAP_PX);
      const y = SHEET_MARGIN_PX + row * (CARD_HEIGHT_PX + SHEET_GAP_PX);

      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      ctx.rect(0, 0, CARD_WIDTH_PX, CARD_HEIGHT_PX);
      ctx.clip();
      await drawBusinessCard(ctx, options, side);
      ctx.restore();

      // Marca de corte
      ctx.save();
      ctx.strokeStyle = '#9CA3AF';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 8]);
      ctx.strokeRect(x, y, CARD_WIDTH_PX, CARD_HEIGHT_PX);
      ctx.restore();
    }
  }

  return canvas;
}

/**
 * Descarga el lienzo como archivo PNG.
 * Lanza un error con mensaje en español si la descarga no puede iniciarse.
 */
export function downloadCanvasAsPng(
  canvas: HTMLCanvasElement,
  filename: string
): void {
  try {
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch {
    throw new Error(
      'No se pudo iniciar la descarga del PNG. Podés usar la opción de imprimir en su lugar.'
    );
  }
}
