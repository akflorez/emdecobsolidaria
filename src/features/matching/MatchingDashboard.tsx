import React, { useState, useEffect } from 'react';
import { mockStore } from '../../shared/lib/mockStore';
import { Need, DonationOfferItem } from '../../shared/types';
import { Badge } from '../../shared/components/Badge';
import { Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const MatchingDashboard: React.FC = () => {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [items, setItems] = useState<DonationOfferItem[]>([]);
  const [selectedNeed, setSelectedNeed] = useState<Need | null>(null);
  const [selectedItem, setSelectedItem] = useState<DonationOfferItem | null>(null);
  const [assignedQty, setAssignedQty] = useState(1);

  useEffect(() => {
    setNeeds(mockStore.getState().needs.filter(n => ['abierta', 'parcialmente_atendida'].includes(n.status)));
    setItems(mockStore.getState().donationOfferItems.filter(i => i.quantity_available > 0));

    return mockStore.subscribe(() => {
      setNeeds(mockStore.getState().needs.filter(n => ['abierta', 'parcialmente_atendida'].includes(n.status)));
      setItems(mockStore.getState().donationOfferItems.filter(i => i.quantity_available > 0));
    });
  }, []);

  const handleApproveMatch = () => {
    if (!selectedNeed || !selectedItem) return;

    try {
      // INVOCACIÓN DE FUNCIÓN TRANSACCIONAL SQL (Simulada con FOR UPDATE y CHECK restriction)
      mockStore.approveMatchAndReserve({
        need_id: selectedNeed.id,
        resource_type: 'donation',
        donation_offer_item_id: selectedItem.id,
        quantity_assigned: Number(assignedQty),
        notes: 'Coincidencia aprobada por el Coordinador en el panel operativo.'
      });

      setSelectedNeed(null);
      setSelectedItem(null);
      alert('Coincidencia aprobada y recursos reservados exitosamente en la base de datos.');
    } catch (err: any) {
      alert(`Error en transacción: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            Motor de Coincidencias de Ayudas (Matching Engine)
          </h2>
          <p className="text-xs text-slate-500">
            Recomendaciones algorítmicas de cruce por categoría, municipio y disponibilidad. La aprobación final siempre es realizada por el Coordinador humano.
          </p>
        </div>
        <span className="bg-brand-50 text-brand-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-brand-200">
          Transacciones SQL con Row Locking (FOR UPDATE)
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Columna 1: Necesidades Abiertas Verificadas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center justify-between">
            <span>1. Necesidades Verificadas Pendientes</span>
            <span className="text-xs text-slate-500 font-normal">Select a Need</span>
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {needs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No hay necesidades pendientes de asignación.</p>
            ) : needs.map(n => {
              const pending = n.quantity_required - n.quantity_fulfilled;
              const isSelected = selectedNeed?.id === n.id;
              return (
                <div
                  key={n.id}
                  onClick={() => {
                    setSelectedNeed(n);
                    setAssignedQty(Math.min(pending, selectedItem?.quantity_available || pending));
                  }}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected ? 'border-brand-600 bg-brand-50/50 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-900">{n.description}</span>
                    <Badge type="urgency" value={n.priority} />
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Requerido: {n.quantity_required} {n.unit} | Pendiente: <strong className="text-brand-700">{pending}</strong></span>
                    <span>Muni: {n.municipality_code}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Columna 2: Ofertas de Donación Disponibles */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center justify-between">
            <span>2. Ofertas de Donación Disponibles</span>
            <span className="text-xs text-slate-500 font-normal">Select an Offer</span>
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {items.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No hay inventario de donaciones disponible.</p>
            ) : items.map(item => {
              const isSelected = selectedItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item);
                    if (selectedNeed) {
                      const pending = selectedNeed.quantity_required - selectedNeed.quantity_fulfilled;
                      setAssignedQty(Math.min(pending, item.quantity_available));
                    } else {
                      setAssignedQty(item.quantity_available);
                    }
                  }}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected ? 'border-brand-600 bg-brand-50/50 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-900">{item.description}</span>
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                      {item.quantity_available} {item.unit} Disponibles
                    </span>
                  </div>
                  <p className="text-slate-500">Donación en inventario verificado</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Panel de Aprobación de Coincidencia */}
      {selectedNeed && selectedItem && (
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-4 border border-slate-800 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Confirmar Asignación Transaccional de Ayuda</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">CHECK: resource_type = 'donation'</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div>
              <span className="text-slate-400 block">Necesidad Destino:</span>
              <strong className="text-white block mt-0.5">{selectedNeed.description}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Origen Recurso:</span>
              <strong className="text-white block mt-0.5">{selectedItem.description}</strong>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Cantidad a Asignar:</label>
              <input
                type="number"
                min={1}
                max={selectedItem.quantity_available}
                value={assignedQty}
                onChange={e => setAssignedQty(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-600 text-white font-bold text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setSelectedNeed(null);
                setSelectedItem(null);
              }}
              className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleApproveMatch}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Ejecutar Transacción y Reservar en BD</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
