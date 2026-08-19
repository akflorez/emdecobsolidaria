import React from 'react';
import { HeartHandshake, Lock, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800 mt-20 mb-14 md:mb-0">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Col 1: Marca & Descripción */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <HeartHandshake className="w-6 h-6 text-brand-400" />
            <span>EMDECOB Solidaria</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            Plataforma de ayuda social y emergencias para conectar solicitudes verificadas con donantes, voluntarios y coordinadores con total transparencia y anonimización de beneficiarios en Colombia.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-teal-400 bg-slate-800 p-2 rounded border border-slate-700">
            <Lock className="w-4 h-4" />
            <span>Privacidad protegida: RLS + HMAC Hash</span>
          </div>
        </div>

        {/* Col 2: Enlaces Rápidos */}
        <div className="space-y-3">
          <h4 className="text-white text-sm font-semibold tracking-wider uppercase">Plataforma</h4>
          <ul className="space-y-2 text-xs">
            <li><a href="/campanas" className="hover:text-white transition-colors">Campañas en Quindío</a></li>
            <li><a href="/necesidades-publicas" className="hover:text-white transition-colors">Catálogo de Necesidades Verificadas</a></li>
            <li><a href="/solicitar-ayuda" className="hover:text-white transition-colors">Solicitar Ayuda (Beneficiarios / Operadores)</a></li>
            <li><a href="/donar" className="hover:text-white transition-colors">Ofrecer Ayuda / Donaciones</a></li>
            <li><a href="/voluntarios" className="hover:text-white transition-colors">Registro de Voluntarios Profesionales</a></li>
          </ul>
        </div>

        {/* Col 3: Cobertura DANE */}
        <div className="space-y-3">
          <h4 className="text-white text-sm font-semibold tracking-wider uppercase">Cobertura Multirregional (DANE)</h4>
          <p className="text-xs text-slate-400">
            Risaralda (Pereira, Dosquebradas), Caldas (Manizales, Villamaría), Valle del Cauca (Cali, Jamundí, Palmira) y Quindío (Armenia, Calarcá, Montenegro, Circasia, La Tebaida).
          </p>
          <div className="text-[11px] text-slate-500">
            Arquitectura extensible a todos los departamentos de Colombia.
          </div>
        </div>

        {/* Col 4: Contacto & Legales */}
        <div className="space-y-3 text-xs">
          <h4 className="text-white text-sm font-semibold tracking-wider uppercase">Contacto y Legal</h4>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-400" />
            <span>Armenia, Quindío, Colombia</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-brand-400" />
            <span>Línea Operativa: (606) 741-1100</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-brand-400" />
            <span>contacto@emdecob.org</span>
          </div>
          <div className="pt-2 flex flex-col gap-1 text-[11px] text-slate-500">
            <a href="#" className="hover:underline">Política de Tratamiento de Datos Personales</a>
            <a href="#" className="hover:underline">Términos de Uso y Transparencia</a>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
        © 2026 EMDECOB Solidaria. Todos los derechos reservados. Desarrollado con estándar PWA, Capacitor y Supabase.
      </div>
    </footer>
  );
};
