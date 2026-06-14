from fastapi import APIRouter, HTTPException

from app.repository import store
from app.schemas import Payment, PaymentIn, PaymentStatus

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/initiate", response_model=Payment, status_code=201)
def initiate_payment(payload: PaymentIn) -> Payment:
    return store.create_payment(payload)


@router.post("/paynow/webhook/{payment_id}", response_model=Payment)
def paynow_webhook(payment_id: str, status: PaymentStatus) -> Payment:
    payment = store.update_payment_status(payment_id, status)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment


@router.get("/{payment_id}", response_model=Payment)
def get_payment(payment_id: str) -> Payment:
    payment = store.get_payment(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment
