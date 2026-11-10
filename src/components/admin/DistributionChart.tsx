import React from 'react';
import { DistributionGroup } from '../../utils/stats';
import { formatColones } from '../../utils/formatters';

interface DistributionChartProps {
  title: string;
  groups: DistributionGroup[];
  emptyMessage?: string;
}

/**
 * Barras horizontales de distribución (por tienda o por categoría).
 * Cada barra muestra unidades, valor en colones y porcentaje sobre el total.
 */
export const DistributionChart: React.FC<DistributionChartProps> = ({
  title,
  groups,
  emptyMessage = 'Sin datos para mostrar',
}) => {
  const max = groups.reduce(
    (acc, group) => Math.max(acc, group.unidades),
    0
  );

  return (
    <div className="bg-white rounded-3xl border border-[#DFE3E8] shadow-xs p-5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-4">
        {title}
      </h3>

      {groups.length === 0 ? (
        <p className="text-xs text-gray-400 py-4 text-center">{emptyMessage}</p>
      ) : (
        <ul className="space-y-3.5">
          {groups.map((group) => (
            <li key={group.clave}>
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <span className="text-xs font-bold text-gray-800 truncate">
                  {group.etiqueta}
                </span>
                <span className="text-[11px] text-gray-500 tabular-nums shrink-0">
                  {group.unidades} · {Math.round(group.porcentaje)}%
                </span>
              </div>

              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0F4C81] to-[#1e3a8a] transition-all duration-500"
                  style={{
                    width: max > 0 ? `${(group.unidades / max) * 100}%` : '0%',
                  }}
                />
              </div>

              <p className="text-[11px] text-gray-500 mt-1 tabular-nums">
                {formatColones(group.valor)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
