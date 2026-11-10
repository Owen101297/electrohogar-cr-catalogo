export type ProductStore = 'Gollo' | 'EPA' | 'Ambas';

export type ProductCategory =
  | 'refrigeracion'
  | 'lavado'
  | 'cocina'
  | 'pantallas'
  | 'pequenos';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  brand: string;
  store: ProductStore;
  originalPrice: number; // in Costa Rican Colones (CRC / ₡)
  currentPrice: number;
  cashDiscountPercent?: number;
  installmentQuincenal: number; // cuota quincenal estimada
  installmentMonths: number;
  image: string;
  badge?: string; // e.g. "Más Vendido", "Oferta Gollo", "Exclusivo EPA", "Liquidación"
  warrantyMonths: number;
  sku: string;
  specs: ProductSpecs;
  description: string;
}

export interface ProductSpecs {
  capacity?: string;
  dimensions?: string;
  voltage?: string;
  energyRating?: string;
  color?: string;
  details: string[];
}

export interface CardProfile {
  brandName: string; // Nombre comercial / Empresa (sin nombre de persona)
  serviceTagline: string; // e.g. "Catálogo Oficial de Electrodomésticos"
  phone: string; // WhatsApp +506
  email?: string;
  slogan: string;
  coverage: string;
  paletteId: string;
  minimalistStyle: 'modern-clean' | 'dark-luxury' | 'pure-white' | 'corporate-navy';
  showStoresLogos: boolean;
  services: string[];
}

export interface ColorPalette {
  id: string;
  name: string;
  description: string;
  primary: string; // e.g. #0F4C81
  primaryDark: string;
  secondary: string; // e.g. #EAB308
  accentGreen: string; // #25D366 (WhatsApp)
  bgCard: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  gradient: string;
}

export interface AdvisorSettings {
  commissionRate: number; // percentage, e.g. 8%
  advisorModeEnabled: boolean;
  notes: string;
}

/**
 * Estado del formulario de producto (alta y edición).
 *
 * Los campos numéricos se mantienen como texto mientras se editan para no
 * romper el cursor ni reformatear lo que la asesora está escribiendo; se
 * parsean al guardar. Ver `src/utils/products.ts`.
 */
export interface ProductFormValues {
  name: string;
  brand: string;
  store: ProductStore;
  category: ProductCategory;
  originalPriceStr: string;
  currentPriceStr: string;
  installmentQuincenalStr: string;
  installmentMonths: number;
  warrantyMonths: number;
  sku: string;
  image: string;
  badge: string;
  description: string;
  capacity: string;
  dimensions: string;
  voltage: string;
  energyRating: string;
  color: string;
}

/**
 * Errores de validación del formulario de producto.
 * Una clave ausente o con string vacío significa "sin error en ese campo".
 */
export interface ProductFormErrors {
  name?: string;
  currentPriceStr?: string;
  originalPriceStr?: string;
  installmentQuincenalStr?: string;
  sku?: string;
  image?: string;
}
