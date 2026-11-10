import React, { useEffect, useState } from 'react';
import { Product, ProductFormErrors, ProductFormValues } from '../types';
import {
  buildProductFromForm,
  CATEGORY_LABELS,
  emptyProductFormValues,
  INSTALLMENT_TERM_OPTIONS,
  productToFormValues,
  PRODUCT_COPY,
  STORE_LABELS,
  validateProductForm,
} from '../utils/products';
import { X, Plus, Save, Image as ImageIcon } from 'lucide-react';

export type ProductFormMode = 'create' | 'edit';

interface ProductFormModalProps {
  isOpen: boolean;
  mode: ProductFormMode;
  /** Producto a editar. Requerido cuando `mode === 'edit'`. */
  product?: Product | null;
  onClose: () => void;
  onSubmit: (product: Product) => void;
}

/**
 * Formulario único de producto: sirve tanto para el alta (mode "create") como
 * para la edición (mode "edit"). Ambas pantallas comparten exactamente la misma
 * lista de campos y las mismas reglas de validación, de modo que no puedan
 * divergir.
 *
 * El componente no toca `localStorage` ni el estado global: recibe el producto
 * inicial y entrega el producto ya construido y validado por `onSubmit`.
 */
export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  mode,
  product,
  onClose,
  onSubmit,
}) => {
  const isEdit = mode === 'edit';

  const [values, setValues] = useState<ProductFormValues>(() =>
    isEdit && product ? productToFormValues(product) : emptyProductFormValues()
  );
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  // Al abrir el formulario se recargan los valores: en modo edición se
  // precarga el producto existente; en modo alta se generan valores nuevos
  // (incluido un SKU nuevo, para no repetirlo entre altas sucesivas).
  useEffect(() => {
    if (!isOpen) return;
    setValues(
      isEdit && product ? productToFormValues(product) : emptyProductFormValues()
    );
    setErrors({});
    setSubmitted(false);
  }, [isOpen, isEdit, product]);

  if (!isOpen) return null;

  const setField = <K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (submitted) {
      // Revalida en vivo solo después del primer intento de guardado.
      setErrors(validateProductForm({ ...values, [key]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const validationErrors = validateProductForm(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    onSubmit(buildProductFromForm(values, isEdit && product ? product : undefined));
    // El formulario se cierra al guardar; el estado vive en App.tsx.
    onClose();
  };

  const fieldError = (key: keyof ProductFormErrors) =>
    submitted ? errors[key] : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-200 my-auto relative animate-in zoom-in-95 duration-200">
        <div className="bg-[#0F4C81] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-400 text-gray-900">
              {isEdit ? <Save className="w-4 h-4 font-black" /> : <Plus className="w-4 h-4 font-black" />}
            </span>
            <div>
              <h3 className="text-lg font-black font-['Montserrat',sans-serif]">
                {isEdit ? 'Editar Producto del Catálogo' : 'Agregar Producto de EPA o Gollo'}
              </h3>
              <p className="text-xs text-blue-200">
                {isEdit
                  ? 'Corrigí los datos y guardá los cambios'
                  : 'Añade ofertas encontradas en las tiendas a tu catálogo'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            aria-label="Cerrar"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4 text-xs">
          <div>
            <label htmlFor="pf-name" className="font-bold text-gray-700 block mb-1">
              Nombre del Electrodoméstico
            </label>
            <input
              id="pf-name"
              type="text"
              value={values.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder="Ej. Refrigeradora LG 14 Pies No Frost"
              aria-invalid={Boolean(fieldError('name'))}
              className={`w-full text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#0F4C81] ${
                fieldError('name')
                  ? 'border-red-400 focus:border-red-400'
                  : 'border-gray-300'
              }`}
            />
            {fieldError('name') && (
              <p role="alert" className="text-red-600 text-[11px] mt-1 font-semibold">
                {fieldError('name')}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="pf-store" className="font-bold text-gray-700 block mb-1">
                Tienda en Costa Rica
              </label>
              <select
                id="pf-store"
                value={values.store}
                onChange={(e) => setField('store', e.target.value as ProductFormValues['store'])}
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
              >
                {Object.entries(STORE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="pf-category" className="font-bold text-gray-700 block mb-1">
                Categoría
              </label>
              <select
                id="pf-category"
                value={values.category}
                onChange={(e) =>
                  setField('category', e.target.value as ProductFormValues['category'])
                }
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
              >
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="pf-brand" className="font-bold text-gray-700 block mb-1">
                Marca
              </label>
              <input
                id="pf-brand"
                type="text"
                value={values.brand}
                onChange={(e) => setField('brand', e.target.value)}
                placeholder="Samsung, LG, Whirlpool, Mabe..."
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
              />
            </div>
            <div>
              <label htmlFor="pf-badge" className="font-bold text-gray-700 block mb-1">
                Etiqueta Promocional
              </label>
              <input
                id="pf-badge"
                type="text"
                value={values.badge}
                onChange={(e) => setField('badge', e.target.value)}
                placeholder="Ej. Oferta Flash, -20% OFF..."
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="pf-current-price" className="font-bold text-gray-700 block mb-1">
                Precio Actual (Colones ₡)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 font-bold">₡</span>
                <input
                  id="pf-current-price"
                  type="text"
                  inputMode="numeric"
                  value={values.currentPriceStr}
                  onChange={(e) => setField('currentPriceStr', e.target.value)}
                  placeholder="299000"
                  aria-invalid={Boolean(fieldError('currentPriceStr'))}
                  className={`w-full text-sm pl-7 pr-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#0F4C81] font-bold text-[#0F4C81] ${
                    fieldError('currentPriceStr')
                      ? 'border-red-400 focus:border-red-400'
                      : 'border-gray-300'
                  }`}
                />
              </div>
              {fieldError('currentPriceStr') && (
                <p role="alert" className="text-red-600 text-[11px] mt-1 font-semibold">
                  {fieldError('currentPriceStr')}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="pf-original-price" className="font-bold text-gray-700 block mb-1">
                Precio Normal / Lista (₡)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 font-bold">₡</span>
                <input
                  id="pf-original-price"
                  type="text"
                  inputMode="numeric"
                  value={values.originalPriceStr}
                  onChange={(e) => setField('originalPriceStr', e.target.value)}
                  placeholder="349000"
                  aria-invalid={Boolean(fieldError('originalPriceStr'))}
                  className={`w-full text-sm pl-7 pr-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#0F4C81] ${
                    fieldError('originalPriceStr')
                      ? 'border-red-400 focus:border-red-400'
                      : 'border-gray-300'
                  }`}
                />
              </div>
              {fieldError('originalPriceStr') && (
                <p role="alert" className="text-red-600 text-[11px] mt-1 font-semibold">
                  {fieldError('originalPriceStr')}
                </p>
              )}
              <p className="text-[10px] text-gray-400 mt-1">
                Si es menor que el precio de contado, se ajusta al guardar.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="pf-quincenal" className="font-bold text-gray-700 block mb-1">
                Cuota Quincenal (₡)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 font-bold">₡</span>
                <input
                  id="pf-quincenal"
                  type="text"
                  inputMode="numeric"
                  value={values.installmentQuincenalStr}
                  onChange={(e) => setField('installmentQuincenalStr', e.target.value)}
                  placeholder="Dejar vacío = calcular"
                  aria-invalid={Boolean(fieldError('installmentQuincenalStr'))}
                  className={`w-full text-sm pl-7 pr-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#0F4C81] ${
                    fieldError('installmentQuincenalStr')
                      ? 'border-red-400 focus:border-red-400'
                      : 'border-gray-300'
                  }`}
                />
              </div>
              {fieldError('installmentQuincenalStr') && (
                <p role="alert" className="text-red-600 text-[11px] mt-1 font-semibold">
                  {fieldError('installmentQuincenalStr')}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="pf-term" className="font-bold text-gray-700 block mb-1">
                Plazo del Crédito (Meses)
              </label>
              <select
                id="pf-term"
                value={values.installmentMonths}
                onChange={(e) => setField('installmentMonths', Number(e.target.value))}
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
              >
                {INSTALLMENT_TERM_OPTIONS.map((months) => (
                  <option key={months} value={months}>
                    {months} meses
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="pf-warranty" className="font-bold text-gray-700 block mb-1">
                Garantía (Meses)
              </label>
              <input
                id="pf-warranty"
                type="number"
                min={0}
                step={1}
                value={values.warrantyMonths}
                onChange={(e) => setField('warrantyMonths', Number(e.target.value) || 0)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
              />
            </div>
            <div>
              <label htmlFor="pf-sku" className="font-bold text-gray-700 block mb-1">
                Código SKU
              </label>
              <input
                id="pf-sku"
                type="text"
                value={values.sku}
                onChange={(e) => setField('sku', e.target.value)}
                placeholder="Ej. LG-LT41WPP"
                readOnly={isEdit}
                aria-invalid={Boolean(fieldError('sku'))}
                className={`w-full text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#0F4C81] font-mono ${
                  fieldError('sku')
                    ? 'border-red-400 focus:border-red-400'
                    : 'border-gray-300'
                } ${isEdit ? 'bg-gray-100 text-gray-500' : ''}`}
              />
              {fieldError('sku') && (
                <p role="alert" className="text-red-600 text-[11px] mt-1 font-semibold">
                  {fieldError('sku')}
                </p>
              )}
              {isEdit && (
                <p className="text-[10px] text-gray-400 mt-1">
                  El SKU identifica el producto y no se modifica.
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="pf-image" className="font-bold text-gray-700 block mb-1">
              URL de la Foto
            </label>
            <div className="relative">
              <ImageIcon className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                id="pf-image"
                type="url"
                value={values.image}
                onChange={(e) => setField('image', e.target.value)}
                placeholder="https://images.unsplash.com/..."
                aria-invalid={Boolean(fieldError('image'))}
                className={`w-full text-xs font-mono pl-9 pr-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#0F4C81] ${
                  fieldError('image') ? 'border-red-400 focus:border-red-400' : 'border-gray-300'
                }`}
              />
            </div>
            {fieldError('image') && (
              <p role="alert" className="text-red-600 text-[11px] mt-1 font-semibold">
                {fieldError('image')}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="pf-description" className="font-bold text-gray-700 block mb-1">
              Descripción Breve
            </label>
            <textarea
              id="pf-description"
              rows={2}
              value={values.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="Detalles para presentarle al cliente en su puerta..."
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
            />
          </div>

          <fieldset className="pt-2 border-t border-gray-100">
            <legend className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
              Especificaciones Técnicas
            </legend>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <label htmlFor="pf-capacity" className="font-bold text-gray-600 block mb-1">
                  Capacidad
                </label>
                <input
                  id="pf-capacity"
                  type="text"
                  value={values.capacity}
                  onChange={(e) => setField('capacity', e.target.value)}
                  placeholder="Ej. 15 Pies Cúbicos (423 Litros)"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
                />
              </div>
              <div>
                <label htmlFor="pf-dimensions" className="font-bold text-gray-600 block mb-1">
                  Dimensiones
                </label>
                <input
                  id="pf-dimensions"
                  type="text"
                  value={values.dimensions}
                  onChange={(e) => setField('dimensions', e.target.value)}
                  placeholder="Ej. 168 cm Alto x 70 cm Ancho"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
                />
              </div>
              <div>
                <label htmlFor="pf-voltage" className="font-bold text-gray-600 block mb-1">
                  Voltaje
                </label>
                <input
                  id="pf-voltage"
                  type="text"
                  value={values.voltage}
                  onChange={(e) => setField('voltage', e.target.value)}
                  placeholder="Ej. 120V / 60Hz"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
                />
              </div>
              <div>
                <label htmlFor="pf-energy" className="font-bold text-gray-600 block mb-1">
                  Eficiencia
                </label>
                <input
                  id="pf-energy"
                  type="text"
                  value={values.energyRating}
                  onChange={(e) => setField('energyRating', e.target.value)}
                  placeholder="Ej. Smart Inverter A++"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
                />
              </div>
            </div>
          </fieldset>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#0F4C81] hover:bg-[#082a47] text-white font-bold cursor-pointer transition shadow-md"
            >
              {isEdit ? 'Guardar Cambios' : 'Guardar en Catálogo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/** Reexportado para que el copy de confirmación viva en un solo lugar. */
export { PRODUCT_COPY };
