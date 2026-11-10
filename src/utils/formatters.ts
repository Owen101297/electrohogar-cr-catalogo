/**
 * Utilities for formatting Costa Rican colones (CRC ₡), telephone numbers,
 * and generating WhatsApp direct message links for specific products.
 */

export function formatColones(amount: number): string {
  // Format as ₡349.900 (standard Costa Rican retail format)
  return '₡' + Math.round(amount).toLocaleString('es-CR');
}

export function cleanPhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

export function getCostaRicaPhoneFormatted(phone: string): string {
  const digits = cleanPhone(phone);
  if (digits.length === 8) {
    return `+506 ${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  if (digits.length === 11 && digits.startsWith('506')) {
    const local = digits.slice(3);
    return `+506 ${local.slice(0, 4)}-${local.slice(4)}`;
  }
  return phone;
}

export function generateWhatsAppLink(
  phone: string,
  productName?: string,
  price?: number,
  installment?: number,
  store?: string,
  sku?: string,
  customMessage?: string
): string {
  let targetPhone = cleanPhone(phone);
  if (!targetPhone.startsWith('506') && targetPhone.length === 8) {
    targetPhone = '506' + targetPhone;
  }

  let text = '';
  if (customMessage) {
    text = customMessage;
  } else if (productName && price) {
    text = `¡Hola! Me interesa este producto del catálogo:

📦 *Producto:* ${productName}
${sku ? `🔖 *Código/SKU:* ${sku}\n` : ''}${store ? `🏪 *Tienda de referencia:* ${store} Costa Rica\n` : ''}💰 *Precio de Contado:* ${formatColones(price)}
${installment ? `💳 *Cuota Quincenal estimada:* ${formatColones(installment)}\n` : ''}
¿Podrían confirmarme la disponibilidad y el tiempo de entrega a domicilio? ¡Gracias!`;
  } else {
    text = `¡Hola! Escaneé el código QR de la tarjeta y me gustaría consultar información y catálogo de electrodomésticos con entrega a domicilio.`;
  }

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
}

export function calculateCommission(price: number, commissionRatePercent: number): number {
  return Math.round((price * commissionRatePercent) / 100);
}
