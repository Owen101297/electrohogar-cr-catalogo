import React from 'react';
import { CardProfile, ColorPalette } from '../types';
import { Phone, MessageCircle, ShoppingBag } from 'lucide-react';

interface PublicHeaderProps {
  profile: CardProfile;
  activePalette: ColorPalette;
}

/**
 * Encabezado del catálogo público: marca y contacto.
 *
 * Deliberadamente no incluye pestañas de navegación, acceso a herramientas ni
 * nada que conduzca al modo asesor: es lo que ve el cliente.
 */
export const PublicHeader: React.FC<PublicHeaderProps> = ({
  profile,
  activePalette,
}) => {
  return (
    <header className="bg-white border-b border-[#DFE3E8] sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Marca */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-white text-base shadow-sm shrink-0"
            style={{ backgroundColor: activePalette.primary }}
          >
            EH
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm sm:text-base font-['Montserrat',sans-serif] text-gray-900 tracking-tight truncate">
                {profile.brandName}
              </span>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded shrink-0">
                CR
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium line-clamp-1">
              {profile.serviceTagline}
            </p>
          </div>
        </div>

        {/* Contacto */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={`tel:+506${profile.phone.replace(/[^0-9]/g, '')}`}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 transition"
          >
            <Phone className="w-3.5 h-3.5 text-[#0F4C81]" />
            +506 {profile.phone}
          </a>

          <a
            href={`https://wa.me/506${profile.phone.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white transition shadow-xs"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white text-[#25D366]" />
            <span className="hidden xs:inline sm:inline">WhatsApp</span>
            <span className="sm:hidden">+506</span>
          </a>
        </div>
      </div>

      {/* Banda de confianza */}
      <div className="bg-[#0F4C81] text-white text-[11px] py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-bold flex items-center gap-1">
            <ShoppingBag className="w-3 h-3" />
            Catálogo Oficial Costa Rica 🇨🇷
          </span>
          <span className="text-blue-200 hidden sm:inline">•</span>
          <span className="text-blue-100 hidden sm:inline">
            Electrodomésticos con garantía de Gollo &amp; EPA
          </span>
        </div>
      </div>
    </header>
  );
};
