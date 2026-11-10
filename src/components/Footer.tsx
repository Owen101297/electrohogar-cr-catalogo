import React from 'react';
import { CardProfile, ColorPalette } from '../types';
import { ShieldCheck, Truck, Phone, MessageCircle, ExternalLink, MapPin } from 'lucide-react';

interface FooterProps {
  profile: CardProfile;
  activePalette: ColorPalette;
  /**
   * `true` en la pantalla del asesor (muestra el acceso al diseñador de
   * tarjetas); `false` en el catálogo público (sin ninguna pista de
   * herramientas internas).
   */
  isAdvisor: boolean;
  onOpenCardStudio?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  profile,
  activePalette,
  isAdvisor,
  onOpenCardStudio,
}) => {
  return (
    <footer className="bg-[#121C27] text-gray-300 pt-12 pb-8 border-t border-gray-800 no-print mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-xs"
                style={{ backgroundColor: activePalette.secondary, color: activePalette.primaryDark }}
              >
                EH
              </span>
              <span className="font-extrabold text-white text-base font-['Montserrat',sans-serif]">
                {profile.brandName}
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Catálogo de electrodomésticos con precios en Colones ₡ y atención personalizada directa por WhatsApp. Todos los productos cuentan con respaldo y garantía oficial de Gollo y EPA en Costa Rica.
            </p>
            <div className="pt-1">
              <span className="text-[11px] text-amber-400 font-bold block">
                Atención y Pedidos:
              </span>
              <span className="text-sm font-black text-white">+506 {profile.phone}</span>
            </div>
          </div>

          {/* Col 2: Affiliations and stores */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Tiendas de Referencia en Costa Rica
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <a
                  href="https://www.gollo.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-300 transition flex items-center gap-1"
                >
                  Gollo Costa Rica <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://cr.epaenlinea.com/es-cr/collections/electrodomesticos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-300 transition flex items-center gap-1"
                >
                  EPA Ferreterías Costa Rica <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li className="text-[11px] text-gray-500 pt-1">
                Garantías tramitadas en centros de servicio técnico autorizados en todo el país.
              </li>
            </ul>
          </div>

          {/* Col 3: Coverage */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Cobertura y Entrega
            </h4>
            <div className="text-xs text-gray-400 space-y-1">
              <p className="flex items-center gap-1 text-gray-300">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{profile.coverage}</span>
              </p>
              <p className="text-[11px] text-gray-500">
                San José • Alajuela • Heredia • Cartago • Puntarenas • Guanacaste • Limón
              </p>
              {isAdvisor && onOpenCardStudio && (
                <div className="pt-2">
                  <button
                    onClick={onOpenCardStudio}
                    className="text-xs text-amber-400 hover:underline font-semibold cursor-pointer"
                  >
                    Ver Tarjeta Corporativa con QR &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Col 4: Direct WhatsApp */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Pedidos por WhatsApp
            </h4>
            <div className="space-y-2">
              <a
                href={`https://wa.me/506${profile.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition"
              >
                <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
                WhatsApp: +506 {profile.phone}
              </a>
              <p className="text-[11px] text-gray-500">
                Envía cualquier producto del catálogo para confirmar inventario y entrega a domicilio.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-2">
          <p>© {new Date().getFullYear()} {profile.brandName} • Costa Rica. Todos los derechos reservados.</p>
          <p>Precios expresados en Colones de Costa Rica (₡). Factura y garantía oficial.</p>
        </div>
      </div>
    </footer>
  );
};
