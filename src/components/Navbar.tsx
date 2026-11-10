import React from 'react';
import { CardProfile, ColorPalette, AdvisorSettings } from '../types';
import { 
  ShoppingBag, 
  CreditCard, 
  Calculator, 
  Smartphone, 
  Phone, 
  MessageCircle,
  LayoutDashboard
} from 'lucide-react';

interface NavbarProps {
  currentView: 'catalog' | 'card-studio' | 'panel';
  onSelectView: (view: 'catalog' | 'card-studio' | 'panel') => void;
  profile: CardProfile;
  activePalette: ColorPalette;
  advisorSettings: AdvisorSettings;
  onOpenCommissionModal: () => void;
  onOpenDigitalCard: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  profile,
  activePalette,
  advisorSettings,
  onOpenCommissionModal,
  onOpenDigitalCard,
}) => {
  return (
    <header className="bg-white border-b border-[#DFE3E8] sticky top-0 z-40 no-print">
      {/* Top micro bar for Costa Rica retail trust */}
      <div className="bg-[#0F4C81] text-white text-[11px] py-1 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold flex items-center gap-1">
              🇨🇷 Catálogo Oficial Costa Rica
            </span>
            <span className="text-blue-200 hidden sm:inline">•</span>
            <span className="text-blue-100 hidden sm:inline">
              Electrodomésticos con garantía de Gollo & EPA
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`https://wa.me/506${profile.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300 hover:text-white font-bold flex items-center gap-1 transition"
            >
              <Phone className="w-3 h-3" />
              WhatsApp: +506 {profile.phone}
            </a>
            <button
              onClick={onOpenCommissionModal}
              className="text-white hover:text-amber-300 font-semibold underline decoration-dotted cursor-pointer flex items-center gap-1"
            >
              <Calculator className="w-3 h-3 text-amber-300" />
              {advisorSettings.commissionRate}% Margen ({advisorSettings.advisorModeEnabled ? 'Visible' : 'Oculto'})
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand identity without personal names */}
        <div 
          onClick={() => onSelectView('catalog')}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-base shadow-sm"
            style={{ backgroundColor: activePalette.primary }}
          >
            EH
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base sm:text-lg font-['Montserrat',sans-serif] text-gray-900 tracking-tight">
                {profile.brandName}
              </span>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                CR
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium line-clamp-1">
              {profile.serviceTagline}
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => onSelectView('catalog')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer ${
              currentView === 'catalog'
                ? 'bg-white text-[#0F4C81] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Catálogo</span>
            <span className="sm:hidden">Productos</span>
          </button>

          <button
            onClick={() => onSelectView('panel')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer ${
              currentView === 'panel'
                ? 'bg-white text-[#0F4C81] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Panel administrativo del catálogo"
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-600" />
            <span className="hidden lg:inline">Panel</span>
            <span className="lg:hidden">Métricas</span>
          </button>

          <button
            onClick={() => onSelectView('card-studio')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer ${
              currentView === 'card-studio'
                ? 'bg-white text-[#0F4C81] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CreditCard className="w-4 h-4 text-[#EAB308]" />
            <span className="hidden sm:inline">Diseñador de Tarjeta con QR</span>
            <span className="sm:hidden">Tarjetas</span>
          </button>
        </nav>

        {/* Actions on right */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenDigitalCard}
            className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 transition cursor-pointer"
            title="Mostrar tarjeta digital en pantalla para que el cliente la escanee"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#0F4C81]" />
            Tarjeta Digital
          </button>

          <a
            href={`https://wa.me/506${profile.phone.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white transition shadow-xs"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white text-[#25D366]" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </div>
      </div>
    </header>
  );
};
