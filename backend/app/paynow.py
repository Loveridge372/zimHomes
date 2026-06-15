import hashlib
import urllib.parse
import urllib.request
from collections import OrderedDict

from app.config import settings
from app.models import PaymentModel


def _make_hash(values: OrderedDict[str, str]) -> str:
    raw = "".join(str(value) for value in values.values()) + settings.paynow_integration_key
    return hashlib.sha512(raw.encode("utf-8")).hexdigest().upper()


def _parse_query_response(body: str) -> dict[str, str]:
    parsed = urllib.parse.parse_qs(body, keep_blank_values=True)
    return {key.lower(): values[0] for key, values in parsed.items()}


def create_paynow_checkout(payment: PaymentModel, result_url: str, return_url: str) -> dict[str, str]:
    if not settings.paynow_enabled:
        return {
            "status": "Demo",
            "browserurl": payment.redirect_url,
            "pollurl": "",
            "message": "Paynow credentials are not configured. Demo payment reference created.",
        }

    fields: OrderedDict[str, str] = OrderedDict(
        [
            ("id", settings.paynow_integration_id),
            ("reference", payment.provider_reference),
            ("amount", f"{payment.amount_usd:.2f}"),
            ("additionalinfo", f"Wana Imba {payment.payment_type}"),
            ("returnurl", return_url),
            ("resulturl", result_url),
            ("status", "Message"),
        ]
    )
    fields["hash"] = _make_hash(fields)

    data = urllib.parse.urlencode(fields).encode("utf-8")
    request = urllib.request.Request(settings.paynow_initiate_url, data=data, method="POST")
    with urllib.request.urlopen(request, timeout=30) as response:
        body = response.read().decode("utf-8")

    return _parse_query_response(body)


def poll_paynow_status(poll_url: str) -> dict[str, str]:
    if not poll_url:
        return {"status": "Error", "message": "No Paynow poll URL recorded for this payment."}

    with urllib.request.urlopen(poll_url, timeout=30) as response:
        body = response.read().decode("utf-8")
    return _parse_query_response(body)


def normalize_paynow_status(status: str) -> str:
    lowered = status.strip().lower()
    if lowered in {"paid", "awaiting delivery", "delivered"}:
        return "paid"
    if lowered in {"cancelled", "canceled"}:
        return "cancelled"
    if lowered in {"failed", "error"}:
        return "failed"
    return "pending"
