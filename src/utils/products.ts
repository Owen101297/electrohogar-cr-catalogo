/**
 * Lógica de producto: parseo de precios, descuento, cuota quincenal y validación.
 *
 * Este módulo es puro (sin React ni DOM) y es la única fuente de verdad para
 * las reglas de precio del catálogo. El formulario de alta y el de edición
 * consumen estas mismas funciones, de modo que ambos se comportan igual.
 *
 * Contrato: specs/001-product-edit-delete/contracts/products.md
 */

import {
  Product,
  ProductCategory,
  ProductFormErrors,
  ProductFormValues,
  ProductStore,
} from '../types';

/** Plazos disponibles para el crédito quincenal. */
export const INSTALLMENT_TERM_OPTIONS: number[] = [6, 12, 18, 24, 36];

/** Meses de garantía por defecto al capturar un producto nuevo. */
export const DEFAULT_WARRANTY_MONTHS = 12;

/**
 * Factor de financiamiento usado para estimar la cuota quincenal cuando la
 * asesora no captura una: el total a financiar es precio * 1.35 repartido en
 * el doble de quincenas que meses.
 */
export const FINANCING_FACTOR = 1.35;

/** Copy centralizado en español costarricense (principio I de la constitución). */
export const PRODUCT_COPY = {
  validation: {
    name: 'Escribe el nombre del electrodoméstico.',
    currentPrice: 'Escribe el precio de contado en colones.',
    originalPrice: 'Escribe el precio de lista en colones.',
    installmentQuincenal: 'La cuota quincenal debe ser un número válido.',
    sku: 'Escribe el código SKU del producto.',
    image: 'La dirección de la foto no es válida.',
  },
  delete: {
    title: 'Eliminar producto del catálogo',
    question:
      '¿Seguro que querés eliminar "{name}" del catálogo? Esta acción se puede deshacer por unos segundos.',
    confirm: 'Sí, eliminar',
    cancel: 'Cancelar',
  },
  undo: {
    message: 'Producto eliminado',
    action: 'Deshacer',
  },
  emptyCatalog: {
    title: 'Tu catálogo está vacío',
    body:
      'Agregá el primer electrodoméstico de Gollo o EPA y compartilo con tus clientes por WhatsApp.',
    action: 'Agregar Producto',
  },
} as const;

/**
 * Convierte una entrada de texto en un número de colones.
 * Ignora el símbolo ₡, los separadores de miles y cualquier carácter no numérico.
 */
export function parseColones(raw: string): number {
  const digits = (raw ?? '').replace(/[^0-9]/g, '');
  if (digits.length === 0) return 0;
  return Number(digits);
}

/**
 * Porcentaje de descuento en efectivo, redondeado al entero más cercano.
 * Devuelve 0 si no hay precio de lista válido o si no hay descuento real.
 */
