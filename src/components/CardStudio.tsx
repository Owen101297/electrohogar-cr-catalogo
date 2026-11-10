import React, { useEffect, useState } from 'react';
import { CardProfile, ColorPalette } from '../types';
import { PALETTES } from '../data/palettes';
import { QRCodeRenderer } from './QRCodeRenderer';
import { 
  Printer, 
  Smartphone, 
  Sparkles, 
  Phone, 
  RotateCw,
  QrCode,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Palette as PaletteIcon,
  Layers,
  ArrowRight
} from 'lucide-react';

interface CardStudioProps {
  profile: CardProfile;
  onUpdateProfile: (profile: CardProfile) => void;
  activePalette: ColorPalette;
  catalogUrl: string;
  onOpenDigitalCard: () => void;
}

export const CardStudio: React.FC<CardStudioProps> = ({
  profile,
  onUpdateProfile,
  activePalette,
  catalogUrl,
  onOpenDigitalCard,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [qrUrlCustom, setQrUrlCustom] = useState(catalogUrl);

  // El destino del QR es siempre la URL pública del catálogo. Si cambia, la
  // vista previa se actualiza sola.
  useEffect(() => {
    setQrUrlCustom(catalogUrl);
  }, [catalogUrl]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-[#121c27] via-[#0F4C81] to-[#121c27] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <QrCode className="w-72 h-72" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 border border-white/20 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Diseño Profesional & Minimalista (Sin Nombres Personales)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-['Montserrat',sans-serif] tracking-tight text-white mb-2">
            Tarjeta Corporativa con Código QR
          </h1>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            Tarjeta de presentación corporativa, limpia y sin nombres personales, diseñada exclusivamente para tu cliente y marca. El cliente en la calle o puerta a puerta escanea el código QR para entrar al catálogo web de productos de <strong>Gollo</strong> y <strong>EPA</strong> en Costa Rica, y te escribe directamente por WhatsApp para coordinar la compra.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 bg-[#EAB308] hover:bg-[#ca9a07] text-[#121c27] font-extrabold px-6 py-3.5 rounded-xl shadow-md transition-all text-sm cursor-pointer"
            >
              <Printer className="w-5 h-5" />
              Imprimir Hoja de Tarjetas (8x)
            </button>
            <button
              onClick={onOpenDigitalCard}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-xl border border-white/20 transition-all text-sm cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              Ver Tarjeta Digital
            </button>
          </div>

          {/* Instrucciones de impresión: la tarjeta queda lista para imprenta o para imprimir en casa */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-blue-200/90">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Papel A4 horizontal
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Márgenes: ninguno
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Activar gráficos de fondo
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              8 tarjetas con marcas de corte
            </span>
          </div>
        </div>
      </div>

      {/* Editor & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#DFE3E8] shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-base font-bold font-['Montserrat',sans-serif] text-gray-900 flex items-center gap-2">
                <PaletteIcon className="w-4 h-4 text-[#0F4C81]" />
                Personalización de Marca
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Estilo corporativo minimalista</p>
            </div>
            <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-bold border border-emerald-200">
              Sin nombres de personas
            </span>
          </div>

          {/* Palette Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Paleta de Color Corporativa
            </label>
            <div className="space-y-2">
              {PALETTES.map((palette) => {
                const isSelected = profile.paletteId === palette.id;
                return (
                  <button
                    key={palette.id}
                    onClick={() => onUpdateProfile({ ...profile, paletteId: palette.id })}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-[#0F4C81] bg-blue-50/40 ring-2 ring-[#0F4C81]/20'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-900">{palette.name}</p>
                      <p className="text-[11px] text-gray-500 line-clamp-1">{palette.description}</p>
                    </div>
                    <div className="flex items-center gap-1.5 ml-2 shrink-0">
                      <span
                        className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: palette.primary }}
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: palette.secondary }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Business & Brand Details */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Datos Comerciales de la Tarjeta
            </label>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Nombre de la Empresa / Marca
              </label>
              <input
                type="text"
                value={profile.brandName}
                onChange={(e) => onUpdateProfile({ ...profile, brandName: e.target.value })}
                placeholder="Ej. ElectroHogar Costa Rica"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] font-semibold text-gray-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Subtítulo o Rubro del Servicio
              </label>
              <input
                type="text"
                value={profile.serviceTagline}
                onChange={(e) => onUpdateProfile({ ...profile, serviceTagline: e.target.value })}
                placeholder="Ej. Catálogo Oficial & Venta de Electrodomésticos"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                WhatsApp Oficial (Costa Rica +506)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-gray-600 font-bold">🇨🇷 +506</span>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => onUpdateProfile({ ...profile, phone: e.target.value })}
                  placeholder="8888-1234"
                  className="w-full text-sm pl-20 pr-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] font-bold text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Lema o Promesa Comercial
              </label>
              <textarea
                rows={2}
                value={profile.slogan}
                onChange={(e) => onUpdateProfile({ ...profile, slogan: e.target.value })}
                placeholder="Ej. Los mejores precios de Gollo y EPA en la puerta de su hogar con garantía oficial"
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Zona de Cobertura
              </label>
              <input
                type="text"
                value={profile.coverage}
                onChange={(e) => onUpdateProfile({ ...profile, coverage: e.target.value })}
                placeholder="Ej. Gran Área Metropolitana y envíos a todo Costa Rica"
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Enlace web del Catálogo (Destino del QR)
              </label>
              <input
                type="text"
                value={qrUrlCustom}
                onChange={(e) => setQrUrlCustom(e.target.value)}
                placeholder="https://ais-..."
                className="w-full text-xs font-mono px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Live Minimalist Preview Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#DFE3E8] shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4 mb-6">
              <div>
                <h2 className="text-base font-bold font-['Montserrat',sans-serif] text-gray-900">
                  Vista Previa Minimalista (3.5" × 2" Estándar)
                </h2>
                <p className="text-xs text-gray-500">
                  Elegante, sin nombres personales, lista para imprenta o corte directo.
                </p>
              </div>

              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 transition cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                {isFlipped ? 'Ver Frente' : 'Ver Reverso (QR)'}
              </button>
            </div>

            {/* Realistic Physical Card Canvas */}
            <div className="flex flex-col items-center justify-center p-6 sm:p-10 bg-[#EDF0F4] rounded-2xl border border-dashed border-gray-300">
              <div className="w-full max-w-[460px] aspect-[1.75/1] rounded-2xl shadow-xl relative overflow-hidden transition-all duration-300 border border-gray-300/80">
                {!isFlipped ? (
                  /* MINIMALIST FRONT: Clean, Brand-Focused, No Personal Names */
                  <div
                    className="w-full h-full p-6 sm:p-7 flex flex-col justify-between text-white relative"
                    style={{
                      background: `linear-gradient(135deg, ${activePalette.primary} 0%, ${activePalette.primaryDark} 100%)`,
                    }}
                  >
                    {/* Top minimal line */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1.5"
                      style={{ backgroundColor: activePalette.secondary }}
                    />

                    {/* Top Row: Store references & Country */}
                    <div className="flex items-center justify-between text-[10px] tracking-widest uppercase font-bold text-gray-300">
                      <span>Costa Rica 🇨🇷</span>
                      <span className="text-amber-300">Gollo • EPA Oficial</span>
                    </div>

                    {/* Center Brand Block */}
                    <div className="my-auto py-1">
                      <div className="flex items-center gap-3 mb-1.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shadow-md"
                          style={{
                            backgroundColor: activePalette.secondary,
                            color: activePalette.primaryDark,
                          }}
                        >
                          EH
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black font-['Montserrat',sans-serif] tracking-tight text-white">
                          {profile.brandName}
                        </h3>
                      </div>
                      <p className="text-xs font-semibold text-blue-200 tracking-wide uppercase text-[10px]">
                        {profile.serviceTagline}
                      </p>
                      <p className="text-xs text-blue-100/90 italic mt-2 line-clamp-1 font-light">
                        "{profile.slogan}"
                      </p>
                    </div>

                    {/* Bottom Row: Contact & Trust */}
                    <div className="pt-2 border-t border-white/15 flex items-end justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                          <Phone className="w-3.5 h-3.5" />
                          <span>WhatsApp: +506 {profile.phone}</span>
                        </div>
                        <p className="text-[10px] text-blue-200 line-clamp-1">
                          {profile.coverage}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-300 block">
                          Garantía de Fábrica
                        </span>
                        <span className="text-[8px] text-gray-300">
                          Entrega a Domicilio
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* MINIMALIST BACK: Large Clean QR Code with Direct WhatsApp Instructions */
                  <div className="w-full h-full p-5 sm:p-6 flex flex-col justify-between bg-white text-gray-900 relative">
                    {/* Top minimal color strip */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1.5"
                      style={{ backgroundColor: activePalette.primary }}
                    />

                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                      <div>
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#0F4C81] block">
                          Catálogo Digital 24/7
                        </span>
                        <h4 className="text-xs sm:text-sm font-black font-['Montserrat',sans-serif] text-gray-900">
                          Escanea para Ver Fotos y Cuotas
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        WhatsApp Directo
                      </span>
                    </div>

                    {/* Center: Clean QR Code with clear callout */}
                    <div className="flex items-center gap-4 my-auto">
                      <div className="p-2 bg-white rounded-xl shadow-md border border-gray-200 shrink-0">
                        <QRCodeRenderer
                          value={qrUrlCustom || catalogUrl}
                          size={105}
                          fgColor={activePalette.primary}
                          bgColor="#FFFFFF"
                        />
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-[#0F4C81] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            1
                          </span>
                          <p className="text-gray-700 text-[11px] leading-tight font-medium">
                            <strong>Apunta la cámara</strong> de tu teléfono al código QR.
                          </p>
                        </div>

                        <div className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-[#0F4C81] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            2
                          </span>
                          <p className="text-gray-700 text-[11px] leading-tight font-medium">
                            <strong>Explora los productos</strong> de Gollo y EPA en Colones ₡.
                          </p>
                        </div>

                        <div className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-[#25D366] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            3
                          </span>
                          <p className="text-gray-700 text-[11px] leading-tight font-medium">
                            <strong>Pide por WhatsApp</strong> y coordinamos entrega a tu puerta.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom row */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500">
                      <span className="flex items-center gap-1 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Factura oficial y garantía de fábrica
                      </span>
                      <span className="font-bold text-[#0F4C81]">
                        +506 {profile.phone}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  QR 100% Funcional y Escaneable
                </span>
                <span>•</span>
                <span>3.5" × 2" (85 × 54 mm)</span>
              </div>
            </div>

            {/* Print trigger banner */}
            <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-gray-600">
                <strong className="text-gray-900 block font-semibold">¿Listo para enviar a imprenta o imprimir?</strong>
                Imprime la hoja completa con 8 tarjetas con marcas de corte.
              </div>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 bg-[#0F4C81] hover:bg-[#082a47] text-white font-bold px-5 py-3 rounded-xl text-sm shadow-xs transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Imprimir Hoja (8x Tarjetas)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PRINT-ONLY SHEET: Hidden on web screen, shown when calling window.print() */}
      <div className="hidden print-only">
        <div className="text-center pb-4 border-b border-gray-400 mb-6">
          <h2 className="text-lg font-bold">
            Tarjetas de Presentación Corporativas - {profile.brandName}
          </h2>
          <p className="text-xs text-gray-600">
            {profile.serviceTagline} | WhatsApp: +506 {profile.phone} | Cortar por las marcas
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
            <div
              key={index}
              className="border border-dashed border-gray-400 rounded-lg overflow-hidden p-1 card-print-container"
              style={{ width: '85mm', height: '54mm' }}
            >
              {index % 2 !== 0 ? (
                /* FRONT */
                <div
                  className="w-full h-full p-3 flex flex-col justify-between text-white rounded text-[9px]"
                  style={{
                    backgroundColor: activePalette.primary,
                    color: '#FFFFFF',
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-black text-xs block text-amber-300">
                        {profile.brandName}
                      </span>
                      <span className="text-[8px] text-blue-200">
                        {profile.serviceTagline}
                      </span>
                    </div>
                    <span className="bg-white/20 px-1 py-0.5 rounded text-[7px] font-bold">
                      Gollo • EPA CR
                    </span>
                  </div>

                  <div className="my-1">
                    <p className="text-[8px] text-blue-100 italic line-clamp-1">"{profile.slogan}"</p>
                  </div>

                  <div className="flex justify-between items-end border-t border-white/20 pt-1 text-[8px]">
                    <div>
                      <p className="font-bold text-amber-300">WhatsApp: +506 {profile.phone}</p>
                      <p className="text-gray-300">{profile.coverage}</p>
                    </div>
                    <span className="font-bold text-white text-[7px]">Entrega a Domicilio</span>
                  </div>
                </div>
              ) : (
                /* BACK */
                <div className="w-full h-full p-2.5 flex flex-col justify-between bg-white text-gray-900 rounded text-[8px]">
                  <div className="flex justify-between items-center border-b pb-1">
                    <span className="font-bold text-[#0F4C81] text-[9px]">
                      Catálogo Digital 24/7
                    </span>
                    <span className="text-[7px] text-gray-500">Escanea con tu celular</span>
                  </div>

                  <div className="flex items-center gap-2 my-auto">
                    <div className="shrink-0 border p-0.5 rounded">
                      <QRCodeRenderer
                        value={qrUrlCustom || catalogUrl}
                        size={64}
                        fgColor={activePalette.primary}
                        bgColor="#FFFFFF"
                      />
                    </div>
                    <div className="space-y-0.5 text-[7px]">
                      <p className="font-bold text-gray-900">1. Escanea el código</p>
                      <p className="text-gray-600">2. Elige tu electrodoméstico</p>
                      <p className="font-bold text-emerald-700">3. Pide por WhatsApp</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[7px] text-gray-500 pt-0.5 border-t">
                    <span>Garantía de Fábrica</span>
                    <span className="font-bold">+506 {profile.phone}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
