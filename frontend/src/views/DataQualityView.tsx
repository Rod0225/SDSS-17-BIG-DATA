import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
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
        <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
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
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          Monitoreo Integral de Calidad de Datos (Data Quality)
        </h2>
        <p className="text-xs text-slate-600 mt-1 font-medium">
          Diagnóstico de integridad, detección de anomalías por método de rango intercuartílico (IQR), valores faltantes y score de gobernanza.
        </p>
      </div>

      {/* Main Score Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-mono text-emerald-800 font-bold uppercase tracking-wider">Score Global de Calidad</span>
          <div className="my-3">
            <span className="text-4xl md:text-5xl font-black text-emerald-700 font-mono">{quality.quality_score}%</span>
            <span className="block text-xs text-emerald-800 font-mono mt-1 font-bold">{quality.quality_grade}</span>
          </div>
          <span className="text-[11px] font-medium text-slate-700">{quality.quality_label}</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase">Registros Válidos</span>
          <div className="text-2xl font-black text-slate-900 font-mono">{quality.valid_records.toLocaleString()}</div>
          <span className="text-xs text-emerald-700 font-mono font-bold">{quality.completeness_percentage}% de completitud</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase">Valores Centinela / Sensor</span>
          <div className="text-2xl font-black text-amber-600 font-mono">{quality.sensor_error_count}</div>
          <span className="text-xs text-slate-600 font-mono font-medium">-9999.0 corregido en ETL</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase">Duplicados Exactos</span>
          <div className="text-2xl font-black text-sky-700 font-mono">{quality.duplicate_count}</div>
          <span className="text-xs text-slate-600 font-mono font-medium">{quality.duplicate_percentage}% del dataset</span>
        </div>
      </div>

      {/* Outliers Chart & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outliers IQR Bar Chart */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Valores Atípicos Detectados (Método IQR)</h3>
              <p className="text-xs text-slate-500">Cantidad de registros fuera de [Q1 - 1.5*IQR, Q3 + 1.5*IQR]</p>
            </div>
            <span className="px-3 py-1 rounded-lg bg-sky-100 border border-sky-300 text-sky-900 text-xs font-mono font-bold">
              Total: {quality.total_outliers_detected.toLocaleString()}
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={outlierChartData.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="columna" stroke="#475569" fontSize={11} fontWeight={600} />
                <YAxis stroke="#475569" fontSize={11} fontWeight={600} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '0.75rem', color: '#0F172A', fontWeight: 600, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: number) => [val.toLocaleString() + ' atípicos', 'Cantidad']}
                />
                <Bar dataKey="outliers" fill="#0284C7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scientific Quality Recommendations */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            Dictamen de Calidad y Recomendaciones de Ingeniería
          </h3>
          <div className="space-y-3">
            {quality.recommendations.map((rec, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-slate-800 leading-relaxed font-medium">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
