import os
import sys
import logging
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))
from backend.app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SkyService")

class SkyService:
    def __init__(self, parquet_path: Optional[str] = None):
        self.parquet_path = parquet_path or str(settings.PROCESSED_PARQUET)
        self._df: Optional[pd.DataFrame] = None

    def _get_df(self) -> pd.DataFrame:
        if self._df is None:
            if not os.path.exists(self.parquet_path):
                raise FileNotFoundError(f"Processed dataset not found at {self.parquet_path}")
            logger.info("Loading processed dataset into memory for 3D exploration...")
            self._df = pd.read_parquet(self.parquet_path)
        return self._df

    def get_points(
        self,
        mode: str = "celestial",  # "celestial" or "spatial"
        classes: Optional[List[str]] = None,
        min_redshift: Optional[float] = None,
        max_redshift: Optional[float] = None,
        min_ra: Optional[float] = None,
        max_ra: Optional[float] = None,
        min_dec: Optional[float] = None,
        max_dec: Optional[float] = None,
        limit: int = 15000,
        offset: int = 0
    ) -> Dict[str, Any]:
        """Obtiene partículas 3D optimizadas para Three.js con filtros dinámicos."""
        df = self._get_df()

        # Filtrar por clases
        if classes:
            classes_upper = [c.upper() for c in classes]
            df = df[df['class'].isin(classes_upper)]

        # Filtros de redshift
        if min_redshift is not None:
            df = df[df['redshift'] >= min_redshift]
        if max_redshift is not None:
            df = df[df['redshift'] <= max_redshift]

        # Filtros de coordenadas celestes
        if min_ra is not None:
            df = df[df['alpha'] >= min_ra]
        if max_ra is not None:
            df = df[df['alpha'] <= max_ra]
        if min_dec is not None:
            df = df[df['delta'] >= min_dec]
        if max_dec is not None:
            df = df[df['delta'] <= max_dec]

        total_filtered = len(df)

        # Slice con paginación / muestreo
        sample_slice = df.iloc[offset: offset + limit]

        # Extraer posiciones según el modo
        if mode == "spatial":
            x = sample_slice['pos_x_spatial'].values
            y = sample_slice['pos_y_spatial'].values
            z = sample_slice['pos_z_spatial'].values
        else:
            x = sample_slice['pos_x_celestial'].values
            y = sample_slice['pos_y_celestial'].values
            z = sample_slice['pos_z_celestial'].values

        # Flatten arrays for ultra-fast Float32Array transfer to Three.js BufferGeometry
        points_data = []
        for i, (_, row) in enumerate(sample_slice.iterrows()):
            points_data.append({
                "id": str(row['obj_ID']),
                "x": round(float(x[i]), 2),
                "y": round(float(y[i]), 2),
                "z": round(float(z[i]), 2),
                "class": row['class'],
                "ra": round(float(row['alpha']), 4),
                "dec": round(float(row['delta']), 4),
                "z_val": round(float(row['redshift']), 4),
                "r_mag": round(float(row['r']), 2),
                "dist_mpc": round(float(row['dist_estimated_mpc']), 2) if 'dist_estimated_mpc' in row else None
            })

        return {
            "mode": mode,
            "total_available": len(self._get_df()),
            "total_filtered": total_filtered,
            "count_returned": len(points_data),
            "points": points_data
        }

    def get_object_detail(self, obj_id: str) -> Optional[Dict[str, Any]]:
        """Obtiene el detalle científico exhaustivo de un objeto seleccionado."""
        df = self._get_df()
        # obj_ID puede buscarse como float o int
        try:
            val = float(obj_id)
            obj_row = df[df['obj_ID'] == val]
        except ValueError:
            obj_row = df[df['obj_ID'].astype(str) == obj_id]

        if obj_row.empty:
            return None

        row = obj_row.iloc[0].to_dict()
        
        # Inferencia con modelo ML para probabilidades
        from backend.app.machine_learning.predictor import predictor
        ml_eval = None
        try:
            ml_eval = predictor.predict_single({
                "u": float(row['u']),
                "g": float(row['g']),
                "r": float(row['r']),
                "i": float(row['i']),
                "z": float(row['z']),
                "redshift": float(row['redshift'])
            })
        except Exception as e:
            logger.warning(f"Error computing live prediction for detail: {e}")

        return {
            "obj_ID": str(row['obj_ID']),
            "class": str(row['class']),
            "alpha": float(row['alpha']),
            "delta": float(row['delta']),
            "u": float(row['u']),
            "g": float(row['g']),
            "r": float(row['r']),
            "i": float(row['i']),
            "z": float(row['z']),
            "u_g": float(row.get('u_g', row['u'] - row['g'])),
            "g_r": float(row.get('g_r', row['g'] - row['r'])),
            "r_i": float(row.get('r_i', row['r'] - row['i'])),
            "i_z": float(row.get('i_z', row['i'] - row['z'])),
            "redshift": float(row['redshift']),
            "plate": int(row['plate']),
            "MJD": int(row['MJD']),
            "fiber_ID": int(row['fiber_ID']),
            "spec_obj_ID": str(row['spec_obj_ID']),
            "pos_celestial": {
                "x": round(float(row['pos_x_celestial']), 2),
                "y": round(float(row['pos_y_celestial']), 2),
                "z": round(float(row['pos_z_celestial']), 2)
            },
            "pos_spatial": {
                "x": round(float(row['pos_x_spatial']), 2),
                "y": round(float(row['pos_y_spatial']), 2),
                "z": round(float(row['pos_z_spatial']), 2),
                "estimated_distance_mpc": round(float(row['dist_estimated_mpc']), 2)
            },
            "machine_learning_inference": ml_eval
        }

sky_service = SkyService()