export function calculateDiscountPercent(
  originalPrice: number,
  currentPrice: number
): number {
  if (!Number.isFinite(originalPrice) || originalPrice <= 0) return 0;
  if (!Number.isFinite(currentPrice) || currentPrice >= originalPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

/**
 * Cuota quincenal estimada para cuando la asesora no captura una.
 * Fórmula: precio * 1.35 / (meses * 2 quincenas).
 */
export function estimateQuincenalInstallment(
  currentPrice: number,
  installmentMonths: number
): number {
  const months = Math.max(1, Math.floor(installmentMonths) || 1);
  const price = Number.isFinite(currentPrice) ? currentPrice : 0;
  return Math.round((price * FINANCING_FACTOR) / (months * 2));
}

/** Genera un SKU de la forma CR-0000 para productos nuevos. */
export function generateSku(): string {
  return `CR-${Math.floor(1000 + Math.random() * 9000)}`;
}

/** Genera un identificador único para productos nuevos. */
export function generateProductId(): string {
  return `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function isValidImageUrl(raw: string): boolean {
  const value = (raw ?? '').trim();
  if (value === '') return true; // la imagen es opcional
  return /^https?:\/\/.+/i.test(value);
}

/**
 * Valida el estado del formulario de producto.
 * Devuelve un objeto con los mensajes de error indexados por campo.
 */
export function validateProductForm(values: ProductFormValues): ProductFormErrors {
  const errors: ProductFormErrors = {};

  if (values.name.trim() === '') {
    errors.name = PRODUCT_COPY.validation.name;
  }

  const currentPrice = parseColones(values.currentPriceStr);
  if (values.currentPriceStr.trim() === '' || currentPrice <= 0) {
    errors.currentPriceStr = PRODUCT_COPY.validation.currentPrice;
  }

  const originalPrice = parseColones(values.originalPriceStr);
  if (values.originalPriceStr.trim() === '' || originalPrice <= 0) {
    errors.originalPriceStr = PRODUCT_COPY.validation.originalPrice;
  }

  const quincenalRaw = values.installmentQuincenalStr.trim();
  if (quincenalRaw !== '' && parseColones(quincenalRaw) <= 0) {
    errors.installmentQuincenalStr = PRODUCT_COPY.validation.installmentQuincenal;
  }

  if (values.sku.trim() === '') {
    errors.sku = PRODUCT_COPY.validation.sku;
  }

  if (!isValidImageUrl(values.image)) {
    errors.image = PRODUCT_COPY.validation.image;
  }

  return errors;
}

/** Valores iniciales del formulario para el alta de un producto nuevo. */
export function emptyProductFormValues(): ProductFormValues {
  return {
    name: '',
    brand: 'Samsung',
    store: 'Gollo',
    category: 'refrigeracion',
    originalPriceStr: '349000',
    currentPriceStr: '299000',
    installmentQuincenalStr: '',
    installmentMonths: 24,
    warrantyMonths: DEFAULT_WARRANTY_MONTHS,
    sku: generateSku(),
    image:
      'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
    badge: 'Nueva Oferta',
    description: '',
    capacity: 'Estándar para el hogar costarricense',
    dimensions: '',
    voltage: '120V / 60Hz estándar Costa Rica',
    energyRating: '',
    color: '',
  };
}

/** Precarga el formulario con los valores actuales de un producto existente. */
export function productToFormValues(product: Product): ProductFormValues {
  return {
    name: product.name,
    brand: product.brand,
    store: product.store,
    category: product.category,
    originalPriceStr: String(product.originalPrice),
    currentPriceStr: String(product.currentPrice),
    installmentQuincenalStr: String(product.installmentQuincenal),
    installmentMonths: product.installmentMonths,
    warrantyMonths: product.warrantyMonths,
    sku: product.sku,
    image: product.image,
    badge: product.badge ?? '',
    description: product.description,
    capacity: product.specs.capacity ?? '',
    dimensions: product.specs.dimensions ?? '',
    voltage: product.specs.voltage ?? '',
    energyRating: product.specs.energyRating ?? '',
    color: product.specs.color ?? '',
  };
}

/**
 * Construye el producto final a partir del estado del formulario.
 *
 * En modo edición (`existing` presente) conserva la identidad del producto
 * (id y sku) y los bullets técnicos de sus especificaciones.
 */
export function buildProductFromForm(
  values: ProductFormValues,
  existing?: Product
): Product {
  const currentPrice = parseColones(values.currentPriceStr);

  // FR-008: el precio de lista nunca puede quedar por debajo del de contado.
  const parsedOriginal = parseColones(values.originalPriceStr);
  const originalPrice =
    parsedOriginal > currentPrice ? parsedOriginal : currentPrice;

  // FR-009: el descuento siempre se deriva de los dos precios.
  const discountPercent = calculateDiscountPercent(originalPrice, currentPrice);

  // FR-010: la cuota capturada se respeta; si está vacía se estima.
  const capturedQuincenal = parseColones(values.installmentQuincenalStr);
  const installmentQuincenal =
    capturedQuincenal > 0
      ? capturedQuincenal
      : estimateQuincenalInstallment(currentPrice, values.installmentMonths);

  const trimmedName = values.name.trim();
  const trimmedBrand = values.brand.trim();
  const trimmedDescription = values.description.trim();

  return {
    id: existing?.id ?? generateProductId(),
    name: trimmedName !== '' ? trimmedName : 'Electrodoméstico de Oferta',
    category: values.category,
    brand: trimmedBrand !== '' ? trimmedBrand : 'Genérico',
    store: values.store,
    originalPrice,
    currentPrice,
    cashDiscountPercent: discountPercent > 0 ? discountPercent : undefined,
    installmentQuincenal,
    installmentMonths: values.installmentMonths,
    image: values.image.trim(),
    badge: values.badge.trim() !== '' ? values.badge.trim() : undefined,
    warrantyMonths: values.warrantyMonths,
    sku: existing?.sku ?? values.sku.trim(),
    specs: {
      capacity: values.capacity.trim() !== '' ? values.capacity.trim() : undefined,
      dimensions:
        values.dimensions.trim() !== '' ? values.dimensions.trim() : undefined,
      voltage: values.voltage.trim() !== '' ? values.voltage.trim() : undefined,
      energyRating:
        values.energyRating.trim() !== '' ? values.energyRating.trim() : undefined,
      color: values.color.trim() !== '' ? values.color.trim() : undefined,
      details: existing?.specs.details ?? [],
    },
    description:
      trimmedDescription !== ''
        ? trimmedDescription
        : existing?.description ??
          'Producto seleccionado de Gollo o EPA Costa Rica con facilidades de pago y entrega a domicilio.',
  };
}

/** Etiquetas legibles de tienda para los select del formulario. */
export const STORE_LABELS: Record<ProductStore, string> = {
  Gollo: 'Gollo Costa Rica',
  EPA: 'EPA Ferretería',
  Ambas: 'Disponible en Ambas',
};

/** Etiquetas legibles de categoría para los select del formulario. */
export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  refrigeracion: 'Refrigeración',
  lavado: 'Lavado y Secado',
  cocina: 'Cocinas y Hornos',
  pantallas: 'Pantallas y TV',
  pequenos: 'Pequeños Electrodomésticos',
};
