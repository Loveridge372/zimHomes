from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import admin, payments, properties


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

app.include_router(properties.router)
app.include_router(admin.router)
app.include_router(payments.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "zimhomes-api"}
