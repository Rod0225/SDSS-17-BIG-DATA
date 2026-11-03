import os
import sys
import json
import logging
from typing import Dict, Any
import pandas as pd
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))
from backend.app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("DataQuality")

def compute_data_quality_report() -> Dict[str, Any]:
    raw_path = str(settings.RAW_DATA)
    if not os.path.exists(raw_path):
        raise FileNotFoundError(f"Raw data file not found: {raw_path}")
        
    df = pd.read_csv(raw_path)
    total_records = len(df)
    
    # 1. Valores faltantes explícitos
    null_counts = df.isnull().sum().to_dict()
    total_null_cells = sum(null_counts.values())
    total_cells = total_records * len(df.columns)
    missing_percentage = (total_null_cells / total_cells) * 100
    
    # 2. Duplicados
    exact_duplicates = int(df.duplicated().sum())
    duplicate_percentage = (exact_duplicates / total_records) * 100
    
    # 3. Errores de sensor o valores centinela (-9999 en u, g, z)
    sensor_error_rows = int(((df['u'] < -9000) | (df['g'] < -9000) | (df['z'] < -9000)).sum())
    
    # 4. Outliers IQR por variable numérica
    numeric_cols = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]
    outliers_iqr = {}
    total_outliers_count = 0
    for col in numeric_cols:
        s = df[col]
        q25 = s.quantile(0.25)
        q75 = s.quantile(0.75)
        iqr = q75 - q25
        lb = q25 - 1.5 * iqr
        ub = q75 + 1.5 * iqr
        count = int(((s < lb) | (s > ub)).sum())
        outliers_iqr[col] = {
            "count": count,
            "percentage": round((count / total_records) * 100, 2),
            "lower_bound": round(float(lb), 4),
            "upper_bound": round(float(ub), 4)
        }
        total_outliers_count += count

    # 5. Registros válidos y descartados
    valid_records = total_records - sensor_error_rows - exact_duplicates
    discarded_records = total_records - valid_records
    completeness_percentage = round((valid_records / total_records) * 100, 4)
    
    # 6. Cálculo del Score Global de Calidad (0 - 100)
    # Deducciones por faltantes, duplicados, centinelas y outliers desmedidos
    deduction_nulls = min(missing_percentage * 5, 25)
    deduction_dups = min(duplicate_percentage * 5, 20)
    deduction_sentinel = (sensor_error_rows / total_records) * 100 * 10
    score = max(0.0, min(100.0, 100.0 - deduction_nulls - deduction_dups - deduction_sentinel))
    quality_score = round(score, 2)
    
    if quality_score >= 90:
        grade = "EXCELLENT"
        grade_label = "Excelente (Apto para entrenamiento científico de alta fidelidad)"
    elif quality_score >= 75:
        grade = "GOOD"
        grade_label = "Bueno (Requiere preprocesamiento mínimo)"
    else:
        grade = "MODERATE"
        grade_label = "Moderado (Requiere limpieza intensiva)"
        
    report = {
        "timestamp": pd.Timestamp.now().isoformat(),
        "total_records": total_records,
        "total_columns": len(df.columns),
        "valid_records": valid_records,
        "discarded_records": discarded_records,
        "completeness_percentage": completeness_percentage,
        "missing_percentage": round(missing_percentage, 4),
        "duplicate_count": exact_duplicates,
        "duplicate_percentage": round(duplicate_percentage, 4),
        "sensor_error_count": sensor_error_rows,
        "total_outliers_detected": total_outliers_count,
        "outliers_by_column": outliers_iqr,
        "missing_by_column": null_counts,
        "quality_score": quality_score,
        "quality_grade": grade,
        "quality_label": grade_label,
        "recommendations": [
            "Remover la fila con error de sensor (-9999.0) en bandas u, g, z durante el pipeline ETL.",
            "Eliminar la columna 'rerun_ID' ya que tiene varianza nula (único valor 301).",
            "Excluir identificadores técnicos (obj_ID, spec_obj_ID, plate, fiber_ID) para evitar fuga de datos (data leakage).",
            "Conservar los redshifts negativos leves ya que corresponden a blueshift real de estrellas del halo galáctico."
        ]
    }
    
    report_file = os.path.join(str(settings.REPORTS_PATH), "data_quality_report.json")
    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)
    logger.info(f"Data quality report saved to {report_file}")
    return report

if __name__ == "__main__":
    rep = compute_data_quality_report()
    print(f"Overall Quality Score: {rep['quality_score']}% ({rep['quality_grade']})")
    print(f"Valid Records: {rep['valid_records']} / {rep['total_records']}")

