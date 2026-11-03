import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.database.models import User, AuditLog
from backend.app.core.security import get_current_user, require_role, get_password_hash
from backend.app.schemas.schemas import UserOut, UserCreate, UserUpdate

router = APIRouter(prefix="/users", tags=["Administración de Usuarios"])

@router.get("/", response_model=List[UserOut])
def list_users(
    search: Optional[str] = Query(None, description="Buscar por nombre o correo"),
    role: Optional[str] = Query(None, description="Filtrar por rol: ADMIN, ANALYST, VIEWER"),
    current_user: User = Depends(require_role(["ADMIN", "ANALYST"])),
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if search:
        query = query.filter(
            (User.full_name.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%"))
        )
    if role:
        query = query.filter(User.role == role.upper())
    return query.order_by(User.id.asc()).all()

@router.post("/", response_model=UserOut)
def create_user(
    user_in: UserCreate,
    request: Request,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya existe."
        )

    new_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="USER_CREATED",
        module="USER_MANAGEMENT",
        details=json.dumps({"created_user": new_user.email, "role": new_user.role}),
        ip_address=request.client.host if request.client else "127.0.0.1"
    )
    db.add(audit)
    db.commit()
    return new_user

@router.put("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    user_up: UserUpdate,
    request: Request,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    # Guard: prevent deactivating or downgrading last ADMIN
    if user.role == "ADMIN" and (user_up.is_active is False or (user_up.role and user_up.role != "ADMIN")):
        admin_count = db.query(User).filter(User.role == "ADMIN", User.is_active == True).count()
        if admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Operación bloqueada: No se puede desactivar o degradar la última cuenta administradora activa."
            )

    if user_up.full_name is not None:
        user.full_name = user_up.full_name
    if user_up.role is not None:
        user.role = user_up.role
    if user_up.is_active is not None:
        user.is_active = user_up.is_active
    if user_up.password:
        user.hashed_password = get_password_hash(user_up.password)

    db.commit()
    db.refresh(user)

    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="USER_UPDATED",
        module="USER_MANAGEMENT",
        details=json.dumps({"updated_user_id": user_id, "email": user.email}),
        ip_address=request.client.host if request.client else "127.0.0.1"
    )
    db.add(audit)
    db.commit()
    return user

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    request: Request,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    # Guard: cannot delete the last active administrator
    if user.role == "ADMIN":
        admin_count = db.query(User).filter(User.role == "ADMIN", User.is_active == True).count()
        if admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Seguridad crítica: No es posible eliminar la única cuenta administradora del sistema."
            )

    db.delete(user)
    db.commit()

    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="USER_DELETED",
        module="USER_MANAGEMENT",
        details=json.dumps({"deleted_user_id": user_id, "deleted_email": user.email}),
        ip_address=request.client.host if request.client else "127.0.0.1"
    )
    db.add(audit)
    db.commit()
    return {"message": f"Usuario {user.email} eliminado exitosamente."}

