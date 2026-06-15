import shutil
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Header, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.config import UPLOADS_DIR
from app.database import get_db
from app.dependencies import get_current_user
from app.models import UserModel
from app.repository import store
from app.schemas import Property, PropertyImage, PropertyIn, Purpose

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


@router.post("/{property_id}/images", response_model=list[PropertyImage], status_code=201)
def upload_property_images(
    property_id: str,
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
) -> list[PropertyImage]:
    property_item = store.get_property_model(db, property_id)
    if not property_item:
        raise HTTPException(status_code=404, detail="Property not found")
    if not files:
        raise HTTPException(status_code=400, detail="At least one image is required")
    if len(property_item.images) + len(files) > 10:
        raise HTTPException(status_code=400, detail="A property can have up to 10 images")

    upload_dir = UPLOADS_DIR / "properties" / property_id
    upload_dir.mkdir(parents=True, exist_ok=True)

    saved_images: list[PropertyImage] = []
    start_order = len(property_item.images)
    for index, file in enumerate(files):
        if file.content_type and not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Only image uploads are allowed")

        extension = Path(file.filename or "property.jpg").suffix.lower() or ".jpg"
        filename = f"{uuid4().hex}{extension}"
        target_path = upload_dir / filename
        with target_path.open("wb") as target:
            shutil.copyfileobj(file.file, target)

        image_url = f"/uploads/properties/{property_id}/{filename}"
        saved_images.append(store.add_property_image(db, property_id, image_url, start_order + index))

    return saved_images
