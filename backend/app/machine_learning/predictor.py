import os
import sys
import logging
from typing import Dict, Any, List, Optional
import joblib
import pandas as pd
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))
from backend.app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ML_Predictor")

CLASSES = ["GALAXY", "QSO", "STAR"]
REQUIRED_FEATURES = ["u", "g", "r", "i", "z", "redshift"]

class AstronomicalPredictor:
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path or os.path.join(str(settings.MODELS_PATH), "best_astronomical_classifier.joblib")
        self.model_data = None
        self.pipeline = None
        self._load_model()

    def _load_model(self):
        if not os.path.exists(self.model_path):
            logger.warning(f"Model file not found at {self.model_path}. Please train models first.")
            return
        self.model_data = joblib.load(self.model_path)
        self.pipeline = self.model_data["pipeline"]
        logger.info(f"Loaded classifier: {self.model_data.get('model_name')} (Best F1: {self.model_data.get('best_f1_macro'):.4f})")

    def _prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calcula los índices de color si no están presentes."""
        df_feats = df.copy()
        if 'u_g' not in df_feats.columns:
            df_feats['u_g'] = df_feats['u'] - df_feats['g']
        if 'g_r' not in df_feats.columns:
            df_feats['g_r'] = df_feats['g'] - df_feats['r']
        if 'r_i' not in df_feats.columns:
            df_feats['r_i'] = df_feats['r'] - df_feats['i']
        if 'i_z' not in df_feats.columns:
            df_feats['i_z'] = df_feats['i'] - df_feats['z']
            
        feature_cols = ["u", "g", "r", "i", "z", "redshift", "u_g", "g_r", "r_i", "i_z"]
        return df_feats[feature_cols]

    def predict_single(self, record: Dict[str, float]) -> Dict[str, Any]:
        """Inferencia para un objeto astronómico individual."""
        if self.pipeline is None:
            self._load_model()
            if self.pipeline is None:
                raise RuntimeError("No trained model available.")

        missing = [f for f in REQUIRED_FEATURES if f not in record]
        if missing:
            raise ValueError(f"Missing required photometric features: {missing}")

        df_input = pd.DataFrame([record])
        X = self._prepare_features(df_input)

        predicted_class = self.pipeline.predict(X)[0]

        # Probabilities
        clf = self.pipeline.named_steps["clf"]
        if hasattr(self.pipeline, "predict_proba"):
            probs = self.pipeline.predict_proba(X)[0]
            prob_dict = {CLASSES[i]: round(float(probs[i]), 4) for i in range(len(CLASSES))}
            confidence = float(np.max(probs))
        elif hasattr(self.pipeline, "decision_function"):
            df_val = self.pipeline.decision_function(X)[0]
            exp_val = np.exp(df_val - np.max(df_val))
            probs = exp_val / np.sum(exp_val)
            prob_dict = {CLASSES[i]: round(float(probs[i]), 4) for i in range(len(CLASSES))}
            confidence = float(np.max(probs))
        else:
            prob_dict = {predicted_class: 1.0}
            confidence = 1.0

        return {
            "predicted_class": str(predicted_class),
            "confidence": round(confidence, 4),
            "probabilities": prob_dict,
            "input_features": record,
            "model_used": self.model_data.get("model_name", "Unknown Classifier")
        }

    def predict_batch(self, df: pd.DataFrame) -> pd.DataFrame:
        """Inferencia en lote para un DataFrame / archivo CSV."""
        if self.pipeline is None:
            self._load_model()
            if self.pipeline is None:
                raise RuntimeError("No trained model available.")

        missing = [f for f in REQUIRED_FEATURES if f not in df.columns]
        if missing:
            raise ValueError(f"Input batch is missing required features: {missing}")

        X = self._prepare_features(df)
        predictions = self.pipeline.predict(X)

        df_result = df.copy()
        df_result['predicted_class'] = predictions

        if hasattr(self.pipeline, "predict_proba"):
            probs = self.pipeline.predict_proba(X)
            for i, cls in enumerate(CLASSES):
                df_result[f'prob_{cls.lower()}'] = np.round(probs[:, i], 4)
            df_result['confidence'] = np.round(np.max(probs, axis=1), 4)

        return df_result

predictor = AstronomicalPredictor()

