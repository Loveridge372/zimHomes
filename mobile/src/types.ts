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
  amenities: string[];
  management_option: "self_managed" | "zimhomes_managed";
  status: PropertyStatus;
  is_verified: boolean;
  image_urls: string[];
};

export type PropertyInput = Omit<Property, "id" | "status" | "is_verified" | "image_urls">;

export type OwnerProperty = Property & {
  application_count: number;
  pending_application_count: number;
};

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
  paynow_poll_url?: string | null;
  paynow_browser_url?: string | null;
  provider_status_message?: string | null;
};

export type ViewingRequest = {
  id: string;
  property_id: string;
  requester_id?: string | null;
  requester_name?: string | null;
  requester_role?: string | null;
  requester_badges: string[];
  property_title?: string | null;
  property_location?: string | null;
  preferred_time?: string | null;
  message?: string | null;
  household_size?: number | null;
  preferred_locations?: string | null;
  preferred_property_type?: string | null;
  budget_usd?: number | null;
  contact_unlocked: boolean;
  requester_phone?: string | null;
  requester_email?: string | null;
  salary_range?: string | null;
  tenant_references?: string | null;
  status: string;
};

export type UserRole = "seeker" | "owner" | "buyer" | "agent" | "admin";

export type User = {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  phone_verified: boolean;
  id_submitted: boolean;
  ownership_proof_submitted: boolean;
  employment_status?: string | null;
  salary_range?: string | null;
  tenant_references?: string | null;
  household_size?: number | null;
  preferred_locations?: string | null;
  preferred_property_type?: string | null;
  preferred_amenities: string[];
  budget_usd?: number | null;
  verification_badges: string[];
};

export type UserProfileUpdate = {
  phone?: string | null;
  phone_verified: boolean;
  id_submitted: boolean;
  ownership_proof_submitted: boolean;
  employment_status?: string | null;
  salary_range?: string | null;
  tenant_references?: string | null;
  household_size?: number | null;
  preferred_locations?: string | null;
  preferred_property_type?: string | null;
  preferred_amenities: string[];
  budget_usd?: number | null;
};

export type PropertyMatch = {
  property: Property;
  score: number;
  reasons: string[];
};

export type AuthResponse = {
  token: string;
  user: User;
};
