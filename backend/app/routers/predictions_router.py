import json
import io
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from sqlalchemy.orm import Session
import pandas as pd

from backend.app.database.session import get_db
from backend.app.database.models import User, PredictionHistory, AuditLog
from backend.app.core.security import get_current_user, require_role
from backend.app.schemas.schemas import SinglePredictionInput, SinglePredictionResponse, BatchPredictionResponse
from backend.app.machine_learning.predictor import predictor

router = APIRouter(prefix="/predictions", tags=["Inferencia & Predicciones"])

@router.post("/single", response_model=SinglePredictionResponse)
def predict_single_object(
    input_data: SinglePredictionInput,
    request: Request,
    current_user: User = Depends(require_role(["ADMIN", "ANALYST"])),
    db: Session = Depends(get_db)
):
    """Realiza predicción supervisada para un objeto astronómico individual."""
    try:
        record_dict = input_data.model_dump()
        result = predictor.predict_single(record_dict)

        # Record in PredictionHistory
        history_entry = PredictionHistory(
            user_id=current_user.id,
            model_name=result["model_used"],
            input_data_json=json.dumps(record_dict),
            predicted_class=result["predicted_class"],
            confidence_score=result["confidence"],
            probabilities_json=json.dumps(result["probabilities"])
        )
        db.add(history_entry)
        db.commit()

        return result
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error en la predicción: {str(e)}")

@router.post("/batch", response_model=BatchPredictionResponse)
async def predict_batch_csv(
    file: UploadFile = File(...),
    request: Request = None,
    current_user: User = Depends(require_role(["ADMIN", "ANALYST"])),
    db: Session = Depends(get_db)
):
    """Carga un archivo CSV con nuevos registros astronómicos y clasifica cada objeto."""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="El archivo cargado debe ser formato CSV.")

    contents = await file.read()
    try:
        df_upload = pd.read_csv(io.StringIO(contents.decode('utf-8')))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"No se pudo parsear el archivo CSV: {str(e)}")

    required_cols = ["u", "g", "r", "i", "z", "redshift"]
    missing = [c for c in required_cols if c not in df_upload.columns]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"El CSV no contiene las columnas fotométricas requeridas: {missing}"
        )

    # Inferencia en lote
    df_pred = predictor.predict_batch(df_upload)
    class_counts = df_pred['predicted_class'].value_counts().to_dict()

    # Devolver hasta 500 registros para previsualización directa
    records = df_pred.head(500).to_dict(orient="records")

    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="BATCH_PREDICTION",
        module="PREDICTIONS",
        details=json.dumps({"total_rows": len(df_upload), "class_distribution": class_counts}),
        ip_address=request.client.host if request and request.client else "127.0.0.1"
    )
    db.add(audit)
    db.commit()

    return {
        "total_records": len(df_pred),
        "predictions": records,
        "class_counts": class_counts
    }

@router.get("/history")
def get_prediction_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Consulta el historial de predicciones realizadas por el usuario o administradores."""
    query = db.query(PredictionHistory)
    if current_user.role != "ADMIN":
        query = query.filter(PredictionHistory.user_id == current_user.id)
    records = query.order_by(PredictionHistory.id.desc()).limit(50).all()

    return [
        {
            "id": r.id,
            "user_id": r.user_id,
            "model_name": r.model_name,
            "predicted_class": r.predicted_class,
            "confidence_score": r.confidence_score,
            "probabilities": json.loads(r.probabilities_json) if r.probabilities_json else {},
            "input_data": json.loads(r.input_data_json) if r.input_data_json else {},
            "created_at": r.created_at.isoformat()
        }
        for r in records
    ]

