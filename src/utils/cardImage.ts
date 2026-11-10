/**
 * Render de la tarjeta de presentación sobre canvas.
 *
 * El mismo código produce la vista previa y el archivo PNG, de modo que lo que
 * se ve en pantalla es exactamente lo que se descarga (FR-019). Se dibuja a
 * 300 DPI para que el PNG sirva para imprenta.
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
export const SHEET_HEIGHT_PX = SHEET_ROWS * CARD_HEIGHT_PX + (SHEET_ROWS - 1) * SHEET_GAP_PX + SHEET_MARGIN_PX * 2; // 2632

export type CardSide = 'front' | 'back';

/** Todo lo que el dibujo necesita, en un solo objeto. */
export interface CardRenderOptions {
  brandName: string;
  serviceTagline: string;
  slogan: string;
  phone: string;
  coverage: string;
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
 * Dibuja el monograma de la marca.
 *
 * "ElectroHogar Costa Rica" produce "EH" — las iniciales de las partes de la
 * primera palabra separadas por camelCase —, igual que el logotipo de la app.
 */
function drawLogoMark(
  ctx: CanvasRenderingContext2D,
  options: CardRenderOptions,
  x: number,
  y: number,
  size: number
): void {
  const words = options.brandName.split(/\s+/).filter(Boolean);
  const first = words[0] ?? '';

  // Se separa por camelCase: "ElectroHogar" -> ["Electro", "Hogar"].
  const parts = first
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/\s+/)
    .filter(Boolean);

  let initials: string;
  if (parts.length >= 2) {
    initials = (parts[0][0] + parts[1][0]).toUpperCase();
  } else if (first.length >= 2) {
    initials = first.slice(0, 2).toUpperCase();
  } else {
    initials = ((first + (words[1]?.[0] ?? '')).slice(0, 2) || 'EH').toUpperCase();
  }

  ctx.save();
  ctx.fillStyle = options.palette.secondary;
  roundRect(ctx, x, y, size, size, size * 0.22);
  ctx.fill();

  ctx.fillStyle = options.palette.primaryDark;
  ctx.font = `900 ${size * 0.42}px ${FONT_HEADING}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, x + size / 2, y + size / 2 + size * 0.02);
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

/** Dibuja el anverso: marca, lema y contacto. */
export async function drawBusinessCard(
  ctx: CanvasRenderingContext2D,
  options: CardRenderOptions,
  side: CardSide
): Promise<void> {
  const W = CARD_WIDTH_PX;
  const H = CARD_HEIGHT_PX;

  if (side === 'front') {
    // Fondo con degradado de la marca
    const gradient = ctx.createLinearGradient(0, 0, W, H);
    gradient.addColorStop(0, options.palette.primary);
    gradient.addColorStop(1, options.palette.primaryDark);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    // Franja de acento
    ctx.fillStyle = options.palette.secondary;
    ctx.fillRect(0, 0, W, 14);

    const padding = 56;

    // Encabezado
    drawLine(ctx, 'COSTA RICA 🇨🇷', padding, 74, W - padding * 2, {
      font: `700 20px ${FONT_BODY}`,
      color: 'rgba(255,255,255,0.72)',
    });
    drawLine(ctx, 'GOLLO • EPA OFICIAL', W - padding, 74, W - padding * 2, {
      font: `800 20px ${FONT_BODY}`,
      color: options.palette.secondary,
      align: 'right',
    });

    // Marca
    const markSize = 74;
    drawLogoMark(ctx, options, padding, 118, markSize);
    drawLine(ctx, options.brandName, padding + markSize + 24, 152, W - padding * 2 - markSize - 24, {
      font: `900 46px ${FONT_HEADING}`,
      color: '#FFFFFF',
    });
    drawLine(ctx, options.serviceTagline, padding + markSize + 24, 190, W - padding * 2 - markSize - 24, {
      font: `600 19px ${FONT_BODY}`,
      color: 'rgba(191,219,254,0.95)',
    });

    // Lema
    drawLine(ctx, `“${options.slogan}”`, padding, 330, W - padding * 2, {
      font: `italic 300 22px ${FONT_BODY}`,
      color: 'rgba(219,234,254,0.9)',
    });

    // Divisor
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, H - 168);
    ctx.lineTo(W - padding, H - 168);
    ctx.stroke();

    // Contacto
    drawLine(ctx, `WhatsApp: +506 ${options.phone}`, padding, H - 116, W - padding * 2, {
      font: `800 25px ${FONT_BODY}`,
      color: options.palette.accentGreen,
    });
    drawLine(ctx, options.coverage, padding, H - 82, W - padding * 2, {
      font: `400 19px ${FONT_BODY}`,
      color: 'rgba(191,219,254,0.9)',
    });
    drawLine(ctx, 'Entrega a domicilio', W - padding, H - 82, 300, {
      font: `800 19px ${FONT_BODY}`,
      color: options.palette.secondary,
      align: 'right',
    });

    return;
  }

  // ---- Reverso ----
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = options.palette.primary;
  ctx.fillRect(0, 0, W, 14);

  const padding = 56;

  drawLine(ctx, 'Catálogo Digital 24/7', padding, 78, W - padding * 2, {
    font: `800 24px ${FONT_HEADING}`,
    color: options.palette.primary,
  });
  drawLine(ctx, 'Escaneá con tu celular', W - padding, 78, 320, {
    font: `400 17px ${FONT_BODY}`,
    color: '#6B7280',
    align: 'right',
  });

  // Código QR
  const qrSize = 300;
  const qrX = padding;
  const qrY = 132;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(qrX, qrY, qrSize, qrSize);
  await drawImage(ctx, options.qrDataUrl, qrX, qrY, qrSize, qrSize);
  ctx.strokeStyle = options.palette.border;
  ctx.lineWidth = 2;
  ctx.strokeRect(qrX, qrY, qrSize, qrSize);

  if (!options.qrDataUrl) {
    drawLine(ctx, 'QR', qrX + qrSize / 2, qrY + qrSize / 2 + 18, qrSize - 20, {
      font: `800 40px ${FONT_HEADING}`,
      color: '#9CA3AF',
      align: 'center',
    });
  }

  // Pasos
  const stepsX = qrX + qrSize + 40;
  const steps = [
    'Escaneá el código',
    'Elegí tu electrodoméstico',
    'Pedí por WhatsApp',
  ];
  steps.forEach((step, index) => {
    const y = qrY + 66 + index * 72;
    ctx.save();
    ctx.fillStyle = options.palette.primary;
    ctx.beginPath();
    ctx.arc(stepsX + 18, y - 7, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `800 20px ${FONT_BODY}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(index + 1), stepsX + 18, y - 6);
    ctx.restore();

    drawLine(ctx, step, stepsX + 52, y, W - stepsX - 52 - padding, {
      font: `${index === 2 ? '800' : '500'} 20px ${FONT_BODY}`,
      color: index === 2 ? '#059669' : '#374151',
    });
  });

  // Pie
  ctx.strokeStyle = options.palette.border;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, H - 92);
  ctx.lineTo(W - padding, H - 92);
  ctx.stroke();

  drawLine(ctx, 'Garantía de fábrica', padding, H - 46, 400, {
    font: `400 19px ${FONT_BODY}`,
    color: '#6B7280',
  });
  drawLine(ctx, `+506 ${options.phone}`, W - padding, H - 46, 320, {
    font: `800 19px ${FONT_BODY}`,
    color: options.palette.primary,
    align: 'right',
  });
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
