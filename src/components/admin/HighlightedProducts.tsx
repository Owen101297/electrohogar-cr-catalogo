import React from 'react';
import { Product } from '../../types';
import { formatColones } from '../../utils/formatters';
import { PANEL_COPY } from '../../utils/stats';
import { TrendingUp, Tag, ShoppingBag } from 'lucide-react';

interface HighlightedProductsProps {
  titulo: string;
  productos: Product[];
  tipo: 'valor' | 'descuento';
  onSelectProduct?: (product: Product) => void;
}

/**
 * Lista de productos destacados: los de mayor valor o los de mayor descuento.
 */
export const HighlightedProducts: React.FC<HighlightedProductsProps> = ({
  titulo,
  productos,
  tipo,
  onSelectProduct,
}) => {
  const Icon = tipo === 'valor' ? TrendingUp : Tag;

  return (
    <div className="bg-white rounded-3xl border border-[#DFE3E8] shadow-xs p-5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-4 flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-[#0F4C81]" />
        {titulo}
      </h3>

      {productos.length === 0 ? (
        <p className="text-xs text-gray-400 py-4 text-center">
          {tipo === 'descuento'
            ? PANEL_COPY.sinDescuento
            : 'Sin productos para mostrar'}
        </p>
      ) : (
        <ul className="space-y-2">
          {productos.map((product) => (
            <li key={product.id}>
              <button
                type="button"
                onClick={() => onSelectProduct?.(product)}
                className="w-full flex items-center gap-2.5 p-2 rounded-xl border border-gray-100 hover:bg-gray-50 text-left transition cursor-pointer"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  className="w-9 h-9 object-contain rounded-lg bg-gray-50 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gray-900 line-clamp-1">
                    {product.name}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {product.brand} · {product.store}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-extrabold text-[#0F4C81] tabular-nums">
                    {formatColones(product.currentPrice)}
                  </p>
                  {tipo === 'descuento' && product.cashDiscountPercent ? (
                    <p className="text-[10px] font-bold text-amber-600">
                      -{product.cashDiscountPercent}%
                    </p>
                  ) : (
                    <p className="text-[10px] text-gray-400 inline-flex items-center gap-0.5">
                      <ShoppingBag className="w-2.5 h-2.5" />
                      {product.installmentMonths}m
                    </p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
