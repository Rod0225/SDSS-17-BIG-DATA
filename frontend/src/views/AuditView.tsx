import React, { useEffect, useState } from 'react';
import { Database, Filter, Search, ShieldAlert, CheckCircle, Activity } from 'lucide-react';
import { api } from '../services/api';
import { AuditLogItem } from '../types';

export const AuditView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [filterAction, setFilterAction] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <Database className="w-6 h-6 text-indigo-400" />
            Auditoría, Trazabilidad y Reproducibilidad del Sistema
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Registro secuencial de eventos: quién ejecutó cada operación, transformaciones aplicadas, modelos entrenados y parámetros utilizados.
          </p>
        </div>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-4 py-2 rounded-xl bg-space-900 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400 self-start"
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
      <div className="rounded-3xl bg-space-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left">
            <thead className="bg-space-950 text-slate-400 border-b border-slate-800">
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
            <tbody className="divide-y divide-slate-800/60">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3.5 text-slate-500">#{log.id}</td>
                  <td className="p-3.5 font-bold text-cyan-300">
                    <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/40 text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5 text-purple-300 font-semibold">{log.module}</td>
                  <td className="p-3.5 text-slate-200">{log.user_email || 'Sistema'}</td>
                  <td className="p-3.5 text-slate-400 max-w-xs truncate" title={log.details || ''}>
                    {log.details || '-'}
                  </td>
                  <td className="p-3.5 text-slate-500">{log.ip_address || '127.0.0.1'}</td>
                  <td className="p-3.5 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

