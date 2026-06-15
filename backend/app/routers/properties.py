from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import UserModel
from app.repository import store
from app.schemas import Property, PropertyIn, Purpose

router = APIRouter(prefix="/properties", tags=["properties"])


@router.get("", response_model=list[Property])
def search_properties(
    city: str | None = None,
    suburb: str | None = None,
    location: str | None = None,
    purpose: Purpose | None = None,
    max_price: float | None = None,
    db: Session = Depends(get_db),
) -> list[Property]:
    return store.search_properties(db, city=city, suburb=suburb, location=location, purpose=purpose, max_price=max_price)


@router.post("", response_model=Property, status_code=201)
def submit_property(
    payload: PropertyIn,
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> Property:
    owner: UserModel | None = None
    if authorization:
        owner = get_current_user(authorization=authorization, db=db)
    return store.create_property(db, payload, owner=owner)
