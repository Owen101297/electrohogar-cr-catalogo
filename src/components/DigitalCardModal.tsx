import React, { useState } from 'react';
import { CardProfile, ColorPalette } from '../types';
import { QRCodeRenderer } from './QRCodeRenderer';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  MessageCircle, 
  ShieldCheck, 
  Sparkles,
  MapPin,
  Building2
} from 'lucide-react';

interface DigitalCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CardProfile;
  activePalette: ColorPalette;
  catalogUrl: string;
}

export const DigitalCardModal: React.FC<DigitalCardModalProps> = ({
  isOpen,
  onClose,
  profile,
  activePalette,
  catalogUrl,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(catalogUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `¡Hola! Te comparto el catálogo digital de electrodomésticos de Gollo y EPA en Costa Rica: ${catalogUrl} - WhatsApp de atención: +506 ${profile.phone}`;
  const shareWhatsAppUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-gray-200 relative animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Card Header (Minimalist & Corporate) */}
        <div
          className="p-6 text-white text-center relative"
          style={{
            background: `linear-gradient(135deg, ${activePalette.primary} 0%, ${activePalette.primaryDark} 100%)`,
          }}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/15 text-amber-300 border border-white/20 text-[10px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" />
            Catálogo Oficial • Costa Rica
          </div>

          <h3 className="text-xl font-black font-['Montserrat',sans-serif] tracking-tight">
            {profile.brandName}
          </h3>
          <p className="text-xs text-blue-100 font-medium mt-1">
            {profile.serviceTagline}
          </p>

          <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-blue-200">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span className="line-clamp-1">{profile.coverage}</span>
          </div>
        </div>

        {/* QR Code Presentation Box */}
        <div className="p-6 text-center space-y-4">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 inline-block shadow-inner mx-auto">
            <QRCodeRenderer
              value={catalogUrl}
              size={180}
              fgColor={activePalette.primary}
              bgColor="#FFFFFF"
            />
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-2">
              Apunta la cámara de tu celular
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-600 font-medium">
              Al escanear abrirás el catálogo con precios en Colones ₡ y cuotas quincenales de <strong>Gollo</strong> y <strong>EPA</strong>.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <a
              href={`https://wa.me/506${profile.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                '¡Hola! Vi la tarjeta digital y me gustaría consultar información de electrodomésticos.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-2.5 px-4 rounded-xl shadow-xs text-xs sm:text-sm transition cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              Escribir por WhatsApp (+506 {profile.phone})
            </a>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={shareWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-3 rounded-xl text-xs transition cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                Compartir
              </a>
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-3 rounded-xl text-xs transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-gray-600" />
                    Copiar Link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-500 flex items-center justify-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Garantía oficial y entrega a domicilio
          </p>
        </div>
      </div>
    </div>
  );
};
