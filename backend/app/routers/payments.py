from fastapi import APIRouter, Depends, Form, Header, HTTPException
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models import UserModel
from app.paynow import create_paynow_checkout, normalize_paynow_status, poll_paynow_status
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
    payment = store.create_payment(db, payload, user=user)
    payment_model = store.get_payment_model(db, payment.id)
    if not payment_model:
        raise HTTPException(status_code=404, detail="Payment not found after creation")

    result_url = f"{settings.public_base_url}/payments/paynow/result/{payment.id}"
    return_url = f"{settings.public_base_url}/payments/{payment.id}"
    checkout = create_paynow_checkout(payment_model, result_url=result_url, return_url=return_url)

    provider_status = checkout.get("status", "")
    next_status = "pending" if provider_status.lower() in {"ok", "demo", "message"} else "failed"
    updated = store.save_payment_provider_details(
        db,
        payment.id,
        status=next_status,
        browser_url=checkout.get("browserurl"),
        poll_url=checkout.get("pollurl"),
        message=checkout.get("message") or provider_status,
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Payment not found")
    return updated


@router.get("", response_model=list[Payment])
def list_payments(db: Session = Depends(get_db)) -> list[Payment]:
    return store.list_payments(db)


@router.post("/paynow/webhook/{payment_id}", response_model=Payment)
def paynow_webhook(payment_id: str, status: PaymentStatus, db: Session = Depends(get_db)) -> Payment:
    payment = store.update_payment_status(db, payment_id, status)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment


@router.post("/paynow/result/{payment_id}", response_model=Payment)
def paynow_result(
    payment_id: str,
    status: str = Form(default="pending"),
    db: Session = Depends(get_db),
) -> Payment:
    payment = store.update_payment_status(db, payment_id, normalize_paynow_status(status))  # type: ignore[arg-type]
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment


@router.post("/{payment_id}/refresh", response_model=Payment)
def refresh_payment(payment_id: str, db: Session = Depends(get_db)) -> Payment:
    payment_model = store.get_payment_model(db, payment_id)
    if not payment_model:
        raise HTTPException(status_code=404, detail="Payment not found")

    provider_result = poll_paynow_status(payment_model.paynow_poll_url or "")
    next_status = normalize_paynow_status(provider_result.get("status", "pending"))
    updated = store.save_payment_provider_details(
        db,
        payment_id,
        status=next_status,
        browser_url=payment_model.paynow_browser_url,
        poll_url=payment_model.paynow_poll_url,
        message=provider_result.get("status") or provider_result.get("message"),
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Payment not found")
    return updated


@router.get("/{payment_id}", response_model=Payment)
def get_payment(payment_id: str, db: Session = Depends(get_db)) -> Payment:
    payment = store.get_payment(db, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment
