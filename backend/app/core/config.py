import os
from pathlib import Path
from dataclasses import dataclass

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_DATA_PATH = DATA_DIR / "raw" / "star_classification.csv"
PROCESSED_PARQUET_PATH = DATA_DIR / "processed" / "sdss_cleaned.parquet"
PROCESSED_CSV_PATH = DATA_DIR / "processed" / "sdss_cleaned.csv"
MODELS_DIR = DATA_DIR / "models"
REPORTS_DIR = DATA_DIR / "reports"

@dataclass
class Settings:
    PROJECT_NAME: str = "SDSS-17 Big Data Astronomical Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "sdss17-super-secret-jwt-key-2026-escom-bigdata")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"sqlite:///{BASE_DIR / 'data' / 'platform_metadata.db'}"
    )
    
    # Data Paths
    RAW_DATA: Path = RAW_DATA_PATH
    PROCESSED_PARQUET: Path = PROCESSED_PARQUET_PATH
    PROCESSED_CSV: Path = PROCESSED_CSV_PATH
    MODELS_PATH: Path = MODELS_DIR
    REPORTS_PATH: Path = REPORTS_DIR

settings = Settings()

# Ensure directories exist
os.makedirs(settings.MODELS_PATH, exist_ok=True)
os.makedirs(settings.REPORTS_PATH, exist_ok=True)
os.makedirs(DATA_DIR / "processed", exist_ok=True)
os.makedirs(DATA_DIR / "raw", exist_ok=True)
