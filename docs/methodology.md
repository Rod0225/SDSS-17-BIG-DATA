# Metodología de Desarrollo del Proyecto SDSS-17

El desarrollo sigue una metodología de ingeniería estructurada en 7 fases consecutivas y verificadas:

---

## Fase 1. Análisis Exploratorio Previo y Arquitectura del Sistema
- **Objetivo**: Examinar la estructura física y estadística del dataset SDSS17, verificar integridad de registros y diseñar la arquitectura global.
- **Resultados**:
  - 100,000 registros, 18 columnas.
  - Cero valores nulos explícitos en CSV crudo.
  - Detección de anomalías en filtros `u, g, z` con valor centinela `-9999.0` (código de error de sensor SDSS).
  - Identificación de `rerun_ID = 301` como columna con varianza nula.
  - Identificación de 13,724 registros con `redshift < 0` correspondientes a blueshift real de estrellas del halo galáctico.
  - Separación entre variables predictoras válidas (`u, g, r, i, z, alpha, delta, redshift` y colores derivados) y variables de metadato instrumental/fuga de información (`obj_ID, spec_obj_ID, run_ID, rerun_ID, cam_col, field_ID, plate, MJD, fiber_ID`).

---

## Fase 2. Ingeniería de Datos y Pipeline ETL Distribuido
- **Objetivo**: Implementar el ciclo Extract-Transform-Load con soporte dual (Pandas y Apache PySpark).
- **Entregables**:
  - Ingesta y validación de esquemas.
  - Imputación/filtrado de errores fotométricos `-9999`.
  - Tratamiento de duplicados y detección de outliers mediante IQR.
  - Ingeniería de variables astrofísicas: colores $u-g, g-r, r-i, i-z$.
  - Exportación a formato Parquet comprimido con Snappy y CSV procesado.
  - Benchmark comparativo de rendimiento (PySpark vs Pandas).
  - Indicadores de calidad de datos.

---

## Fase 3. Análisis Exploratorio de Datos (EDA) Científico
- **Objetivo**: Generar estadísticas descriptivas completas y visualizaciones analíticas con interpretación científica automatizada.
- **Entregables**:
  - Resumen estadístico (media, mediana, moda, varianza, desviación estándar, min, max, cuartiles, IQR).
  - Matrices de correlación de Pearson y Spearman.
  - Gráficos de distribución de clases, histogramas de redshift y perfiles de color por objeto.
  - Diagnóstico automatizado de variables con mayor separabilidad.

---

## Fase 4. Módulo de Machine Learning y Clasificación Supervisada
- **Objetivo**: Construir, entrenar y comparar 6 algoritmos de clasificación multiclase (`GALAXY`, `STAR`, `QSO`), superando el objetivo de 80% de Accuracy sin data leakage.
- **Modelos**:
  1. Regresión Logística Multinomial.
  2. Decision Tree Classifier.
  3. Random Forest Classifier.
  4. K-Nearest Neighbors (KNN).
  5. Support Vector Machine (Linear / RBF).
  6. HistGradientBoosting Classifier / XGBoost.
- **Entregables**:
  - Preprocesamiento ajustado estrictamente sobre conjunto de entrenamiento.
  - Matriz de confusión multiclase y curvas ROC por clase One-vs-Rest.
  - Métricas: Accuracy, Precision, Recall, F1 macro, tiempos de entrenamiento e inferencia.
  - Interpretabilidad mediante Feature Importance y Permutation Importance.
  - Serialización con Joblib y servicio de inferencia en tiempo real para nuevos registros y archivos CSV.

---

## Fase 5. Backend RESTful y Gobernanza de Seguridad
- **Objetivo**: Desarrollar la API REST en FastAPI conectada a la base de datos relacional y motores de cálculo.
- **Entregables**:
  - Autenticación con JWT Bearer y hash de contraseñas con `bcrypt`.
  - CRUD completo de usuarios con roles (`ADMIN`, `ANALYST`, `VIEWER`).
  - Endpoints modulares para Ingesta, ETL, EDA, ML, Predicciones, Visor 3D y Auditoría.
  - Manejo de excepciones, códigos HTTP estándar y documentación OpenAPI / Swagger.

---

## Fase 6. Frontend Interactivo y Visor 3D del Universo
- **Objetivo**: Diseñar e implementar la interfaz web en React 18 + TypeScript + Tailwind CSS.
- **Entregables**:
  - Visor 3D del Universo utilizando Three.js acelerado por GPU:
    - Modo A: Esfera Celeste 3D con coordenadas ecuatoriales $(\alpha, \delta)$.
    - Modo B: Distribución espacial 3D estimada por distancia cosmológica comóvil $D_C(z)$ para galaxias/QSO.
    - Controles OrbitControls, inspección de partículas por raycasting, filtrado dinámico por categoría y confianza predictiva.
  - Dashboard analítico con métricas clave y gráficos en Recharts.
  - Módulos para EDA, Calidad de Datos, ETL Benchmark, Machine Learning Playground y Gestión de Usuarios.

---

## Fase 7. Integración, Pruebas y Despliegue con Docker
- **Objetivo**: Ensamblar y validar el sistema completo.
- **Entregables**:
  - `docker-compose.yml` y `Dockerfile` para backend y frontend.
  - Pruebas unitarias y de integración para endpoints y modelos.
  - Manual de instalación y ejecución.

