const listings = [
  {
    id: 1,
    title: "Borrowdale family house",
    city: "Harare",
    suburb: "Borrowdale",
    purpose: "rent",
    type: "house",
    price: 1200,
    beds: 4,
    baths: 3,
    status: "approved",
    verified: true,
    management: "ZimHomes managed",
    image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=80",
    description: "Secure family home with borehole, walled garden, staff quarters, and double lock-up garage."
  },
  {
    id: 2,
    title: "Avondale furnished flat",
    city: "Harare",
    suburb: "Avondale",
    purpose: "rent",
    type: "flat",
    price: 650,
    beds: 2,
    baths: 1,
    status: "approved",
    verified: true,
    management: "Self managed",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80",
    description: "Neat furnished flat close to shops, schools, and public transport."
  },
  {
    id: 3,
    title: "Hillside townhouse for sale",
    city: "Bulawayo",
    suburb: "Hillside",
    purpose: "buy",
    type: "house",
    price: 85000,
    beds: 3,
    baths: 2,
    status: "approved",
    verified: true,
    management: "Self managed",
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1000&q=80",
    description: "Move-in ready townhouse with title deeds available for buyer due diligence."
  },
  {
    id: 4,
    title: "Mutare student rooms",
    city: "Mutare",
    suburb: "Murambi",
    purpose: "rent",
    type: "room",
    price: 120,
    beds: 1,
    baths: 1,
    status: "approved",
    verified: false,
    management: "ZimHomes managed",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80",
    description: "Affordable student rooms with shared kitchen, prepaid electricity, and reliable water storage."
  },
  {
    id: 5,
    title: "Victoria Falls commercial lodge",
    city: "Victoria Falls",
    suburb: "CBD",
    purpose: "buy",
    type: "commercial",
    price: 380000,
    beds: 8,
    baths: 8,
    status: "approved",
    verified: true,
    management: "ZimHomes managed",
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1000&q=80",
    description: "Tourism-ready property with expansion space and strong short-stay potential."
  }
];

const listingGrid = document.querySelector("#listingGrid");
const pendingList = document.querySelector("#pendingList");
const liveCount = document.querySelector("#liveCount");
const filters = {
  location: document.querySelector("#locationFilter"),
  purpose: document.querySelector("#purposeFilter"),
  type: document.querySelector("#typeFilter"),
  price: document.querySelector("#priceFilter")
};

function currency(value, purpose) {
  const formatted = Number(value).toLocaleString("en-US");
  return purpose === "rent" ? `$${formatted}/mo` : `$${formatted}`;
}

function matchesFilter(listing) {
  const locationNeedle = filters.location.value.trim().toLowerCase();
  const maxPrice = Number(filters.price.value);
  const locationText = `${listing.city} ${listing.suburb}`.toLowerCase();

  return (
    listing.status === "approved" &&
    (!locationNeedle || locationText.includes(locationNeedle)) &&
    (filters.purpose.value === "all" || listing.purpose === filters.purpose.value) &&
    (filters.type.value === "all" || listing.type === filters.type.value) &&
    (!maxPrice || listing.price <= maxPrice)
  );
}

function listingCard(listing) {
  return `
    <article class="listing-card">
      <img src="${listing.image}" alt="${listing.title}" />
      <div class="listing-body">
        <div class="listing-meta">
          <span class="chip">${listing.purpose === "rent" ? "For rent" : "For sale"}</span>
          <span class="chip">${listing.type}</span>
          ${listing.verified ? '<span class="chip">Verified</span>' : ""}
        </div>
        <h3>${listing.title}</h3>
        <p>${listing.suburb}, ${listing.city} - ${listing.beds} bed - ${listing.baths} bath</p>
        <strong class="price">${currency(listing.price, listing.purpose)}</strong>
        <p>${listing.description}</p>
        <div class="card-actions">
          <button class="secondary-button" type="button" data-save="${listing.id}">Save</button>
          <button class="primary-button" type="button" data-pay="Viewing fee - $2">Book viewing</button>
        </div>
      </div>
    </article>
  `;
}

function renderListings() {
  const approved = listings.filter((listing) => listing.status === "approved");
  const visible = listings.filter(matchesFilter);
  liveCount.textContent = approved.length;
  listingGrid.innerHTML = visible.length
    ? visible.map(listingCard).join("")
    : '<div class="empty-state">No listings match that search yet. Try a wider price or nearby suburb.</div>';
}

function renderPending() {
  const pending = listings.filter((listing) => listing.status === "pending");
  pendingList.innerHTML = pending.length
    ? pending
        .map(
          (listing) => `
            <div class="pending-item">
              <div>
                <strong>${listing.title}</strong>
                <p>${listing.suburb}, ${listing.city} - ${listing.management}</p>
              </div>
              <button class="primary-button" type="button" data-approve="${listing.id}">Approve</button>
            </div>
          `
        )
        .join("")
    : '<div class="empty-state">No pending listings. New owner submissions will appear here.</div>';
}

function openPayment(type = "Listing fee - $5") {
  const modal = document.querySelector("#paymentModal");
  document.querySelector("#paymentType").value = type;
  document.querySelector("#paymentNote").textContent = "";
  if (typeof modal.showModal === "function") {
    modal.showModal();
  } else {
    alert("Payment modal is not supported by this browser.");
  }
}

document.querySelector("#quickSearchForm").addEventListener("submit", (event) => {
  event.preventDefault();
  filters.location.value = document.querySelector("#quickSearch").value;
  document.querySelector("#search").scrollIntoView({ behavior: "smooth" });
  renderListings();
});

Object.values(filters).forEach((filter) => {
  filter.addEventListener("input", renderListings);
  filter.addEventListener("change", renderListings);
});

document.querySelector("#propertyForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const newListing = {
    id: Date.now(),
    title: data.get("title"),
    city: data.get("city"),
    suburb: data.get("suburb"),
    purpose: data.get("purpose"),
    type: data.get("type"),
    price: Number(data.get("price")),
    beds: Number(data.get("beds")),
    baths: 1,
    status: "pending",
    verified: false,
    management: data.get("management"),
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=80",
    description: data.get("description")
  };

  listings.unshift(newListing);
  event.currentTarget.reset();
  document.querySelector("#formNote").textContent =
    "Submitted. Admin approval is required before this listing goes live.";
  renderPending();
  openPayment("Listing fee - $5");
});

document.body.addEventListener("click", (event) => {
  const payType = event.target.getAttribute("data-pay");
  const approveId = Number(event.target.getAttribute("data-approve"));
  const saveId = event.target.getAttribute("data-save");

  if (payType) {
    openPayment(payType);
  }

  if (approveId) {
    const listing = listings.find((item) => item.id === approveId);
    if (listing) {
      listing.status = "approved";
      renderListings();
      renderPending();
    }
  }

  if (saveId) {
    event.target.textContent = "Saved";
    event.target.disabled = true;
  }
});

document.querySelector("#openPaymentBtn").addEventListener("click", () => openPayment());

document.querySelector("#simulatePaymentBtn").addEventListener("click", () => {
  const type = document.querySelector("#paymentType").value;
  const channel = document.querySelector("#paymentChannel").value;
  const reference = document.querySelector("#paymentReference").value.trim() || "customer reference";
  document.querySelector("#paymentNote").textContent =
    `${type} created through ${channel}. Status: pending confirmation for ${reference}.`;
});

renderListings();
renderPending();
