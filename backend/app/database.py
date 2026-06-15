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

    required_columns = {
        "paynow_poll_url": "VARCHAR(255)",
        "paynow_browser_url": "VARCHAR(255)",
        "provider_status_message": "VARCHAR(255)",
    }
    with engine.begin() as connection:
        rows = connection.execute(text("PRAGMA table_info(payments)")).fetchall()
        existing_columns = {row[1] for row in rows}
        for column_name, column_type in required_columns.items():
            if column_name not in existing_columns:
                connection.execute(text(f"ALTER TABLE payments ADD COLUMN {column_name} {column_type}"))
