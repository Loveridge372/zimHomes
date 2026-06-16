from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import UserModel
from app.repository import store
from app.schemas import PropertyMatch

router = APIRouter(prefix="/matches", tags=["matches"])


@router.get("/me", response_model=list[PropertyMatch])
def my_matches(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[PropertyMatch]:
    return store.match_properties(db, current_user)
