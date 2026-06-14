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
};

export type PropertyInput = Omit<Property, "id" | "status" | "is_verified">;

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
