from fastapi import APIRouter

from app.repository import store
from app.schemas import Property, PropertyIn, Purpose

router = APIRouter(prefix="/properties", tags=["properties"])


@router.get("", response_model=list[Property])
def search_properties(
    city: str | None = None,
    suburb: str | None = None,
    purpose: Purpose | None = None,
    max_price: float | None = None,
) -> list[Property]:
    return store.search_properties(city=city, suburb=suburb, purpose=purpose, max_price=max_price)


@router.post("", response_model=Property, status_code=201)
def submit_property(payload: PropertyIn) -> Property:
    return store.create_property(payload)
