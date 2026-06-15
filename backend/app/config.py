import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[1]
UPLOADS_DIR = BASE_DIR / "uploads"


class Settings:
    database_url: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'zimhomes.db'}")
    auth_token_hours: int = int(os.getenv("AUTH_TOKEN_HOURS", "168"))
    public_base_url: str = os.getenv("PUBLIC_BASE_URL", "http://127.0.0.1:8000")
    paynow_integration_id: str = os.getenv("PAYNOW_INTEGRATION_ID", "")
    paynow_integration_key: str = os.getenv("PAYNOW_INTEGRATION_KEY", "")
    paynow_initiate_url: str = os.getenv("PAYNOW_INITIATE_URL", "https://www.paynow.co.zw/interface/initiatetransaction")

    @property
    def paynow_enabled(self) -> bool:
        return bool(self.paynow_integration_id and self.paynow_integration_key)


settings = Settings()
