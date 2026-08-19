import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mockStore } from '../shared/lib/mockStore';
import { HeartHandshake, ShieldCheck, PlusCircle, ArrowRight, CheckCircle2, Lock } from 'lucide-react';

export const Home: React.FC = () => {
  const [stats, setStats] = useState(mockStore.getPublicCampaignStats());
  const [verifiedNeeds, setVerifiedNeeds] = useState(mockStore.getPublicVerifiedNeeds().slice(0, 3));

  useEffect(() => {
    return mockStore.subscribe(() => {
      setStats(mockStore.getPublicCampaignStats());
      setVerifiedNeeds(mockStore.getPublicVerifiedNeeds().slice(0, 3));
    });
  }, []);

  return (
    <div className="space-y-16 pb-12">
      
      {/* Hero Section Con Rich Aesthetics */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-teal-950 to-brand-900 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-brand-500/20 text-brand-300 border border-brand-400/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              <span>Gestión Social Transparente & Anonimizada</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Conectando la ayuda solidaria con quien más lo necesita
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Plataforma nacional para Risaralda, Caldas (Manizales), Valle del Cauca (Cali), Quindío y extendible a toda Colombia. Registre solicitudes de ayuda, donaciones en especie o voluntariado profesional con anonimización estricta.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/solicitar-ayuda"
                className="px-6 py-3.5 bg-brand-500 hover:bg-brand-600 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Solicitar Ayuda</span>
              </Link>

              <Link
                to="/necesidades-publicas"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl border border-white/20 backdrop-blur-sm transition-colors flex items-center gap-2"
              >
                <span>Ver Catálogo Verificado</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Tarjeta de Indicadores en Vivo */}
          <div className="bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/20 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="font-bold text-base text-white">Impacto en Tiempo Real (Quindío)</h3>
              <span className="text-[10px] bg-emerald-500/30 text-emerald-300 font-mono font-bold px-2.5 py-1 rounded-full">DATOS OPERATIVOS REALES</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/10 space-y-1">
                <span className="text-xs text-slate-400 font-semibold block">Solicitudes Verificadas</span>
                <span className="text-3xl font-extrabold text-brand-300 block">{stats.total_cases_verified}</span>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/10 space-y-1">
                <span className="text-xs text-slate-400 font-semibold block">Familias Beneficiadas</span>
                <span className="text-3xl font-extrabold text-emerald-400 block">{stats.total_families_benefited}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl text-xs text-slate-300 flex items-center gap-2 border border-slate-700">
              <Lock className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Todas las donaciones e identificadores son protegidos con cifrado RLS y hash HMAC.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sección ¿Cómo Funciona? (Recorrido de 13 pasos sintetizado) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Flujo Transparente de Principio a Fin</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">¿Cómo Funciona EMDECOB Solidaria?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '1', title: 'Registro y Borrador', desc: 'El beneficiario u operador registra la solicitud mediante formulario móvil con autoguardado.', icon: PlusCircle },
            { step: '2', title: 'Verificación Humana', desc: 'Un coordinador inspecciona evidencias y verifica el caso anonimizando datos personales.', icon: ShieldCheck },
            { step: '3', title: 'Coincidencia Algorítmica', desc: 'El motor propone coincidencias con donaciones e insta transacciones SQL seguras.', icon: HeartHandshake },
            { step: '4', title: 'Entrega y Auditoría', desc: 'Se registra la entrega y el beneficiario confirma la recepción actualizando las métricas.', icon: CheckCircle2 }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm">
                {item.step}
              </div>
              <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vista Previa de Necesidades Verificadas */}
      {verifiedNeeds.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Ayuda Requerida</span>
              <h2 className="text-2xl font-extrabold text-slate-900">Necesidades Verificadas Recientes</h2>
            </div>
            <Link to="/necesidades-publicas" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              <span>Ver Catálogo Completo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {verifiedNeeds.map(item => (
              <div key={item.need_id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-xs bg-slate-900 text-brand-400 px-2.5 py-1 rounded">
                    {item.public_code}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{item.municipality_name}</span>
                </div>
                <div className="font-bold text-sm text-slate-900">{item.category_name}</div>
                <p className="text-xs text-slate-600 line-clamp-2">{item.summary}</p>
                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-500">Pendiente: <strong>{item.quantity_pending} {item.unit}</strong></span>
                  <Link to={`/donar?need=${item.need_id}`} className="text-brand-600 font-bold hover:underline">
                    Ofrecer Ayuda →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
