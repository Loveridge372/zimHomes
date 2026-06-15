from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.repository import store
from app.schemas import Property

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/properties/pending", response_model=list[Property])
def pending_properties(db: Session = Depends(get_db)) -> list[Property]:
    return store.pending_properties(db)


@router.post("/properties/{property_id}/approve", response_model=Property)
def approve_property(property_id: str, db: Session = Depends(get_db)) -> Property:
    item = store.approve_property(db, property_id)
    if not item:
        raise HTTPException(status_code=404, detail="Property not found")
    return item
