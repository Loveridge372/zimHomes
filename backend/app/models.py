from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def new_id() -> str:
    return str(uuid4())


def now_utc() -> datetime:
    return datetime.utcnow()


class UserModel(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    full_name: Mapped[str] = mapped_column(String(160))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    phone: Mapped[str | None] = mapped_column(String(40), unique=True, nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(40), default="seeker")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)

    properties: Mapped[list["PropertyModel"]] = relationship(back_populates="owner")


class PropertyModel(Base):
    __tablename__ = "properties"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    owner_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(180))
    city: Mapped[str] = mapped_column(String(100), index=True)
    suburb: Mapped[str] = mapped_column(String(120), index=True)
    purpose: Mapped[str] = mapped_column(String(20), index=True)
    property_type: Mapped[str] = mapped_column(String(60))
    price_usd: Mapped[float] = mapped_column(Float)
    bedrooms: Mapped[int] = mapped_column(Integer, default=0)
    bathrooms: Mapped[int] = mapped_column(Integer, default=1)
    description: Mapped[str] = mapped_column(Text)
    management_option: Mapped[str] = mapped_column(String(40), default="self_managed")
    status: Mapped[str] = mapped_column(String(40), default="pending_review", index=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)

    owner: Mapped[UserModel | None] = relationship(back_populates="properties")
    images: Mapped[list["PropertyImageModel"]] = relationship(
        back_populates="property",
        cascade="all, delete-orphan",
        order_by="PropertyImageModel.sort_order",
    )


class PropertyImageModel(Base):
    __tablename__ = "property_images"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    property_id: Mapped[str] = mapped_column(ForeignKey("properties.id"), index=True)
    image_url: Mapped[str] = mapped_column(String(255))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)

    property: Mapped[PropertyModel] = relationship(back_populates="images")


class PaymentModel(Base):
    __tablename__ = "payments"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    property_id: Mapped[str | None] = mapped_column(ForeignKey("properties.id"), nullable=True)
    payment_type: Mapped[str] = mapped_column(String(60))
    amount_usd: Mapped[float] = mapped_column(Float)
    channel: Mapped[str] = mapped_column(String(80))
    payer_reference: Mapped[str] = mapped_column(String(160))
    provider: Mapped[str] = mapped_column(String(40), default="paynow")
    provider_reference: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    status: Mapped[str] = mapped_column(String(40), default="pending", index=True)
    redirect_url: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)


class AuthTokenModel(Base):
    __tablename__ = "auth_tokens"

    token: Mapped[str] = mapped_column(String(120), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)
