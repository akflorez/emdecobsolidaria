import React, { useState, useEffect } from 'react';
import { mockStore } from '../shared/lib/mockStore';
import { CaseVerificationView } from '../features/cases/CaseVerificationView';
import { MatchingDashboard } from '../features/matching/MatchingDashboard';
import { DeliveryManager } from '../features/deliveries/DeliveryManager';
import { AuditLogViewer } from '../features/admin/AuditLogViewer';
import { PublicIndicators } from '../features/reports/PublicIndicators';
import { ShieldCheck, Sparkles, Truck, ShieldAlert, BarChart3, Download } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [user, setUser] = useState(mockStore.getState().currentUser);
  const [activeTab, setActiveTab] = useState<'overview' | 'verification' | 'matching' | 'deliveries' | 'audit'>('overview');

  useEffect(() => {
    return mockStore.subscribe(() => {
      setUser(mockStore.getState().currentUser);
    });
  }, []);

  const handleExportCSV = () => {
    const cases = mockStore.getState().cases;
    let csvContent = "data:text/csv;charset=utf-8,PublicCode,Status,Urgency,Channel,CreatedAt\n";
    cases.forEach(c => {
      csvContent += `${c.public_code},${c.status},${c.urgency_level},${c.created_channel},${c.created_at}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `EMDECOB_Casos_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header del Panel con Información de Usuario y Rol Activo */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-brand-100 text-brand-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
              {user.role}
            </span>
            <span className="text-xs text-slate-500 font-mono">Org ID: {user.organization_id.substring(0, 8)}...</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{user.full_name}</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Casos CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs de Navegación del Panel */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-2 text-xs font-bold scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'overview' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Resumen de Operación</span>
        </button>

        {['superadmin', 'org_admin', 'coordinator', 'operator'].includes(user.role) && (
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'verification' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Cola de Verificación</span>
          </button>
        )}

        {['superadmin', 'org_admin', 'coordinator'].includes(user.role) && (
          <button
            onClick={() => setActiveTab('matching')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'matching' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Motor Coincidencias</span>
          </button>
        )}

        {['superadmin', 'org_admin', 'coordinator', 'operator'].includes(user.role) && (
          <button
            onClick={() => setActiveTab('deliveries')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'deliveries' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Entregas</span>
          </button>
        )}

        {['superadmin', 'org_admin', 'coordinator', 'auditor'].includes(user.role) && (
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'audit' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Auditoría (Insert-Only)</span>
          </button>
        )}
      </div>

      {/* Contenido de la Tab Seleccionada */}
      {activeTab === 'overview' && <PublicIndicators />}
      {activeTab === 'verification' && <CaseVerificationView />}
      {activeTab === 'matching' && <MatchingDashboard />}
      {activeTab === 'deliveries' && <DeliveryManager />}
      {activeTab === 'audit' && <AuditLogViewer />}

    </div>
  );
};
