import React, { useState, useEffect } from 'react';
import { mockStore } from '../../shared/lib/mockStore';
import { formatCOP } from '../../shared/lib/formatters';
import { Users, ShieldCheck, DollarSign, Home, CheckCircle2 } from 'lucide-react';

export const PublicIndicators: React.FC = () => {
  const [stats, setStats] = useState(mockStore.getPublicCampaignStats());
  const [needs, setNeeds] = useState(mockStore.getState().needs);

  useEffect(() => {
    setStats(mockStore.getPublicCampaignStats());
    setNeeds(mockStore.getState().needs);

    return mockStore.subscribe(() => {
      setStats(mockStore.getPublicCampaignStats());
      setNeeds(mockStore.getState().needs);
    });
  }, []);

  const totalValueCOP = needs.reduce((acc, n) => acc + (n.estimated_value_cop || 0), 0);
  const openCount = needs.filter(n => n.status === 'abierta').length;
  const fulfilledCount = needs.filter(n => n.status === 'atendida').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="bg-brand-100 text-brand-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Métricas en Tiempo Real
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Indicadores Públicos de Transparencia e Impacto
        </h2>
        <p className="text-xs text-slate-500">
          Resultados calculados con operaciones reales en la plataforma para la emergencia en el Quindío.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Solicitudes Recibidas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold text-slate-500 uppercase">Solicitudes Recibidas</span>
            <Users className="w-5 h-5 text-brand-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.total_cases_received}</div>
          <div className="text-[11px] text-slate-500">Casos registrados por autogestión u operadores</div>
        </div>

        {/* Card 2: Solicitudes Verificadas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold text-slate-500 uppercase">Casos Verificados</span>
            <ShieldCheck className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-3xl font-extrabold text-teal-700">{stats.total_cases_verified}</div>
          <div className="text-[11px] text-slate-500">Revisados por equipo de coordinación</div>
        </div>

        {/* Card 3: Familias Beneficiadas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold text-slate-500 uppercase">Familias Atendidas</span>
            <Home className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-700">{stats.total_families_benefited}</div>
          <div className="text-[11px] text-slate-500">Familias con entregas confirmadas</div>
        </div>

        {/* Card 4: Valor Total Ayudas COP */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold text-slate-500 uppercase">Valor Estimado Ayudas</span>
            <DollarSign className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{formatCOP(totalValueCOP)}</div>
          <div className="text-[11px] text-slate-500">Suma total en pesos colombianos (COP)</div>
        </div>

      </div>

      {/* Desglose de Estado de Necesidades */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-slate-900">Estado General de las Necesidades</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Monitoreo continuo de las necesidades registradas en el catálogo público frente al volumen cubierto con donaciones o voluntariado.
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-600">Total Necesidades Registradas:</span>
              <span className="text-slate-900 font-bold">{needs.length}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-amber-700">Necesidades Abiertas / En Proceso:</span>
              <span className="text-amber-800 font-bold">{openCount}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-emerald-700">Necesidades 100% Atendidas:</span>
              <span className="text-emerald-800 font-bold">{fulfilledCount}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h4 className="font-bold text-slate-800">Transparencia Total Garantizada</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Cada movimiento operativo genera un registro inmutable de auditoría. Ningún dato sensible de los beneficiarios es expuesto en estos reportes.
          </p>
        </div>
      </div>
    </div>
  );
};
