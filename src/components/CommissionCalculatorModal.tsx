import React, { useState } from 'react';
import { AdvisorSettings, Product } from '../types';
import { formatColones, calculateCommission } from '../utils/formatters';
import { 
  X, 
  DollarSign, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  Calculator, 
  Sliders,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

interface CommissionCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AdvisorSettings;
  onUpdateSettings: (settings: AdvisorSettings) => void;
  products: Product[];
}

export const CommissionCalculatorModal: React.FC<CommissionCalculatorModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  products,
}) => {
  const [monthlySalesGoal, setMonthlySalesGoal] = useState<number>(5); // e.g. 5 appliances sold per month

  if (!isOpen) return null;

  // Average price of appliances in the catalog
  const avgPrice = Math.round(
    products.reduce((acc, p) => acc + p.currentPrice, 0) / (products.length || 1)
  );

  const avgCommissionPerUnit = calculateCommission(avgPrice, settings.commissionRate);
  const projectedMonthlyIncome = avgCommissionPerUnit * monthlySalesGoal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-gray-200 my-auto relative animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F4C81] to-[#041524] text-white p-6 relative">
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 rounded-xl bg-amber-400 text-gray-950">
              <Calculator className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-xl font-black font-['Montserrat',sans-serif]">
                Calculadora de Ganancias & Comisiones
              </h3>
              <p className="text-xs text-blue-200">
                Modelo de Ventas Puerta a Puerta en Costa Rica
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Commission Rate Slider */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
                  Tu Margen de Comisión por Venta
                </label>
                <p className="text-xs text-gray-500">
                  Porcentaje acordado o margen que le ganas al producto de Gollo/EPA
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-[#0F4C81] font-['Montserrat',sans-serif]">
                  {settings.commissionRate}%
                </span>
              </div>
            </div>

            <input
              type="range"
              min={3}
              max={25}
              step={1}
              value={settings.commissionRate}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  commissionRate: Number(e.target.value),
                })
              }
              className="w-full accent-[#0F4C81] cursor-pointer"
            />

            <div className="flex justify-between text-[11px] text-gray-400">
              <span>3% (Volumen)</span>
              <span>8% - 10% (Estándar CR)</span>
              <span>25% (Margen Alto)</span>
            </div>
          </div>

          {/* Toggle Advisor Mode on Catalog */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-blue-200 bg-blue-50/50">
            <div>
              <p className="text-xs font-bold text-[#0F4C81]">
                Mostrar "Tu Ganancia" en las tarjetas del catálogo
              </p>
              <p className="text-[11px] text-gray-600">
                Te muestra en cada producto cuánto dinero en colones ₡ ganarás si el cliente lo compra.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
              <input
                type="checkbox"
                checked={settings.advisorModeEnabled}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    advisorModeEnabled: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F4C81]"></div>
            </label>
          </div>

          {/* Monthly Projections */}
          <div className="border border-gray-200 rounded-2xl p-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Simulador de Ingresos Mensuales
            </h4>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600">Meta de electrodomésticos vendidos al mes:</span>
                <span className="font-extrabold text-[#0F4C81]">{monthlySalesGoal} productos</span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                value={monthlySalesGoal}
                onChange={(e) => setMonthlySalesGoal(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                <span className="text-[11px] text-emerald-800 font-medium block">
                  Ganancia Promedio por Producto
                </span>
                <span className="text-base sm:text-lg font-black text-emerald-950 font-['Montserrat',sans-serif]">
                  {formatColones(avgCommissionPerUnit)}
                </span>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
                <span className="text-[11px] text-amber-800 font-medium block">
                  Ingreso Mensual Estimado
                </span>
                <span className="text-base sm:text-lg font-black text-amber-950 font-['Montserrat',sans-serif]">
                  {formatColones(projectedMonthlyIncome)}
                </span>
              </div>
            </div>
          </div>

          {/* Top Selling Items & Profits Preview */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Ejemplos con Productos del Catálogo:
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {products.slice(0, 4).map((item) => {
                const commission = calculateCommission(item.currentPrice, settings.commissionRate);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-9 h-9 object-contain rounded-md bg-gray-100 shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                        <p className="text-[11px] text-gray-500">
                          {formatColones(item.currentPrice)} ({item.store})
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="text-xs font-extrabold text-emerald-700 block">
                        +{formatColones(commission)}
                      </span>
                      <span className="text-[10px] text-gray-400">comisión</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#0F4C81] text-white font-bold text-xs hover:bg-[#082a47] transition cursor-pointer"
          >
            Guardar & Ver Catálogo
          </button>
        </div>
      </div>
    </div>
  );
};
