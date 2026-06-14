import { Payment, Property, PropertyInput } from "../types";

const API_BASE_URL = "http://127.0.0.1:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {})
    },
    ...options
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getProperties(filters: { city?: string; suburb?: string; purpose?: string; max_price?: string }) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  return request<Property[]>(`/properties${query ? `?${query}` : ""}`);
}

export function submitProperty(payload: PropertyInput) {
  return request<Property>("/properties", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getPendingProperties() {
  return request<Property[]>("/admin/properties/pending");
}

export function approveProperty(propertyId: string) {
  return request<Property>(`/admin/properties/${propertyId}/approve`, {
    method: "POST"
  });
}

export function initiatePayment(payload: {
  payment_type: string;
  amount_usd: number;
  channel: string;
  payer_reference: string;
  property_id?: string;
}) {
  return request<Payment>("/payments/initiate", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
