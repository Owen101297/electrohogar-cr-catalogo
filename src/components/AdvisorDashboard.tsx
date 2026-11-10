import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Product } from '../types';
import { PALETTES } from '../data/palettes';
import { Navbar } from './Navbar';
import { CatalogView } from './CatalogView';
import { CardStudio } from './CardStudio';
import { AdminPanel } from './admin/AdminPanel';
import { ProductDetailModal } from './ProductDetailModal';
import { ProductFormModal } from './ProductFormModal';
import { DigitalCardModal } from './DigitalCardModal';
import { CommissionCalculatorModal } from './CommissionCalculatorModal';
import { ConfirmDialog } from './ConfirmDialog';
import { UndoToast } from './UndoToast';
import { Footer } from './Footer';
import { PRODUCT_COPY } from '../utils/products';
import { getPublicCatalogUrl, ADVISOR_GATE_COPY } from '../utils/routing';
import { useCatalogData } from '../hooks/useCatalogData';

/** Ventana durante la cual se puede deshacer una eliminación. */
const UNDO_DELETE_WINDOW_MS = 6000;

/** Producto eliminado que todavía puede recuperarse. */
interface PendingDeletion {
  product: Product;
  index: number;
  expiresAt: number;
}

interface AdvisorDashboardProps {
  onExitAdvisorMode: () => void;
}

/**
 * Pantalla de administración: todas las herramientas del asesor.
 * Se monta únicamente en la ruta interna `/asesor` con sesión activa.
 */
export const AdvisorDashboard: React.FC<AdvisorDashboardProps> = ({
  onExitAdvisorMode,
}) => {
  const {
    profile,
    setProfile,
    products,
    setProducts,
    advisorSettings,
    setAdvisorSettings,
    addProduct,
    updateProduct,
  } = useCatalogData();

  // UI state
  const [currentView, setCurrentView] = useState<
    'catalog' | 'card-studio' | 'panel'
  >('catalog');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDigitalCardOpen, setIsDigitalCardOpen] = useState(false);
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // Gestión de productos: edición, eliminación y deshacer
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [pendingDeletion, setPendingDeletion] = useState<PendingDeletion | null>(null);

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

  // Destino del QR: siempre el catálogo público, nunca la ruta interna.
  const catalogUrl = useMemo(() => getPublicCatalogUrl(), []);

  const handleEditProduct = (product: Product) => {
    // La ficha se cierra y el formulario de edición toma el relevo.
    setSelectedProduct(null);
    setEditingProduct(product);
    setIsEditProductOpen(true);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    updateProduct(updatedProduct);
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
            isAdvisor
            onSelectProduct={(p) => setSelectedProduct(p)}
            onOpenCardStudio={() => setCurrentView('card-studio')}
            onOpenDigitalCard={() => setIsDigitalCardOpen(true)}
            onOpenAddProduct={() => setIsAddProductOpen(true)}
          />
        ) : currentView === 'panel' ? (
          <AdminPanel
            products={products}
            advisorSettings={advisorSettings}
            onOpenAddProduct={() => setIsAddProductOpen(true)}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleRequestDelete}
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
        isAdvisor
        onOpenCardStudio={() => setCurrentView('card-studio')}
      />

      {/* Salir del modo asesor: vuelve al catálogo público limpio */}
      <div className="bg-[#121C27] border-t border-gray-800 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-end">
          <button
            onClick={onExitAdvisorMode}
            className="text-xs text-gray-400 hover:text-amber-300 font-semibold underline decoration-dotted transition cursor-pointer"
          >
            {ADVISOR_GATE_COPY.exit}
          </button>
        </div>
      </div>

      {/* Modals */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        isAdvisor
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
        onSubmit={addProduct}
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
};
