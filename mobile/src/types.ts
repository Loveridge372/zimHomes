export type Purpose = "rent" | "buy";

export type PropertyStatus = "pending_review" | "approved" | "rejected" | "unavailable";

export type Property = {
  id: string;
  title: string;
  city: string;
  suburb: string;
  purpose: Purpose;
  property_type: string;
  price_usd: number;
  bedrooms: number;
  bathrooms: number;
  description: string;
  management_option: "self_managed" | "zimhomes_managed";
  status: PropertyStatus;
  is_verified: boolean;
  image_urls: string[];
};

export type PropertyInput = Omit<Property, "id" | "status" | "is_verified" | "image_urls">;

export type Payment = {
  id: string;
  payment_type: string;
  amount_usd: number;
  channel: string;
  payer_reference: string;
  provider: string;
  provider_reference: string;
  status: "pending" | "paid" | "failed" | "cancelled";
  redirect_url: string;
};

export type ViewingRequest = {
  id: string;
  property_id: string;
  requester_id?: string | null;
  property_title?: string | null;
  property_location?: string | null;
  preferred_time?: string | null;
  message?: string | null;
  status: string;
};

export type UserRole = "seeker" | "owner" | "buyer" | "agent" | "admin";

export type User = {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
};

export type AuthResponse = {
  token: string;
  user: User;
};
