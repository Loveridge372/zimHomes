from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import UserModel
from app.schemas import AuthResponse, User, UserLogin, UserRegister
from app.security import create_auth_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


def user_from_model(user: UserModel) -> User:
    return User(id=user.id, full_name=user.full_name, email=user.email, phone=user.phone, role=user.role)  # type: ignore[arg-type]


@router.post("/register", response_model=AuthResponse, status_code=201)
def register(payload: UserRegister, db: Session = Depends(get_db)) -> AuthResponse:
    email = payload.email.strip().lower()
    existing = db.scalar(select(UserModel).where(UserModel.email == email))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already registered")

    user = UserModel(
        full_name=payload.full_name.strip(),
        email=email,
        phone=payload.phone.strip() if payload.phone else None,
        password_hash=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_auth_token(db, user)
    return AuthResponse(token=token.token, user=user_from_model(user))


@router.post("/login", response_model=AuthResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)) -> AuthResponse:
    email = payload.email.strip().lower()
    user = db.scalar(select(UserModel).where(UserModel.email == email))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_auth_token(db, user)
    return AuthResponse(token=token.token, user=user_from_model(user))


@router.get("/me", response_model=User)
def me(current_user: UserModel = Depends(get_current_user)) -> User:
    return user_from_model(current_user)
