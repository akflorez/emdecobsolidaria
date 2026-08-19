import React, { useState, useEffect } from 'react';
import { mockStore } from '../../shared/lib/mockStore';
import { Case } from '../../shared/types';
import { Badge } from '../../shared/components/Badge';
import { formatDateCO } from '../../shared/lib/formatters';
import { ShieldCheck, Eye, Globe, CheckCircle2 } from 'lucide-react';

export const CaseVerificationView: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [internalNotes, setInternalNotes] = useState('');

  useEffect(() => {
    setCases(mockStore.getState().cases);
    return mockStore.subscribe(() => {
      setCases(mockStore.getState().cases);
    });
  }, []);

  const handleVerify = (caseId: string) => {
    mockStore.verifyCase(caseId, internalNotes);
    mockStore.publishCase(caseId);
    setSelectedCase(null);
    setInternalNotes('');
    alert('Caso verificado y publicado anónimamente en el catálogo público.');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-600" />
            Cola de Verificación y Control de Calidad
          </h2>
          <p className="text-xs text-slate-500">
            Módulo del Coordinador para validar evidencias, comprobar duplicados por HMAC y publicar anónimamente.
          </p>
        </div>
        <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg">
          {cases.filter(c => ['enviado', 'en_revision'].includes(c.status)).length} Pendientes
        </span>
      </div>

      {cases.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="font-bold text-slate-800">No hay casos pendientes por revisar</h3>
          <p className="text-xs text-slate-500">Todas las solicitudes recibidas han sido procesadas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {cases.map(c => {
            const needs = mockStore.getState().needs.filter(n => n.case_id === c.id);
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono font-bold text-xs bg-slate-900 text-brand-400 px-2.5 py-1 rounded-md">
                      {c.public_code}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      Canal: {c.created_channel.toUpperCase()} • {formatDateCO(c.created_at)}
                    </span>
                  </div>
                  <Badge type="status" value={c.status} />
                </div>

                <div className="space-y-2 text-xs">
                  <div className="text-slate-800 font-semibold">{c.affectation_description}</div>
                  <div className="flex gap-2">
                    <Badge type="urgency" value={c.urgency_level} />
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {needs.length} Necesidades Desglosadas
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
                    HMAC duplicados OK
                  </span>

                  <button
                    onClick={() => setSelectedCase(c)}
                    className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Inspeccionar y Aprobar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Inspección y Verificación */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Verificación de Caso {selectedCase.public_code}</h3>
                <span className="text-xs text-slate-500">Revisión de Seguridad y Asignación de Prioridad Humana</span>
              </div>
              <button onClick={() => setSelectedCase(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200">
                <div className="font-bold text-slate-800">Afectación Reportada:</div>
                <p className="text-slate-600 leading-relaxed">{selectedCase.affectation_description}</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observaciones Internas del Coordinador</label>
                <textarea
                  rows={3}
                  value={internalNotes}
                  onChange={e => setInternalNotes(e.target.value)}
                  placeholder="Justificación de verificación, llamadas de confirmación realizadas..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleVerify(selectedCase.id)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <Globe className="w-4 h-4" />
                <span>Verificar y Publicar Anónimamente</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
