import React, { useEffect, useState } from 'react';
import {
  Activity,
  Orbit,
  Cpu,
  Sparkles,
  ArrowRight
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
    { name: 'Galaxias (GALAXY)', count: overview?.galaxy_count || 59445, color: '#7E22CE' },
    { name: 'Estrellas (STAR)', count: overview?.star_count || 21594, color: '#0284C7' },
    { name: 'Cuásares (QSO)', count: overview?.qso_count || 18961, color: '#D97706' },
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
          <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-mono font-bold text-sky-800">Cargando métricas científicas SDSS-17...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-sky-300 text-sky-800 text-xs font-mono font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            Sloan Digital Sky Survey (DR17) • Presentación de Alta Visibilidad
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Plataforma de Exploración, ETL y Machine Learning Astronómico
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            Arquitectura Big Data para el análisis de 100,000 objetos astronómicos, clasificación supervisada con Random Forest y visualización inmersiva acelerada por GPU en 3D.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('universe3d')}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-sky-600/30 transition-all hover:scale-105"
            >
              <Orbit className="w-4 h-4" />
              Explorar Universo 3D
            </button>
            <button
              onClick={() => onNavigate('ml')}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-purple-600/30 transition-all hover:scale-105"
            >
              <Cpu className="w-4 h-4" />
              Ver Modelos (97.9%)
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Records */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-mono text-slate-500 font-bold uppercase tracking-wider block">Total Objetos</span>
          <div className="text-xl md:text-2xl font-extrabold text-slate-900 font-mono">
            {overview?.total_records.toLocaleString() || '100,000'}
          </div>
          <span className="text-[11px] text-emerald-700 font-bold font-mono">100% Reales SDSS</span>
        </div>

        {/* Galaxias */}
        <div className="p-4 rounded-2xl bg-white border border-purple-200 shadow-sm space-y-1">
          <span className="text-[11px] font-mono text-purple-700 font-bold uppercase tracking-wider block">Galaxias</span>
          <div className="text-xl md:text-2xl font-extrabold text-purple-700 font-mono">
            {overview?.galaxy_count.toLocaleString() || '59,445'}
          </div>
          <span className="text-[11px] text-slate-600 font-semibold font-mono">59.45% de la muestra</span>
        </div>

        {/* Estrellas */}
        <div className="p-4 rounded-2xl bg-white border border-sky-200 shadow-sm space-y-1">
          <span className="text-[11px] font-mono text-sky-700 font-bold uppercase tracking-wider block">Estrellas</span>
          <div className="text-xl md:text-2xl font-extrabold text-sky-700 font-mono">
            {overview?.star_count.toLocaleString() || '21,594'}
          </div>
          <span className="text-[11px] text-slate-600 font-semibold font-mono">21.59% Vía Láctea</span>
        </div>

        {/* Cuásares */}
        <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-sm space-y-1">
          <span className="text-[11px] font-mono text-amber-700 font-bold uppercase tracking-wider block">Cuásares (QSO)</span>
          <div className="text-xl md:text-2xl font-extrabold text-amber-700 font-mono">
            {overview?.qso_count.toLocaleString() || '18,961'}
          </div>
          <span className="text-[11px] text-slate-600 font-semibold font-mono">18.96% Núcleos AGN</span>
        </div>

        {/* Completitud */}
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-sm space-y-1">
          <span className="text-[11px] font-mono text-emerald-700 font-bold uppercase tracking-wider block">Calidad de Datos</span>
          <div className="text-xl md:text-2xl font-extrabold text-emerald-700 font-mono">
            {overview?.completeness_percentage || '99.99'}%
          </div>
          <span className="text-[11px] text-slate-600 font-semibold font-mono">Grado Excelente</span>
        </div>

        {/* Mejor Modelo */}
        <div className="p-4 rounded-2xl bg-white border border-pink-200 shadow-sm space-y-1">
          <span className="text-[11px] font-mono text-pink-700 font-bold uppercase tracking-wider block">Mejor Accuracy</span>
          <div className="text-xl md:text-2xl font-extrabold text-pink-700 font-mono">
            {overview?.best_model?.accuracy || 97.95}%
          </div>
          <span className="text-[11px] text-slate-600 font-semibold font-mono truncate block">
            {overview?.best_model?.name || 'Random Forest'}
          </span>
        </div>
      </div>

      {/* Visualizations Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Distribution Chart */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-wide">Distribución de Clases Taxonómicas</h3>
              <p className="text-xs text-slate-600 font-medium">Proporción de objetos en el dataset de 100,000 observaciones</p>
            </div>
            <span className="px-3 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 text-xs font-mono font-bold">
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
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '0.75rem', color: '#0F172A', fontWeight: 'bold' }}
                  formatter={(val: number) => [val.toLocaleString() + ' objetos', 'Cantidad']}
                />
                <Legend
                  formatter={(value) => <span className="text-xs font-bold text-slate-700">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Photometric Magnitude Profiles by Class */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-wide">Perfil Fotométrico (Filtros ugriz)</h3>
              <p className="text-xs text-slate-600 font-medium">Magnitud aparente promedio por clase astronómica</p>
            </div>
            <span className="px-3 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 text-xs font-mono font-bold">
              Filtros SDSS
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bandComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="band" stroke="#475569" fontSize={11} fontWeight={600} />
                <YAxis stroke="#475569" fontSize={11} fontWeight={600} domain={[16, 24]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '0.75rem', color: '#0F172A', fontWeight: 'bold' }}
                />
                <Legend formatter={(val) => <span className="text-xs font-bold text-slate-700">{val}</span>} />
                <Bar dataKey="GALAXY" fill="#7E22CE" radius={[4, 4, 0, 0]} name="Galaxia" />
                <Bar dataKey="STAR" fill="#0284C7" radius={[4, 4, 0, 0]} name="Estrella" />
                <Bar dataKey="QSO" fill="#D97706" radius={[4, 4, 0, 0]} name="Cuásar" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Visualizations Row 2: Redshift Multi-Class Distribution */}
      {edaData?.redshift_by_class_histogram && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-wide">Distribución Espectroscópica de Redshift (z)</h3>
              <p className="text-xs text-slate-600 font-medium">
                Comparativa de corrimiento al rojo: Estrellas concentradas en z ~ 0, Galaxias en z ~ 0.4 y Cuásares extendidos en z &gt; 1.0
              </p>
            </div>
            <button
              onClick={() => onNavigate('eda')}
              className="text-xs text-sky-700 hover:text-sky-800 font-bold flex items-center gap-1 font-mono"
            >
              Explorar en detalle <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={edaData.redshift_by_class_histogram}>
                <defs>
                  <linearGradient id="colorGalaxy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7E22CE" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#7E22CE" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="colorStar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284C7" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#0284C7" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="colorQSO" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D97706" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#D97706" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="center" stroke="#475569" fontSize={11} fontWeight={600} label={{ value: 'Redshift (z)', position: 'insideBottom', offset: -5, fill: '#475569', fontSize: 11, fontWeight: 700 }} />
                <YAxis stroke="#475569" fontSize={11} fontWeight={600} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '0.75rem', color: '#0F172A', fontWeight: 'bold' }} />
                <Legend formatter={(val) => <span className="text-xs font-bold text-slate-700">{val}</span>} />
                <Area type="monotone" dataKey="GALAXY" stroke="#7E22CE" strokeWidth={2} fillOpacity={1} fill="url(#colorGalaxy)" name="Galaxia" />
                <Area type="monotone" dataKey="STAR" stroke="#0284C7" strokeWidth={2} fillOpacity={1} fill="url(#colorStar)" name="Estrella" />
                <Area type="monotone" dataKey="QSO" stroke="#D97706" strokeWidth={2} fillOpacity={1} fill="url(#colorQSO)" name="Cuásar" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
