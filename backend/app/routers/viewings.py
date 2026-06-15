from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import UserModel
from app.repository import store
from app.schemas import ViewingRequest, ViewingRequestIn, ViewingStatusUpdate

router = APIRouter(prefix="/viewings", tags=["viewings"])


@router.post("", response_model=ViewingRequest, status_code=201)
def create_viewing_request(
    payload: ViewingRequestIn,
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> ViewingRequest:
    requester: UserModel | None = None
    if authorization:
        requester = get_current_user(authorization=authorization, db=db)

    viewing = store.create_viewing_request(db, payload, requester=requester)
    if not viewing:
        raise HTTPException(status_code=404, detail="Approved property not found")
    return viewing


@router.get("/mine", response_model=list[ViewingRequest])
def my_viewing_requests(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ViewingRequest]:
    return store.list_viewing_requests(db, requester=current_user)


@router.get("", response_model=list[ViewingRequest])
def all_viewing_requests(db: Session = Depends(get_db)) -> list[ViewingRequest]:
    return store.list_viewing_requests(db)


@router.patch("/{viewing_id}/status", response_model=ViewingRequest)
def update_viewing_status(
    viewing_id: str,
    payload: ViewingStatusUpdate,
    db: Session = Depends(get_db),
) -> ViewingRequest:
    viewing = store.update_viewing_status(db, viewing_id, payload.status)
    if not viewing:
        raise HTTPException(status_code=404, detail="Viewing request not found")
    return viewing
