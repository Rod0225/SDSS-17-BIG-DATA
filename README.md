# Plataforma Big Data para el Análisis, Visualización 3D y Clasificación de Objetos Astronómicos (SDSS-17)

Plataforma científica web integral que cubre todo el ciclo de vida de un proyecto de Big Data y Ciencia de Datos sobre el conjunto de datos **Stellar Classification Dataset - SDSS17** (Sloan Digital Sky Survey Data Release 17, 100,000 registros y 18 columnas).

Desarrollada por un equipo multidisciplinario (Arquitecto Big Data, Científico de Datos, Ingeniero de ML, Ingeniero de Datos, Desarrollador Full Stack y Diseñador UX/UI).

---

## 🌟 Características Principales

1. **Visor 3D Astronómico Interactivo (GPU Acelerado)**:
   - Motor Three.js con `THREE.Points` y `BufferGeometry` para renderizado fluido de decenas de miles de objetos celestes.
   - **Modo A (Esfera celeste 3D)**: Proyección angular real sobre la bóveda estelar con ascensión recta ($\alpha$) y declinación ($\delta$).
   - **Modo B (Espacio 3D estimado)**: Distribución comóvil cosmológica calculada mediante el modelo cosmológico estándar $\Lambda\text{CDM}$ a partir de redshift ($z$) para galaxias y cuásares, situando estrellas en el radio local.
   - Controles de cámara orbitales (rotación, zoom continuo, pan), rotación automática, filtrado dinámico por categoría, rangos de coordenadas celestes y redshift.
   - Inspección interactiva con raycasting para obtener metadatos observacionales e inferencia supervisada en vivo.

2. **Ingeniería de Datos & Big Data ETL**:
   - Pipeline automatizado Extract-Transform-Load con exportación a formato columnar comprimido **Parquet** (Snappy) y CSV.
   - Limpieza de errores centinela fotométricos (`-9999.0`), deduplicación e ingeniería de características astrofísicas (índices de color $u-g$, $g-r$, $r-i$, $i-z$).
   - **Procesamiento Distribuido Real con Apache PySpark**: Comparativa de rendimiento real frente a Pandas (tiempos de carga, agregaciones grupales, uso de memoria y consistencia de resultados).
   - Monitoreo de calidad de datos (Score de gobernanza 99.99%, detección de outliers por rango intercuartílico IQR y dictamen científico).

3. **Análisis Exploratorio de Datos (EDA) Científico**:
   - Estadística descriptiva completa (media, mediana, moda, varianza, desviación estándar, cuartiles, IQR).
   - Matrices de correlación de Pearson y Spearman con mapas de calor.
   - Histogramas multivariantes y diagramas de color astronómicos ($g-r$ vs $u-g$).
   - Diagnóstico científico automatizado sobre la separabilidad física de cada clase.

4. **Machine Learning y Clasificación Supervisada (>97% Accuracy)**:
   - Clasificación multiclase en 3 categorías: **GALAXY** (59.45%), **STAR** (21.59%) y **QSO** (18.96%).
   - Implementación y comparativa de 6 algoritmos supervisados:
     1. **Random Forest** (Modelo Campeón: **Accuracy 97.95%**, Macro-F1 97.61%)
     2. **HistGradientBoosting** (Accuracy 97.77%, Macro-F1 97.41%)
     3. **Decision Tree** (Accuracy 97.68%, Macro-F1 97.30%)
     4. **Regresión Logística Multinomial** (Accuracy 95.77%, Macro-F1 95.15%)
     5. **K-Nearest Neighbors (KNN)** (Accuracy 95.67%, Macro-F1 95.18%)
     6. **Support Vector Machine (Linear)** (Accuracy 93.86%, Macro-F1 93.15%)
   - Prevención estricta de fuga de datos (Data Leakage): Exclusión de metadatos instrumentales (`obj_ID`, `spec_obj_ID`, `plate`, `fiber_ID`, `run_ID`, `rerun_ID`, `cam_col`, `field_ID`, `MJD`).
   - Métricas completas: Matrices de confusión multiclase, curvas ROC (One-vs-Rest) con AUC, Feature Importance y Permutation Importance.
   - Modelo serializado con `joblib` en `data/models/best_astronomical_classifier.joblib` para inferencia inmediata sin reentrenar.

5. **Laboratorio de Inferencia**:
   - Clasificador individual en tiempo real con sliders de magnitudes fotométricas y redshift.
   - Clasificador masivo por lotes mediante carga de archivos CSV con descarga de predicciones.
   - Historial de predicciones realizadas.

6. **Administración de Usuarios y Seguridad (RBAC)**:
   - Autenticación mediante tokens JWT Bearer y contraseñas cifradas con `bcrypt`.
   - Control de acceso basado en roles:
     - **ADMIN**: Control total, CRUD de usuarios, ejecuciones ETL y reentrenamiento.
     - **ANALYST**: Visualización, preprocesamiento, inferencia y entrenamiento de modelos.
     - **VIEWER**: Consulta de dashboard, exploración en visor 3D y lectura de métricas.
   - Protección de seguridad: Se impide expresamente desactivar o eliminar la última cuenta administradora del sistema.
   - Registro de auditoría y trazabilidad en base de datos relacional.

