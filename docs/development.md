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

The backend now uses SQLAlchemy. By default it creates a local SQLite database at `backend/zimhomes.db`, which is enough for development and phone testing. For production, set `DATABASE_URL` to PostgreSQL.

Run the backend after installing requirements:

```bash
cd backend
.venv\Scripts\pip install -r requirements.txt
.venv\Scripts\uvicorn main:app --host 0.0.0.0 --reload
```

Seeded demo admin account:

```text
Email: admin@zimhomes.local
Password: AdminPass123
```

Next backend milestone:

1. Add Alembic migrations.
2. Move from local SQLite to PostgreSQL.
3. Add role-based admin permissions to protect approval routes.
4. Add password reset and phone verification.

## Payment Integration

The current payment endpoint creates a local pending payment record and a fake Paynow redirect URL. Real Paynow work comes next:

1. Add Paynow credentials to `.env`.
2. Create real Paynow payment requests in `/payments/initiate`.
3. Verify Paynow callbacks in `/payments/paynow/webhook/{payment_id}`.
4. Unlock listings, featured placement, viewing bookings, rent records, or deposits only after verified payment status is `paid`.

## Agreement Generation

Draft agreement templates live in `docs/agreements`, and generated Word versions live in `generated/agreements`.

Regenerate the Word files after editing the Markdown templates:

```bash
python tools/generate_agreement_docs.py
```

Production flow should generate a lease or management agreement from saved property, owner, tenant, payment, and inspection data, then store the signed document against the relevant property record.

## Property Photos

The mobile app uses Expo Image Picker to select up to 10 property photos. The backend accepts multipart uploads at:

```text
POST /properties/{property_id}/images
```

Local development stores uploaded files in:

```text
backend/uploads/properties/{property_id}/
```

Those files are ignored by Git. Production should move image storage to Cloudinary or S3 and keep only the public image URLs in the database.
