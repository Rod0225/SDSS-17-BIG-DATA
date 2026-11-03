import React, { useState, useEffect } from 'react';
import { Sparkles, Upload, History, FileText, CheckCircle2, AlertCircle, ArrowRight, Download } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PredictionResult, PredictionHistoryItem } from '../types';

export const PredictionsPlaygroundView: React.FC = () => {
  const { hasRole } = useAuth();
  
  // Single prediction state
  const [u, setU] = useState<number>(22.1);
  const [g, setG] = useState<number>(21.4);
  const [r, setR] = useState<number>(20.1);
  const [i, setI] = useState<number>(19.5);
  const [z, setZ] = useState<number>(19.1);
  const [redshift, setRedshift] = useState<number>(0.42);
  const [singleResult, setSingleResult] = useState<PredictionResult | null>(null);
  const [singleLoading, setSingleLoading] = useState<boolean>(false);

  // Batch prediction state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [batchResult, setBatchResult] = useState<any>(null);
  const [batchLoading, setBatchLoading] = useState<boolean>(false);

  // History state
  const [history, setHistory] = useState<PredictionHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const hist = await api.getPredictionHistory();
      setHistory(hist);
    } catch (err) {
      console.error("Error loading prediction history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handlePredictSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSingleLoading(true);
    try {
      const res = await api.predictSingle({ u, g, r, i, z, redshift });
      setSingleResult(res);
      loadHistory();
    } catch (err: any) {
      alert(`Error en la predicción: ${err.message}`);
    } finally {
      setSingleLoading(false);
    }
  };

  const handleQuickPreset = (presetType: 'galaxy' | 'star' | 'quasar') => {
    if (presetType === 'galaxy') {
      setU(22.8); setG(21.2); setR(19.8); setI(19.2); setZ(18.9); setRedshift(0.38);
    } else if (presetType === 'star') {
      setU(19.2); setG(17.8); setR(17.1); setI(16.9); setZ(16.7); setRedshift(-0.0001);
    } else if (presetType === 'quasar') {
      setU(21.5); setG(21.2); setR(20.9); setI(20.5); setZ(20.2); setRedshift(2.45);
    }
  };

  const handleBatchUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;
    setBatchLoading(true);
    try {
      const res = await api.predictBatchCSV(csvFile);
      setBatchResult(res);
      loadHistory();
      alert(`Clasificación completada para ${res.total_records} objetos.`);
    } catch (err: any) {
      alert(`Error en predicción por lotes: ${err.message}`);
    } finally {
      setBatchLoading(false);
    }
  };

  const handleDownloadResults = () => {
    if (!batchResult?.predictions) return;
    const items = batchResult.predictions;
    const replacer = (key: string, value: any) => value === null ? '' : value;
    const header = Object.keys(items[0]);
    const csv = [
      header.join(','),
      ...items.map((row: any) => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
    ].join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'sdss_predicciones_supervisadas.csv');
    a.click();
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-400" />
          Laboratorio de Inferencia y Predicciones en Tiempo Real
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Clasificación supervisada interactiva para nuevos objetos fotométricos o cargas masivas mediante archivos CSV.
        </p>
      </div>

      {/* Row 1: Single Prediction vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Single Object Form */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-space-900 border border-slate-800 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white">Clasificación Manual de Objeto</h3>
              <p className="text-xs text-slate-400">Introduce las magnitudes de los 5 filtros SDSS y el redshift</p>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex gap-1.5 text-[10px] font-mono">
              <button
                type="button"
                onClick={() => handleQuickPreset('galaxy')}
                className="px-2 py-1 rounded-lg bg-purple-950 text-purple-300 border border-purple-800 hover:bg-purple-900"
              >
                + Galaxia
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('star')}
                className="px-2 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900"
              >
                + Estrella
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('quasar')}
                className="px-2 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900"
              >
                + Cuásar
              </button>
            </div>
          </div>

          <form onSubmit={handlePredictSingle} className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">u (Ultravioleta)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={u}
                  onChange={(e) => setU(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">g (Verde)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={g}
                  onChange={(e) => setG(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">r (Rojo)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={r}
                  onChange={(e) => setR(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">i (IR Cercano)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={i}
                  onChange={(e) => setI(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">z (Infrarrojo)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={z}
                  onChange={(e) => setZ(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-cyan-300 block mb-1 font-bold">redshift (z)</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={redshift}
                  onChange={(e) => setRedshift(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-cyan-950/40 border border-cyan-700 text-sm font-mono text-cyan-200 focus:outline-none focus:border-cyan-400 font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={singleLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-cyan-950 transition-all hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {singleLoading ? 'Calculando Inferencia...' : 'Ejecutar Clasificación Supervisada'}
            </button>
          </form>
        </div>

        {/* Prediction Output Card */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-space-900 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Resultado de Inferencia</span>
            {singleResult ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-space-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-mono block">Categoría Estimada</span>
                    <span className={`text-2xl font-extrabold font-mono ${
                      singleResult.predicted_class === 'STAR' ? 'text-cyan-400' :
                      singleResult.predicted_class === 'GALAXY' ? 'text-purple-400' : 'text-amber-400'
                    }`}>
                      {singleResult.predicted_class}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-mono block">Nivel de Confianza</span>
                    <span className="text-xl font-bold text-emerald-400 font-mono">
                      {(singleResult.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Probability Distribution */}
                <div className="space-y-2">
                  <span className="text-xs font-mono text-slate-300 font-semibold block">Probabilidades por Categoría:</span>
                  {Object.entries(singleResult.probabilities).map(([c, prob]) => (
                    <div key={c} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-300">{c}</span>
                        <span className="text-slate-400">{(prob * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-space-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            c === 'STAR' ? 'bg-cyan-400' : c === 'GALAXY' ? 'bg-purple-400' : 'bg-amber-400'
                          }`}
                          style={{ width: `${prob * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800">
                  Modelo Utilizado: {singleResult.model_used}
                </div>
              </div>
            ) : (
              <div className="h-48 rounded-2xl bg-space-950/40 border border-slate-800/60 flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                <Sparkles className="w-8 h-8 text-slate-600" />
                <p className="text-xs">Ajusta las variables a la izquierda y presiona "Ejecutar Clasificación" para ver las probabilidades en tiempo real.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Batch CSV Upload */}
      <div className="p-6 rounded-3xl bg-space-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-cyan-400" />
              Clasificación Masiva por Lotes (Batch CSV Upload)
            </h3>
            <p className="text-xs text-slate-400">Sube un archivo CSV con columnas u, g, r, i, z, redshift para predecir miles de registros simultáneamente</p>
          </div>
          {batchResult && (
            <button
              onClick={handleDownloadResults}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 transition-colors self-start"
            >
              <Download className="w-4 h-4" />
              Descargar Resultados ({batchResult.total_records})
            </button>
          )}
        </div>

        <form onSubmit={handleBatchUpload} className="flex flex-col sm:flex-row gap-3">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-xs text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-950 file:text-cyan-300 hover:file:bg-cyan-900 cursor-pointer"
          />
          <button
            type="submit"
            disabled={!csvFile || batchLoading}
            className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-950 transition-all disabled:opacity-50"
          >
            {batchLoading ? 'Procesando Archivo...' : 'Predecir Lote CSV'}
          </button>
        </form>

        {batchResult && (
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex flex-wrap gap-4 text-xs font-mono">
              <span className="text-slate-300">Total Evaluados: <strong className="text-white">{batchResult.total_records}</strong></span>
              <span className="text-purple-400">Galaxias: <strong>{batchResult.class_counts?.GALAXY || 0}</strong></span>
              <span className="text-cyan-400">Estrellas: <strong>{batchResult.class_counts?.STAR || 0}</strong></span>
              <span className="text-amber-400">Cuásares: <strong>{batchResult.class_counts?.QSO || 0}</strong></span>
            </div>
            
            <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-800">
              <table className="w-full text-xs font-mono text-left">
                <thead className="bg-space-950 text-slate-400 sticky top-0">
                  <tr className="border-b border-slate-800">
                    <th className="p-2.5">Fila</th>
                    <th className="p-2.5">Clase Predicha</th>
                    <th className="p-2.5">Confianza</th>
                    <th className="p-2.5">Redshift</th>
                    <th className="p-2.5">r</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-space-900/60">
                  {batchResult.predictions.slice(0, 100).map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="p-2 text-slate-500">#{idx + 1}</td>
                      <td className="p-2 font-bold">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                          row.predicted_class === 'STAR' ? 'bg-cyan-950 text-cyan-300' :
                          row.predicted_class === 'GALAXY' ? 'bg-purple-950 text-purple-300' : 'bg-amber-950 text-amber-300'
                        }`}>
                          {row.predicted_class}
                        </span>
                      </td>
                      <td className="p-2 text-emerald-400">{((row.confidence || 0.99) * 100).toFixed(1)}%</td>
                      <td className="p-2 text-slate-300">{Number(row.redshift).toFixed(4)}</td>
                      <td className="p-2 text-slate-300">{Number(row.r).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Row 3: Predictions History */}
      <div className="p-6 rounded-3xl bg-space-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            Historial de Predicciones Realizadas
          </h3>
          <span className="text-xs font-mono text-slate-400">Últimas 50 consultas</span>
        </div>

        {history.length > 0 ? (
          <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-800">
            <table className="w-full text-xs font-mono text-left">
              <thead className="bg-space-950 text-slate-400 sticky top-0">
                <tr className="border-b border-slate-800">
                  <th className="p-2.5">ID</th>
                  <th className="p-2.5">Clase Predicha</th>
                  <th className="p-2.5">Confianza</th>
                  <th className="p-2.5">Modelo</th>
                  <th className="p-2.5">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-space-900/60">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40">
                    <td className="p-2 text-slate-500">#{item.id}</td>
                    <td className="p-2 font-bold text-cyan-300">{item.predicted_class}</td>
                    <td className="p-2 text-emerald-400 font-bold">{(item.confidence_score * 100).toFixed(1)}%</td>
                    <td className="p-2 text-slate-400">{item.model_name}</td>
                    <td className="p-2 text-slate-500">{new Date(item.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 font-mono text-center py-4">No hay predicciones registradas aún.</p>
        )}
      </div>
    </div>
  );
};

