from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select

from app.config import UPLOADS_DIR
from app.database import SessionLocal, create_db_and_tables
from app.models import PropertyModel, UserModel
from app.routers import admin, auth, payments, properties, viewings
from app.security import hash_password


app = FastAPI(title="ZimHomes API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:19006",
        "http://127.0.0.1:19006",
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "null",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(properties.router)
app.include_router(admin.router)
app.include_router(payments.router)
app.include_router(viewings.router)
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "zimhomes-api"}


@app.on_event("startup")
def startup() -> None:
    create_db_and_tables()
    seed_demo_data()


def seed_demo_data() -> None:
    db = SessionLocal()
    try:
        admin = db.scalar(select(UserModel).where(UserModel.email == "admin@zimhomes.local"))
        if not admin:
            admin = UserModel(
                full_name="ZimHomes Admin",
                email="admin@zimhomes.local",
                phone="+263770000000",
                password_hash=hash_password("AdminPass123"),
                role="admin",
            )
            db.add(admin)
            db.flush()

        has_properties = db.scalar(select(PropertyModel.id).limit(1))
        if not has_properties:
            db.add_all(
                [
                    PropertyModel(
                        owner_id=admin.id,
                        title="Borrowdale family house",
                        city="Harare",
                        suburb="Borrowdale",
                        purpose="rent",
                        property_type="house",
                        price_usd=1200,
                        bedrooms=4,
                        bathrooms=3,
                        description="Secure family home with borehole, garden, and double garage.",
                        management_option="zimhomes_managed",
                        status="approved",
                        is_verified=True,
                    ),
                    PropertyModel(
                        owner_id=admin.id,
                        title="Hillside townhouse for sale",
                        city="Bulawayo",
                        suburb="Hillside",
                        purpose="buy",
                        property_type="house",
                        price_usd=85000,
                        bedrooms=3,
                        bathrooms=2,
                        description="Move-in ready townhouse with title deeds available for buyer due diligence.",
                        management_option="self_managed",
                        status="approved",
                        is_verified=True,
                    ),
                ]
            )

        db.commit()
    finally:
        db.close()
