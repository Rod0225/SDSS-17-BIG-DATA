import React, { useEffect, useState } from 'react';
import { Search, Filter, FileText, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { api } from '../services/api';
import { VariableDoc } from '../types';

export const VariablesView: React.FC = () => {
  const [variables, setVariables] = useState<VariableDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'PREDICTOR' | 'EXCLUDE'>('ALL');

  useEffect(() => {
    async function loadVars() {
      try {
        const res = await api.getVariables();
        setVariables(res.variables);
      } catch (err) {
        console.error("Error loading variables:", err);
      } finally {
        setLoading(false);
      }
    }
    loadVars();
  }, []);

  const filtered = variables.filter((v) => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterRole === 'PREDICTOR') {
      return matchesSearch && (v.ml_role.toLowerCase().includes('predictor') || v.ml_role.toLowerCase().includes('clave') || v.ml_role.toLowerCase().includes('crucial'));
    }
    if (filterRole === 'EXCLUDE') {
      return matchesSearch && v.ml_role.toLowerCase().includes('excluir');
    }
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            Diccionario Científico de Variables (SDSS-17)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Documentación exhaustiva de las 18 columnas del dataset, unidades físicas, estadísticas descriptivas y justificación de inclusión o exclusión en Machine Learning.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar variable..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-space-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex rounded-xl bg-space-900 border border-slate-800 p-1 text-xs font-mono">
            <button
              onClick={() => setFilterRole('ALL')}
              className={`px-3 py-1 rounded-lg transition-colors ${filterRole === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
            >
              Todas (18)
            </button>
            <button
              onClick={() => setFilterRole('PREDICTOR')}
              className={`px-3 py-1 rounded-lg transition-colors ${filterRole === 'PREDICTOR' ? 'bg-cyan-950 text-cyan-300' : 'text-slate-400'}`}
            >
              Predictoras
            </button>
            <button
              onClick={() => setFilterRole('EXCLUDE')}
              className={`px-3 py-1 rounded-lg transition-colors ${filterRole === 'EXCLUDE' ? 'bg-rose-950 text-rose-300' : 'text-slate-400'}`}
            >
              Excluidas
            </button>
          </div>
        </div>
      </div>

      {/* Variables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => {
          const isPredictor = item.ml_role.toLowerCase().includes('predictor') || item.ml_role.toLowerCase().includes('crucial');
          const isTarget = item.ml_role.toLowerCase().includes('objetivo');
          const isExcluded = item.ml_role.toLowerCase().includes('excluir');

          return (
            <div
              key={item.name}
              className="p-5 rounded-2xl bg-space-900 border border-slate-800 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div className="space-y-3">
                {/* Header with name and Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-extrabold text-white font-mono tracking-wide">{item.name}</h3>
                    <span className="text-[10px] font-mono text-slate-400">{item.type} • {item.unit}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider ${
                    isTarget ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                    isPredictor ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                    'bg-rose-950/80 text-rose-300 border border-rose-800'
                  }`}>
                    {item.ml_role}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>

                {/* Scientific Importance */}
                <div className="p-2.5 rounded-xl bg-space-950 border border-slate-800/80 text-[11px] text-slate-400">
                  <strong className="text-slate-300 block mb-0.5">Importancia Astrofísica:</strong>
                  {item.importance}
                </div>
              </div>

              {/* Statistical Summary Box */}
              {item.stats && 'min' in item.stats && (
                <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-[10px] font-mono">
                  <div className="bg-space-950/60 p-1.5 rounded-lg border border-slate-800/50">
                    <span className="text-slate-500 block">Mín / Máx</span>
                    <span className="text-slate-200">{Number(item.stats.min).toFixed(1)} / {Number(item.stats.max).toFixed(1)}</span>
                  </div>
                  <div className="bg-space-950/60 p-1.5 rounded-lg border border-slate-800/50">
                    <span className="text-slate-500 block">Media (μ)</span>
                    <span className="text-slate-200">{Number(item.stats.mean).toFixed(2)}</span>
                  </div>
                  <div className="bg-space-950/60 p-1.5 rounded-lg border border-slate-800/50">
                    <span className="text-slate-500 block">Desv (σ)</span>
                    <span className="text-slate-200">{Number(item.stats.std).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

