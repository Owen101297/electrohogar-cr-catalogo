import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: 'primary' | 'gold' | 'green' | 'neutral';
}

/**
 * Tarjeta de métrica del panel administrativo.
 * Muestra una cifra clave del catálogo con su etiqueta y una pista de contexto.
 */
export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'primary',
}) => {
  const tones: Record<
    NonNullable<MetricCardProps['tone']>,
    { wrap: string; icon: string }
  > = {
    primary: { wrap: 'bg-blue-50/70 border-blue-100', icon: 'text-[#0F4C81]' },
    gold: { wrap: 'bg-amber-50/70 border-amber-200', icon: 'text-amber-600' },
    green: { wrap: 'bg-emerald-50/70 border-emerald-200', icon: 'text-emerald-600' },
    neutral: { wrap: 'bg-gray-50 border-gray-200', icon: 'text-gray-500' },
  };

  const palette = tones[tone];

  return (
    <div
      className={`rounded-2xl border p-4 flex items-start gap-3 ${palette.wrap}`}
    >
      <span className="p-2 rounded-xl bg-white/80 shadow-xs shrink-0">
        <Icon className={`w-4 h-4 ${palette.icon}`} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
          {label}
        </p>
        <p className="text-xl font-black text-gray-900 font-['Montserrat',sans-serif] leading-tight mt-0.5 break-words">
          {value}
        </p>
        {hint && (
          <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{hint}</p>
        )}
      </div>
    </div>
  );
};
