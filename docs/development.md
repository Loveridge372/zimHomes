# ZimHomes Development Guide

This repo now has three useful parts:

- `mobile/`: Expo React Native app for seekers, buyers, owners, payments, and admin preview.
- `backend/`: FastAPI app for listings, admin approval, and payment records.
- Root static files: the first clickable web prototype, kept for quick visual reference.

## Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
.venv\Scripts\uvicorn main:app --reload
```

Open:

```text
http://127.0.0.1:8000/docs
```

## Mobile App

```bash
cd mobile
npm install
npm run start
```

Then choose Android, iOS, or web from the Expo terminal.

If you test on a physical phone, change `API_BASE_URL` in `mobile/src/api/client.ts` from `http://127.0.0.1:8000` to your computer's local network IP, for example:

```text
http://192.168.1.50:8000
```

## Current Backend Storage

The backend currently uses an in-memory store. This is intentional for the first app structure because it lets the mobile app and API run before PostgreSQL credentials are ready.

Next backend milestone:

1. Add SQLAlchemy models.
2. Connect `DATABASE_URL` from `.env`.
3. Create migrations with Alembic.
4. Replace `InMemoryStore` with database repositories.

## Payment Integration

The current payment endpoint creates a local pending payment record and a fake Paynow redirect URL. Real Paynow work comes next:

1. Add Paynow credentials to `.env`.
2. Create real Paynow payment requests in `/payments/initiate`.
3. Verify Paynow callbacks in `/payments/paynow/webhook/{payment_id}`.
4. Unlock listings, featured placement, viewing bookings, rent records, or deposits only after verified payment status is `paid`.
