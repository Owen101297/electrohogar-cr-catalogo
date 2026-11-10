import React, { useMemo, useState } from 'react';
import { Product } from '../types';
import { PALETTES } from '../data/palettes';
import { PublicHeader } from './PublicHeader';
import { CatalogView } from './CatalogView';
import { ProductDetailModal } from './ProductDetailModal';
import { Footer } from './Footer';
import { useCatalogData } from '../hooks/useCatalogData';

/**
 * Catálogo público: lo que ve el cliente que escanea el código QR.
 *
 * Es de solo lectura. No expone herramientas de asesor, porcentajes de
 * ganancia, diseño de tarjetas ni ningún enlace al modo administrador.
 */
export const PublicCatalog: React.FC = () => {
  const { profile, products, advisorSettings } = useCatalogData();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const activePalette = useMemo(() => {
    return PALETTES.find((p) => p.id === profile.paletteId) || PALETTES[0];
  }, [profile.paletteId]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F8] text-[#121c27]">
      <PublicHeader profile={profile} activePalette={activePalette} />

      <main className="flex-1">
        <CatalogView
          products={products}
          profile={profile}
          activePalette={activePalette}
          advisorSettings={advisorSettings}
          isAdvisor={false}
          onSelectProduct={(p) => setSelectedProduct(p)}
        />
      </main>

      <Footer
        profile={profile}
        activePalette={activePalette}
        isAdvisor={false}
      />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        isAdvisor={false}
        profile={profile}
        activePalette={activePalette}
        advisorSettings={advisorSettings}
      />
    </div>
  );
};
