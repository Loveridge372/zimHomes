import Constants from "expo-constants";
import { Platform } from "react-native";

import { AuthResponse, Payment, Property, PropertyInput, User } from "../types";

function getApiBaseUrl() {
  const configuredUrl = Constants.expoConfig?.extra?.apiBaseUrl;
  if (typeof configuredUrl === "string" && configuredUrl.length > 0) {
    return configuredUrl;
  }

  const expoHostUri =
    Constants.expoConfig?.hostUri ??
    (Constants.manifest as { debuggerHost?: string } | null)?.debuggerHost ??
    (Constants.manifest2 as { extra?: { expoClient?: { hostUri?: string } } } | null)?.extra?.expoClient?.hostUri;

  const host = typeof expoHostUri === "string" ? expoHostUri.split(":")[0] : "";
  if (host) {
    return `http://${host}:8000`;
  }

  return Platform.OS === "android" ? "http://10.0.2.2:8000" : "http://127.0.0.1:8000";
}

const API_BASE_URL = getApiBaseUrl();
let authToken: string | null = null;

export function getCurrentApiBaseUrl() {
  return API_BASE_URL;
}

export function setAuthToken(token: string | null) {
  authToken = token;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options?.headers ?? {})
    },
    ...options
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(formatApiError(message, response.status));
  }

  return response.json() as Promise<T>;
}

function formatApiError(message: string, status: number) {
  if (!message) {
    return `Request failed with ${status}`;
  }

  try {
    const parsed = JSON.parse(message) as { detail?: unknown };
    if (typeof parsed.detail === "string") {
      return parsed.detail;
    }
    if (Array.isArray(parsed.detail)) {
      return parsed.detail
        .map((item) => {
          const issue = item as { loc?: string[]; msg?: string };
          const field = issue.loc?.filter((part) => part !== "body").join(".");
          return field ? `${field}: ${issue.msg}` : issue.msg;
        })
        .filter(Boolean)
        .join("\n");
    }
  } catch {
    return message;
  }

  return message;
}

export function register(payload: {
  full_name: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
}) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function login(payload: { email: string; password: string }) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getMe() {
  return request<User>("/auth/me");
}

export function getProperties(filters: { city?: string; suburb?: string; location?: string; purpose?: string; max_price?: string }) {
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
