import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2, TrendingUp, BarChart3, HelpCircle } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { api } from '../services/api';
import { DataQualityReport } from '../types';

export const DataQualityView: React.FC = () => {
  const [quality, setQuality] = useState<DataQualityReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getDataQuality();
        setQuality(res);
      } catch (err) {
        console.error("Error loading data quality report:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !quality) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const outlierChartData = Object.entries(quality.outliers_by_column || {}).map(([col, data]) => ({
    columna: col,
    outliers: data.count,
    porcentaje: data.percentage
  }));

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          Monitoreo Integral de Calidad de Datos (Data Quality)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Diagnóstico de integridad, detección de anomalías por método de rango intercuartílico (IQR), valores faltantes y score de gobernanza.
        </p>
      </div>

      {/* Main Score Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/60 to-space-900 border border-emerald-700/50 shadow-xl flex flex-col justify-between">
          <span className="text-xs font-mono text-emerald-300 font-semibold uppercase tracking-wider">Score Global de Calidad</span>
          <div className="my-3">
            <span className="text-4xl md:text-5xl font-extrabold text-emerald-400 font-mono">{quality.quality_score}%</span>
            <span className="block text-xs text-emerald-300/80 font-mono mt-1 font-semibold">{quality.quality_grade}</span>
          </div>
          <span className="text-[11px] text-slate-300">{quality.quality_label}</span>
        </div>

        <div className="p-5 rounded-2xl bg-space-900 border border-slate-800 space-y-1">
          <span className="text-xs font-mono text-slate-400 uppercase">Registros Válidos</span>
          <div className="text-2xl font-bold text-white font-mono">{quality.valid_records.toLocaleString()}</div>
          <span className="text-xs text-emerald-400 font-mono">{quality.completeness_percentage}% de completitud</span>
        </div>

        <div className="p-5 rounded-2xl bg-space-900 border border-slate-800 space-y-1">
          <span className="text-xs font-mono text-slate-400 uppercase">Valores Centinela / Sensor</span>
          <div className="text-2xl font-bold text-amber-400 font-mono">{quality.sensor_error_count}</div>
          <span className="text-xs text-slate-400 font-mono">-9999.0 corregido en ETL</span>
        </div>

        <div className="p-5 rounded-2xl bg-space-900 border border-slate-800 space-y-1">
          <span className="text-xs font-mono text-slate-400 uppercase">Duplicados Exactos</span>
          <div className="text-2xl font-bold text-cyan-400 font-mono">{quality.duplicate_count}</div>
          <span className="text-xs text-slate-400 font-mono">{quality.duplicate_percentage}% del dataset</span>
        </div>
      </div>

      {/* Outliers Chart & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outliers IQR Bar Chart */}
        <div className="p-6 rounded-3xl bg-space-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Valores Atípicos Detectados (Método IQR)</h3>
              <p className="text-xs text-slate-400">Cantidad de registros fuera de [Q1 - 1.5*IQR, Q3 + 1.5*IQR]</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-mono">
              Total: {quality.total_outliers_detected.toLocaleString()}
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={outlierChartData.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="columna" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#374151', borderRadius: '0.75rem', color: '#F8FAFC' }}
                  formatter={(val: number) => [val.toLocaleString() + ' atípicos', 'Cantidad']}
                />
                <Bar dataKey="outliers" fill="#38BDF8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scientific Quality Recommendations */}
        <div className="p-6 rounded-3xl bg-space-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            Dictamen de Calidad y Recomendaciones de Ingeniería
          </h3>
          <div className="space-y-3">
            {quality.recommendations.map((rec, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-space-950 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-slate-300 leading-relaxed">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

