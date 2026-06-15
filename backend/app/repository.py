from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models import PaymentModel, PropertyModel, UserModel
from app.schemas import Payment, PaymentIn, PaymentStatus, Property, PropertyIn, PropertyStatus, Purpose


def property_from_model(item: PropertyModel) -> Property:
    return Property(
        id=item.id,
        title=item.title,
        city=item.city,
        suburb=item.suburb,
        purpose=Purpose(item.purpose),
        property_type=item.property_type,
        price_usd=item.price_usd,
        bedrooms=item.bedrooms,
        bathrooms=item.bathrooms,
        description=item.description,
        management_option=item.management_option,  # type: ignore[arg-type]
        status=PropertyStatus(item.status),
        is_verified=item.is_verified,
        owner_id=item.owner_id,
    )


def payment_from_model(item: PaymentModel) -> Payment:
    return Payment(
        id=item.id,
        payment_type=item.payment_type,
        amount_usd=item.amount_usd,
        channel=item.channel,
        payer_reference=item.payer_reference,
        provider=item.provider,
        provider_reference=item.provider_reference,
        status=item.status,  # type: ignore[arg-type]
        redirect_url=item.redirect_url,
        property_id=item.property_id,
        user_id=item.user_id,
    )


class DatabaseStore:
    def search_properties(
        self,
        db: Session,
        city: str | None = None,
        suburb: str | None = None,
        location: str | None = None,
        purpose: Purpose | None = None,
        max_price: float | None = None,
    ) -> list[Property]:
        statement = select(PropertyModel).where(PropertyModel.status == PropertyStatus.approved.value)

        if location:
            pattern = f"%{location.strip()}%"
            statement = statement.where(
                or_(
                    PropertyModel.city.ilike(pattern),
                    PropertyModel.suburb.ilike(pattern),
                    PropertyModel.title.ilike(pattern),
                )
            )
        if city:
            statement = statement.where(PropertyModel.city.ilike(f"%{city.strip()}%"))
        if suburb:
            statement = statement.where(PropertyModel.suburb.ilike(f"%{suburb.strip()}%"))
        if purpose:
            statement = statement.where(PropertyModel.purpose == purpose.value)
        if max_price:
            statement = statement.where(PropertyModel.price_usd <= max_price)

        return [property_from_model(item) for item in db.scalars(statement).all()]

    def create_property(self, db: Session, payload: PropertyIn, owner: UserModel | None = None) -> Property:
        item = PropertyModel(
            owner_id=owner.id if owner else None,
            title=payload.title,
            city=payload.city,
            suburb=payload.suburb,
            purpose=payload.purpose.value,
            property_type=payload.property_type,
            price_usd=payload.price_usd,
            bedrooms=payload.bedrooms,
            bathrooms=payload.bathrooms,
            description=payload.description,
            management_option=payload.management_option,
            status=PropertyStatus.pending_review.value,
            is_verified=False,
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return property_from_model(item)

    def pending_properties(self, db: Session) -> list[Property]:
        statement = select(PropertyModel).where(PropertyModel.status == PropertyStatus.pending_review.value)
        return [property_from_model(item) for item in db.scalars(statement).all()]

    def approve_property(self, db: Session, property_id: str) -> Property | None:
        item = db.get(PropertyModel, property_id)
        if not item:
            return None
        item.status = PropertyStatus.approved.value
        item.is_verified = True
        db.commit()
        db.refresh(item)
        return property_from_model(item)

    def create_payment(self, db: Session, payload: PaymentIn, user: UserModel | None = None) -> Payment:
        item = PaymentModel(
            user_id=user.id if user else None,
            property_id=payload.property_id,
            payment_type=payload.payment_type,
            amount_usd=payload.amount_usd,
            channel=payload.channel,
            payer_reference=payload.payer_reference,
            provider_reference="pending",
            redirect_url="pending",
        )
        db.add(item)
        db.flush()
        item.provider_reference = f"ZH-{item.id[:8].upper()}"
        item.redirect_url = f"https://paynow.example/checkout/{item.id}"
        db.commit()
        db.refresh(item)
        return payment_from_model(item)

    def update_payment_status(self, db: Session, payment_id: str, status: PaymentStatus) -> Payment | None:
        item = db.get(PaymentModel, payment_id)
        if not item:
            return None
        item.status = status
        db.commit()
        db.refresh(item)
        return payment_from_model(item)

    def get_payment(self, db: Session, payment_id: str) -> Payment | None:
        item = db.get(PaymentModel, payment_id)
        return payment_from_model(item) if item else None


store = DatabaseStore()
