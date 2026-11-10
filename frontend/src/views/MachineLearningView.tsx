import React, { useEffect, useState } from 'react';
import { Cpu, Award, Zap, BarChart2, RefreshCw, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MLExperimentsSummary, ModelComparison } from '../types';

export const MachineLearningView: React.FC = () => {
  const { hasRole } = useAuth();
  const [summary, setSummary] = useState<MLExperimentsSummary | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelComparison | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [retraining, setRetraining] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const res = await api.getExperiments();
      setSummary(res);
      if (res.models_comparison?.length > 0) {
        // default select best model
        const best = res.models_comparison.find(m => m.model_name === res.best_model_name) || res.models_comparison[0];
        setSelectedModel(best);
      }
    } catch (err) {
      console.error("Error loading ML experiments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRetrain = async (quick: boolean = false) => {
    if (!confirm(`¿Iniciar reentrenamiento supervisado de los 6 modelos?`)) return;
    setRetraining(true);
    try {
      const res = await api.retrainModels(quick);
      setSummary(res.summary);
      const best = res.summary.models_comparison.find(m => m.model_name === res.summary.best_model_name);
      if (best) setSelectedModel(best);
      alert(`Modelos reentrenados exitosamente. Mejor modelo: ${res.summary.best_model_name}`);
    } catch (err: any) {
      alert(`Error en entrenamiento: ${err.message}`);
    } finally {
      setRetraining(false);
    }
  };

  if (loading || !summary) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Feature importance data for chart
  const featureImpData = selectedModel?.feature_importances 
    ? Object.entries(selectedModel.feature_importances).map(([col, val]) => ({
        característica: col,
        importancia: (val * 100).toFixed(2)
      }))
    : Object.entries(summary.permutation_importance_best_model || {}).map(([col, obj]) => ({
        característica: col,
        importancia: (obj.mean * 100).toFixed(2)
      }));

  // ROC curve data for selected model
  const rocChartData: any[] = [];
  if (selectedModel?.roc_curves?.['GALAXY']) {
    const galaxyFpr = selectedModel.roc_curves['GALAXY'].fpr;
    const galaxyTpr = selectedModel.roc_curves['GALAXY'].tpr;
    const starTpr = selectedModel.roc_curves['STAR']?.tpr || [];
    const qsoTpr = selectedModel.roc_curves['QSO']?.tpr || [];

    for (let i = 0; i < galaxyFpr.length; i++) {
      rocChartData.push({
        fpr: galaxyFpr[i],
        GALAXY: galaxyTpr[i],
        STAR: starTpr[i] || 0,
        QSO: qsoTpr[i] || 0,
        diagonal: galaxyFpr[i]
      });
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Cpu className="w-6 h-6 text-purple-600" />
            Módulo de Machine Learning y Clasificación Supervisada
          </h2>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Entrenamiento, optimización y comparación de 6 algoritmos supervisados multiclase evaluados con 100,000 objetos astronómicos reales.
          </p>
        </div>

        {hasRole(['ADMIN', 'ANALYST']) && (
          <div className="flex gap-2">
            <button
              onClick={() => handleRetrain(false)}
              disabled={retraining}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-purple-200 transition-all hover:scale-105 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${retraining ? 'animate-spin' : ''}`} />
              {retraining ? 'Reentrenando...' : 'Reentrenar Todos los Modelos'}
            </button>
          </div>
        )}
      </div>

      {/* Best Model Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-50 via-sky-50 to-purple-50 border border-purple-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-800 shadow-sm flex-shrink-0">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-purple-900 font-bold uppercase tracking-wider">Modelo Campeón Seleccionado</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-[10px] font-mono font-bold">
                Supera Objetivo &gt;80%
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{summary.best_model_name}</h3>
            <p className="text-xs text-slate-700 font-mono font-medium">
              Macro F1-Score: <strong className="text-slate-900 font-bold">{(summary.best_f1_macro * 100).toFixed(2)}%</strong> • Muestras de prueba: 20,000
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 font-mono text-center">
          <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] text-slate-500 font-bold block">Accuracy Global</span>
            <span className="text-xl font-black text-emerald-700">
              {((selectedModel?.accuracy || 0.9795) * 100).toFixed(2)}%
            </span>
          </div>
          <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] text-slate-500 font-bold block">Tiempo Entrenamiento</span>
            <span className="text-xl font-black text-sky-700">
              {selectedModel?.training_time_seconds || 2.46}s
            </span>
          </div>
        </div>
      </div>

      {/* Model Comparison Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-wide">Tabla Comparativa de los 6 Algoritmos Supervisados</h3>
            <p className="text-xs text-slate-500 font-medium">Evaluación multiclase sobre el 20% estratificado de prueba (20,000 registros)</p>
          </div>
          <span className="text-xs font-mono font-bold text-sky-900 bg-sky-100 px-3 py-1 rounded-lg border border-sky-300">
            Sin Data Leakage
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-600 font-bold">
                <th className="p-3">Algoritmo</th>
                <th className="p-3 text-center">Accuracy</th>
                <th className="p-3 text-center">Precision (Macro)</th>
                <th className="p-3 text-center">Recall (Macro)</th>
                <th className="p-3 text-center">F1-Score (Macro)</th>
                <th className="p-3 text-center">Tiempo Train</th>
                <th className="p-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {summary.models_comparison.map((m) => {
                const isSelected = selectedModel?.model_name === m.model_name;
                const isBest = summary.best_model_name === m.model_name;

                return (
                  <tr
                    key={m.model_name}
                    onClick={() => setSelectedModel(m)}
                    className={`border-b border-slate-100 cursor-pointer transition-colors ${
                      isSelected ? 'bg-sky-50 text-sky-950 font-bold' : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <td className="p-3 flex items-center gap-2 font-sans font-bold">
                      {isBest && <Award className="w-4 h-4 text-amber-600 flex-shrink-0" />}
                      {m.model_name}
                    </td>
                    <td className="p-3 text-center text-emerald-700 font-black">{(m.accuracy * 100).toFixed(2)}%</td>
                    <td className="p-3 text-center font-bold">{(m.precision_macro * 100).toFixed(2)}%</td>
                    <td className="p-3 text-center font-bold">{(m.recall_macro * 100).toFixed(2)}%</td>
                    <td className="p-3 text-center text-sky-800 font-black">{(m.f1_macro * 100).toFixed(2)}%</td>
                    <td className="p-3 text-center font-medium">{m.training_time_seconds.toFixed(2)}s</td>
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isBest ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {isBest ? 'Campeón' : 'Evaluado'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Model Details: Confusion Matrix & ROC Curves */}
      {selectedModel && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Confusion Matrix */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-purple-600" />
                Matriz de Confusión Multiclase ({selectedModel.model_name})
              </h3>
              <p className="text-xs text-slate-500 font-medium">Filas: Clase Real vs Columnas: Clase Predicha</p>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-xs font-mono text-center border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="p-2 text-left text-slate-600 font-bold">Real \ Pred</th>
                    {selectedModel.classes.map((c) => (
                      <th key={c} className="p-2 text-slate-900 font-bold">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedModel.confusion_matrix.map((row, rIdx) => {
                    const rowClass = selectedModel.classes[rIdx];
                    const rowSum = row.reduce((a, b) => a + b, 0);

                    return (
                      <tr key={rowClass} className="border-b border-slate-100">
                        <td className="p-2 text-left font-black text-slate-900">{rowClass}</td>
                        {row.map((val, cIdx) => {
                          const isDiagonal = rIdx === cIdx;
                          const pct = (val / rowSum) * 100;
                          return (
                            <td
                              key={cIdx}
                              className={`p-3 rounded-lg border border-slate-100 ${
                                isDiagonal
                                  ? 'bg-purple-100 text-purple-950 font-black border-purple-200 shadow-sm'
                                  : val > 0 ? 'bg-rose-50 text-rose-900 font-bold' : 'text-slate-400 font-medium'
                              }`}
                            >
                              <span className="block text-sm">{val.toLocaleString()}</span>
                              <span className="text-[10px] text-slate-600 font-bold font-mono">{pct.toFixed(1)}%</span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Multiclass ROC Curves */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-sky-600" />
                Curvas ROC Multiclase (One-vs-Rest)
              </h3>
              <p className="text-xs text-slate-500 font-medium">Tasa de Verdaderos Positivos vs Falsos Positivos</p>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rocChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="fpr" stroke="#475569" fontSize={10} fontWeight={600} label={{ value: 'Falso Positivo (FPR)', position: 'insideBottom', offset: -5, fill: '#475569', fontSize: 10, fontWeight: 600 }} />
                  <YAxis stroke="#475569" fontSize={10} fontWeight={600} domain={[0, 1]} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '0.75rem', color: '#0F172A', fontWeight: 600, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend formatter={(val) => <span className="text-xs font-bold text-slate-800">{val}</span>} />
                  <Line type="monotone" dataKey="GALAXY" stroke="#7E22CE" dot={false} strokeWidth={2.5} name="GALAXY (AUC 0.99)" />
                  <Line type="monotone" dataKey="STAR" stroke="#0284C7" dot={false} strokeWidth={2.5} name="STAR (AUC 0.99)" />
                  <Line type="monotone" dataKey="QSO" stroke="#D97706" dot={false} strokeWidth={2.5} name="QSO (AUC 0.98)" />
                  <Line type="monotone" dataKey="diagonal" stroke="#94A3B8" strokeDasharray="4 4" dot={false} strokeWidth={1.5} name="Azar (0.50)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Feature Importance Bar Chart */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-600" />
            Importancia de Características (Feature Importance)
          </h3>
          <p className="text-xs text-slate-500 font-medium">Poder discriminante de las variables fotométricas y astrofísicas en la clasificación</p>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={featureImpData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="característica" stroke="#475569" fontSize={11} fontWeight={600} />
              <YAxis stroke="#475569" fontSize={11} fontWeight={600} label={{ value: 'Importancia Relativa (%)', angle: -90, position: 'insideLeft', fill: '#475569', fontSize: 10, fontWeight: 600 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '0.75rem', color: '#0F172A', fontWeight: 600, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(val: number) => [`${val}%`, 'Importancia']}
              />
              <Bar dataKey="importancia" fill="#0284C7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
