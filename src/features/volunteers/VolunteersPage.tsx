import React, { useState } from 'react';
import { mockStore } from '../../shared/lib/mockStore';
import { CheckCircle2, Award } from 'lucide-react';

export const VolunteersPage: React.FC = () => {
  const municipalities = mockStore.getState().municipalities;
  
  const [profession, setProfession] = useState('Psicología Clínica');
  const [specialty, setSpecialty] = useState('Atención de Trauma y Crisis');
  const [licenseNumber, setLicenseNumber] = useState('TP-98765-CO');
  const [muniCode, setMuniCode] = useState('63001');
  const [maxHours, setMaxHours] = useState(10);
  const [isVirtual, setIsVirtual] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mockStore.addAuditLog('PROFESSIONAL_VOLUNTEER_REGISTERED', 'professional_profiles', undefined, {
      profession,
      specialty,
      muniCode,
      maxHours
    });
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      <div className="bg-gradient-to-r from-teal-700 to-brand-800 rounded-3xl p-8 text-white shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-brand-200 text-xs font-bold uppercase tracking-wider">
          <Award className="w-4 h-4" />
          <span>Voluntariado y Apoyo Profesional</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Registro de Voluntarios Profesionales</h1>
        <p className="text-xs text-teal-100 max-w-2xl leading-relaxed">
          Sume sus capacidades en psicología, arquitectura, ingeniería, asesoría jurídica o logística para apoyar a las comunidades afectadas en el Quindío.
        </p>
      </div>

      {submitted ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Registro Profesional Recibido</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Su disponibilidad ha sido registrada en el motor de coincidencias. El equipo de coordinación lo contactará cuando exista un caso compatible.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl shadow"
          >
            Registrar Otro Voluntario
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Profesión Principal</label>
              <input
                type="text"
                required
                value={profession}
                onChange={e => setProfession(e.target.value)}
                placeholder="Ej: Psicólogo, Arquitecto, Abogado..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Especialidad / Enfoque</label>
              <input
                type="text"
                value={specialty}
                onChange={e => setSpecialty(e.target.value)}
                placeholder="Ej: Evaluación de estructuras, Primeros auxilios psicológicos"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Número de Registro o Tarjeta Profesional</label>
              <input
                type="text"
                value={licenseNumber}
                onChange={e => setLicenseNumber(e.target.value)}
                placeholder="Ej: TP-123456-CO"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Municipio Cobertura (DANE)</label>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Horas Semanales Disponibles</label>
              <input
                type="number"
                min={1}
                max={40}
                value={maxHours}
                onChange={e => setMaxHours(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVirtual}
                  onChange={e => setIsVirtual(e.target.checked)}
                  className="rounded text-brand-600"
                />
                <span>Disponible para atención virtual / remota</span>
              </label>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-800">Aviso Operativo para Apoyo Psicológico y Jurídico:</span>
            <p>Por razones de confidencialidad, las historias clínicas y notas terapéuticas NUNCA se guardan en la plataforma. Solo se audita la fecha, modalidad y confirmación de asistencia.</p>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md"
          >
            Registrar Disponibilidad Profesional
          </button>
        </form>
      )}

    </div>
  );
};
