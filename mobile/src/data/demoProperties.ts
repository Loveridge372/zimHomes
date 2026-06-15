import { Property } from "../types";

export const demoProperties: Property[] = [
  {
    id: "demo-borrowdale",
    title: "Borrowdale family house",
    city: "Harare",
    suburb: "Borrowdale",
    purpose: "rent",
    property_type: "house",
    price_usd: 1200,
    bedrooms: 4,
    bathrooms: 3,
    description: "Secure family home with borehole, walled garden, staff quarters, and double lock-up garage.",
    management_option: "zimhomes_managed",
    status: "approved",
    is_verified: true,
    image_urls: []
  },
  {
    id: "demo-avondale",
    title: "Avondale furnished flat",
    city: "Harare",
    suburb: "Avondale",
    purpose: "rent",
    property_type: "flat",
    price_usd: 650,
    bedrooms: 2,
    bathrooms: 1,
    description: "Neat furnished flat close to shops, schools, and public transport.",
    management_option: "self_managed",
    status: "approved",
    is_verified: true,
    image_urls: []
  },
  {
    id: "demo-hillside",
    title: "Hillside townhouse for sale",
    city: "Bulawayo",
    suburb: "Hillside",
    purpose: "buy",
    property_type: "house",
    price_usd: 85000,
    bedrooms: 3,
    bathrooms: 2,
    description: "Move-in ready townhouse with title deeds available for buyer due diligence.",
    management_option: "self_managed",
    status: "approved",
    is_verified: true,
    image_urls: []
  }
];
