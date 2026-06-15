import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[1]
UPLOADS_DIR = BASE_DIR / "uploads"


class Settings:
    database_url: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'zimhomes.db'}")
    auth_token_hours: int = int(os.getenv("AUTH_TOKEN_HOURS", "168"))


settings = Settings()
