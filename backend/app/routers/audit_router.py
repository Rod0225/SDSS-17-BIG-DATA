from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.database.models import User, AuditLog
from backend.app.core.security import require_role
from backend.app.schemas.schemas import AuditLogOut

router = APIRouter(prefix="/audit", tags=["Auditoría y Trazabilidad"])

@router.get("/logs", response_model=List[AuditLogOut])
def get_audit_logs(
    limit: int = Query(50, le=200),
    action: Optional[str] = Query(None),
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action == action.upper())
    return query.order_by(AuditLog.id.desc()).limit(limit).all()

