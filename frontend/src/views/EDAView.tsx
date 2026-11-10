import React, { useEffect, useState } from 'react';
import { BarChart2 } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ScatterChart,
  Scatter,
  Legend
} from 'recharts';
import { api } from '../services/api';

export const EDAView: React.FC = () => {
  const [edaData, setEdaData] = useState<any>(null);
  const [selectedHistCol, setSelectedHistCol] = useState<string>('redshift');
  const [corrType, setCorrType] = useState<'pearson' | 'spearman'>('pearson');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadEDA() {
      try {
        const res = await api.getEDASummary();
        setEdaData(res);
      } catch (err) {
        console.error("Error loading EDA data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadEDA();
  }, []);

  if (loading || !edaData) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentHist = edaData.histograms?.[selectedHistCol] || [];

  // Group scatter points by class for multi-colored scatter plot
  const scatterStars = (edaData.scatter_sample || []).filter((p: any) => p.class === 'STAR');
  const scatterGalaxies = (edaData.scatter_sample || []).filter((p: any) => p.class === 'GALAXY');
  const scatterQSO = (edaData.scatter_sample || []).filter((p: any) => p.class === 'QSO');

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-purple-600" />
          Análisis Exploratorio de Datos (EDA) Científico
        </h2>
        <p className="text-xs text-slate-600 mt-1 font-medium">
          Estadística descriptiva multivariante, correlaciones de Pearson/Spearman, diagramas de color astronómicos e interpretaciones científicas automatizadas.
        </p>
      </div>

      {/* Scientific Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(edaData.scientific_insights || []).map((insight: any, i: number) => (
          <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
              <h3 className="text-sm font-black text-slate-900 font-mono">{insight.topic}</h3>
            </div>
            <p className="text-xs font-bold text-sky-800">{insight.finding}</p>
            <p className="text-xs text-slate-700 leading-relaxed font-normal">{insight.detail}</p>
          </div>
        ))}
      </div>

      {/* Interactive Histogram Explorer */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Histograma de Frecuencias</h3>
            <p className="text-xs text-slate-500 font-medium">Distribución empírica de variables seleccionadas</p>
          </div>
          <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-mono">
            {['redshift', 'r', 'u_g', 'g_r', 'r_i'].map((col) => (
              <button
                key={col}
                onClick={() => setSelectedHistCol(col)}
                className={`px-3 py-1 rounded-lg transition-colors font-bold ${
                  selectedHistCol === col ? 'bg-sky-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {col}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={currentHist}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="range_label" stroke="#475569" fontSize={10} fontWeight={600} />
              <YAxis stroke="#475569" fontSize={11} fontWeight={600} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '0.75rem', color: '#0F172A', fontWeight: 600, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(val: number) => [val.toLocaleString() + ' objetos', 'Frecuencia']}
              />
              <Bar dataKey="count" fill="#7E22CE" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Color-Color Astronomical Scatter Plot */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Diagrama Color-Color (g - r vs u - g)</h3>
            <p className="text-xs text-slate-500 font-medium">Separabilidad física por temperatura espectral fotosférica</p>
          </div>
          <span className="text-xs font-mono font-bold text-sky-900 bg-sky-100 px-3 py-1 rounded-lg border border-sky-300">
            Muestra Representativa (1,500 puntos)
          </span>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" dataKey="u_g" name="u - g" stroke="#475569" fontSize={11} fontWeight={600} domain={[-1, 4]} label={{ value: 'Índice u - g', position: 'insideBottom', offset: -10, fill: '#475569', fontSize: 11, fontWeight: 600 }} />
              <YAxis type="number" dataKey="g_r" name="g - r" stroke="#475569" fontSize={11} fontWeight={600} domain={[-1, 3]} label={{ value: 'Índice g - r', angle: -90, position: 'insideLeft', fill: '#475569', fontSize: 11, fontWeight: 600 }} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '0.75rem', color: '#0F172A', fontWeight: 600, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend formatter={(val) => <span className="text-xs font-bold text-slate-800">{val}</span>} />
              <Scatter name="Estrella (STAR)" data={scatterStars} fill="#0284C7" opacity={0.85} />
              <Scatter name="Galaxia (GALAXY)" data={scatterGalaxies} fill="#7E22CE" opacity={0.75} />
              <Scatter name="Cuásar (QSO)" data={scatterQSO} fill="#D97706" opacity={0.9} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Correlation Matrix Table / Heatmap representation */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Matriz de Correlación ({corrType.toUpperCase()})</h3>
            <p className="text-xs text-slate-500 font-medium">Interdependencia lineal y monotónica entre bandas y redshift</p>
          </div>
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-mono shadow-sm">
            <button
              onClick={() => setCorrType('pearson')}
              className={`px-3 py-1 rounded-lg transition-colors font-bold ${corrType === 'pearson' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Pearson
            </button>
            <button
              onClick={() => setCorrType('spearman')}
              className={`px-3 py-1 rounded-lg transition-colors font-bold ${corrType === 'spearman' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Spearman
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {(() => {
            const matrix = corrType === 'pearson' ? edaData.correlation_matrix_pearson : edaData.correlation_matrix_spearman;
            if (!matrix) return null;
            const keys = Object.keys(matrix);

            return (
              <table className="w-full text-xs font-mono text-center border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="p-2 text-left font-bold text-slate-600">Var</th>
                    {keys.map((k) => (
                      <th key={k} className="p-2 font-bold text-slate-800">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {keys.map((rowKey) => (
                    <tr key={rowKey} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-2 text-left font-black text-slate-900">{rowKey}</td>
                      {keys.map((colKey) => {
                        const val = matrix[rowKey][colKey];
                        const absVal = Math.abs(val);
                        const isPositive = val >= 0;
                        const bgColor = isPositive 
                          ? `rgba(2, 132, 199, ${absVal * 0.35})` 
                          : `rgba(225, 29, 72, ${absVal * 0.35})`;

                        return (
                          <td
                            key={colKey}
                            style={{ backgroundColor: bgColor }}
                            className="p-2 text-slate-900 font-bold border border-slate-100"
                            title={`${rowKey} vs ${colKey}: ${val}`}
                          >
                            {val.toFixed(2)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
