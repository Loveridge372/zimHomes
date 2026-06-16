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
    amenities: list[str] = Field(default_factory=list)
    management_option: ManagementOption = "self_managed"


class Property(PropertyIn):
    id: str
    status: PropertyStatus = PropertyStatus.pending_review
    is_verified: bool = False
    owner_id: str | None = None
    image_urls: list[str] = Field(default_factory=list)


class PropertyStatusUpdate(BaseModel):
    status: Literal["approved", "unavailable"] = "unavailable"


class PropertyUpdate(BaseModel):
    title: str = Field(min_length=3)
    city: str = Field(min_length=2)
    suburb: str = Field(min_length=2)
    purpose: Purpose
    property_type: str
    price_usd: float = Field(gt=0)
    bedrooms: int = Field(ge=0)
    bathrooms: int = Field(ge=0)
    description: str = Field(min_length=10)
    amenities: list[str] = Field(default_factory=list)
    management_option: ManagementOption = "self_managed"


class OwnerProperty(Property):
    application_count: int = 0
    pending_application_count: int = 0


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
    paynow_poll_url: str | None = None
    paynow_browser_url: str | None = None
    provider_status_message: str | None = None


class ViewingRequestIn(BaseModel):
    property_id: str
    preferred_time: str | None = None
    message: str | None = None


class ViewingRequest(BaseModel):
    id: str
    property_id: str
    requester_id: str | None = None
    requester_name: str | None = None
    requester_role: str | None = None
    requester_badges: list[str] = Field(default_factory=list)
    property_title: str | None = None
    property_location: str | None = None
    preferred_time: str | None = None
    message: str | None = None
    household_size: int | None = None
    preferred_locations: str | None = None
    preferred_property_type: str | None = None
    budget_usd: float | None = None
    contact_unlocked: bool = False
    requester_phone: str | None = None
    requester_email: str | None = None
    salary_range: str | None = None
    tenant_references: str | None = None
    status: str


class ViewingStatusUpdate(BaseModel):
    status: Literal["pending", "confirmed", "completed", "cancelled"]


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
    phone_verified: bool = False
    id_submitted: bool = False
    ownership_proof_submitted: bool = False
    employment_status: str | None = None
    salary_range: str | None = None
    tenant_references: str | None = None
    household_size: int | None = None
    preferred_locations: str | None = None
    preferred_property_type: str | None = None
    preferred_amenities: list[str] = Field(default_factory=list)
    budget_usd: float | None = None
    verification_badges: list[str] = Field(default_factory=list)


class UserProfileUpdate(BaseModel):
    phone: str | None = None
    phone_verified: bool = False
    id_submitted: bool = False
    ownership_proof_submitted: bool = False
    employment_status: str | None = None
    salary_range: str | None = None
    tenant_references: str | None = None
    household_size: int | None = Field(default=None, ge=1)
    preferred_locations: str | None = None
    preferred_property_type: str | None = None
    preferred_amenities: list[str] = Field(default_factory=list)
    budget_usd: float | None = Field(default=None, ge=0)


class PropertyMatch(BaseModel):
    property: Property
    score: int
    reasons: list[str] = Field(default_factory=list)


class AuthResponse(BaseModel):
    token: str
    user: User


class AssistantRequest(BaseModel):
    message: str = Field(min_length=1)


class AssistantReply(BaseModel):
    reply: str
