import React, { useState, useEffect } from 'react';
import { mockStore } from '../../shared/lib/mockStore';
import { Match, Delivery } from '../../shared/types';
import { Truck, CheckCircle2, Star, FileCheck } from 'lucide-react';

export const DeliveryManager: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [deliveredQty, setDeliveredQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('Ayuda recibida en perfecto estado. ¡Muchas gracias!');

  useEffect(() => {
    setMatches(mockStore.getState().matches.filter(m => m.status === 'aprobado'));
    setDeliveries(mockStore.getState().deliveries);

    return mockStore.subscribe(() => {
      setMatches(mockStore.getState().matches.filter(m => m.status === 'aprobado'));
      setDeliveries(mockStore.getState().deliveries);
    });
  }, []);

  const handleConfirmDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) return;

    try {
      mockStore.createAndConfirmDelivery({
        match_id: selectedMatch.id,
        quantity_delivered: Number(deliveredQty),
        evidence_storage_path: 'evidences/delivery_proof_01.jpg',
        beneficiary_rating: Number(rating),
        beneficiary_feedback: feedback
      });

      setSelectedMatch(null);
      alert('Entrega registrada y confirmada por el beneficiario. Las necesidades y métricas públicas han sido actualizadas.');
    } catch (err: any) {
      alert(`Error al registrar entrega: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-brand-600" />
            Gestión de Entregas y Confirmación de Beneficiarios
          </h2>
          <p className="text-xs text-slate-500">
            Registro de despachos, subida de evidencia y confirmación final de la ayuda recibida.
          </p>
        </div>
        <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200">
          {matches.length} Asignaciones Pendientes de Despacho
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Asignaciones Aprobadas por Entregar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm">Asignaciones Listas para Entrega</h3>
          {matches.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-xs text-slate-500">No hay asignaciones pendientes de despacho en este momento.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map(m => {
                const need = mockStore.getState().needs.find(n => n.id === m.need_id);
                return (
                  <div key={m.id} className="p-4 rounded-xl border border-slate-200 hover:border-brand-500 text-xs space-y-2">
                    <div className="flex justify-between items-center font-bold text-slate-900">
                      <span>{need?.description || 'Necesidad Asignada'}</span>
                      <span className="bg-brand-100 text-brand-800 px-2 py-0.5 rounded">
                        Asignado: {m.quantity_assigned} {need?.unit}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Recurso: {m.resource_type.toUpperCase()}</span>
                      <span>Fecha: {new Date(m.created_at).toLocaleDateString('es-CO')}</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedMatch(m);
                        setDeliveredQty(m.quantity_assigned);
                      }}
                      className="w-full mt-2 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-lg shadow-sm"
                    >
                      Registrar Entrega y Evidencia
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Historial de Entregas Realizadas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm">Historial de Entregas Verificadas</h3>
          {deliveries.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No se han registrado entregas todavía.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {deliveries.map(d => (
                <div key={d.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5" />
                      Entrega Confirmada
                    </span>
                    <span className="text-slate-400">{new Date(d.delivery_date).toLocaleDateString('es-CO')}</span>
                  </div>
                  <div className="text-slate-800 font-semibold">Cantidad Entregada: {d.quantity_delivered} unidades</div>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <span>Calificación: {d.beneficiary_rating}</span>
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <p className="text-slate-600 italic">"{d.beneficiary_feedback}"</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Modal Registro de Entrega y Confirmación */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleConfirmDelivery} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Confirmación de Entrega y Evaluación</h3>
              <button type="button" onClick={() => setSelectedMatch(null)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cantidad Real Entregada</label>
              <input
                type="number"
                min={1}
                max={selectedMatch.quantity_assigned}
                value={deliveredQty}
                onChange={e => setDeliveredQty(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Calificación de la Atención (1 a 5 Estrellas)</label>
              <select
                value={rating}
                onChange={e => setRating(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm"
              >
                <option value={5}>5 Estrellas - Excelente Atención</option>
                <option value={4}>4 Estrellas - Buena Atención</option>
                <option value={3}>3 Estrellas - Regular</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Comentario / Feedback del Beneficiario</label>
              <textarea
                rows={3}
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setSelectedMatch(null)} className="px-4 py-2 text-xs font-semibold text-slate-600">
                Cancelar
              </button>
              <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow">
                Confirmar Reception y Cerrar Entrega
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
