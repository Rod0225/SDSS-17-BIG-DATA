import json
import os
from fastapi import APIRouter, Depends, HTTPException
from backend.app.core.security import get_current_user
from backend.app.database.models import User
from backend.app.analytics.eda_service import compute_full_eda
from backend.app.core.config import settings

router = APIRouter(prefix="/eda", tags=["Análisis Exploratorio de Datos"])

@router.get("/summary")
def get_eda_summary(
    refresh: bool = False,
    current_user: User = Depends(get_current_user)
):
    report_file = os.path.join(str(settings.REPORTS_PATH), "eda_summary.json")
    if not refresh and os.path.exists(report_file):
        with open(report_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    return compute_full_eda()

@router.get("/variables")
def get_variables_documentation(current_user: User = Depends(get_current_user)):
    """Retorna la documentación científica y descriptiva completa de las 18 variables."""
    # Leer el reporte inicial con estadísticas exactas
    report_file = os.path.join(str(settings.REPORTS_PATH), "initial_inspection.json")
    stats = {}
    if os.path.exists(report_file):
        with open(report_file, 'r', encoding='utf-8') as f:
            stats = json.load(f).get("columns_stats", {})

    variables_metadata = [
        {
            "name": "obj_ID",
            "description": "Identificador único fotométrico asignado por el SDSS a cada detección en las placas CCD.",
            "type": "float64",
            "unit": "Adimensional (ID)",
            "ml_role": "Excluir (Riesgo de Data Leakage)",
            "importance": "Metadato de referencia única de base de datos.",
            "stats": stats.get("obj_ID", {})
        },
        {
            "name": "alpha",
            "description": "Ascensión recta (Right Ascension) en el sistema ecuatorial celeste (J2000). Equivale a la longitud terrestre.",
            "type": "float64",
            "unit": "Grados sexagesimales (°)",
            "ml_role": "Predictor / Coordenada Espacial",
            "importance": "Fundamental para posicionamiento angular y mapeo en la esfera celeste.",
            "stats": stats.get("alpha", {})
        },
        {
            "name": "delta",
            "description": "Declinación en el sistema ecuatorial celeste (J2000). Equivale a la latitud terrestre.",
            "type": "float64",
            "unit": "Grados sexagesimales (°)",
            "ml_role": "Predictor / Coordenada Espacial",
            "importance": "Determina la altura angular sobre el ecuador celeste para la proyección 3D.",
            "stats": stats.get("delta", {})
        },
        {
            "name": "u",
            "description": "Magnitud fotométrica en el filtro ultravioleta cercano (~3551 Å).",
            "type": "float64",
            "unit": "Magnitud aparente inversa",
            "ml_role": "Predictor Clave",
            "importance": "Sensible a la radiación térmica de alta temperatura de estrellas jóvenes y cuásares.",
            "stats": stats.get("u", {})
        },
        {
            "name": "g",
            "description": "Magnitud fotométrica en el filtro verde-azul (~4686 Å).",
            "type": "float64",
            "unit": "Magnitud aparente",
            "ml_role": "Predictor Clave",
            "importance": "Captura el espectro continuo visible de transición estelar.",
            "stats": stats.get("g", {})
        },
        {
            "name": "r",
            "description": "Magnitud fotométrica en el filtro rojo óptico (~6165 Å). Banda de calibración principal del SDSS.",
            "type": "float64",
            "unit": "Magnitud aparente",
            "ml_role": "Predictor Clave",
            "importance": "Pivote fotométrico para los índices de color y medidas de brillo.",
            "stats": stats.get("r", {})
        },
        {
            "name": "i",
            "description": "Magnitud fotométrica en el infrarrojo cercano (~7481 Å).",
            "type": "float64",
            "unit": "Magnitud aparente",
            "ml_role": "Predictor Clave",
            "importance": "Sensible a objetos fríos y fuentes galácticas con absorción interestelar.",
            "stats": stats.get("i", {})
        },
        {
            "name": "z",
            "description": "Magnitud fotométrica en el infrarrojo (~8931 Å).",
            "type": "float64",
            "unit": "Magnitud aparente",
            "ml_role": "Predictor Clave",
            "importance": "Permite clasificar objetos con alto corrimiento al rojo y envolturas frías.",
            "stats": stats.get("z", {})
        },
        {
            "name": "run_ID",
            "description": "Identificador numérico de la pasada de escaneo del telescopio.",
            "type": "int64",
            "unit": "Identificador operacional",
            "ml_role": "Excluir (Metadato Instrumental)",
            "importance": "Sin relación con las propiedades físicas intrínsecas del objeto.",
            "stats": stats.get("run_ID", {})
        },
        {
            "name": "rerun_ID",
            "description": "Identificador del algoritmo de reprocesamiento fotométrico.",
            "type": "int64",
            "unit": "Identificador operacional",
            "ml_role": "Excluir (Varianza Cero = 301)",
            "importance": "Columna constante sin variabilidad matemática.",
            "stats": stats.get("rerun_ID", {})
        },
        {
            "name": "cam_col",
            "description": "Columna de la cámara CCD en la matriz del plano focal (1 a 6).",
            "type": "int64",
            "unit": "Canal detector",
            "ml_role": "Excluir (Metadato Instrumental)",
            "importance": "Configuración física del telescopio.",
            "stats": stats.get("cam_col", {})
        },
        {
            "name": "field_ID",
            "description": "Identificador del campo fotométrico de 13 arcminutos.",
            "type": "int64",
            "unit": "Identificador espacial de cámara",
            "ml_role": "Excluir (Metadato de Escaneo)",
            "importance": "Cuadrícula interna de observación.",
            "stats": stats.get("field_ID", {})
        },
        {
            "name": "spec_obj_ID",
            "description": "Identificador único global de 64 bits para el espectro astronómico procesado.",
            "type": "float64",
            "unit": "Identificador único",
            "ml_role": "Excluir (Data Leakage)",
            "importance": "ID único por fila.",
            "stats": stats.get("spec_obj_ID", {})
        },
        {
            "name": "class",
            "description": "Clasificación astrofísica supervisada del objeto: GALAXY, STAR, QSO.",
            "type": "string",
            "unit": "Categoría taxonómica",
            "ml_role": "VARIABLE OBJETIVO (TARGET)",
            "importance": "Etiqueta supervisada a predecir.",
            "stats": stats.get("class", {})
        },
        {
            "name": "redshift",
            "description": "Corrimiento al rojo espectroscópico z = (lambda_obs - lambda_emit) / lambda_emit.",
            "type": "float64",
            "unit": "Adimensional (z)",
            "ml_role": "PREDICTOR CRUCIAL",
            "importance": "Distingue estrellas locales (z ~ 0), galaxias intermedias (z ~ 0.4) y cuásares lejanos (z > 1.0).",
            "stats": stats.get("redshift", {})
        },
        {
            "name": "plate",
            "description": "Número de placa metálica espectrográfica donde se conectaron las fibras ópticas.",
            "type": "int64",
            "unit": "ID placa",
            "ml_role": "Excluir (Metadato Instrumental)",
            "importance": "Soporte físico de observación.",
            "stats": stats.get("plate", {})
        },
        {
            "name": "MJD",
            "description": "Modified Julian Date: día juliano modificado en que se realizó la observación espectroscópica.",
            "type": "int64",
            "unit": "Días terrestres continuos",
            "ml_role": "Excluir (Metadato Temporal)",
            "importance": "Fecha de la campaña observacional.",
            "stats": stats.get("MJD", {})
        },
        {
            "name": "fiber_ID",
            "description": "Identificador de la fibra óptica específica en la placa (1 a 1000).",
            "type": "int64",
            "unit": "Canal de fibra óptica",
            "ml_role": "Excluir (Metadato Instrumental)",
            "importance": "Ranura física del espectrógrafo.",
            "stats": stats.get("fiber_ID", {})
        }
    ]

    return {
        "dataset_name": "Stellar Classification Dataset - SDSS17",
        "total_variables": len(variables_metadata),
        "variables": variables_metadata
    }

