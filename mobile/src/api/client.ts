import Constants from "expo-constants";
import { Platform } from "react-native";

import { AuthResponse, Payment, Property, PropertyInput, User, ViewingRequest } from "../types";

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

export function getMediaUrl(path?: string) {
  if (!path) {
    return "";
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${API_BASE_URL}${path}`;
}

export function setAuthToken(token: string | null) {
  authToken = token;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const isFormData = options?.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      ...(!isFormData ? { "Content-Type": "application/json" } : {}),
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

export function uploadPropertyImages(propertyId: string, images: Array<{ uri: string; fileName?: string | null; mimeType?: string | null }>) {
  const formData = new FormData();
  images.forEach((image, index) => {
    const fileName = image.fileName ?? `property-${index + 1}.jpg`;
    formData.append("files", {
      uri: image.uri,
      name: fileName,
      type: image.mimeType ?? "image/jpeg"
    } as unknown as Blob);
  });

  return request<Array<{ id: string; property_id: string; image_url: string; sort_order: number }>>(`/properties/${propertyId}/images`, {
    method: "POST",
    body: formData
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

export function createViewingRequest(payload: { property_id: string; preferred_time?: string; message?: string }) {
  return request<ViewingRequest>("/viewings", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getMyViewingRequests() {
  return request<ViewingRequest[]>("/viewings/mine");
}

export function getViewingRequests() {
  return request<ViewingRequest[]>("/viewings");
}

export function updateViewingStatus(viewingId: string, status: "pending" | "confirmed" | "completed" | "cancelled") {
  return request<ViewingRequest>(`/viewings/${viewingId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
}

export function askAssistant(message: string) {
  return request<{ reply: string }>("/assistant/chat", {
    method: "POST",
    body: JSON.stringify({ message })
  });
}
