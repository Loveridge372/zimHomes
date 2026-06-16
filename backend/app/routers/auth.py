import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import UserModel
from app.schemas import AuthResponse, User, UserLogin, UserProfileUpdate, UserRegister
from app.security import create_auth_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


def user_from_model(user: UserModel) -> User:
    try:
        preferred_amenities = json.loads(user.preferred_amenities or "[]")
    except json.JSONDecodeError:
        preferred_amenities = []

    badges: list[str] = []
    if user.phone_verified:
        badges.append("Phone verified")
    if user.id_submitted:
        badges.append("ID submitted")
    if user.ownership_proof_submitted:
        badges.append("Ownership proof submitted")
    if user.phone_verified and user.id_submitted and (user.role not in {"owner", "agent"} or user.ownership_proof_submitted):
        badges.append("Fully verified")

    return User(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        role=user.role,  # type: ignore[arg-type]
        phone_verified=user.phone_verified,
        id_submitted=user.id_submitted,
        ownership_proof_submitted=user.ownership_proof_submitted,
        employment_status=user.employment_status,
        salary_range=user.salary_range,
        tenant_references=user.tenant_references,
        household_size=user.household_size,
        preferred_locations=user.preferred_locations,
        preferred_property_type=user.preferred_property_type,
        preferred_amenities=preferred_amenities if isinstance(preferred_amenities, list) else [],
        budget_usd=user.budget_usd,
        verification_badges=badges,
    )


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


@router.put("/me", response_model=User)
def update_me(
    payload: UserProfileUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    current_user.phone = payload.phone.strip() if payload.phone else None
    current_user.phone_verified = payload.phone_verified
    current_user.id_submitted = payload.id_submitted
    current_user.ownership_proof_submitted = payload.ownership_proof_submitted
    current_user.employment_status = payload.employment_status.strip() if payload.employment_status else None
    current_user.salary_range = payload.salary_range.strip() if payload.salary_range else None
    current_user.tenant_references = payload.tenant_references.strip() if payload.tenant_references else None
    current_user.household_size = payload.household_size
    current_user.preferred_locations = payload.preferred_locations.strip() if payload.preferred_locations else None
    current_user.preferred_property_type = payload.preferred_property_type.strip() if payload.preferred_property_type else None
    current_user.preferred_amenities = json.dumps(payload.preferred_amenities)
    current_user.budget_usd = payload.budget_usd
    db.commit()
    db.refresh(current_user)
    return user_from_model(current_user)
