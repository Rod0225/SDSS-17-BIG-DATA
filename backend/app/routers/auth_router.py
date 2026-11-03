import json
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.database.models import User, AuditLog
from backend.app.core.security import verify_password, get_password_hash, create_access_token, get_current_user
from backend.app.schemas.schemas import UserCreate, UserOut, LoginRequest, Token

router = APIRouter(prefix="/auth", tags=["Autenticación"])

@router.post("/login", response_model=Token)
def login(login_req: LoginRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_req.email).first()
    if not user or not verify_password(login_req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo electrónico o contraseña incorrectos."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Esta cuenta ha sido desactivada por el administrador."
        )

    # Audit log
    audit = AuditLog(
        user_id=user.id,
        user_email=user.email,
        action="LOGIN",
        module="AUTH",
        details=json.dumps({"role": user.role}),
        ip_address=request.client.host if request.client else "127.0.0.1"
    )
    db.add(audit)
    db.commit()

    token = create_access_token({"sub": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/register", response_model=UserOut)
def register(user_in: UserCreate, request: Request, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya se encuentra registrado."
        )

    # First user automatically becomes ADMIN
    total_users = db.query(User).count()
    assigned_role = "ADMIN" if total_users == 0 else user_in.role

    new_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        role=assigned_role,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    audit = AuditLog(
        user_id=new_user.id,
        user_email=new_user.email,
        action="REGISTER",
        module="AUTH",
        details=json.dumps({"role": assigned_role}),
        ip_address=request.client.host if request.client else "127.0.0.1"
    )
    db.add(audit)
    db.commit()

    return new_user

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

