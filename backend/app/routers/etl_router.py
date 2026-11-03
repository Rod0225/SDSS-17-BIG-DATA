import json
import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.database.models import User, AuditLog, ETLExecution
from backend.app.core.security import get_current_user, require_role
from backend.app.schemas.schemas import ETLExecutionOut
from backend.app.etl.pipeline import ETLPipeline
from backend.app.etl.quality import compute_data_quality_report
from backend.app.etl.spark_bench import compare_engines
from backend.app.core.config import settings

router = APIRouter(prefix="/etl", tags=["Ingeniería de Datos & Big Data"])

@router.post("/run")
def trigger_etl_pipeline(
    request: Request,
    current_user: User = Depends(require_role(["ADMIN", "ANALYST"])),
    db: Session = Depends(get_db)
):
    try:
        pipeline = ETLPipeline()
        summary = pipeline.run()

        # Record in DB
        execution = ETLExecution(
            user_id=current_user.id,
            pipeline_name="SDSS17_Standard_ETL",
            engine="PANDAS_PYARROW",
            rows_input=summary["extract"]["raw_rows"],
            rows_output=summary["transform"]["final_rows"],
            execution_time_seconds=summary["total_pipeline_time_seconds"],
            status="SUCCESS",
            metrics_json=json.dumps(summary)
        )
        db.add(execution)

        audit = AuditLog(
            user_id=current_user.id,
            user_email=current_user.email,
            action="ETL_PIPELINE_RUN",
            module="DATA_ENGINEERING",
            details=json.dumps({"rows_processed": summary["transform"]["final_rows"]}),
            ip_address=request.client.host if request.client else "127.0.0.1"
        )
        db.add(audit)
        db.commit()

        return {
            "status": "SUCCESS",
            "message": "Pipeline ETL ejecutado y dataset Parquet/CSV actualizado exitosamente.",
            "summary": summary
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fallo en ejecución ETL: {str(e)}")

@router.get("/quality")
def get_data_quality(current_user: User = Depends(get_current_user)):
    report_file = os.path.join(str(settings.REPORTS_PATH), "data_quality_report.json")
    if os.path.exists(report_file):
        with open(report_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    return compute_data_quality_report()

@router.get("/benchmark")
def get_or_run_benchmark(
    run_fresh: bool = False,
    current_user: User = Depends(get_current_user)
):
    report_file = os.path.join(str(settings.REPORTS_PATH), "spark_vs_pandas_benchmark.json")
    if not run_fresh and os.path.exists(report_file):
        with open(report_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    return compare_engines()

@router.get("/history", response_model=List[ETLExecutionOut])
def get_etl_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(ETLExecution).order_by(ETLExecution.id.desc()).limit(20).all()

