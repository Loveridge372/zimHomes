import hashlib
import hmac
import secrets
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.config import settings
from app.models import AuthTokenModel, UserModel


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 210_000)
    return f"pbkdf2_sha256${salt}${digest.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, salt, expected = stored_hash.split("$", 2)
    except ValueError:
        return False
    if algorithm != "pbkdf2_sha256":
        return False
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 210_000)
    return hmac.compare_digest(digest.hex(), expected)


def create_auth_token(db: Session, user: UserModel) -> AuthTokenModel:
    token = secrets.token_urlsafe(36)
    auth_token = AuthTokenModel(
        token=token,
        user_id=user.id,
        expires_at=datetime.utcnow() + timedelta(hours=settings.auth_token_hours),
    )
    db.add(auth_token)
    db.commit()
    db.refresh(auth_token)
    return auth_token
