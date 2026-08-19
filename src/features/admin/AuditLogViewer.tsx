import React, { useState, useEffect } from 'react';
import { mockStore } from '../../shared/lib/mockStore';
import { AuditLog } from '../../shared/types';
import { formatDateTimeCO } from '../../shared/lib/formatters';
import { ShieldAlert, Search } from 'lucide-react';

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLogs(mockStore.getState().auditLogs);
    return mockStore.subscribe(() => {
      setLogs(mockStore.getState().auditLogs);
    });
  }, []);

  const filtered = logs.filter(l => 
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.target_entity.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-brand-600" />
            Registro de Auditoría Inmutable (Insert-Only Audit Log)
          </h2>
          <p className="text-xs text-slate-500">
            Trazabilidad auditada de todas las acciones operativas. Permisos UPDATE y DELETE revocados en base de datos.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filtrar por acción o entidad..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Fecha y Hora (CO)</th>
                <th className="py-3 px-4">Acción</th>
                <th className="py-3 px-4">Entidad Destino</th>
                <th className="py-3 px-4">ID Destino</th>
                <th className="py-3 px-4">Payload Sanitizado (Sin PII)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filtered.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-slate-500 font-sans">{formatDateTimeCO(log.created_at)}</td>
                  <td className="py-3 px-4">
                    <span className="bg-brand-50 text-brand-800 font-bold px-2 py-0.5 rounded border border-brand-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-sans font-semibold">{log.target_entity}</td>
                  <td className="py-3 px-4 text-slate-400">{log.target_id ? log.target_id.substring(0, 12) + '...' : '-'}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                    {JSON.stringify(log.payload_sanitized)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
