import React, { useMemo } from 'react';
import { AdvisorSettings, Product } from '../../types';
import { computeCatalogMetrics, PANEL_COPY } from '../../utils/stats';
import { MetricCard } from './MetricCard';
import { DistributionChart } from './DistributionChart';
import { HighlightedProducts } from './HighlightedProducts';
import { ProductTable } from './ProductTable';
import {
  Boxes,
  Wallet,
  Tag,
  Percent,
  Coins,
  PlusCircle,
  LayoutDashboard,
} from 'lucide-react';
import { formatColones } from '../../utils/formatters';

interface AdminPanelProps {
  products: Product[];
  advisorSettings: AdvisorSettings;
  onOpenAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
}

/**
 * Panel administrativo del catálogo digital.
 *
 * Muestra las métricas del negocio y la gestión de productos. Solo se monta
 * en el modo asesor: nunca es alcanzable desde el catálogo público (FR-025).
 */
export const AdminPanel: React.FC<AdminPanelProps> = ({
  products,
  advisorSettings,
  onOpenAddProduct,
  onEditProduct,
  onDeleteProduct,
}) => {
  const metrics = useMemo(
    () => computeCatalogMetrics(products, advisorSettings),
    [products, advisorSettings]
  );

  if (metrics.totalProductos === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-3xl border border-[#DFE3E8] shadow-xs p-12 text-center">
          <LayoutDashboard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-black text-gray-900 font-['Montserrat',sans-serif]">
            {PANEL_COPY.vacioTitulo}
          </h2>
          <p className="text-xs text-gray-500 mt-2 max-w-md mx-auto">
            {PANEL_COPY.vacioBody}
          </p>
          <button
            type="button"
            onClick={onOpenAddProduct}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F4C81] hover:bg-[#082a47] text-white font-bold text-xs transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Agregar Producto
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900 font-['Montserrat',sans-serif] tracking-tight">
            {PANEL_COPY.titulo}
          </h1>
          <p className="text-xs text-gray-500 mt-1">{PANEL_COPY.subtitulo}</p>
        </div>
        <button
          type="button"
          onClick={onOpenAddProduct}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F4C81] hover:bg-[#082a47] text-white font-bold text-xs transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Agregar Producto
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        <MetricCard
          label={PANEL_COPY.metricas.totalProductos}
          value={String(metrics.totalProductos)}
          hint={`${metrics.sinDescuento} sin descuento`}
          icon={Boxes}
          tone="neutral"
        />
        <MetricCard
          label={PANEL_COPY.metricas.valorTotal}
          value={formatColones(metrics.valorTotal)}
          hint={PANEL_COPY.metricasAyuda.valorTotal}
          icon={Wallet}
          tone="primary"
        />
        <MetricCard
          label={PANEL_COPY.metricas.precioPromedio}
          value={formatColones(metrics.precioPromedio)}
          hint={PANEL_COPY.metricasAyuda.precioPromedio}
          icon={Tag}
          tone="neutral"
        />
        <MetricCard
          label={PANEL_COPY.metricas.descuentoPromedio}
          value={`${metrics.descuentoPromedio}%`}
          hint={PANEL_COPY.metricasAyuda.descuentoPromedio}
          icon={Percent}
          tone="gold"
        />
        <MetricCard
          label={PANEL_COPY.metricas.comisionPotencial}
          value={formatColones(metrics.comisionPotencial)}
          hint={PANEL_COPY.metricasAyuda.comisionPotencial}
          icon={Coins}
          tone="green"
        />
      </div>

      {/* Distribuciones y destacados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DistributionChart
          title={PANEL_COPY.distribucionTienda}
          groups={metrics.porTienda}
        />
        <DistributionChart
          title={PANEL_COPY.distribucionCategoria}
          groups={metrics.porCategoria}
        />
        <HighlightedProducts
          titulo={PANEL_COPY.destacadosValor}
          productos={metrics.mayorValor}
          tipo="valor"
        />
        <HighlightedProducts
          titulo={PANEL_COPY.destacadosDescuento}
          productos={metrics.mayorDescuento}
          tipo="descuento"
        />
      </div>

      {/* Gestión de productos */}
      <ProductTable
        products={products}
        onEditProduct={onEditProduct}
        onDeleteProduct={onDeleteProduct}
      />
    </div>
  );
};
