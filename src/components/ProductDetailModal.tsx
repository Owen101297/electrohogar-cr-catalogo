import React, { useState } from 'react';
import { Product, CardProfile, ColorPalette, AdvisorSettings } from '../types';
import { formatColones, generateWhatsAppLink, calculateCommission } from '../utils/formatters';
import { 
  X, 
  MessageCircle, 
  ShieldCheck, 
  Truck, 
  CheckCircle, 
  CreditCard,
  Building2,
  Info,
  DollarSign,
  Pencil,
  Trash2
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  /**
   * `true` en la pantalla del asesor (permite editar y eliminar);
   * `false` en el catálogo público (solo consulta y contacto).
   */
  isAdvisor: boolean;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
  profile: CardProfile;
  activePalette: ColorPalette;
  advisorSettings: AdvisorSettings;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  isAdvisor,
  onEditProduct,
  onDeleteProduct,
  profile,
  activePalette,
  advisorSettings,
}) => {
  const [paymentMode, setPaymentMode] = useState<'contado' | 'quincenal' | 'mensual'>('quincenal');

  if (!product) return null;

  // Calculate monthly installment estimate
  const monthlyInstallment = Math.round(product.installmentQuincenal * 2);
  const advisorCommission = calculateCommission(product.currentPrice, advisorSettings.commissionRate);

  // El plazo y la cuota mostrados son los reales del producto (FR-011).
  const termMonths = product.installmentMonths;

  // Monto que se envía a WhatsApp según la modalidad elegida.
  const amountForWhatsApp =
    paymentMode === 'quincenal'
      ? product.installmentQuincenal
      : paymentMode === 'mensual'
        ? monthlyInstallment
        : product.currentPrice;

  // El enlace de WhatsApp lleva el monto según la modalidad elegida:
  // contado ⇒ precio de contado sin cuota; quincenal/mensual ⇒ el precio de
  // contado más la cuota correspondiente.
  const installmentForWhatsApp =
    paymentMode === 'contado' ? undefined : amountForWhatsApp;

  const whatsAppUrl = generateWhatsAppLink(
    profile.phone,
    product.name,
    product.currentPrice,
    installmentForWhatsApp,
    product.store,
    product.sku
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-gray-200 my-auto relative animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-md flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* Product Image Column */}
          <div className="md:col-span-5 bg-gray-50 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-200 relative">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#0F4C81] text-white">
                {product.brand}
              </span>
              <span
                className="px-2.5 py-1 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: product.store === 'Gollo' ? '#FEE2E2' : product.store === 'EPA' ? '#FEF3C7' : '#E0E7FF',
                  color: product.store === 'Gollo' ? '#991B1B' : product.store === 'EPA' ? '#92400E' : '#3730A3',
                }}
              >
                Tienda: {product.store} Costa Rica
              </span>
              {product.badge && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400 text-gray-900">
                  {product.badge}
                </span>
              )}
            </div>

            <div className="my-auto flex items-center justify-center p-2">
              <img
                src={product.image}
                alt={product.name}
                className="max-h-64 sm:max-h-72 object-contain rounded-xl drop-shadow-md hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Advisor commission box when advisor mode is on */}
            {advisorSettings.advisorModeEnabled && (
              <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                    Ganancia ({advisorSettings.commissionRate}%):
                  </span>
                  <span className="text-sm font-extrabold text-amber-800">
                    {formatColones(advisorCommission)}
                  </span>
                </div>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Comisión estimada al cerrar esta venta.
                </p>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Garantía: {product.warrantyMonths} meses en CR
              </span>
              <span className="text-gray-400 font-mono text-[10px]">
                SKU: {product.sku}
              </span>
            </div>
          </div>

          {/* Product Details Column */}
          <div className="md:col-span-7 p-6 sm:p-7 flex flex-col justify-between space-y-5">
            <div>
              <p className="text-xs uppercase font-extrabold tracking-wider text-gray-400">
                Línea Blanca y Hogar • Costa Rica
              </p>
              <h2 className="text-xl sm:text-2xl font-black font-['Montserrat',sans-serif] text-gray-900 leading-snug mt-1">
                {product.name}
              </h2>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Pricing and Installment Simulator */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500 block">Precio de Contado</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black font-['Montserrat',sans-serif] text-[#0F4C81]">
                      {formatColones(product.currentPrice)}
                    </span>
                    {product.originalPrice > product.currentPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatColones(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {product.cashDiscountPercent && (
                  <span className="bg-red-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg">
                    -{product.cashDiscountPercent}% Descuento
                  </span>
                )}
              </div>

              {/* Payment Mode Segmented Control */}
              <div className="pt-2 border-t border-gray-200">
                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-1.5">
                  Modalidad de Pago
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-200/70 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setPaymentMode('quincenal')}
                    className={`py-1.5 px-2 rounded-lg transition cursor-pointer text-center ${
                      paymentMode === 'quincenal'
                        ? 'bg-white text-[#0F4C81] shadow-xs font-bold'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Cuota Quincenal
                  </button>
                  <button
                    onClick={() => setPaymentMode('mensual')}
                    className={`py-1.5 px-2 rounded-lg transition cursor-pointer text-center ${
                      paymentMode === 'mensual'
                        ? 'bg-white text-[#0F4C81] shadow-xs font-bold'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Cuota Mensual
                  </button>
                  <button
                    onClick={() => setPaymentMode('contado')}
                    className={`py-1.5 px-2 rounded-lg transition cursor-pointer text-center ${
                      paymentMode === 'contado'
                        ? 'bg-white text-[#0F4C81] shadow-xs font-bold'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Contado Directo
                  </button>
                </div>
              </div>

              {/* Installment Highlight */}
              {paymentMode !== 'contado' && (
                <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[11px] font-medium text-blue-900 block">
                      {paymentMode === 'quincenal' ? 'Cuota estimada por quincena:' : 'Cuota estimada por mes:'}
                    </span>
                    <span className="text-lg font-black font-['Montserrat',sans-serif] text-[#0F4C81]">
                      {paymentMode === 'quincenal'
                        ? `${formatColones(product.installmentQuincenal)} / quincena`
                        : `${formatColones(monthlyInstallment)} / mes`}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium">
                    A {termMonths} {termMonths === 1 ? 'mes' : 'meses'} plazo
                  </span>
                </div>
              )}
            </div>

            {/* Technical Specifications */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#0F4C81]" />
                Especificaciones Técnicas
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {product.specs.capacity && (
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <span className="text-gray-500 block text-[10px]">Capacidad</span>
                    <span className="font-semibold text-gray-800">{product.specs.capacity}</span>
                  </div>
                )}
                {product.specs.voltage && (
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <span className="text-gray-500 block text-[10px]">Voltaje</span>
                    <span className="font-semibold text-gray-800">{product.specs.voltage}</span>
                  </div>
                )}
                {product.specs.dimensions && (
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <span className="text-gray-500 block text-[10px]">Dimensiones</span>
                    <span className="font-semibold text-gray-800">{product.specs.dimensions}</span>
                  </div>
                )}
                {product.specs.energyRating && (
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <span className="text-gray-500 block text-[10px]">Eficiencia</span>
                    <span className="font-semibold text-gray-800">{product.specs.energyRating}</span>
                  </div>
                )}
              </div>

              {/* Key Features Bullet List */}
              <ul className="space-y-1 text-xs text-gray-600 pt-1">
                {product.specs.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-[11px] text-gray-600">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#0F4C81]" />
                <span>Entrega coordinada a domicilio</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Garantía oficial de {product.store}</span>
              </div>
            </div>

            {/* Direct WhatsApp Redirection CTA */}
            <div className="pt-2">
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold py-3.5 px-5 rounded-2xl shadow-lg hover:shadow-xl transition-all text-sm cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
                Pedir este producto por WhatsApp
              </a>
              <p className="text-[11px] text-center text-gray-400 mt-1.5">
                Se enviará un mensaje pre-llenado con este producto a WhatsApp: +506 {profile.phone}
              </p>
            </div>

            {/* Gestión del producto: editar y eliminar (solo modo asesor) */}
            {isAdvisor && onEditProduct && onDeleteProduct && (
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => onEditProduct(product)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#0F4C81]/30 bg-blue-50/60 hover:bg-blue-100 text-[#0F4C81] font-bold text-xs transition cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Editar producto
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteProduct(product)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-red-200 bg-red-50/60 hover:bg-red-100 text-red-700 font-bold text-xs transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar producto
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
