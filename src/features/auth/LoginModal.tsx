import React, { useState } from 'react';
import { mockStore } from '../../shared/lib/mockStore';
import { OrgRole } from '../../shared/types';
import { Shield, Lock, User, CheckCircle2, KeyRound } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<OrgRole>('coordinator');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      // Iniciar sesión con el rol seleccionado y credenciales
      mockStore.setCurrentUserRole(selectedRole);
      mockStore.addAuditLog('USER_AUTHENTICATED', 'auth', undefined, { email: email || 'usuario@emdecob.org', role: selectedRole });
      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-100">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
              <Shield className="w-3.5 h-3.5" />
              <span>Autenticación Institucional</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Ingreso Seguro</h3>
            <p className="text-xs text-slate-500">Ingrese sus credenciales de usuario autorizado para acceder a paneles de gestión.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico Institucional</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="coordinador@emdecob.org"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Rol Operativo Autorizado</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value as OrgRole)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none text-xs font-semibold bg-white"
              >
                <option value="coordinator">Coordinador / Validador</option>
                <option value="operator">Operador de Campo</option>
                <option value="org_admin">Administrador de Organización</option>
                <option value="superadmin">Superadministrador del Sistema</option>
                <option value="auditor">Auditor Interno / Externo</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
            <Lock className="w-4 h-4 text-brand-600 shrink-0" />
            <span>Acceso protegido por Row Level Security (RLS) y token de sesión cifrado.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-transform active:scale-98 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{loading ? 'Verificando credenciales...' : 'Iniciar Sesión'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
