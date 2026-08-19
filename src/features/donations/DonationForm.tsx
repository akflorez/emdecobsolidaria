import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { mockStore } from '../../shared/lib/mockStore';
import { paymentAdapter } from '../../shared/lib/paymentAdapter';
import { formatCOP } from '../../shared/lib/formatters';
import { HeartHandshake, Package, DollarSign, CheckCircle2, Truck, Award } from 'lucide-react';

export const DonationForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetNeedId = searchParams.get('need');

  const categories = mockStore.getState().needCategories;
  const municipalities = mockStore.getState().municipalities;

  const [donationType, setDonationType] = useState<'kind' | 'economic'>('kind');
  const [title, setTitle] = useState('');
  const [muniCode, setMuniCode] = useState('63001');
  const [hasTransport, setHasTransport] = useState(true);
  const [requiresCert, setRequiresCert] = useState(false);
  const [publicConsent, setPublicConsent] = useState(true);

  // Ítem en especie
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-1');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [unit, setUnit] = useState('Sacos');
  const [estimatedValue, setEstimatedValue] = useState(350000);

  // Aporte económico
  const [pledgeAmount, setPledgeAmount] = useState(200000);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (donationType === 'economic') {
      const result = await paymentAdapter.createPledgeOrIntent({
        organization_id: mockStore.getState().currentUser.organization_id,
        donor_id: 'donor-1',
        need_id: targetNeedId || undefined,
        amount_cop: Number(pledgeAmount)
      });
      setSuccessMsg(result.message);
    } else {
      mockStore.createDonationOffer({
        title: title || 'Ofrecimiento de Donación en Especie',
        municipality_code: muniCode,
        has_transport: hasTransport,
        requires_certificate: requiresCert,
        items: [
          {
            category_id: categoryId,
            description: description || 'Donación de elementos de ayuda',
            quantity_offered: Number(quantity),
            unit: unit || 'Unidades',
            estimated_value_cop: Number(estimatedValue)
          }
        ]
      });
      setSuccessMsg('¡Muchas gracias! Tu ofrecimiento ha sido registrado como DISPONIBLE para coincidencia.');
    }
  };

  if (successMsg) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Donación Registrada Exitosamente</h2>
        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">{successMsg}</p>
        <div className="flex justify-center gap-3 pt-2">
          <button onClick={() => navigate('/necesidades-publicas')} className="px-5 py-2.5 bg-brand-600 text-white text-xs font-bold rounded-xl shadow">
            Ver Catálogo de Necesidades
          </button>
          <button onClick={() => navigate('/panel')} className="px-5 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200">
            Ir a Mi Panel de Donante
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-brand-600 font-bold text-xs">
          <HeartHandshake className="w-4 h-4" />
          <span>Portal del Donante Solidario</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Ofrecer Ayuda Humanitaria</h1>
        <p className="text-xs text-slate-500">
          Registre materiales, productos, transporte o compromisos de aporte. El equipo de coordinación aprobará las coincidencias con casos verificados.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {/* Selector Tipo de Donación */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setDonationType('kind')}
            className={`p-4 rounded-2xl border text-center transition-all ${
              donationType === 'kind'
                ? 'border-brand-600 bg-brand-50/50 text-brand-900 font-bold shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Package className="w-6 h-6 mx-auto mb-2 text-brand-600" />
            <span className="text-xs block font-bold">Donación en Especie / Materiales</span>
            <span className="text-[10px] text-slate-500 font-normal">Herramientas, tejas, vivres, transporte</span>
          </button>

          <button
            type="button"
            onClick={() => setDonationType('economic')}
            className={`p-4 rounded-2xl border text-center transition-all ${
              donationType === 'economic'
                ? 'border-brand-600 bg-brand-50/50 text-brand-900 font-bold shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <DollarSign className="w-6 h-6 mx-auto mb-2 text-brand-600" />
            <span className="text-xs block font-bold">Compromiso Aporte Económico</span>
            <span className="text-[10px] text-slate-500 font-normal">Intención de donación en dinero (COP)</span>
          </button>
        </div>

        {donationType === 'kind' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Título del Ofrecimiento</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ej: Donación de 50 tejas de zinc en Armenia"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Categoría</label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ubicación de Disponibilidad (DANE)</label>
                <select
                  value={muniCode}
                  onChange={e => setMuniCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500"
                >
                  {municipalities.map(m => (
                    <option key={m.code} value={m.code}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Descripción del Elemento Donado</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Estado de los materiales, especificaciones técnicas..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cantidad Ofrecida</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Unidad</label>
                <input
                  type="text"
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  placeholder="Sacos, Cajas..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Valor Estimado COP</label>
                <input
                  type="number"
                  min={0}
                  step={50000}
                  value={estimatedValue}
                  onChange={e => setEstimatedValue(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={hasTransport} onChange={e => setHasTransport(e.target.checked)} className="rounded text-brand-600" />
                <Truck className="w-4 h-4 text-slate-500" />
                <span>Cuento con transporte para la entrega</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={requiresCert} onChange={e => setRequiresCert(e.target.checked)} className="rounded text-brand-600" />
                <Award className="w-4 h-4 text-slate-500" />
                <span>Requiero certificado de donación</span>
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-800">Adaptador de Pagos Desacoplado:</div>
              <p className="text-slate-600">
                Los cobros bancarios reales están deshabilitados. Se registrará una intención o compromiso de aporte en COP para conciliación administrativa.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Monto del Compromiso (Pesos Colombianos - COP)</label>
              <input
                type="number"
                min={20000}
                step={50000}
                value={pledgeAmount}
                onChange={e => setPledgeAmount(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-lg font-bold text-slate-900 focus:ring-2 focus:ring-brand-500"
              />
              <span className="text-xs text-brand-700 font-bold block mt-1">Valor: {formatCOP(pledgeAmount)}</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 pt-4 border-t border-slate-100 text-xs">
          <input type="checkbox" id="pubConsent" checked={publicConsent} onChange={e => setPublicConsent(e.target.checked)} className="rounded text-brand-600" />
          <label htmlFor="pubConsent" className="text-slate-600">Deseo aparecer públicamente en el panel de reconocimiento a donantes solidarios.</label>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md transition-transform active:scale-98"
        >
          Confirmar y Registrar Ofrecimiento
        </button>
      </form>
    </div>
  );
};
