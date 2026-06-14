from fastapi import APIRouter, HTTPException

from app.repository import store
from app.schemas import Property

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/properties/pending", response_model=list[Property])
def pending_properties() -> list[Property]:
    return store.pending_properties()


@router.post("/properties/{property_id}/approve", response_model=Property)
def approve_property(property_id: str) -> Property:
    item = store.approve_property(property_id)
    if not item:
        raise HTTPException(status_code=404, detail="Property not found")
    return item
