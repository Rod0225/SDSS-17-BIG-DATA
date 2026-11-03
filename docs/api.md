# Documentación de la API RESTful (FastAPI)

La API sigue los estándares RESTful, autenticación por Bearer Tokens JWT, validación de esquemas con Pydantic y documentación interactiva automática en `/docs` (Swagger UI) y `/redoc` (ReDoc).

---

## 1. Autenticación (`/api/v1/auth`)

### `POST /api/v1/auth/login`
- **Descripción**: Inicia sesión mediante correo y contraseña. Retorna token JWT y rol.
- **Request Body**:
  ```json
  {
    "email": "admin@sdss.astro",
    "password": "Admin123!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "email": "admin@sdss.astro",
      "full_name": "Dr. Neil Vance (Admin Astrofísico)",
      "role": "ADMIN",
      "is_active": true
    }
  }
  ```

### `POST /api/v1/auth/register`
- **Descripción**: Registra una nueva cuenta.
- **Response `200 OK`**: Objeto `UserOut`.

### `GET /api/v1/auth/me`
- **Descripción**: Retorna la información de la cuenta asociada al token actual.

---

## 2. Visor 3D Astronómico (`/api/v1/astronomy`)

### `GET /api/v1/astronomy/points`
- **Descripción**: Retorna partículas 3D optimizadas para Three.js con filtros dinámicos.
- **Query Parameters**:
  - `mode`: `"celestial"` (Modo A) o `"spatial"` (Modo B).
  - `classes`: Lista repetible (`STAR`, `GALAXY`, `QSO`).
  - `min_redshift`, `max_redshift`: Rango numérico de redshift.
  - `min_ra`, `max_ra`, `min_dec`, `max_dec`: Filtros de ascensión recta y declinación.
  - `limit`: Límite de puntos (default: 15,000, máx: 50,000).
- **Response `200 OK`**:
  ```json
  {
    "mode": "celestial",
    "total_available": 99999,
    "total_filtered": 59445,
    "count_returned": 15000,
    "points": [
      {
        "id": "1.23766e+18",
        "x": 24.12,
        "y": 88.54,
        "z": 45.12,
        "class": "GALAXY",
        "ra": 177.63,
        "dec": 24.14,
        "z_val": 0.4216,
        "r_mag": 19.59
      }
    ]
  }
  ```

### `GET /api/v1/astronomy/object/{obj_id}`
- **Descripción**: Consulta exhaustiva de metadatos físicos, coordenadas cartesianas e inferencia en vivo con Random Forest para un objeto.

---

## 3. Inferencia y Predicciones (`/api/v1/predictions`)

### `POST /api/v1/predictions/single`
- **Descripción**: Clasifica un objeto individual según sus 5 filtros y redshift.
- **Request Body**:
  ```json
  {
    "u": 22.1,
    "g": 21.4,
    "r": 20.1,
    "i": 19.5,
    "z": 19.1,
    "redshift": 0.42
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "predicted_class": "GALAXY",
    "confidence": 0.9849,
    "probabilities": {
      "GALAXY": 0.9849,
      "STAR": 0.0000,
      "QSO": 0.0151
    },
    "model_used": "Random Forest"
  }
  ```

### `POST /api/v1/predictions/batch`
- **Descripción**: Carga multipart de un archivo CSV con nuevas observaciones para predicción masiva.

### `GET /api/v1/predictions/history`
- **Descripción**: Historial de inferencias realizadas por el usuario.

---

## 4. Ingeniería de Datos y ETL (`/api/v1/etl`)

- `POST /api/v1/etl/run`: Dispara el pipeline completo (Extract, Transform, Load a Parquet y CSV).
- `GET /api/v1/etl/quality`: Retorna el dictamen de completitud, outliers IQR y score de calidad (99.99%).
- `GET /api/v1/etl/benchmark`: Retorna la comparativa de rendimiento entre Pandas y PySpark.
- `GET /api/v1/etl/history`: Historial de ejecuciones registradas en la base de datos.

---

## 5. Machine Learning (`/api/v1/ml`)

- `GET /api/v1/ml/experiments`: Comparativa de los 6 modelos (Accuracy, Precision, Recall, F1 macro, matrices de confusión, curvas ROC y feature importance).
- `POST /api/v1/ml/retrain`: Reentrena supervisadamente todos los modelos sobre el dataset activo.

---

## 6. Análisis Exploratorio (`/api/v1/eda`)

- `GET /api/v1/eda/summary`: Estadísticas descriptivas, histogramas, scatter samples y narrativas científicas.
- `GET /api/v1/eda/variables`: Documentación técnica de las 18 variables del SDSS17.

---

## 7. Usuarios (`/api/v1/users`)

- `GET /api/v1/users/`: Lista usuarios con búsqueda y filtros por rol (Admin y Analista).
- `POST /api/v1/users/`: Crea un usuario con rol asignado (Admin).
- `PUT /api/v1/users/{id}`: Modifica datos o activa/desactiva cuentas (Admin).
- `DELETE /api/v1/users/{id}`: Elimina cuenta (con protección para no borrar al último administrador).

---

## 8. Auditoría (`/api/v1/audit`)

- `GET /api/v1/audit/logs`: Historial de eventos y trazabilidad del sistema (Admin).

