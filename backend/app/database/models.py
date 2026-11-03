from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="VIEWER", nullable=False)  # ADMIN, ANALYST, VIEWER
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")
    etl_executions = relationship("ETLExecution", back_populates="user")
    predictions = relationship("PredictionHistory", back_populates="user")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    user_email = Column(String(255), nullable=True)
    action = Column(String(100), nullable=False)  # LOGIN, CREATE_USER, RUN_ETL, TRAIN_MODEL, PREDICT
    module = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)  # JSON string
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="audit_logs")

class ETLExecution(Base):
    __tablename__ = "etl_executions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    pipeline_name = Column(String(100), default="SDSS17_Standard_ETL")
    engine = Column(String(50), default="PANDAS")  # PANDAS, PYSPARK
    rows_input = Column(Integer, nullable=False)
    rows_output = Column(Integer, nullable=False)
    execution_time_seconds = Column(Float, nullable=False)
    status = Column(String(50), default="SUCCESS")
    metrics_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="etl_executions")

class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    model_name = Column(String(100), nullable=False)
    input_data_json = Column(Text, nullable=False)
    predicted_class = Column(String(50), nullable=False)
    confidence_score = Column(Float, nullable=False)
    probabilities_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="predictions")

