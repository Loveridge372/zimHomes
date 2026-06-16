from collections.abc import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings


connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}

engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_db_and_tables() -> None:
    from app import models

    Base.metadata.create_all(bind=engine)
    ensure_sqlite_columns()


def ensure_sqlite_columns() -> None:
    if not settings.database_url.startswith("sqlite"):
        return

    required_payment_columns = {
        "paynow_poll_url": "VARCHAR(255)",
        "paynow_browser_url": "VARCHAR(255)",
        "provider_status_message": "VARCHAR(255)",
    }
    with engine.begin() as connection:
        rows = connection.execute(text("PRAGMA table_info(payments)")).fetchall()
        existing_columns = {row[1] for row in rows}
        for column_name, column_type in required_payment_columns.items():
            if column_name not in existing_columns:
                connection.execute(text(f"ALTER TABLE payments ADD COLUMN {column_name} {column_type}"))

        property_rows = connection.execute(text("PRAGMA table_info(properties)")).fetchall()
        property_columns = {row[1] for row in property_rows}
        if "amenities" not in property_columns:
            connection.execute(text("ALTER TABLE properties ADD COLUMN amenities TEXT DEFAULT '[]'"))

        required_user_columns = {
            "phone_verified": "BOOLEAN DEFAULT 0",
            "id_submitted": "BOOLEAN DEFAULT 0",
            "ownership_proof_submitted": "BOOLEAN DEFAULT 0",
            "employment_status": "VARCHAR(80)",
            "salary_range": "VARCHAR(80)",
            "tenant_references": "TEXT",
            "household_size": "INTEGER",
            "preferred_locations": "VARCHAR(255)",
            "preferred_property_type": "VARCHAR(80)",
            "preferred_amenities": "TEXT DEFAULT '[]'",
            "budget_usd": "FLOAT",
        }
        user_rows = connection.execute(text("PRAGMA table_info(users)")).fetchall()
        user_columns = {row[1] for row in user_rows}
        for column_name, column_type in required_user_columns.items():
            if column_name not in user_columns:
                connection.execute(text(f"ALTER TABLE users ADD COLUMN {column_name} {column_type}"))
