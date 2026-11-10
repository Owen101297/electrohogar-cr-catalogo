import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Product, CardProfile, AdvisorSettings } from './types';
import { INITIAL_PRODUCTS } from './data/initialProducts';
import { PALETTES } from './data/palettes';
import { Navbar } from './components/Navbar';
import { CatalogView } from './components/CatalogView';
import { CardStudio } from './components/CardStudio';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ProductFormModal } from './components/ProductFormModal';
import { DigitalCardModal } from './components/DigitalCardModal';
import { CommissionCalculatorModal } from './components/CommissionCalculatorModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { UndoToast } from './components/UndoToast';
import { Footer } from './components/Footer';
import { PRODUCT_COPY } from './utils/products';

const STORAGE_KEY_PROFILE = 'electrohogar_cr_profile_v2';
const STORAGE_KEY_PRODUCTS = 'electrohogar_cr_products_v2';
const STORAGE_KEY_SETTINGS = 'electrohogar_cr_settings_v2';

/** Ventana durante la cual se puede deshacer una eliminación. */
const UNDO_DELETE_WINDOW_MS = 6000;

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

/** Producto eliminado que todavía puede recuperarse. */
interface PendingDeletion {
  product: Product;
  index: number;
  expiresAt: number;
}

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

  // Gestión de productos: edición, eliminación y deshacer
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [pendingDeletion, setPendingDeletion] = useState<PendingDeletion | null>(null);

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

  // Otra pestaña del navegador modificó el catálogo: recargamos para no pisar
  // cambios ajenos (edge case de la spec).
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== STORAGE_KEY_PRODUCTS) return;
      try {
        const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
        if (saved) {
          setProducts(JSON.parse(saved));
        }
      } catch (e) {
        console.error(e);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // El aviso de deshacer caduca solo: al expirar, la eliminación se confirma.
  useEffect(() => {
    if (!pendingDeletion) return;

    const remaining = pendingDeletion.expiresAt - Date.now();
    if (remaining <= 0) {
      setPendingDeletion(null);
      return;
    }

    const timer = window.setTimeout(() => {
      setPendingDeletion(null);
    }, remaining);

    return () => window.clearTimeout(timer);
  }, [pendingDeletion]);

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

  const handleEditProduct = (product: Product) => {
    // La ficha se cierra y el formulario de edición toma el relevo.
    setSelectedProduct(null);
    setEditingProduct(product);
    setIsEditProductOpen(true);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    setIsEditProductOpen(false);
    setEditingProduct(null);
  };
  const handleRequestDelete = (product: Product) => {
    // La ficha del producto permanece abierta detrás del diálogo: si la
    // asesora cancela, sigue en la misma pantalla y no pierde el contexto.
    setProductToDelete(product);
  };

  const handleConfirmDelete = () => {
    if (!productToDelete) return;

    setSelectedProduct(null);
    setProducts((prev) => {
      const index = prev.findIndex((p) => p.id === productToDelete.id);
      if (index === -1) return prev;

      setPendingDeletion({
        product: productToDelete,
        index,
        expiresAt: Date.now() + UNDO_DELETE_WINDOW_MS,
      });

      return prev.filter((p) => p.id !== productToDelete.id);
    });

    setProductToDelete(null);
  };

  const handleUndoDelete = useCallback(() => {
    setProducts((prev) => {
      if (!pendingDeletion) return prev;
      const next = [...prev];
      next.splice(
        Math.min(pendingDeletion.index, next.length),
        0,
        pendingDeletion.product
      );
      return next;
    });
    setPendingDeletion(null);
  }, [pendingDeletion]);

  const handleDismissUndo = useCallback(() => {
    setPendingDeletion(null);
  }, []);

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
        onEditProduct={handleEditProduct}
        onDeleteProduct={handleRequestDelete}
        profile={profile}
        activePalette={activePalette}
        advisorSettings={advisorSettings}
      />

      <ProductFormModal
        isOpen={isAddProductOpen}
        mode="create"
        onClose={() => setIsAddProductOpen(false)}
        onSubmit={handleAddProduct}
      />

      <ProductFormModal
        isOpen={isEditProductOpen}
        mode="edit"
        product={editingProduct}
        onClose={() => {
          setIsEditProductOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleUpdateProduct}
      />

      <ConfirmDialog
        isOpen={productToDelete !== null}
        title={PRODUCT_COPY.delete.title}
        message={
          productToDelete
            ? PRODUCT_COPY.delete.question.replace('{name}', productToDelete.name)
            : ''
        }
        confirmLabel={PRODUCT_COPY.delete.confirm}
        cancelLabel={PRODUCT_COPY.delete.cancel}
        onConfirm={handleConfirmDelete}
        onClose={() => setProductToDelete(null)}
      />

      <UndoToast
        isVisible={pendingDeletion !== null}
        message={PRODUCT_COPY.undo.message}
        actionLabel={PRODUCT_COPY.undo.action}
        durationMs={UNDO_DELETE_WINDOW_MS}
        onAction={handleUndoDelete}
        onDismiss={handleDismissUndo}
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
    </div>
  );
}
