# Wana Imba API Design

Recommended backend: FastAPI with PostgreSQL.

## Authentication

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/verify-phone`

## Listings

- `GET /properties`
- `GET /properties/{property_id}`
- `POST /properties`
- `PATCH /properties/{property_id}`
- `DELETE /properties/{property_id}`
- `POST /properties/{property_id}/images`
- `POST /properties/{property_id}/submit-for-review`

## Search Filters

`GET /properties?purpose=rent&city=Harare&suburb=Borrowdale&type=house&max_price=800&bedrooms=2`

## Favourites

- `GET /me/favourites`
- `POST /me/favourites/{property_id}`
- `DELETE /me/favourites/{property_id}`

## Viewings

- `POST /viewings`
- `GET /me/viewings`
- `PATCH /viewings/{viewing_id}/status`

## Payments

- `POST /payments/initiate`
- `GET /payments/{payment_id}`
- `POST /payments/paynow/webhook`

Payment types:

- listing_fee
- featured_listing
- viewing_fee
- rent
- deposit
- management_fee

## Admin

- `GET /admin/properties/pending`
- `POST /admin/properties/{property_id}/approve`
- `POST /admin/properties/{property_id}/reject`
- `GET /admin/payments`
- `GET /admin/reports`

## Property Management

- `POST /management/contracts`
- `GET /management/contracts`
- `POST /management/maintenance-requests`
- `PATCH /management/maintenance-requests/{request_id}`
- `GET /management/owner-statements`
