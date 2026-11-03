import React, { useEffect, useState } from 'react';
import {
  Activity,
  Orbit,
  Cpu,
  ShieldCheck,
  TrendingUp,
  Layers,
  ArrowRight,
  Database,
  Calendar,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { api } from '../services/api';
import { OverviewMetrics } from '../types';

interface DashboardViewProps {
  onNavigate: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [edaData, setEdaData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ov, eda] = await Promise.all([
          api.getOverview(),
          api.getEDASummary()
        ]);
        setOverview(ov);
        setEdaData(eda);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const classData = [
    { name: 'Galaxias (GALAXY)', count: overview?.galaxy_count || 59445, color: '#A855F7' },
    { name: 'Estrellas (STAR)', count: overview?.star_count || 21594, color: '#38BDF8' },
    { name: 'Cuásares (QSO)', count: overview?.qso_count || 18961, color: '#F59E0B' },
  ];

  // Band comparison data across classes
  const bandComparisonData = [
    { band: 'u (UV)', GALAXY: 22.56, STAR: 20.73, QSO: 21.65 },
    { band: 'g (Verde)', GALAXY: 20.94, STAR: 19.19, QSO: 21.03 },
    { band: 'r (Rojo)', GALAXY: 19.59, STAR: 18.95, QSO: 20.62 },
    { band: 'i (IR cercano)', GALAXY: 19.01, STAR: 18.89, QSO: 20.35 },
    { band: 'z (IR)', GALAXY: 18.66, STAR: 18.86, QSO: 20.15 },
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-mono text-cyan-300">Cargando métricas científicas SDSS-17...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-space-900 via-indigo-950/60 to-purple-950/40 border border-slate-800 p-6 md:p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800/60 text-cyan-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            Sloan Digital Sky Survey (DR17)
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Plataforma de Exploración, ETL y Machine Learning Astronómico
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Arquitectura Big Data para el análisis de 100,000 objetos astronómicos, clasificación supervisada con Random Forest y visualización inmersiva acelerada por GPU en 3D.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('universe3d')}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950 transition-all hover:scale-105"
            >
              <Orbit className="w-4 h-4" />
              Explorar Bóveda 3D
            </button>
            <button
              onClick={() => onNavigate('ml')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-purple-950 transition-all hover:scale-105"
            >
              <Cpu className="w-4 h-4" />
              Ver Modelos (97.9%)
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Indicators (Sección 10) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Records */}
        <div className="p-4 rounded-2xl bg-space-900 border border-slate-800 shadow-lg space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Total Objetos</span>
          <div className="text-xl md:text-2xl font-extrabold text-white font-mono">
            {overview?.total_records.toLocaleString() || '100,000'}
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">100% Reales SDSS</span>
        </div>

        {/* Galaxias */}
        <div className="p-4 rounded-2xl bg-space-900 border border-purple-900/40 shadow-lg space-y-1">
          <span className="text-[10px] font-mono text-purple-300 uppercase tracking-wider block">Galaxias</span>
          <div className="text-xl md:text-2xl font-extrabold text-purple-400 font-mono">
            {overview?.galaxy_count.toLocaleString() || '59,445'}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">59.45% de la muestra</span>
        </div>

        {/* Estrellas */}
        <div className="p-4 rounded-2xl bg-space-900 border border-cyan-900/40 shadow-lg space-y-1">
          <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider block">Estrellas</span>
          <div className="text-xl md:text-2xl font-extrabold text-cyan-400 font-mono">
            {overview?.star_count.toLocaleString() || '21,594'}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">21.59% Vía Láctea</span>
        </div>

        {/* Cuásares */}
        <div className="p-4 rounded-2xl bg-space-900 border border-amber-900/40 shadow-lg space-y-1">
          <span className="text-[10px] font-mono text-amber-300 uppercase tracking-wider block">Cuásares (QSO)</span>
          <div className="text-xl md:text-2xl font-extrabold text-amber-400 font-mono">
            {overview?.qso_count.toLocaleString() || '18,961'}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">18.96% Núcleos AGN</span>
        </div>

        {/* Completitud */}
        <div className="p-4 rounded-2xl bg-space-900 border border-emerald-900/40 shadow-lg space-y-1">
          <span className="text-[10px] font-mono text-emerald-300 uppercase tracking-wider block">Calidad de Datos</span>
          <div className="text-xl md:text-2xl font-extrabold text-emerald-400 font-mono">
            {overview?.completeness_percentage || '99.99'}%
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Grado Excelente</span>
        </div>

        {/* Mejor Modelo */}
        <div className="p-4 rounded-2xl bg-space-900 border border-pink-900/40 shadow-lg space-y-1">
          <span className="text-[10px] font-mono text-pink-300 uppercase tracking-wider block">Mejor Accuracy</span>
          <div className="text-xl md:text-2xl font-extrabold text-pink-400 font-mono">
            {overview?.best_model?.accuracy || 97.95}%
          </div>
          <span className="text-[10px] text-slate-400 font-mono truncate block">
            {overview?.best_model?.name || 'Random Forest'}
          </span>
        </div>
      </div>

      {/* Visualizations Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Distribution Chart */}
        <div className="p-6 rounded-3xl bg-space-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">Distribución de Clases Taxonómicas</h3>
              <p className="text-xs text-slate-400">Proporción de objetos en el dataset de 100,000 observaciones</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-purple-950 border border-purple-800 text-purple-300 text-xs font-mono">
              3 Clases
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={classData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {classData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#374151', borderRadius: '0.75rem', color: '#F8FAFC' }}
                  formatter={(val: number) => [val.toLocaleString() + ' objetos', 'Cantidad']}
                />
                <Legend
                  formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Photometric Magnitude Profiles by Class */}
        <div className="p-6 rounded-3xl bg-space-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">Perfil Fotométrico (Filtros ugriz)</h3>
              <p className="text-xs text-slate-400">Magnitud aparente promedio por clase astronómica</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-mono">
              ugriz Bands
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bandComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="band" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} domain={[16, 24]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#374151', borderRadius: '0.75rem' }}
                />
                <Legend formatter={(val) => <span className="text-xs text-slate-300">{val}</span>} />
                <Bar dataKey="GALAXY" fill="#A855F7" radius={[4, 4, 0, 0]} name="Galaxia" />
                <Bar dataKey="STAR" fill="#38BDF8" radius={[4, 4, 0, 0]} name="Estrella" />
                <Bar dataKey="QSO" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Cuásar" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Visualizations Row 2: Redshift Multi-Class Distribution */}
      {edaData?.redshift_by_class_histogram && (
        <div className="p-6 rounded-3xl bg-space-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">Distribución Espectroscópica de Redshift (z)</h3>
              <p className="text-xs text-slate-400">
                Comparativa de corrimiento al rojo: Estrellas concentradas en z ~ 0, Galaxias en z ~ 0.4 y Cuásares extendidos en z &gt; 1.0
              </p>
            </div>
            <button
              onClick={() => onNavigate('eda')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
            >
              Explorar en detalle <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={edaData.redshift_by_class_histogram}>
                <defs>
                  <linearGradient id="colorGalaxy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorStar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorQSO" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="center" stroke="#94A3B8" fontSize={11} label={{ value: 'Redshift (z)', position: 'insideBottom', offset: -5, fill: '#94A3B8', fontSize: 10 }} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#374151', borderRadius: '0.75rem' }} />
                <Legend formatter={(val) => <span className="text-xs text-slate-300">{val}</span>} />
                <Area type="monotone" dataKey="GALAXY" stroke="#A855F7" fillOpacity={1} fill="url(#colorGalaxy)" name="Galaxia" />
                <Area type="monotone" dataKey="STAR" stroke="#38BDF8" fillOpacity={1} fill="url(#colorStar)" name="Estrella" />
                <Area type="monotone" dataKey="QSO" stroke="#F59E0B" fillOpacity={1} fill="url(#colorQSO)" name="Cuásar" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

