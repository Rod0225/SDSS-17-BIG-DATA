import React from 'react';
import {
  Compass,
  Database,
  BarChart2,
  Cpu,
  Layers,
  Sparkles,
  Users,
  ShieldAlert,
  FileText,
  Activity,
  LogOut,
  Orbit
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavTab = 
  | 'dashboard'
  | 'universe3d'
  | 'variables'
  | 'data-quality'
  | 'etl'
  | 'eda'
  | 'ml'
  | 'predict'
  | 'users'
  | 'audit';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, collapsed, setCollapsed }) => {
  const { user, logout, isAdmin, isAnalyst } = useAuth();

  const menuItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string; minRole?: string }[] = [
    { id: 'dashboard', label: 'Dashboard General', icon: <Activity className="w-5 h-5 text-indigo-600" /> },
    { id: 'universe3d', label: 'Universo 3D', icon: <Orbit className="w-5 h-5 text-sky-600" />, badge: '3D' },
    { id: 'variables', label: 'Diccionario de Variables', icon: <FileText className="w-5 h-5 text-slate-700" /> },
    { id: 'data-quality', label: 'Calidad de Datos', icon: <ShieldAlert className="w-5 h-5 text-emerald-600" /> },
    { id: 'etl', label: 'Big Data & ETL', icon: <Layers className="w-5 h-5 text-blue-600" />, badge: 'Spark' },
    { id: 'eda', label: 'Análisis Exploratorio (EDA)', icon: <BarChart2 className="w-5 h-5 text-purple-600" /> },
    { id: 'ml', label: 'Machine Learning', icon: <Cpu className="w-5 h-5 text-pink-600" />, badge: '97.9%' },
    { id: 'predict', label: 'Laboratorio de Predicción', icon: <Sparkles className="w-5 h-5 text-amber-600" /> },
    { id: 'users', label: 'Gestión de Usuarios', icon: <Users className="w-5 h-5 text-teal-600" />, minRole: 'ANALYST' },
    { id: 'audit', label: 'Auditoría & Trazabilidad', icon: <Database className="w-5 h-5 text-slate-700" />, minRole: 'ADMIN' },
  ];

  return (
    <aside className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 border-r border-slate-200 bg-white shadow-sm flex flex-col ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
        <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md flex-shrink-0">
            <Orbit className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-wider text-slate-900">SDSS-17</span>
              <span className="text-[10px] tracking-widest text-sky-700 font-mono font-bold uppercase">Astro Big Data</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-500 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          title={collapsed ? "Expandir" : "Colapsar"}
        >
          <Compass className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        {menuItems.map((item) => {
          if (item.minRole === 'ADMIN' && !isAdmin) return null;
          if (item.minRole === 'ANALYST' && !isAdmin && !isAnalyst) return null;

          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                isActive
                  ? 'bg-sky-50 text-sky-900 border border-sky-300 shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <div className="flex-shrink-0 transition-transform group-hover:scale-110">
                {item.icon}
              </div>
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between text-left truncate">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-2 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-slate-800">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        {user ? (
          <div className="flex items-center justify-between gap-2">
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-slate-900 truncate">{user.full_name}</span>
                <span className="text-[10px] font-mono font-bold text-sky-700">{user.role}</span>
              </div>
            )}
            <button
              onClick={logout}
              className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          !collapsed && (
            <div className="text-center text-xs font-semibold text-slate-500">
              Modo Invitado (Lectura)
            </div>
          )
        )}
      </div>
    </aside>
  );
};
