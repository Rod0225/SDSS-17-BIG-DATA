import React, { useEffect, useState } from 'react';
import { Database } from 'lucide-react';
import { api } from '../services/api';
import { AuditLogItem } from '../types';

export const AuditView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [filterAction, setFilterAction] = useState<string>('');
  const [, setLoading] = useState<boolean>(true);

  const loadLogs = async () => {
    try {
      const res = await api.getAuditLogs(100, filterAction || undefined);
      setLogs(res);
    } catch (err) {
      console.error("Error loading audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [filterAction]);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-sky-600" />
            Auditoría, Trazabilidad y Reproducibilidad del Sistema
          </h2>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Registro secuencial de eventos: quién ejecutó cada operación, transformaciones aplicadas, modelos entrenados y parámetros utilizados.
          </p>
        </div>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-sky-600 shadow-sm self-start"
        >
          <option value="">Todas las Acciones</option>
          <option value="LOGIN">LOGIN</option>
          <option value="ETL_PIPELINE_RUN">ETL_PIPELINE_RUN</option>
          <option value="MODELS_RETRAINED">MODELS_RETRAINED</option>
          <option value="BATCH_PREDICTION">BATCH_PREDICTION</option>
          <option value="USER_CREATED">USER_CREATED</option>
          <option value="USER_UPDATED">USER_UPDATED</option>
          <option value="USER_DELETED">USER_DELETED</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">ID</th>
                <th className="p-3.5">Acción</th>
                <th className="p-3.5">Módulo</th>
                <th className="p-3.5">Usuario</th>
                <th className="p-3.5">Detalles</th>
                <th className="p-3.5">IP</th>
                <th className="p-3.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 text-slate-500 font-medium">#{log.id}</td>
                  <td className="p-3.5 font-bold">
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-100 border border-sky-300 text-sky-900 text-[10px] font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5 text-purple-800 font-bold">{log.module}</td>
                  <td className="p-3.5 text-slate-900 font-bold">{log.user_email || 'Sistema'}</td>
                  <td className="p-3.5 text-slate-700 max-w-xs truncate font-medium" title={log.details || ''}>
                    {log.details || '-'}
                  </td>
                  <td className="p-3.5 text-slate-500 font-medium">{log.ip_address || '127.0.0.1'}</td>
                  <td className="p-3.5 text-slate-600 font-medium">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
