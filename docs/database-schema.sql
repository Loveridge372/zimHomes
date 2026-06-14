-- ZimHomes initial PostgreSQL schema.

CREATE TABLE users (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('seeker', 'owner', 'buyer', 'agent', 'admin')),
  is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE owner_verifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  national_id_url TEXT,
  proof_of_ownership_url TEXT,
  authority_letter_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ
);

CREATE TABLE properties (
  id UUID PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('rent', 'buy')),
  property_type TEXT NOT NULL CHECK (property_type IN ('room', 'cottage', 'flat', 'house', 'stand', 'commercial', 'farm', 'townhouse')),
  city TEXT NOT NULL,
  suburb TEXT NOT NULL,
  address_line TEXT,
  price_usd NUMERIC(12, 2) NOT NULL,
  bedrooms INTEGER NOT NULL DEFAULT 0,
  bathrooms INTEGER NOT NULL DEFAULT 0,
  furnished BOOLEAN NOT NULL DEFAULT FALSE,
  available_from DATE,
  management_option TEXT NOT NULL DEFAULT 'self_managed' CHECK (management_option IN ('self_managed', 'zimhomes_managed')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected', 'unavailable')),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE property_images (
  id UUID PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE favourites (
  user_id UUID NOT NULL REFERENCES users(id),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, property_id)
);

CREATE TABLE viewing_requests (
  id UUID PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES properties(id),
  requester_id UUID NOT NULL REFERENCES users(id),
  preferred_time TIMESTAMPTZ,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  property_id UUID REFERENCES properties(id),
  viewing_request_id UUID REFERENCES viewing_requests(id),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('listing_fee', 'featured_listing', 'viewing_fee', 'rent', 'deposit', 'management_fee')),
  amount_usd NUMERIC(12, 2) NOT NULL,
  provider TEXT NOT NULL DEFAULT 'paynow',
  provider_reference TEXT,
  channel TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);

CREATE TABLE management_contracts (
  id UUID PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES properties(id),
  owner_id UUID NOT NULL REFERENCES users(id),
  fee_percent NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'paused', 'ended')),
  starts_on DATE NOT NULL,
  ends_on DATE
);

CREATE TABLE maintenance_requests (
  id UUID PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES properties(id),
  tenant_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
