import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockStore } from '../lib/mockStore';
import { LoginModal } from '../../features/auth/LoginModal';
import { HeartHandshake, Shield, PlusCircle, LayoutDashboard, LogIn, LogOut, UserCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [currentUser, setCurrentUser] = useState(mockStore.getState().currentUser);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    return mockStore.subscribe(() => {
      setCurrentUser(mockStore.getState().currentUser);
    });
  }, []);

  const handleLogout = () => {
    if (confirm('¿Desea cerrar la sesión actual?')) {
      mockStore.addAuditLog('USER_LOGGED_OUT', 'auth', undefined, { role: currentUser.role });
      // Reset user session to default viewer or basic role
      mockStore.setCurrentUserRole('operator');
      navigate('/');
    }
  };

  const getRoleBadgeLabel = (role: string) => {
    switch (role) {
      case 'superadmin': return 'Superadmin';
      case 'org_admin': return 'Admin Org';
      case 'coordinator': return 'Coordinador';
      case 'operator': return 'Operador';
      case 'auditor': return 'Auditor';
      default: return role;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        {/* Banner de Emergencia y Notificación Oficial */}
        <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[10px]">IMPORTANTE</span>
            <span>EMDECOB Solidaria no reemplaza servicios de emergencia de atención inmediata. Línea nacional 123.</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-slate-400">
            <span>Atención: (606) 741-1100</span>
            <span>Cruz Roja 132</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo Marca */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-slate-900 tracking-tight block">EMDECOB <span className="text-brand-600">Solidaria</span></span>
                <span className="text-[10px] text-slate-500 font-medium block">Plataforma de Ayuda Humanitaria</span>
              </div>
            </Link>

            {/* Navegación Desktop */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
              <Link to="/campanas" className="hover:text-brand-600 transition-colors">Campañas</Link>
              <Link to="/necesidades-publicas" className="hover:text-brand-600 transition-colors flex items-center gap-1">
                <span>Necesidades Verificadas</span>
                <span className="bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full text-xs font-bold">Verificadas</span>
              </Link>
              <Link to="/donar" className="hover:text-brand-600 transition-colors">Ofrecer Ayuda</Link>
              <Link to="/voluntarios" className="hover:text-brand-600 transition-colors">Voluntariado</Link>
              <Link to="/panel" className="text-brand-600 hover:text-brand-700 font-bold flex items-center gap-1">
                <LayoutDashboard className="w-4 h-4" />
                <span>Panel de Control</span>
              </Link>
            </nav>

            {/* Estado de Autenticación Institucional Segura */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                <UserCheck className="w-4 h-4 text-brand-600" />
                <span className="font-bold text-slate-800">{getRoleBadgeLabel(currentUser.role)}</span>
              </div>

              <button
                onClick={() => setIsLoginOpen(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Ingreso Institucional</span>
              </button>

              <Link
                to="/solicitar-ayuda"
                className="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Solicitar Ayuda</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Modal de Inicio de Sesión Institucional */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={() => navigate('/panel')}
      />
    </>
  );
};