---

## 🏗️ Arquitectura Tecnológica

- **Backend**: Python 3.11, FastAPI, SQLAlchemy 2.0, Pydantic, Scikit-learn, Apache PySpark 3.5, Pandas, NumPy, PyArrow, Joblib, PyJWT, Bcrypt.
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Three.js, Lucide React, Recharts.
- **Base de Datos**: SQLite (ejecución inmediata local) y PostgreSQL 16 (producción y Docker Compose).
- **Almacenamiento Científico**: Formatos Parquet con compresión Snappy y CSV.

---

## 👥 Cuentas de Acceso Preconfiguradas

| Rol | Correo Electrónico | Contraseña | Permisos |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@sdss.astro` | `Admin123!` | Acceso total, CRUD usuarios, reentrenamiento, ETL |
| **Analista** | `analyst@sdss.astro` | `Analyst123!` | Visualización, predicciones individuales y por lotes CSV |
| **Visualizador** | `viewer@sdss.astro` | `Viewer123!` | Exploración en Universo 3D, métricas y dashboard |

*(El modal de inicio de sesión incluye botones de auto-llenado con un solo clic para cada cuenta de demostración).*

---

## 🚀 Instrucciones de Instalación y Ejecución

### Opción A. Ejecución Local Directa

#### 1. Backend (FastAPI + PySpark)
```bash
# Instalar dependencias
pip install -r backend/requirements.txt

# Ejecutar la API en el puerto 8000
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
*API y documentación Swagger disponible en:* `http://localhost:8000/docs`

#### 2. Frontend (React 18 + Vite)
```bash
cd frontend
npm install
npm run dev
```
*Interfaz de usuario disponible en:* `http://localhost:5173`

*(Nota: La aplicación también puede compilarse con `npm run build` dentro de `frontend`, tras lo cual FastAPI sirve directamente el frontend desde `http://localhost:8000`).*

---

### Opción B. Despliegue con Docker Compose

Para levantar toda la arquitectura con PostgreSQL, Backend y Frontend contenedorizado:

```bash
docker compose -f infrastructure/docker-compose.yml up --build
```
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **PostgreSQL**: `localhost:5432`

---

## 🧪 Pruebas Unitarias y de Integración

Para ejecutar la suite de pruebas automatizadas del sistema:

```bash
python backend/tests/test_api.py
```

La suite valida:
- Autenticación correcta y rechazo de credenciales inválidas.
- Métricas del dashboard general (`/api/v1/overview`).
- Documentación de las 18 variables científicas.
- Inferencia en tiempo real del clasificador supervisado.
- Puntos 3D e inspección de objetos astronómicos.
- CRUD de usuarios y bloqueo de seguridad al intentar eliminar al último administrador.

---

## 📁 Estructura del Repositorio

```
├── backend/
│   ├── app/
│   │   ├── main.py                  # Entrypoint FastAPI, CORS y seeding
│   │   ├── core/                   # Configuración y seguridad JWT/Bcrypt
│   │   ├── database/               # Modelos ORM SQLAlchemy y sesiones
│   │   ├── schemas/                # Esquemas Pydantic
│   │   ├── etl/                    # Pipeline ETL, PySpark benchmark, calidad
│   │   ├── analytics/              # Análisis exploratorio (EDA) y estadísticas
│   │   ├── machine_learning/       # Entrenamiento (6 modelos), inferencia
│   │   ├── astronomical_map/       # Proveedor de coordenadas 3D para Three.js
│   │   └── routers/                # Endpoints REST modulares
│   ├── tests/                      # Suite de pruebas unitarias
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/             # Sidebar, Navbar, LoginModal
│   │   ├── views/                  # Dashboard, Universe3D, Variables, EDA, ML, etc.
│   │   ├── services/               # Cliente API REST tipado
│   │   ├── context/                # AuthContext con RBAC
│   │   └── types/                  # Definiciones de TypeScript
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── data/
│   ├── raw/                        # Dataset original SDSS17
│   ├── processed/                  # Dataset limpio en Parquet y CSV
│   ├── models/                     # Clasificador serializado (.joblib)
│   └── reports/                    # Informes JSON de calidad, EDA y ML
├── infrastructure/
│   ├── docker-compose.yml          # Orquestación de contenedores
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.conf
└── docs/
    ├── architecture.md             # Arquitectura y componentes
    ├── database.md                 # Diagrama ER y tablas relacionales
    ├── variables.md                # Diccionario científico de variables
    ├── api.md                      # Documentación completa de endpoints REST
    └── methodology.md              # Fases metodológicas
```

