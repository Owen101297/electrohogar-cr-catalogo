import React, { useState, useMemo } from 'react';
import { Product, CardProfile, ColorPalette, AdvisorSettings } from '../types';
import { CATEGORIES } from '../data/initialProducts';
import { formatColones, generateWhatsAppLink, calculateCommission } from '../utils/formatters';
import { PRODUCT_COPY } from '../utils/products';
import { 
  Search, 
  MessageCircle, 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  Sparkles, 
  DollarSign, 
  Smartphone, 
  Eye,
  PlusCircle,
  HelpCircle,
  ArrowUpRight,
  CheckCircle2,
  ShoppingBag
} from 'lucide-react';

interface CatalogViewProps {
  products: Product[];
  profile: CardProfile;
  activePalette: ColorPalette;
  advisorSettings: AdvisorSettings;
  onSelectProduct: (product: Product) => void;
  onOpenCardStudio: () => void;
  onOpenDigitalCard: () => void;
  onOpenAddProduct: () => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  profile,
  activePalette,
  advisorSettings,
  onSelectProduct,
  onOpenCardStudio,
  onOpenDigitalCard,
  onOpenAddProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [selectedStore, setSelectedStore] = useState<'Todas' | 'Gollo' | 'EPA'>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<'recommended' | 'price-asc' | 'price-desc' | 'discount'>('recommended');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'todas' && p.category !== selectedCategory) {
        return false;
      }

      // Store filter
      if (selectedStore !== 'Todas') {
        if (p.store !== selectedStore && p.store !== 'Ambas') {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchBrand = p.brand.toLowerCase().includes(query);
        const matchSku = p.sku.toLowerCase().includes(query);
        if (!matchName && !matchBrand && !matchSku) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortOption === 'price-asc') return a.currentPrice - b.currentPrice;
      if (sortOption === 'price-desc') return b.currentPrice - a.currentPrice;
      if (sortOption === 'discount') return (b.cashDiscountPercent || 0) - (a.cashDiscountPercent || 0);
      return 0; // recommended
    });
  }, [products, selectedCategory, selectedStore, searchQuery, sortOption]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      {/* Brand Hero & Catalog Announcement */}
      <div 
        className="rounded-3xl p-5 sm:p-8 text-white shadow-lg relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${activePalette.primary} 0%, ${activePalette.primaryDark} 100%)`,
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 border border-white/20 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Catálogo de Electrodomésticos • Costa Rica 🇨🇷
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-['Montserrat',sans-serif] tracking-tight">
              {profile.brandName}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium">
              {profile.serviceTagline}
            </p>
            <p className="text-xs text-blue-200/90 leading-relaxed pt-1">
              Selecciona cualquier electrodoméstico y presiona <strong>"Pedir por WhatsApp"</strong> para enviarnos el producto exacto con su precio en Colones ₡ y coordinar entrega inmediata a tu domicilio.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              href={`https://wa.me/506${profile.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                '¡Hola! Estoy viendo el catálogo web de electrodomésticos y me gustaría consultar disponibilidad de productos.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
              WhatsApp: +506 {profile.phone}
            </a>

            <button
              onClick={onOpenCardStudio}
              className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl border border-white/20 transition cursor-pointer"
            >
              Configurar Tarjeta / QR
            </button>
          </div>
        </div>

        {/* Benefits Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6 pt-5 border-t border-white/15 text-xs text-blue-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Garantía oficial de fábrica</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-300 shrink-0" />
            <span>Entrega a Domicilio en Costa Rica</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Cuotas Quincenales Accesibles</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
            <span>Respaldo Gollo y EPA</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Station */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#DFE3E8] shadow-xs space-y-4">
        {/* Top Controls: Search + Store Filter */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, refrigeradora, lavadora, cocina, televisor..."
              className="w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent bg-gray-50/60 text-gray-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Store Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl text-xs font-semibold shrink-0">
            <button
              onClick={() => setSelectedStore('Todas')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                selectedStore === 'Todas'
                  ? 'bg-white text-[#0F4C81] shadow-xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Todas las Tiendas
            </button>
            <button
              onClick={() => setSelectedStore('Gollo')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                selectedStore === 'Gollo'
                  ? 'bg-red-600 text-white shadow-xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-300" />
              Gollo Costa Rica
            </button>
            <button
              onClick={() => setSelectedStore('EPA')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                selectedStore === 'EPA'
                  ? 'bg-amber-500 text-gray-950 shadow-xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-800" />
              EPA Ferretería
            </button>
          </div>

          {/* Add product button */}
          <button
            onClick={onOpenAddProduct}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-50 text-[#0F4C81] hover:bg-blue-100 font-bold text-xs transition cursor-pointer shrink-0 border border-blue-200"
            title="Agregar producto nuevo de Gollo o EPA"
          >
            <PlusCircle className="w-4 h-4" />
            + Agregar Producto
          </button>
        </div>

        {/* Category Horizontal Filter Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#0F4C81] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Status Count and Sort Options */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
          <span>
            Mostrando <strong>{filteredProducts.length}</strong> electrodomésticos en catálogo
          </span>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">Ordenar:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="text-xs bg-transparent border-0 font-semibold text-gray-700 focus:outline-none cursor-pointer"
            >
              <option value="recommended">Destacados</option>
              <option value="discount">Mayor Descuento</option>
              <option value="price-asc">Menor Precio</option>
              <option value="price-desc">Mayor Precio</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        products.length === 0 ? (
          /* Catálogo completamente vacío: la asesora aún no capturó productos */
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-3">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-800">
              {PRODUCT_COPY.emptyCatalog.title}
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              {PRODUCT_COPY.emptyCatalog.body}
            </p>
            <button
              onClick={onOpenAddProduct}
              className="px-4 py-2 bg-[#0F4C81] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              {PRODUCT_COPY.emptyCatalog.action}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-3">
            <HelpCircle className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-800">
              No se encontraron productos con estos criterios
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Prueba buscando con otro término o seleccionando "Todas las Tiendas".
            </p>
            <button
              onClick={() => {
                setSelectedCategory('todas');
                setSelectedStore('Todas');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-[#0F4C81] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Ver Todos los Productos
            </button>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredProducts.map((product) => {
            // Direct WhatsApp redirect URL formatted specifically for this product
            const whatsAppOrderUrl = generateWhatsAppLink(
              profile.phone,
              product.name,
              product.currentPrice,
              product.installmentQuincenal,
              product.store,
              product.sku
            );

            const commissionAmount = calculateCommission(
              product.currentPrice,
              advisorSettings.commissionRate
            );

            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-[#DFE3E8] hover:border-[#0F4C81]/50 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                {/* Photo Container */}
                <div 
                  onClick={() => onSelectProduct(product)}
                  className="p-4 bg-white relative cursor-pointer border-b border-gray-100 flex items-center justify-center min-h-[200px]"
                >
                  {/* Store Badge */}
                  <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg shadow-xs uppercase tracking-wide ${
                        product.store === 'Gollo'
                          ? 'bg-red-600 text-white'
                          : product.store === 'EPA'
                          ? 'bg-amber-500 text-gray-950 font-black'
                          : 'bg-indigo-700 text-white'
                      }`}
                    >
                      {product.store} CR
                    </span>
                    {product.cashDiscountPercent && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-amber-400 text-gray-900 shadow-xs">
                        -{product.cashDiscountPercent}%
                      </span>
                    )}
                  </div>

                  {/* Warranty pill */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-gray-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      {product.warrantyMonths}m Gar.
                    </span>
                  </div>

                  {/* Product photo */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-h-44 max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                {/* Product Card Content */}
                <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                      <span className="font-bold text-[#0F4C81]">{product.brand}</span>
                      <span className="font-mono text-[10px] text-gray-400">{product.sku}</span>
                    </div>

                    <h3 
                      onClick={() => onSelectProduct(product)}
                      className="text-xs sm:text-sm font-bold text-gray-900 font-['Montserrat',sans-serif] line-clamp-2 hover:text-[#0F4C81] cursor-pointer"
                    >
                      {product.name}
                    </h3>
                  </div>

                  {/* Pricing Details */}
                  <div className="pt-2 border-t border-gray-100 space-y-1.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] text-gray-500 font-medium">Contado:</span>
                      <div className="text-right">
                        <span className="text-base sm:text-lg font-black text-[#0F4C81] font-['Montserrat',sans-serif]">
                          {formatColones(product.currentPrice)}
                        </span>
                        {product.originalPrice > product.currentPrice && (
                          <span className="text-[11px] text-gray-400 line-through block -mt-1">
                            {formatColones(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quincenal Installment Badge */}
                    <div className="bg-blue-50/70 p-2 rounded-xl border border-blue-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-blue-900 uppercase">
                        Cuotas desde:
                      </span>
                      <span className="text-xs font-extrabold text-[#0F4C81] font-['Montserrat',sans-serif]">
                        {formatColones(product.installmentQuincenal)} / quincena
                      </span>
                    </div>

                    {/* Commission Badge if enabled */}
                    {advisorSettings.advisorModeEnabled && (
                      <div className="bg-amber-50 p-1.5 rounded-lg border border-amber-300 flex items-center justify-between text-[11px]">
                        <span className="text-amber-800 font-bold flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-amber-600" />
                          Tu ganancia:
                        </span>
                        <span className="font-black text-amber-900">
                          +{formatColones(commissionAmount)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Direct Redirection to WhatsApp & Details */}
                  <div className="space-y-1.5 pt-1">
                    <a
                      href={whatsAppOrderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
                      title="Pedir este electrodoméstico directamente por WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
                      Pedir por WhatsApp
                    </a>

                    <button
                      onClick={() => onSelectProduct(product)}
                      className="w-full flex items-center justify-center gap-1 py-1.5 text-[11px] text-gray-600 hover:text-gray-900 font-semibold transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Ver Ficha Técnica y Cuotas
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Field Selling WhatsApp Bar for mobile quick consultation */}
      <div className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
        <a
          href={`https://wa.me/506${profile.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
            `¡Hola! Estoy viendo el catálogo de electrodomésticos y me gustaría consultar disponibilidad de entrega a domicilio.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold px-4 py-3 rounded-full shadow-2xl hover:scale-105 transition-all text-sm border-2 border-white cursor-pointer"
        >
          <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
          <span>Consultar por WhatsApp</span>
        </a>
      </div>
    </div>
  );
};
