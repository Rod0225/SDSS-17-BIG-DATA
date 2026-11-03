from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# --- Auth & User Schemas ---
class UserBase(BaseModel):
    email: str = Field(..., pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$", description="Correo electrónico válido")
    full_name: str
    role: str = Field(default="VIEWER", pattern="^(ADMIN|ANALYST|VIEWER)$")

class UserCreate(UserBase):
    password: str = Field(min_length=6)

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = Field(default=None, pattern="^(ADMIN|ANALYST|VIEWER)$")
    is_active: Optional[bool] = None
    password: Optional[str] = Field(default=None, min_length=6)

class UserOut(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: str = Field(..., pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# --- ML Prediction Schemas ---
class SinglePredictionInput(BaseModel):
    u: float = Field(..., description="Magnitud ultravioleta")
    g: float = Field(..., description="Magnitud verde")
    r: float = Field(..., description="Magnitud rojo")
    i: float = Field(..., description="Magnitud infrarrojo cercano")
    z: float = Field(..., description="Magnitud infrarrojo")
    redshift: float = Field(..., description="Corrimiento al rojo espectroscópico")

class SinglePredictionResponse(BaseModel):
    model_config = {"protected_namespaces": ()}
    predicted_class: str
    confidence: float
    probabilities: Dict[str, float]
    input_features: Dict[str, float]
    model_used: str

class BatchPredictionResponse(BaseModel):
    total_records: int
    predictions: List[Dict[str, Any]]
    class_counts: Dict[str, int]

# --- Audit & History Schemas ---
class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int]
    user_email: Optional[str]
    action: str
    module: str
    details: Optional[str]
    ip_address: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True

class ETLExecutionOut(BaseModel):
    id: int
    user_id: Optional[int]
    pipeline_name: str
    engine: str
    rows_input: int
    rows_output: int
    execution_time_seconds: float
    status: str
    metrics_json: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
