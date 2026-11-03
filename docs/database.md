# Diseño del Modelo de Base de Datos Relacional

Para la administración del sistema, usuarios, experimentos de Machine Learning y trazabilidad de ejecuciones ETL, se implementa un modelo relacional en SQLAlchemy, preparado para PostgreSQL (en producción / Docker) y SQLite (en desarrollo local inmediato).

Los 100,000 registros científicos se almacenan en archivos optimizados Parquet y CSV en disco, mientras que los metadatos de gobernanza, trazabilidad y experimentos residen en la base de datos relacional.

---

## 1. Diagrama Entidad-Relación (ER)

```mermaid
erDiagram
    USERS ||--o{ AUDIT_LOGS : "genera"
    USERS ||--o{ ETL_EXECUTIONS : "ejecuta"
    USERS ||--o{ ML_EXPERIMENTS : "entrena"
    USERS ||--o{ PREDICTION_HISTORY : "solicita"
    ML_EXPERIMENTS ||--o{ ML_MODELS : "produce"
    ML_MODELS ||--o{ PREDICTION_HISTORY : "evalua"

    USERS {
        int id PK
        string email UK
        string full_name
        string hashed_password
        string role "ADMIN | ANALYST | VIEWER"
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    AUDIT_LOGS {
        int id PK
        int user_id FK
        string action
        string module
        string details_json
        string ip_address
        datetime timestamp
    }

    ETL_EXECUTIONS {
        int id PK
        int user_id FK
        string pipeline_name
        string engine "PANDAS | PYSPARK"
        int rows_input
        int rows_output
        float execution_time_seconds
        float memory_used_mb
        string status "SUCCESS | FAILED"
        string metrics_json
        string output_path_parquet
        string output_path_csv
        datetime created_at
    }

    ML_EXPERIMENTS {
        int id PK
        int user_id FK
        string experiment_name
        string algorithm
        string hyperparameters_json
        string feature_columns_json
        float test_split_ratio
        int random_state
        string dataset_version
        datetime created_at
    }

    ML_MODELS {
        int id PK
        int experiment_id FK
        string model_name
        string model_path
        float accuracy
        float precision_macro
        float recall_macro
        float f1_macro
        float training_time_seconds
        float inference_time_seconds
        string confusion_matrix_json
        string classification_report_json
        string feature_importance_json
        boolean is_active_model
        datetime created_at
    }

    PREDICTION_HISTORY {
        int id PK
        int user_id FK
        int model_id FK
        string input_data_json
        string predicted_class "GALAXY | STAR | QSO"
        float confidence_score
        string probabilities_json
        datetime created_at
    }
```

---

## 2. Descripción de Tablas

### `users`
- Almacena las cuentas de usuario y credenciales con contraseñas cifradas mediante `bcrypt`.
- Soporta roles estrictos: `ADMIN`, `ANALYST`, `VIEWER`.
- Restricción de unicidad en `email`.
- Protección lógica: no permite eliminar la última cuenta administradora activa.

### `audit_logs`
- Trazabilidad y gobernanza de eventos relevantes del sistema (inicios de sesión, exportaciones, ejecuciones ETL y entrenamientos).
- Almacena detalles en formato JSON estructurado.

### `etl_executions`
- Historial de ejecuciones de limpieza y transformación de datos.
- Registra el motor de cómputo empleado (`PANDAS` o `PYSPARK`), los tiempos de ejecución, cantidad de registros filtrados, anomalías tratadas y rutas a los artefactos generados.

### `ml_experiments` & `ml_models`
- Garantizan reproducibilidad científica completa:
  - Registro exacto de hiperparámetros.
  - Conjunto de características seleccionadas.
  - Semilla aleatoria (`random_state`) y partición entrenamiento/prueba.
  - Métricas multiclase (Accuracy, Precision macro, Recall macro, F1-score macro).
  - Matrices de confusión y curvas ROC.
  - Serialización con `joblib` para despliegue productivo sin reentrenamiento.

### `prediction_history`
- Registro de predicciones generadas por los usuarios, tanto para objetos individuales como para cargas en lote vía archivo CSV.

