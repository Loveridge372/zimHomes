from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class Purpose(str, Enum):
    rent = "rent"
    buy = "buy"


class PropertyStatus(str, Enum):
    pending_review = "pending_review"
    approved = "approved"
    rejected = "rejected"
    unavailable = "unavailable"


ManagementOption = Literal["self_managed", "zimhomes_managed"]


class PropertyIn(BaseModel):
    title: str = Field(min_length=3)
    city: str = Field(min_length=2)
    suburb: str = Field(min_length=2)
    purpose: Purpose
    property_type: str
    price_usd: float = Field(gt=0)
    bedrooms: int = Field(ge=0)
    bathrooms: int = Field(ge=0, default=1)
    description: str = Field(min_length=10)
    management_option: ManagementOption = "self_managed"


class Property(PropertyIn):
    id: str
    status: PropertyStatus = PropertyStatus.pending_review
    is_verified: bool = False


PaymentType = Literal[
    "listing_fee",
    "featured_listing",
    "viewing_fee",
    "rent",
    "deposit",
    "management_fee",
]

PaymentStatus = Literal["pending", "paid", "failed", "cancelled"]


class PaymentIn(BaseModel):
    payment_type: PaymentType
    amount_usd: float = Field(gt=0)
    channel: str
    payer_reference: str = Field(min_length=3)
    property_id: str | None = None


class Payment(BaseModel):
    id: str
    payment_type: str
    amount_usd: float
    channel: str
    payer_reference: str
    provider: str = "paynow"
    provider_reference: str
    status: PaymentStatus = "pending"
    redirect_url: str
