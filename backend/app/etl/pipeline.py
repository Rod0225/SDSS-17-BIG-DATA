import os
import sys
import time
import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional
import pandas as pd
import numpy as np

# Add workspace root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

from backend.app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ETL_Pipeline")

EXPECTED_COLUMNS = [
    'obj_ID', 'alpha', 'delta', 'u', 'g', 'r', 'i', 'z', 
    'run_ID', 'rerun_ID', 'cam_col', 'field_ID', 'spec_obj_ID', 
    'class', 'redshift', 'plate', 'MJD', 'fiber_ID'
]

class ETLPipeline:
    def __init__(self, raw_path: Optional[str] = None):
        self.raw_path = raw_path or str(settings.RAW_DATA)
        self.parquet_path = str(settings.PROCESSED_PARQUET)
        self.csv_path = str(settings.PROCESSED_CSV)
        self.metadata: Dict[str, Any] = {}

    def extract(self) -> pd.DataFrame:
        """Paso 1: Extract - Lectura y validación estructural del dataset original."""
        start_time = time.time()
        logger.info(f"Extracting raw data from {self.raw_path}...")
        
        if not os.path.exists(self.raw_path):
            raise FileNotFoundError(f"Raw dataset not found at {self.raw_path}")

        df = pd.read_csv(self.raw_path)
        extract_time = time.time() - start_time
        
        # Validar columnas
        missing_cols = [c for c in EXPECTED_COLUMNS if c not in df.columns]
        if missing_cols:
            raise ValueError(f"Dataset structure invalid. Missing columns: {missing_cols}")

        self.metadata["extract"] = {
            "source_path": self.raw_path,
            "raw_rows": len(df),
            "raw_columns": len(df.columns),
            "columns": list(df.columns),
            "extraction_time_seconds": round(extract_time, 4),
            "timestamp": datetime.utcnow().isoformat()
        }
        logger.info(f"Extracted {len(df)} rows and {len(df.columns)} columns in {extract_time:.2f}s")
        return df

    def transform(self, df: pd.DataFrame, remove_sensor_errors: bool = True) -> pd.DataFrame:
        """Paso 2: Transform - Limpieza, imputación, ingeniería de variables y detección de outliers."""
        start_time = time.time()
        initial_rows = len(df)
        transform_log = []

        # 1. Tratamiento de duplicados
        exact_dups = int(df.duplicated().sum())
        if exact_dups > 0:
            df = df.drop_duplicates()
            transform_log.append(f"Removed {exact_dups} exact duplicate rows.")
        else:
            transform_log.append("No exact duplicates found.")

        # 2. Tratamiento de errores de sensor (-9999.0 en u, g, z)
        sensor_error_mask = (df['u'] < -9000) | (df['g'] < -9000) | (df['z'] < -9000)
        sensor_error_count = int(sensor_error_mask.sum())
        
        if sensor_error_count > 0:
            if remove_sensor_errors:
                df = df[~sensor_error_mask].copy()
                transform_log.append(f"Filtered {sensor_error_count} rows with corrupted sensor readings (-9999).")
            else:
                for band in ['u', 'g', 'z']:
                    med = df.loc[df[band] > -9000, band].median()
                    df.loc[df[band] < -9000, band] = med
                transform_log.append(f"Imputed {sensor_error_count} corrupted sensor values with median.")

        # 3. Detección de outliers mediante IQR en bandas fotométricas
        outlier_counts = {}
        for band in ['u', 'g', 'r', 'i', 'z']:
            q25 = df[band].quantile(0.25)
            q75 = df[band].quantile(0.75)
            iqr = q75 - q25
            lb, ub = q25 - 1.5 * iqr, q75 + 1.5 * iqr
            outliers = ((df[band] < lb) | (df[band] > ub)).sum()
            outlier_counts[band] = int(outliers)
        transform_log.append(f"IQR Outliers detected: {outlier_counts}")

        # 4. Ingeniería de Variables Astrofísicas (Colores astronómicos SDSS)
        # Los índices de color son independientes de la distancia y capturan la curva de emisión del cuerpo negro
        df['u_g'] = df['u'] - df['g']
        df['g_r'] = df['g'] - df['r']
        df['r_i'] = df['r'] - df['i']
        df['i_z'] = df['i'] - df['z']
        transform_log.append("Created astronomical color indices: u_g, g_r, r_i, i_z.")

        # 5. Coordenadas esféricas y cartesianas normalizadas para el universo 3D
        # alpha [0, 360] y delta [-90, 90] a radianes
        alpha_rad = np.radians(df['alpha'])
        delta_rad = np.radians(df['delta'])
        R_sphere = 100.0  # Radio arbitrario de la esfera celeste
        df['pos_x_celestial'] = R_sphere * np.cos(delta_rad) * np.cos(alpha_rad)
        df['pos_y_celestial'] = R_sphere * np.cos(delta_rad) * np.sin(alpha_rad)
        df['pos_z_celestial'] = R_sphere * np.sin(delta_rad)
        transform_log.append("Computed 3D celestial sphere coordinates (pos_x_celestial, pos_y_celestial, pos_z_celestial).")

        # 6. Distancia estimada cosmológica comóvil para modo 3D espacial (para galaxias y QSO)
        # z <= 0 se asigna a distancia cercana estelar
        c_speed = 299792.458  # km/s
        H0 = 70.0  # km/s/Mpc
        # Aproximación comóvil Hubble de 1er orden para z moderado con saturación para cuásares
        # Distancia Dc ~ (c / H0) * z / (1 + z * 0.5)
        safe_z = np.maximum(df['redshift'], 0.0001)
        dist_mpc = (c_speed / H0) * (safe_z / (1.0 + 0.28 * safe_z))
        
        # Para estrellas, fijamos distancia relativa en un halo cercano (r ~ 10 a 50 Mpc para visualización consistente)
        is_star = df['class'] == 'STAR'
        dist_mpc[is_star] = 15.0 + (np.abs(df.loc[is_star, 'redshift']) * 1000.0) % 25.0

        scale_factor = 0.05  # Escala para renderizado en Three.js
        dist_3d = dist_mpc * scale_factor
        df['dist_estimated_mpc'] = np.round(dist_mpc, 2)
        df['pos_x_spatial'] = dist_3d * np.cos(delta_rad) * np.cos(alpha_rad)
        df['pos_y_spatial'] = dist_3d * np.cos(delta_rad) * np.sin(alpha_rad)
        df['pos_z_spatial'] = dist_3d * np.sin(delta_rad)
        transform_log.append("Computed 3D cosmological spatial coordinates (pos_x_spatial, pos_y_spatial, pos_z_spatial).")

        # 7. Descarte de columnas redundantes o con varianza nula
        if 'rerun_ID' in df.columns:
            df = df.drop(columns=['rerun_ID'])
            transform_log.append("Dropped 'rerun_ID' (zero variance constant 301).")

        transform_time = time.time() - start_time
        self.metadata["transform"] = {
            "initial_rows": initial_rows,
            "final_rows": len(df),
            "rows_removed": initial_rows - len(df),
            "transformations_applied": transform_log,
            "transformation_time_seconds": round(transform_time, 4),
            "outlier_counts": outlier_counts
        }
        logger.info(f"Transformation complete. {len(df)} rows retained in {transform_time:.2f}s")
        return df

    def load(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Paso 3: Load - Exportación a Parquet comprimido y CSV, registro de estadísticas."""
        start_time = time.time()
        logger.info("Saving processed datasets to Parquet and CSV...")

        # Exportar a Parquet (optimizado con compresión snappy)
        df.to_parquet(self.parquet_path, engine='pyarrow', compression='snappy', index=False)
        parquet_size_mb = os.path.getsize(self.parquet_path) / (1024 * 1024)

        # Exportar a CSV
        df.to_csv(self.csv_path, index=False)
        csv_size_mb = os.path.getsize(self.csv_path) / (1024 * 1024)

        load_time = time.time() - start_time

        self.metadata["load"] = {
            "parquet_path": self.parquet_path,
            "parquet_size_mb": round(parquet_size_mb, 2),
            "csv_path": self.csv_path,
            "csv_size_mb": round(csv_size_mb, 2),
            "compression": "snappy",
            "load_time_seconds": round(load_time, 4),
            "timestamp": datetime.utcnow().isoformat()
        }

        # Guardar informe de ejecución ETL
        report_file = os.path.join(str(settings.REPORTS_PATH), "etl_execution_summary.json")
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.metadata, f, indent=2)

        logger.info(f"Parquet saved ({parquet_size_mb:.2f} MB), CSV saved ({csv_size_mb:.2f} MB) in {load_time:.2f}s")
        return self.metadata

    def run(self) -> Dict[str, Any]:
        """Ejecuta el pipeline ETL completo end-to-end."""
        total_start = time.time()
        raw_df = self.extract()
        transformed_df = self.transform(raw_df)
        self.load(transformed_df)
        total_time = time.time() - total_start
        self.metadata["total_pipeline_time_seconds"] = round(total_time, 4)
        return self.metadata

if __name__ == "__main__":
    pipeline = ETLPipeline()
    summary = pipeline.run()
    print(json.dumps(summary, indent=2))
