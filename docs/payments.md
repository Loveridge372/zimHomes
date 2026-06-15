# Wana Imba Payment Flow

Recommended first gateway: Paynow, because it supports Zimbabwe-friendly payment methods.

## Supported Payment Use Cases

- Owner listing fee
- Featured listing fee
- Viewing booking fee
- Rental deposit
- Monthly rent collection
- Wana Imba management fee

## Flow

1. User chooses an action that requires payment.
2. Backend creates a local `payments` record with status `pending`.
3. Backend sends payment request to Paynow with amount, reference, return URL, and result webhook URL.
4. User completes payment through EcoCash, OneMoney, card, or another supported channel.
5. Paynow sends payment update to `POST /payments/paynow/webhook`.
6. Backend verifies the payment result and updates status to `paid`, `failed`, or `cancelled`.
7. App unlocks the paid action, such as publishing a listing or confirming a viewing.

## Current Implementation

The backend now creates Wana Imba payment records and is Paynow-ready.

Environment variables:

```text
PAYNOW_INTEGRATION_ID=replace-me
PAYNOW_INTEGRATION_KEY=replace-me
PAYNOW_INITIATE_URL=https://www.paynow.co.zw/interface/initiatetransaction
PUBLIC_BASE_URL=https://your-public-api-domain.example
```

If `PAYNOW_INTEGRATION_ID` and `PAYNOW_INTEGRATION_KEY` are missing, the backend stays in demo mode and returns a pending payment reference without charging the customer.

For local phone testing, payment creation works in demo mode. For live Paynow testing, `PUBLIC_BASE_URL` must be reachable by Paynow over the internet, not just `127.0.0.1` or a private Wi-Fi IP.

## Admin Controls

- See pending and paid payments.
- Reconcile payments by provider reference.
- Manually mark exceptional payments after finance review.
- Export monthly reports for owners and Wana Imba revenue.

## Security Notes

- Never trust client-side payment status.
- Always verify payment callbacks on the backend.
- Store provider references and timestamps.
- Use HTTPS in production.
- Keep gateway credentials in environment variables.
