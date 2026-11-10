import React, { useMemo, useState } from 'react';
import { Product } from '../../types';
import { formatColones } from '../../utils/formatters';
import {
  buildProductRows,
  filterAndSortRows,
  PANEL_COPY,
  SortDirection,
  SortKey,
} from '../../utils/stats';
import { Pencil, Trash2, Search, ArrowUpDown, PackageSearch } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
}

/**
 * Tabla de gestión del catálogo: una fila por producto, con buscador, orden
 * y las acciones de editar y eliminar.
 */
export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEditProduct,
  onDeleteProduct,
}) => {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('nombre');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  const rows = useMemo(
    () => filterAndSortRows(buildProductRows(products), { query, sortBy, sortDir }),
    [products, query, sortBy, sortDir]
  );

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
  };

  const sortIcon = (key: SortKey) =>
    sortBy !== key ? (
      <ArrowUpDown className="w-3 h-3 text-gray-300" />
    ) : (
      <ArrowUpDown
        className={`w-3 h-3 ${sortDir === 'asc' ? 'text-[#0F4C81]' : 'text-amber-600'}`}
      />
    );

  return (
    <div className="bg-white rounded-3xl border border-[#DFE3E8] shadow-xs overflow-hidden">
      <div className="p-5 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
            {PANEL_COPY.tablaTitulo}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {rows.length} de {products.length} productos
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={PANEL_COPY.tablaBusqueda}
            aria-label={PANEL_COPY.tablaBusqueda}
            className="w-full sm:w-72 pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] bg-gray-50/60"
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="px-5 pb-10 pt-2 text-center">
          <PackageSearch className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-xs text-gray-500">
            {products.length === 0
              ? PANEL_COPY.vacioBody
              : PANEL_COPY.tablaSinResultados}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-y border-gray-100 bg-gray-50/60">
                <th className="px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Producto
                </th>
                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Tienda
                </th>
                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 text-right">
                  <button
                    type="button"
                    onClick={() => toggleSort('precio')}
                    className="inline-flex items-center gap-1 hover:text-[#0F4C81] transition cursor-pointer"
                  >
                    Precio {sortIcon('precio')}
                  </button>
                </th>
                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 text-right">
                  <button
                    type="button"
                    onClick={() => toggleSort('descuento')}
                    className="inline-flex items-center gap-1 hover:text-[#0F4C81] transition cursor-pointer"
                  >
                    Descuento {sortIcon('descuento')}
                  </button>
                </th>
                <th className="px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 text-right w-24">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ producto }) => (
                <tr
                  key={producto.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition"
                >
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={producto.image}
                        alt={producto.name}
                        loading="lazy"
                        className="w-9 h-9 object-contain rounded-lg bg-gray-50 shrink-0 border border-gray-100"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-900 line-clamp-1">
                          {producto.name}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono">
                          {producto.brand} · {producto.sku}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg ${
                        producto.store === 'Gollo'
                          ? 'bg-red-50 text-red-700'
                          : producto.store === 'EPA'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {producto.store}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="text-xs font-extrabold text-[#0F4C81] tabular-nums">
                      {formatColones(producto.currentPrice)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {producto.cashDiscountPercent ? (
                      <span className="text-xs font-bold text-amber-600">
                        -{producto.cashDiscountPercent}%
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEditProduct(producto)}
                        aria-label={`Editar ${producto.name}`}
                        title="Editar producto"
                        className="w-7 h-7 rounded-lg border border-[#0F4C81]/25 bg-blue-50/60 hover:bg-blue-100 text-[#0F4C81] flex items-center justify-center transition cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteProduct(producto)}
                        aria-label={`Eliminar ${producto.name}`}
                        title="Eliminar producto"
                        className="w-7 h-7 rounded-lg border border-red-200 bg-red-50/60 hover:bg-red-100 text-red-600 flex items-center justify-center transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
