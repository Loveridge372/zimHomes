import json

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models import PaymentModel, PropertyImageModel, PropertyModel, UserModel, ViewingRequestModel
from app.schemas import (
    Payment,
    PaymentIn,
    PaymentStatus,
    OwnerProperty,
    Property,
    PropertyImage,
    PropertyIn,
    PropertyMatch,
    PropertyStatus,
    PropertyUpdate,
    Purpose,
    User,
    ViewingRequest,
    ViewingRequestIn,
    ViewingStatusUpdate,
)


def property_from_model(item: PropertyModel) -> Property:
    try:
        amenities = json.loads(item.amenities or "[]")
    except json.JSONDecodeError:
        amenities = []

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
        amenities=amenities if isinstance(amenities, list) else [],
        management_option=item.management_option,  # type: ignore[arg-type]
        status=PropertyStatus(item.status),
        is_verified=item.is_verified,
        owner_id=item.owner_id,
        image_urls=[image.image_url for image in item.images],
    )


def owner_property_from_model(item: PropertyModel) -> OwnerProperty:
    base = property_from_model(item)
    application_count = len(getattr(item, "viewing_requests", []))
    pending_application_count = len([request for request in getattr(item, "viewing_requests", []) if request.status == "pending"])
    return OwnerProperty(
        **base.model_dump(),
        application_count=application_count,
        pending_application_count=pending_application_count,
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
        paynow_poll_url=item.paynow_poll_url,
        paynow_browser_url=item.paynow_browser_url,
        provider_status_message=item.provider_status_message,
    )


def user_from_model(item: UserModel) -> User:
    try:
        preferred_amenities = json.loads(item.preferred_amenities or "[]")
    except json.JSONDecodeError:
        preferred_amenities = []

    badges: list[str] = []
    if item.phone_verified:
        badges.append("Phone verified")
    if item.id_submitted:
        badges.append("ID submitted")
    if item.ownership_proof_submitted:
        badges.append("Ownership proof submitted")
    if item.phone_verified and item.id_submitted and (item.role not in {"owner", "agent"} or item.ownership_proof_submitted):
        badges.append("Fully verified")

    return User(
        id=item.id,
        full_name=item.full_name,
        email=item.email,
        phone=item.phone,
        role=item.role,  # type: ignore[arg-type]
        phone_verified=item.phone_verified,
        id_submitted=item.id_submitted,
        ownership_proof_submitted=item.ownership_proof_submitted,
        employment_status=item.employment_status,
        salary_range=item.salary_range,
        tenant_references=item.tenant_references,
        household_size=item.household_size,
        preferred_locations=item.preferred_locations,
        preferred_property_type=item.preferred_property_type,
        preferred_amenities=preferred_amenities if isinstance(preferred_amenities, list) else [],
        budget_usd=item.budget_usd,
        verification_badges=badges,
    )


