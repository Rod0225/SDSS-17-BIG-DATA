import React, { useEffect, useState } from 'react';
import { BarChart2, TrendingUp, Grid, Sparkles, Sliders, ScatterChart as ScatterIcon, Layers } from 'lucide-react';
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
  ZAxis,
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
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
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
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-purple-400" />
          Análisis Exploratorio de Datos (EDA) Científico
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Estadística descriptiva multivariante, correlaciones de Pearson/Spearman, diagramas de color astronómicos e interpretaciones científicas automatizadas.
        </p>
      </div>

      {/* Scientific Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(edaData.scientific_insights || []).map((insight: any, i: number) => (
          <div key={i} className="p-5 rounded-2xl bg-space-900 border border-slate-800 shadow-xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <h3 className="text-sm font-bold text-white font-mono">{insight.topic}</h3>
            </div>
            <p className="text-xs font-semibold text-cyan-300">{insight.finding}</p>
            <p className="text-xs text-slate-300 leading-relaxed">{insight.detail}</p>
          </div>
        ))}
      </div>

      {/* Interactive Histogram Explorer */}
      <div className="p-6 rounded-3xl bg-space-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white">Histograma de Frecuencias</h3>
            <p className="text-xs text-slate-400">Distribución empírica de variables seleccionadas</p>
          </div>
          <div className="flex flex-wrap gap-1.5 bg-space-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            {['redshift', 'r', 'u_g', 'g_r', 'r_i'].map((col) => (
              <button
                key={col}
                onClick={() => setSelectedHistCol(col)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  selectedHistCol === col ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
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
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="range_label" stroke="#94A3B8" fontSize={9} />
              <YAxis stroke="#94A3B8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#374151', borderRadius: '0.75rem', color: '#F8FAFC' }}
                formatter={(val: number) => [val.toLocaleString() + ' objetos', 'Frecuencia']}
              />
              <Bar dataKey="count" fill="#A855F7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Color-Color Astronomical Scatter Plot */}
      <div className="p-6 rounded-3xl bg-space-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Diagrama Color-Color (g - r vs u - g)</h3>
            <p className="text-xs text-slate-400">Separabilidad física por temperatura espectral fotosférica</p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-lg border border-cyan-800">
            Muestra Representativa (1,500 puntos)
          </span>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis type="number" dataKey="u_g" name="u - g" stroke="#94A3B8" fontSize={11} domain={[-1, 4]} label={{ value: 'Índice u - g', position: 'insideBottom', offset: -10, fill: '#94A3B8', fontSize: 11 }} />
              <YAxis type="number" dataKey="g_r" name="g - r" stroke="#94A3B8" fontSize={11} domain={[-1, 3]} label={{ value: 'Índice g - r', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 11 }} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#374151', borderRadius: '0.75rem' }}
              />
              <Legend formatter={(val) => <span className="text-xs text-slate-300">{val}</span>} />
              <Scatter name="Estrella (STAR)" data={scatterStars} fill="#38BDF8" opacity={0.7} />
              <Scatter name="Galaxia (GALAXY)" data={scatterGalaxies} fill="#A855F7" opacity={0.6} />
              <Scatter name="Cuásar (QSO)" data={scatterQSO} fill="#F59E0B" opacity={0.8} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Correlation Matrix Table / Heatmap representation */}
      <div className="p-6 rounded-3xl bg-space-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Matriz de Correlación ({corrType.toUpperCase()})</h3>
            <p className="text-xs text-slate-400">Interdependencia lineal y monotónica entre bandas y redshift</p>
          </div>
          <div className="flex rounded-xl bg-space-950 p-1 border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setCorrType('pearson')}
              className={`px-3 py-1 rounded-lg transition-colors ${corrType === 'pearson' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
            >
              Pearson
            </button>
            <button
              onClick={() => setCorrType('spearman')}
              className={`px-3 py-1 rounded-lg transition-colors ${corrType === 'spearman' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
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
              <table className="w-full text-xs font-mono text-center">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="p-2 text-left text-slate-400">Var</th>
                    {keys.map((k) => (
                      <th key={k} className="p-2 text-slate-300">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {keys.map((rowKey) => (
                    <tr key={rowKey} className="border-b border-slate-800/40 hover:bg-slate-800/30">
                      <td className="p-2 text-left font-bold text-slate-300">{rowKey}</td>
                      {keys.map((colKey) => {
                        const val = matrix[rowKey][colKey];
                        // Color intensity based on correlation
                        const absVal = Math.abs(val);
                        const isPositive = val >= 0;
                        const bgColor = isPositive 
                          ? `rgba(56, 189, 248, ${absVal * 0.4})` 
                          : `rgba(244, 63, 94, ${absVal * 0.4})`;

                        return (
                          <td
                            key={colKey}
                            style={{ backgroundColor: bgColor }}
                            className="p-2 text-slate-100 rounded"
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

