import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdvisorSettings, CardProfile, Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { DEFAULT_PHONE, migrateProfilePhone } from '../utils/profile';

export const STORAGE_KEY_PROFILE = 'electrohogar_cr_profile_v2';
export const STORAGE_KEY_PRODUCTS = 'electrohogar_cr_products_v2';
export const STORAGE_KEY_SETTINGS = 'electrohogar_cr_settings_v2';

export const DEFAULT_PROFILE: CardProfile = {
  brandName: 'ElectroHogar Costa Rica',
  serviceTagline: 'Catálogo Oficial de Electrodomésticos & Entrega a Domicilio',
  phone: DEFAULT_PHONE,
  email: 'ventas@electrohogarcr.com',
  slogan: 'Los mejores precios de Gollo y EPA en la puerta de su hogar con garantía oficial',
  coverage: 'San José, Alajuela, Heredia, Cartago y envíos a todo Costa Rica',
  paletteId: 'sapphire-gold',
  minimalistStyle: 'modern-clean',
  showStoresLogos: true,
  services: [
    'Entrega coordinada a domicilio',
    'Cuotas quincenales y mensuales',
    'Garantía directa de fábrica',
    'Pedidos directos por WhatsApp',
  ],
};

export const DEFAULT_SETTINGS: AdvisorSettings = {
  commissionRate: 8, // 8% commission standard
  advisorModeEnabled: false, // Default to clean customer view without commission visible
  notes: '',
};

function readStored<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStored(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(e);
  }
}

/**
 * Estado persistente del catálogo, compartido por la vista pública y la del
 * asesor. Ambas pantallas leen y escriben el mismo almacenamiento local, de
 * modo que lo que la asesora agrega en el modo asesor aparece de inmediato en
 * el catálogo que ve el cliente.
 */
export function useCatalogData() {
  const [profile, setProfile] = useState<CardProfile>(() => {
    const stored = readStored(STORAGE_KEY_PROFILE, DEFAULT_PROFILE);
    // Si el teléfono guardado quedó atrás (el negocio cambió el número), se
    // actualiza solo sin perder el resto de la información del perfil.
    return migrateProfilePhone(stored, DEFAULT_PROFILE.phone);
  });

  const [products, setProducts] = useState<Product[]>(() =>
    readStored(STORAGE_KEY_PRODUCTS, INITIAL_PRODUCTS)
  );

  const [advisorSettings, setAdvisorSettings] = useState<AdvisorSettings>(() =>
    readStored(STORAGE_KEY_SETTINGS, DEFAULT_SETTINGS)
  );

  // Persistencia
  useEffect(() => {
    writeStored(STORAGE_KEY_PROFILE, profile);
  }, [profile]);

  useEffect(() => {
    writeStored(STORAGE_KEY_PRODUCTS, products);
  }, [products]);

  useEffect(() => {
    writeStored(STORAGE_KEY_SETTINGS, advisorSettings);
  }, [advisorSettings]);

  // Otra pestaña del navegador modificó el catálogo: recargamos para no pisar
  // cambios ajenos.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== STORAGE_KEY_PRODUCTS) return;
      try {
        const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
        if (saved) setProducts(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const addProduct = useCallback((product: Product) => {
    setProducts((prev) => [product, ...prev]);
  }, []);

  const updateProduct = useCallback((updated: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  }, []);

  const deleteProduct = useCallback((productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const resetCatalog = useCallback(() => {
    setProducts(INITIAL_PRODUCTS);
  }, []);

  return {
    profile,
    setProfile,
    products,
    setProducts,
    advisorSettings,
    setAdvisorSettings,
    addProduct,
    updateProduct,
    deleteProduct,
    resetCatalog,
  };
}
