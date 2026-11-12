import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { CardProfile, ColorPalette } from '../types';
import { PALETTES } from '../data/palettes';
import {
  CARD_FILENAMES,
  CARD_HEIGHT_PX,
  CARD_WIDTH_PX,
  CardRenderOptions,
  downloadCanvasAsPng,
  drawBusinessCard,
  renderCardPreview,
  renderCardSheet,
} from '../utils/cardImage';
import { 
  Printer, 
  Smartphone, 
  Sparkles, 
  Phone, 
  RotateCw,
  QrCode,
  CheckCircle2,
  ShieldCheck,
  Palette as PaletteIcon,
  Download,
  FileImage,
  AlertTriangle
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
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [sheetDataUrl, setSheetDataUrl] = useState('');
  const [downloadError, setDownloadError] = useState('');

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // El destino del QR es siempre la URL pública del catálogo. Si cambia, la
  // vista previa se actualiza sola.
  useEffect(() => {
    setQrUrlCustom(catalogUrl);
  }, [catalogUrl]);

  const renderOptions: CardRenderOptions = useMemo(
    () => ({
      brandName: profile.brandName,
      serviceTagline: profile.serviceTagline,
      slogan: profile.slogan,
      phone: profile.phone,
      coverage: profile.coverage,
      website: qrUrlCustom || catalogUrl,
      qrDataUrl,
      palette: activePalette,
    }),
    [
      profile.brandName,
      profile.serviceTagline,
      profile.slogan,
      profile.phone,
      profile.coverage,
      qrUrlCustom,
      catalogUrl,
      qrDataUrl,
      activePalette,
    ]
  );

  // El QR se genera como PNG para poder dibujarlo en el lienzo.
  useEffect(() => {
    let cancelled = false;
    const target = qrUrlCustom || catalogUrl;

    QRCode.toDataURL(target, {
      width: 900,
      margin: 1,
      color: { dark: activePalette.primary, light: '#FFFFFF' },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('');
      });

    return () => {
      cancelled = true;
    };
  }, [qrUrlCustom, catalogUrl, activePalette.primary]);

  // La vista previa y la hoja se redibujan con los mismos datos que se
  // descargan, de modo que lo que se ve es lo que se descarga (FR-019).
  const redraw = useCallback(async () => {
    // Las fuentes deben estar listas o el lienzo usará la de respaldo.
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      await document.fonts.ready;
    }

    if (previewCanvasRef.current) {
      await renderCardPreview(
        previewCanvasRef.current,
        renderOptions,
        isFlipped ? 'back' : 'front'
      );
    }

    const sheet = await renderCardSheet(renderOptions);
    setSheetDataUrl(sheet.toDataURL('image/png'));
  }, [renderOptions, isFlipped]);

  useEffect(() => {
    void redraw();
  }, [redraw]);

  const handlePrint = () => {
    window.print();
  };

  const missingPhone = profile.phone.replace(/[^0-9]/g, '').length < 8;

  /** Renderiza una cara de la tarjeta a 300 DPI y la descarga como PNG. */
  const downloadSide = async (side: 'front' | 'back') => {
    setDownloadError('');
    try {
      if (typeof document !== 'undefined' && document.fonts?.ready) {
        await document.fonts.ready;
      }
      const canvas = document.createElement('canvas');
      canvas.width = CARD_WIDTH_PX;
      canvas.height = CARD_HEIGHT_PX;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('sin contexto 2d');
      await drawBusinessCard(ctx, renderOptions, side);
      downloadCanvasAsPng(
        canvas,
        side === 'front' ? CARD_FILENAMES.front : CARD_FILENAMES.back
      );
    } catch {
      setDownloadError(
        'No se pudo iniciar la descarga del PNG. Podés usar la opción de imprimir en su lugar.'
      );
    }
  };

  /** Renderiza la hoja de 8 tarjetas y la descarga como PNG. */
  const downloadSheet = async () => {
    setDownloadError('');
    try {
      if (typeof document !== 'undefined' && document.fonts?.ready) {
        await document.fonts.ready;
      }
      const canvas = await renderCardSheet(renderOptions);
      downloadCanvasAsPng(canvas, CARD_FILENAMES.sheet);
    } catch {
      setDownloadError(
        'No se pudo iniciar la descarga del PNG. Podés usar la opción de imprimir en su lugar.'
      );
    }
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
                  placeholder="6168-2892"
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

            {/* Vista previa sobre lienzo: es exactamente el PNG que se descarga */}
            <div className="flex flex-col items-center justify-center p-6 sm:p-10 bg-[#EDF0F4] rounded-2xl border border-dashed border-gray-300">
              <canvas
                ref={previewCanvasRef}
                className="w-full max-w-[460px] rounded-2xl shadow-xl border border-gray-300/80 bg-white"
                aria-label="Vista previa de la tarjeta de presentación"
              />

              <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  QR 100% Funcional y Escaneable
                </span>
                <span>•</span>
                <span>3.5" × 2" (85 × 54 mm) a 300 DPI</span>
              </div>
            </div>

            {/* Descargas en PNG */}
            <div className="mt-6 pt-5 border-t border-gray-100 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-gray-600">
                  <strong className="text-gray-900 block font-semibold">
                    ¿Listo para enviar a imprenta o compartir?
                  </strong>
                  Descarga la tarjeta en PNG a 300 DPI o imprime la hoja de 8 tarjetas.
                </div>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 bg-[#0F4C81] hover:bg-[#082a47] text-white font-bold px-5 py-3 rounded-xl text-sm shadow-xs transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir Hoja (8x Tarjetas)
                </button>
              </div>

              {missingPhone && (
                <div
                  role="alert"
                  className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px]"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Falta un número de WhatsApp válido. La tarjeta se puede descargar, pero
                    el cliente no va a poder contactarte. Completalo antes de imprimir.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => void downloadSide('front')}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#0F4C81]/25 bg-blue-50/60 hover:bg-blue-100 text-[#0F4C81] font-bold text-xs transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Anverso .png
                </button>
                <button
                  type="button"
                  onClick={() => void downloadSide('back')}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#0F4C81]/25 bg-blue-50/60 hover:bg-blue-100 text-[#0F4C81] font-bold text-xs transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Reverso .png
                </button>
                <button
                  type="button"
                  onClick={() => void downloadSheet()}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0F4C81] hover:bg-[#082a47] text-white font-bold text-xs transition cursor-pointer shadow-xs"
                >
                  <FileImage className="w-4 h-4" />
                  Hoja 8 Tarjetas .png
                </button>
              </div>

              <p className="text-[11px] text-gray-400">
                Los PNG se generan a 300 DPI: 1004 × 638 px por tarjeta y 2088 × 2632 px la
                hoja completa, listos para imprenta.
              </p>

              {downloadError && (
                <div
                  role="alert"
                  className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[11px]"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{downloadError}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PRINT-ONLY SHEET: la misma hoja que se descarga en PNG, oculta en
          pantalla y visible al imprimir (FR-013, FR-018). */}
      <div className="print-only">
        <div className="text-center pb-4 border-b border-gray-400 mb-6">
          <h2 className="text-lg font-bold">
            Tarjetas de Presentación Corporativas - {profile.brandName}
          </h2>
          <p className="text-xs text-gray-600">
            {profile.serviceTagline} | WhatsApp: +506 {profile.phone} | Cortar por las marcas
          </p>
        </div>

        {sheetDataUrl ? (
          <img
            src={sheetDataUrl}
            alt="Hoja con 8 tarjetas de presentación con código QR"
            className="w-full block"
          />
        ) : (
          <p className="text-xs text-gray-500 text-center py-8">
            Generando la hoja de tarjetas...
          </p>
        )}
      </div>
    </div>
  );
};
