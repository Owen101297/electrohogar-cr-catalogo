export interface Product {
  id: string;
  name: string;
  category: 'refrigeracion' | 'lavado' | 'cocina' | 'pantallas' | 'pequenos';
  brand: string;
  store: 'Gollo' | 'EPA' | 'Ambas';
  originalPrice: number; // in Costa Rican Colones (CRC / ₡)
  currentPrice: number;
  cashDiscountPercent?: number;
  installmentQuincenal: number; // cuota quincenal estimada
  installmentMonths: number;
  image: string;
  badge?: string; // e.g. "Más Vendido", "Oferta Gollo", "Exclusivo EPA", "Liquidación"
  warrantyMonths: number;
  sku: string;
  specs: {
    capacity?: string;
    dimensions?: string;
    voltage?: string;
    energyRating?: string;
    color?: string;
    details: string[];
  };
  description: string;
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
