import React, { useState, useEffect, useMemo } from 'react';
import { Product, CardProfile, AdvisorSettings } from './types';
import { INITIAL_PRODUCTS } from './data/initialProducts';
import { PALETTES } from './data/palettes';
import { Navbar } from './components/Navbar';
import { CatalogView } from './components/CatalogView';
import { CardStudio } from './components/CardStudio';
import { ProductDetailModal } from './components/ProductDetailModal';
import { DigitalCardModal } from './components/DigitalCardModal';
import { CommissionCalculatorModal } from './components/CommissionCalculatorModal';
import { AddProductModal } from './components/AddProductModal';
import { Footer } from './components/Footer';

const STORAGE_KEY_PROFILE = 'electrohogar_cr_profile_v2';
const STORAGE_KEY_PRODUCTS = 'electrohogar_cr_products_v2';
const STORAGE_KEY_SETTINGS = 'electrohogar_cr_settings_v2';

const DEFAULT_PROFILE: CardProfile = {
  brandName: 'ElectroHogar Costa Rica',
  serviceTagline: 'Catálogo Oficial de Electrodomésticos & Entrega a Domicilio',
  phone: '8888-1234',
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

const DEFAULT_SETTINGS: AdvisorSettings = {
  commissionRate: 8, // 8% commission standard
  advisorModeEnabled: false, // Default to clean customer view without commission visible
  notes: '',
};

export default function App() {
  // Load state from localStorage or defaults
  const [profile, setProfile] = useState<CardProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [advisorSettings, setAdvisorSettings] = useState<AdvisorSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // UI state
  const [currentView, setCurrentView] = useState<'catalog' | 'card-studio'>('catalog');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDigitalCardOpen, setIsDigitalCardOpen] = useState(false);
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(advisorSettings));
    } catch (e) {
      console.error(e);
    }
  }, [advisorSettings]);

  // Active palette
  const activePalette = useMemo(() => {
    return PALETTES.find((p) => p.id === profile.paletteId) || PALETTES[0];
  }, [profile.paletteId]);

  // URL for the QR code: points to current web app
  const catalogUrl = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.location.href.split('#')[0];
    }
    return 'https://ais-dev-yssmg46j5ckofjvnwaqzzg-235380230441.us-west2.run.app';
  }, []);

  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F8] text-[#121c27]">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onSelectView={setCurrentView}
        profile={profile}
        activePalette={activePalette}
        advisorSettings={advisorSettings}
        onOpenCommissionModal={() => setIsCommissionModalOpen(true)}
        onOpenDigitalCard={() => setIsDigitalCardOpen(true)}
      />

      {/* Main Views */}
      <main className="flex-1">
        {currentView === 'catalog' ? (
          <CatalogView
            products={products}
            profile={profile}
            activePalette={activePalette}
            advisorSettings={advisorSettings}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onOpenCardStudio={() => setCurrentView('card-studio')}
            onOpenDigitalCard={() => setIsDigitalCardOpen(true)}
            onOpenAddProduct={() => setIsAddProductOpen(true)}
          />
        ) : (
          <CardStudio
            profile={profile}
            onUpdateProfile={setProfile}
            activePalette={activePalette}
            catalogUrl={catalogUrl}
            onOpenDigitalCard={() => setIsDigitalCardOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        profile={profile}
        activePalette={activePalette}
        onOpenCardStudio={() => setCurrentView('card-studio')}
      />

      {/* Modals */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        profile={profile}
        activePalette={activePalette}
        advisorSettings={advisorSettings}
      />

      <DigitalCardModal
        isOpen={isDigitalCardOpen}
        onClose={() => setIsDigitalCardOpen(false)}
        profile={profile}
        activePalette={activePalette}
        catalogUrl={catalogUrl}
      />

      <CommissionCalculatorModal
        isOpen={isCommissionModalOpen}
        onClose={() => setIsCommissionModalOpen(false)}
        settings={advisorSettings}
        onUpdateSettings={setAdvisorSettings}
        products={products}
      />

      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onAddProduct={handleAddProduct}
      />
    </div>
  );
}
