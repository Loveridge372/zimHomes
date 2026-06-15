# ZimHomes

ZimHomes is a Zimbabwe-focused property marketplace and property-management platform.

Tagline: **Find, Rent, Buy, Manage.**

This workspace now contains a real starter structure plus the original static MVP prototype. It demonstrates:

- Accommodation and property search by city, suburb, purpose, type, and price
- Rental and sale listings
- Owner listing submission
- Admin listing approval
- ZimHomes managed-property service positioning
- Payment flow preview for listing fees, featured listings, viewing fees, rent, and deposits

## Project Structure

- `mobile/`: Expo React Native app for the customer, owner, payments, management, and admin flows.
- `backend/`: FastAPI API scaffold for properties, approvals, and payments.
- `docs/`: Product plan, API design, database schema, payment plan, and development guide.
- `index.html`, `styles.css`, `app.js`: Static prototype kept for quick visual preview.

## Quick Static Preview

Open `index.html` in a browser.

No install step is required for this version.

## Backend

The `backend` folder contains a FastAPI scaffold for properties, admin approval, and payment initiation.

```bash
cd backend
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
.venv\Scripts\uvicorn main:app --host 0.0.0.0 --reload
```

Then open `http://127.0.0.1:8000/docs` for the API explorer.

The backend creates a local SQLite database at `backend/zimhomes.db` by default. Demo admin login:

```text
Email: admin@zimhomes.local
Password: AdminPass123
```

## Mobile App

```bash
cd mobile
npm install
npm run start
```

The mobile app currently calls `http://127.0.0.1:8000`. If testing on a physical phone, update `mobile/src/api/client.ts` to use your computer's local network IP address.

## Recommended Next Build Steps

1. Install dependencies and run the backend plus mobile app locally.
2. Add Alembic migrations and move production storage to PostgreSQL.
3. Store property images in Cloudinary or S3.
4. Integrate Paynow first for EcoCash, OneMoney, cards, ZimSwitch, InnBucks, and related local payment options.
5. Add login, role-based permissions, and verification workflows for landlords and properties before listings go live.

## Business Model

- Basic listing fee
- Featured listing fee
- Viewing booking fee
- Rental or sale commission
- Monthly property-management fee, recommended starting range: 8% to 12%
