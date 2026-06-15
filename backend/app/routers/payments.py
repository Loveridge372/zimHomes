from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import UserModel
from app.repository import store
from app.schemas import Payment, PaymentIn, PaymentStatus

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/initiate", response_model=Payment, status_code=201)
def initiate_payment(
    payload: PaymentIn,
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> Payment:
    user: UserModel | None = None
    if authorization:
        user = get_current_user(authorization=authorization, db=db)
    return store.create_payment(db, payload, user=user)


@router.post("/paynow/webhook/{payment_id}", response_model=Payment)
def paynow_webhook(payment_id: str, status: PaymentStatus, db: Session = Depends(get_db)) -> Payment:
    payment = store.update_payment_status(db, payment_id, status)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment


@router.get("/{payment_id}", response_model=Payment)
def get_payment(payment_id: str, db: Session = Depends(get_db)) -> Payment:
    payment = store.get_payment(db, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment
