import React, { useState, useEffect } from 'react';
import { mockStore } from '../../shared/lib/mockStore';
import { Campaign } from '../../shared/types';
import { ShieldCheck, Plus, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CampaignList: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const municipalities = mockStore.getState().municipalities;
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [muniCode, setMuniCode] = useState('63001');
  const role = mockStore.getState().currentUser.role;

  useEffect(() => {
    setCampaigns(mockStore.getState().campaigns);
    return mockStore.subscribe(() => {
      setCampaigns(mockStore.getState().campaigns);
    });
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    mockStore.createCampaign(title, description, muniCode);
    setTitle('');
    setDescription('');
    setShowModal(false);
  };

  const getMuniName = (code?: string) => {
    if (!code) return 'Todo el Quindío';
    return municipalities.find(m => m.code === code)?.name || code;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-700 to-teal-800 rounded-2xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="bg-brand-500/30 text-brand-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Emergencias Activas en Colombia
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Campañas de Atención Humanitaria</h1>
          <p className="text-sm text-teal-100 leading-relaxed">
            Coordinación centralizada de emergencias en Risaralda, Caldas (Manizales), Valle del Cauca (Cali), Quindío y departamentos de Colombia.
          </p>
        </div>

        {['superadmin', 'org_admin', 'coordinator'].includes(role) && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-white text-brand-800 hover:bg-brand-50 font-bold text-sm px-5 py-3 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Crear Nueva Campaña</span>
          </button>
        )}
      </div>

      {/* Grid de Campañas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map(c => (
          <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Campaña Activa
                </span>
                <span className="text-slate-400 text-xs flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(c.created_at).toLocaleDateString('es-CO')}
                </span>
              </div>

              <h3 className="font-bold text-lg text-slate-900 leading-snug">{c.title}</h3>
              <p className="text-slate-600 text-xs line-clamp-3 leading-relaxed">{c.description}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <MapPin className="w-4 h-4 text-brand-600" />
                <span>Quindío - {getMuniName(c.municipality_code)}</span>
              </div>

              <Link
                to={`/solicitar-ayuda?campaign=${c.id}`}
                className="text-brand-600 hover:text-brand-700 font-bold text-xs flex items-center gap-1"
              >
                <span>Solicitar Ayuda</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Crear Campaña */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Crear Campaña de Emergencia</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Título de la Campaña</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ej: Emergencia Inundación Montenegro 2026"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Municipio Cobertura (DANE)</label>
                <select
                  value={muniCode}
                  onChange={e => setMuniCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  {municipalities.map(m => (
                    <option key={m.code} value={m.code}>{m.name} ({m.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Descripción de la Emergencia</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Detalles de la afectación, zonas impactadas y necesidades esperadas..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  Guardar Campaña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
