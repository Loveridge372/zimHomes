from uuid import uuid4

from app.schemas import Payment, PaymentIn, PaymentStatus, Property, PropertyIn, PropertyStatus, Purpose


class InMemoryStore:
    def __init__(self) -> None:
        self.properties: list[Property] = [
            Property(
                id="demo-borrowdale",
                title="Borrowdale family house",
                city="Harare",
                suburb="Borrowdale",
                purpose=Purpose.rent,
                property_type="house",
                price_usd=1200,
                bedrooms=4,
                bathrooms=3,
                description="Secure family home with borehole, garden, and double garage.",
                management_option="zimhomes_managed",
                status=PropertyStatus.approved,
                is_verified=True,
            ),
            Property(
                id="demo-hillside",
                title="Hillside townhouse for sale",
                city="Bulawayo",
                suburb="Hillside",
                purpose=Purpose.buy,
                property_type="house",
                price_usd=85000,
                bedrooms=3,
                bathrooms=2,
                description="Move-in ready townhouse with title deeds available for buyer due diligence.",
                management_option="self_managed",
                status=PropertyStatus.approved,
                is_verified=True,
            ),
        ]
        self.payments: dict[str, Payment] = {}

    def search_properties(
        self,
        city: str | None = None,
        suburb: str | None = None,
        purpose: Purpose | None = None,
        max_price: float | None = None,
    ) -> list[Property]:
        results = [item for item in self.properties if item.status == PropertyStatus.approved]

        if city:
            results = [item for item in results if item.city.lower() == city.lower()]
        if suburb:
            results = [item for item in results if item.suburb.lower() == suburb.lower()]
        if purpose:
            results = [item for item in results if item.purpose == purpose]
        if max_price:
            results = [item for item in results if item.price_usd <= max_price]

        return results

    def create_property(self, payload: PropertyIn) -> Property:
        item = Property(id=str(uuid4()), **payload.model_dump())
        self.properties.append(item)
        return item

    def pending_properties(self) -> list[Property]:
        return [item for item in self.properties if item.status == PropertyStatus.pending_review]

    def approve_property(self, property_id: str) -> Property | None:
        for item in self.properties:
            if item.id == property_id:
                item.status = PropertyStatus.approved
                item.is_verified = True
                return item
        return None

    def create_payment(self, payload: PaymentIn) -> Payment:
        payment_id = str(uuid4())
        payment = Payment(
            id=payment_id,
            payment_type=payload.payment_type,
            amount_usd=payload.amount_usd,
            channel=payload.channel,
            payer_reference=payload.payer_reference,
            provider_reference=f"ZH-{payment_id[:8].upper()}",
            redirect_url=f"https://paynow.example/checkout/{payment_id}",
        )
        self.payments[payment.id] = payment
        return payment

    def update_payment_status(self, payment_id: str, status: PaymentStatus) -> Payment | None:
        payment = self.payments.get(payment_id)
        if not payment:
            return None
        payment.status = status
        return payment

    def get_payment(self, payment_id: str) -> Payment | None:
        return self.payments.get(payment_id)


store = InMemoryStore()
