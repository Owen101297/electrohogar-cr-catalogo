import React, { useState } from 'react';
import { Product } from '../types';
import { X, Plus, Upload, Link, Sparkles, Building2 } from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Product) => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
}) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Samsung');
  const [store, setStore] = useState<'Gollo' | 'EPA' | 'Ambas'>('Gollo');
  const [category, setCategory] = useState<'refrigeracion' | 'lavado' | 'cocina' | 'pantallas' | 'pequenos'>('refrigeracion');
  const [priceStr, setPriceStr] = useState('299000');
  const [originalPriceStr, setOriginalPriceStr] = useState('349000');
  const [installmentStr, setInstallmentStr] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80');
  const [description, setDescription] = useState('');
  const [badge, setBadge] = useState('Nueva Oferta');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPrice = Number(priceStr.replace(/[^0-9]/g, '')) || 100000;
    const originalPrice = Number(originalPriceStr.replace(/[^0-9]/g, '')) || currentPrice;
    
    // Auto calculate quincenal if empty: 24 months = 48 quincenas with small factor
    const calculatedQuincenal = installmentStr 
      ? Number(installmentStr.replace(/[^0-9]/g, ''))
      : Math.round((currentPrice * 1.35) / 48);

    const discountPercent = originalPrice > currentPrice 
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) 
      : 0;

    const newProduct: Product = {
      id: `custom-${Date.now()}`,
      name: name || 'Electrodoméstico de Oferta',
      brand,
      store,
      category,
      currentPrice,
      originalPrice,
      cashDiscountPercent: discountPercent > 0 ? discountPercent : undefined,
      installmentQuincenal: calculatedQuincenal,
      installmentMonths: 24,
      image: imageUrl,
      badge: badge || undefined,
      warrantyMonths: 12,
      sku: `CR-${Math.floor(1000 + Math.random() * 9000)}`,
      specs: {
        capacity: 'Estándar para el hogar costarricense',
        voltage: '120V / 60Hz estándar Costa Rica',
        details: [
          'Garantía oficial directa en centros de servicio autorizados',
          'Factura timbrada de compra para reclamos o créditos',
          'Entrega coordinada puerta a puerta',
        ],
      },
      description: description || `Producto seleccionado de ${store} Costa Rica con facilidades de pago y entrega a domicilio.`,
    };

    onAddProduct(newProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-200 my-auto relative animate-in zoom-in-95 duration-200">
        <div className="bg-[#0F4C81] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-400 text-gray-900">
              <Plus className="w-4 h-4 font-black" />
            </span>
            <div>
              <h3 className="text-lg font-black font-['Montserrat',sans-serif]">
                Agregar Producto de EPA o Gollo
              </h3>
              <p className="text-xs text-blue-200">
                Añade ofertas encontradas en las tiendas a tu catálogo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Nombre del Electrodoméstico</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Refrigeradora LG 14 Pies No Frost"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Tienda en Costa Rica</label>
              <select
                value={store}
                onChange={(e) => setStore(e.target.value as any)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
              >
                <option value="Gollo">Gollo Costa Rica</option>
                <option value="EPA">EPA Ferretería</option>
                <option value="Ambas">Disponible en Ambas</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
              >
                <option value="refrigeracion">Refrigeración</option>
                <option value="lavado">Lavado y Secado</option>
                <option value="cocina">Cocinas y Hornos</option>
                <option value="pantallas">Pantallas y TV</option>
                <option value="pequenos">Pequeños Electrodomésticos</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Marca</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Samsung, LG, Whirlpool, Mabe..."
                className="w-full text-sm px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">Etiqueta Promocional</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Ej. Oferta Flash, -20% OFF..."
                className="w-full text-sm px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Precio Actual (Colones ₡)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-400 font-bold">₡</span>
                <input
                  type="text"
                  required
                  value={priceStr}
                  onChange={(e) => setPriceStr(e.target.value)}
                  placeholder="299000"
                  className="w-full text-sm pl-7 pr-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] font-bold text-[#0F4C81]"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Precio Normal / Lista (₡)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-400 font-bold">₡</span>
                <input
                  type="text"
                  value={originalPriceStr}
                  onChange={(e) => setOriginalPriceStr(e.target.value)}
                  placeholder="349000"
                  className="w-full text-sm pl-7 pr-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">URL de la Foto</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full text-xs font-mono px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Descripción Breve</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles para presentarle al cliente en su puerta..."
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
            />
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#0F4C81] hover:bg-[#082a47] text-white font-bold cursor-pointer transition shadow-md"
            >
              Guardar en Catálogo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
