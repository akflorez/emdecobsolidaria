import React, { useState, useEffect } from 'react';
import { mockStore } from '../../shared/lib/mockStore';
import { PublicVerifiedNeed } from '../../shared/types';
import { Badge } from '../../shared/components/Badge';
import { Icon } from '../../shared/components/Icon';
import { Search, MapPin, ShieldCheck, HeartHandshake, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PublicNeedsCatalog: React.FC = () => {
  const [needs, setNeeds] = useState<PublicVerifiedNeed[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMuni, setSelectedMuni] = useState('');

  const categories = mockStore.getState().needCategories;
  const municipalities = mockStore.getState().municipalities;

  useEffect(() => {
    setNeeds(mockStore.getPublicVerifiedNeeds());
    return mockStore.subscribe(() => {
      setNeeds(mockStore.getPublicVerifiedNeeds());
    });
  }, []);

  const filtered = needs.filter(item => {
    const matchesSearch = item.summary.toLowerCase().includes(search.toLowerCase()) ||
                          item.public_code.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !selectedCategory || item.category_name === selectedCategory;
    const matchesMuni = !selectedMuni || item.municipality_code === selectedMuni;
    return matchesSearch && matchesCat && matchesMuni;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Banner Principal Catálogo Público */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Vista Pública Anonimizada (Security Invoker View)</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Catálogo de Necesidades Verificadas</h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          Consulte las ayudas requeridas por familias afectadas en el Quindío. Cada registro ha sido previamente verificado por coordinadores. Los datos personales están rigurosamente protegidos.
        </p>

        {/* Buscador y Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Buscar por código anónimo o ítem..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Todas las Categorías</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedMuni}
              onChange={e => setSelectedMuni(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Todos los Municipios DANE</option>
              {municipalities.map(m => (
                <option key={m.code} value={m.code}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid de Tarjetas Anonimizadas */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3 shadow-sm">
          <HeartHandshake className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No hay necesidades verificadas que coincidan</h3>
          <p className="text-xs text-slate-500">Intente cambiar los filtros o busque por otro término.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(item => {
            const percent = Math.min(100, Math.round((item.quantity_fulfilled / item.quantity_required) * 100));
            return (
              <div key={item.need_id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-xs bg-slate-900 text-brand-400 px-2.5 py-1 rounded-md">
                      {item.public_code}
                    </span>
                    <Badge type="urgency" value={item.priority} />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-700 font-bold pt-1">
                    <Icon name={item.category_icon} className="w-4 h-4 text-brand-600" />
                    <span>{item.category_name}</span>
                  </div>

                  <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                    {item.summary}
                  </p>
                </div>

                {/* Barra de Progreso de Cantidad Atendida */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600">Pendiente: {item.quantity_pending} {item.unit}</span>
                    <span className="text-brand-700">{percent}% Coberto</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-brand-600 h-full transition-all duration-300" style={{ width: `${percent}%` }} />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 text-xs">
                  <div className="flex items-center gap-1 text-slate-500 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-brand-600" />
                    <span>{item.municipality_name}</span>
                  </div>

                  <Link
                    to={`/donar?need=${item.need_id}`}
                    className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-1"
                  >
                    <span>Ofrecer Ayuda</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
