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
    owner_id: str | None = None
    image_urls: list[str] = Field(default_factory=list)


class PropertyImage(BaseModel):
    id: str
    property_id: str
    image_url: str
    sort_order: int


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
    property_id: str | None = None
    user_id: str | None = None


class ViewingRequestIn(BaseModel):
    property_id: str
    preferred_time: str | None = None
    message: str | None = None


class ViewingRequest(BaseModel):
    id: str
    property_id: str
    requester_id: str | None = None
    preferred_time: str | None = None
    message: str | None = None
    status: str


UserRole = Literal["seeker", "owner", "buyer", "agent", "admin"]


class UserRegister(BaseModel):
    full_name: str = Field(min_length=2)
    email: str = Field(min_length=5)
    phone: str | None = None
    password: str = Field(min_length=8)
    role: UserRole = "seeker"


class UserLogin(BaseModel):
    email: str = Field(min_length=5)
    password: str = Field(min_length=8)


class User(BaseModel):
    id: str
    full_name: str
    email: str
    phone: str | None = None
    role: UserRole


class AuthResponse(BaseModel):
    token: str
    user: User