def viewing_from_model(item: ViewingRequestModel) -> ViewingRequest:
    property_item = item.property
    requester = item.requester
    contact_unlocked = item.status in {"confirmed", "completed"}
    requester_badges = user_from_model(requester).verification_badges if requester else []

    return ViewingRequest(
        id=item.id,
        property_id=item.property_id,
        requester_id=item.requester_id,
        requester_name=requester.full_name if requester else None,
        requester_role=requester.role if requester else None,
        requester_badges=requester_badges,
        property_title=property_item.title if property_item else None,
        property_location=f"{property_item.suburb}, {property_item.city}" if property_item else None,
        preferred_time=item.preferred_time,
        message=item.message,
        household_size=requester.household_size if requester else None,
        preferred_locations=requester.preferred_locations if requester else None,
        preferred_property_type=requester.preferred_property_type if requester else None,
        budget_usd=requester.budget_usd if requester else None,
        contact_unlocked=contact_unlocked,
        requester_phone=requester.phone if requester and contact_unlocked else None,
        requester_email=requester.email if requester and contact_unlocked else None,
        salary_range=requester.salary_range if requester and contact_unlocked else None,
        tenant_references=requester.tenant_references if requester and contact_unlocked else None,
        status=item.status,
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
        amenities: list[str] | None = None,
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

        results = [property_from_model(item) for item in db.scalars(statement).all()]
        if amenities:
            required = {amenity.strip().lower() for amenity in amenities if amenity.strip()}
            results = [
                item
                for item in results
                if required.issubset({amenity.strip().lower() for amenity in item.amenities})
            ]

        return results

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
            amenities=json.dumps(payload.amenities),
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

    def list_owner_properties(self, db: Session, owner: UserModel) -> list[OwnerProperty]:
        statement = select(PropertyModel).where(PropertyModel.owner_id == owner.id).order_by(PropertyModel.created_at.desc())
        return [owner_property_from_model(item) for item in db.scalars(statement).all()]

    def update_owner_property_status(self, db: Session, owner: UserModel, property_id: str, status: str) -> OwnerProperty | None:
        item = db.get(PropertyModel, property_id)
        if not item or item.owner_id != owner.id:
            return None
        item.status = status
        if status == PropertyStatus.approved.value:
            item.is_verified = True
        if status == PropertyStatus.unavailable.value:
            item.is_verified = False
        db.commit()
        db.refresh(item)
        return owner_property_from_model(item)

    def update_owner_property(self, db: Session, owner: UserModel, property_id: str, payload: PropertyUpdate) -> OwnerProperty | None:
        item = db.get(PropertyModel, property_id)
        if not item or item.owner_id != owner.id:
            return None

        item.title = payload.title
        item.city = payload.city
        item.suburb = payload.suburb
        item.purpose = payload.purpose.value
        item.property_type = payload.property_type
        item.price_usd = payload.price_usd
        item.bedrooms = payload.bedrooms
        item.bathrooms = payload.bathrooms
        item.description = payload.description
        item.amenities = json.dumps(payload.amenities)
        item.management_option = payload.management_option
        db.commit()
        db.refresh(item)
        return owner_property_from_model(item)

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
        item.provider_reference = f"WI-{item.id[:8].upper()}"
        item.redirect_url = f"https://paynow.example/checkout/{item.id}"
        db.commit()
        db.refresh(item)
        return payment_from_model(item)

    def get_payment_model(self, db: Session, payment_id: str) -> PaymentModel | None:
        return db.get(PaymentModel, payment_id)

    def save_payment_provider_details(
        self,
        db: Session,
        payment_id: str,
        status: str,
        browser_url: str | None = None,
        poll_url: str | None = None,
        message: str | None = None,
    ) -> Payment | None:
        item = db.get(PaymentModel, payment_id)
        if not item:
            return None
        item.status = status
        item.paynow_browser_url = browser_url
        item.paynow_poll_url = poll_url
        item.redirect_url = browser_url or item.redirect_url
        item.provider_status_message = message
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

    def list_payments(self, db: Session) -> list[Payment]:
        statement = select(PaymentModel).order_by(PaymentModel.created_at.desc())
        return [payment_from_model(item) for item in db.scalars(statement).all()]

    def list_users(self, db: Session) -> list[User]:
        statement = select(UserModel).order_by(UserModel.created_at.desc())
        return [user_from_model(item) for item in db.scalars(statement).all()]

    def match_properties(self, db: Session, user: UserModel) -> list[PropertyMatch]:
        properties = self.search_properties(db)
        profile = user_from_model(user)
        preferred_locations = [
            location.strip().lower()
            for location in (profile.preferred_locations or "").split(",")
            if location.strip()
        ]
        preferred_type = (profile.preferred_property_type or "").strip().lower()
        preferred_amenities = {amenity.strip().lower() for amenity in profile.preferred_amenities}

        matches: list[PropertyMatch] = []
        for property_item in properties:
            score = 0
            reasons: list[str] = []

            if profile.budget_usd:
                if property_item.price_usd <= profile.budget_usd:
                    score += 25
                    reasons.append("Within budget")
                elif property_item.price_usd <= profile.budget_usd * 1.15:
                    score += 12
                    reasons.append("Close to budget")

            if preferred_locations:
                location_text = f"{property_item.city} {property_item.suburb}".lower()
                if any(location in location_text for location in preferred_locations):
                    score += 25
                    reasons.append("Matches preferred area")

            if preferred_type and preferred_type in property_item.property_type.lower():
                score += 15
                reasons.append("Matches property type")

            if profile.household_size:
                needed_bedrooms = max(1, (profile.household_size + 1) // 2)
                if property_item.bedrooms >= needed_bedrooms:
                    score += 15
                    reasons.append("Fits household size")

            if preferred_amenities:
                property_amenities = {amenity.strip().lower() for amenity in property_item.amenities}
                matched_amenities = preferred_amenities.intersection(property_amenities)
                if matched_amenities:
                    amenity_score = round((len(matched_amenities) / len(preferred_amenities)) * 20)
                    score += amenity_score
                    reasons.append(f"{len(matched_amenities)} amenity match{'' if len(matched_amenities) == 1 else 'es'}")

            if not reasons:
                reasons.append("Approved listing")

            matches.append(PropertyMatch(property=property_item, score=min(score, 100), reasons=reasons))

        return sorted(matches, key=lambda item: item.score, reverse=True)

    def get_property_model(self, db: Session, property_id: str) -> PropertyModel | None:
        return db.get(PropertyModel, property_id)

    def add_property_image(self, db: Session, property_id: str, image_url: str, sort_order: int) -> PropertyImage:
        item = PropertyImageModel(property_id=property_id, image_url=image_url, sort_order=sort_order)
        db.add(item)
        db.commit()
        db.refresh(item)
        return PropertyImage(id=item.id, property_id=item.property_id, image_url=item.image_url, sort_order=item.sort_order)

    def create_viewing_request(
        self,
        db: Session,
        payload: ViewingRequestIn,
        requester: UserModel | None = None,
    ) -> ViewingRequest | None:
        property_item = db.get(PropertyModel, payload.property_id)
        if not property_item or property_item.status != PropertyStatus.approved.value:
            return None

        item = ViewingRequestModel(
            property_id=payload.property_id,
            requester_id=requester.id if requester else None,
            preferred_time=payload.preferred_time,
            message=payload.message,
            status="pending",
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return viewing_from_model(item)

    def list_viewing_requests(self, db: Session, requester: UserModel | None = None) -> list[ViewingRequest]:
        statement = select(ViewingRequestModel).order_by(ViewingRequestModel.created_at.desc())
        if requester:
            statement = statement.where(ViewingRequestModel.requester_id == requester.id)
        return [viewing_from_model(item) for item in db.scalars(statement).all()]

    def list_owner_viewing_requests(self, db: Session, owner: UserModel) -> list[ViewingRequest]:
        statement = (
            select(ViewingRequestModel)
            .join(PropertyModel, ViewingRequestModel.property_id == PropertyModel.id)
            .where(PropertyModel.owner_id == owner.id)
            .order_by(ViewingRequestModel.created_at.desc())
        )
        return [viewing_from_model(item) for item in db.scalars(statement).all()]

    def update_viewing_status(self, db: Session, viewing_id: str, status: str) -> ViewingRequest | None:
        item = db.get(ViewingRequestModel, viewing_id)
        if not item:
            return None
        item.status = status
        db.commit()
        db.refresh(item)
        return viewing_from_model(item)


store = DatabaseStore()
