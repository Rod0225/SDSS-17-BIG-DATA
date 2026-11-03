import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Sidebar, NavTab } from './components/Sidebar';
import { Navbar } from './components/Navbar';

// Views
import { DashboardView } from './views/DashboardView';
import { Universe3DView } from './views/Universe3DView';
import { VariablesView } from './views/VariablesView';
import { DataQualityView } from './views/DataQualityView';
import { ETLView } from './views/ETLView';
import { EDAView } from './views/EDAView';
import { MachineLearningView } from './views/MachineLearningView';
import { PredictionsPlaygroundView } from './views/PredictionsPlaygroundView';
import { UserManagementView } from './views/UserManagementView';
import { AuditView } from './views/AuditView';

const viewTitles: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Dashboard General SDSS-17',
    subtitle: 'Métricas analíticas globales, distribución taxonómica y perfil fotométrico'
  },
  universe3d: {
    title: 'Universo Tridimensional Interactivo (3D)',
    subtitle: 'Exploración espacial acelerada por GPU: Esfera Celeste 3D y Espacio Cosmológico ΛCDM'
  },
  variables: {
    title: 'Diccionario Científico de Variables',
    subtitle: 'Metadatos, unidades fotométricas, estadísticas descriptivas y justificación en ML'
  },
  'data-quality': {
    title: 'Monitoreo de Calidad de Datos',
    subtitle: 'Auditoría de integridad, detección de outliers IQR y dictamen de gobernanza'
  },
  etl: {
    title: 'Pipeline Big Data & ETL Distribuido',
    subtitle: 'Extract-Transform-Load con Parquet y benchmark de rendimiento Pandas vs Apache PySpark'
  },
  eda: {
    title: 'Análisis Exploratorio de Datos (EDA)',
    subtitle: 'Estadística multivariante, correlaciones, histogramas y análisis astrofísico automatizado'
  },
  ml: {
    title: 'Machine Learning & Clasificación Supervisada',
    subtitle: 'Comparativa de 6 modelos (Accuracy > 97%), matrices de confusión, ROC y explicabilidad'
  },
  predict: {
    title: 'Laboratorio de Predicciones en Tiempo Real',
    subtitle: 'Inferencia supervisada individual con sliders fotométricos y clasificación masiva por lotes CSV'
  },
  users: {
    title: 'Administración de Usuarios y Roles (RBAC)',
    subtitle: 'Gestión CRUD de cuentas, permisos de seguridad y trazabilidad de sesiones'
  },
  audit: {
    title: 'Auditoría y Trazabilidad de Experimentos',
    subtitle: 'Registro histórico de operaciones, ejecuciones ETL y entrenamientos reproducibles'
  }
};

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const currentMeta = viewTitles[activeTab] || viewTitles.dashboard;

  return (
    <div className="min-h-screen bg-space-950 text-slate-100 flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <Navbar
          title={currentMeta.title}
          subtitle={currentMeta.subtitle}
        />

        <main className="flex-1 overflow-x-hidden">
          {activeTab === 'dashboard' && <DashboardView onNavigate={(tab) => setActiveTab(tab)} />}
          {activeTab === 'universe3d' && <Universe3DView />}
          {activeTab === 'variables' && <VariablesView />}
          {activeTab === 'data-quality' && <DataQualityView />}
          {activeTab === 'etl' && <ETLView />}
          {activeTab === 'eda' && <EDAView />}
          {activeTab === 'ml' && <MachineLearningView />}
          {activeTab === 'predict' && <PredictionsPlaygroundView />}
          {activeTab === 'users' && <UserManagementView />}
          {activeTab === 'audit' && <AuditView />}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};

export default App;

