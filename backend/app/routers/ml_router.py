import json
import os
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.database.models import User, AuditLog
from backend.app.core.security import get_current_user, require_role
from backend.app.machine_learning.trainer import AstronomicalModelTrainer
from backend.app.core.config import settings

router = APIRouter(prefix="/ml", tags=["Machine Learning & Modelos"])

@router.get("/experiments")
def get_ml_experiments_summary(current_user: User = Depends(get_current_user)):
    """Retorna la tabla comparativa de modelos, métricas completas, matriz de confusión y curvas ROC."""
    report_file = os.path.join(str(settings.REPORTS_PATH), "ml_experiments_summary.json")
    if not os.path.exists(report_file):
        trainer = AstronomicalModelTrainer()
        return trainer.train_and_evaluate()
    with open(report_file, 'r', encoding='utf-8') as f:
        return json.load(f)

@router.post("/retrain")
def retrain_models(
    quick_mode: bool = False,
    request: Request = None,
    current_user: User = Depends(require_role(["ADMIN", "ANALYST"])),
    db: Session = Depends(get_db)
):
    """Reentrena todos los modelos sobre el dataset actual y guarda el mejor clasificador."""
    try:
        trainer = AstronomicalModelTrainer()
        summary = trainer.train_and_evaluate(quick_mode=quick_mode)

        audit = AuditLog(
            user_id=current_user.id,
            user_email=current_user.email,
            action="MODELS_RETRAINED",
            module="MACHINE_LEARNING",
            details=json.dumps({"best_model": summary["best_model_name"], "f1_macro": summary["best_f1_macro"]}),
            ip_address=request.client.host if request and request.client else "127.0.0.1"
        )
        db.add(audit)
        db.commit()

        return {
            "status": "SUCCESS",
            "message": f"Modelos reentrenados exitosamente. Mejor clasificador: {summary['best_model_name']}",
            "summary": summary
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al reentrenar modelos: {str(e)}")

