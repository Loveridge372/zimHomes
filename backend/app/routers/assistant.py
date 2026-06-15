from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.repository import store
from app.schemas import AssistantReply, AssistantRequest

router = APIRouter(prefix="/assistant", tags=["assistant"])


@router.post("/chat", response_model=AssistantReply)
def chat(payload: AssistantRequest, db: Session = Depends(get_db)) -> AssistantReply:
    message = payload.message.strip()
    lowered = message.lower()

    if not message:
        return AssistantReply(reply="Ask me about rentals, buying property, listing a property, viewings, payments, or Wana Imba management.")

    if any(word in lowered for word in ["rent", "rental", "accommodation", "room", "flat", "house"]):
        properties = store.search_properties(db, location=message)
        if properties:
            names = ", ".join(f"{item.title} in {item.suburb}" for item in properties[:3])
            return AssistantReply(reply=f"I found approved listings that may help: {names}. Open Search and try the suburb or city name.")
        return AssistantReply(reply="For rentals, search by city or suburb, then open View details to inspect photos and book a viewing.")

    if any(word in lowered for word in ["buy", "sale", "purchase", "stand", "commercial"]):
        return AssistantReply(reply="For buying property, use Search with purpose set to buy. Check verified listings, photos, title-deed availability, and book a viewing before paying anything.")

    if any(word in lowered for word in ["list", "upload", "landlord", "owner", "advertise"]):
        return AssistantReply(reply="To list a property, open List Property, choose photos, add city, suburb, price, bedrooms, and submit. Admin must approve it before buyers or tenants see it.")

    if any(word in lowered for word in ["viewing", "visit", "book"]):
        return AssistantReply(reply="To book a viewing, open a property, tap Book viewing, and the app creates a viewing request plus a viewing-fee payment reference.")

    if any(word in lowered for word in ["payment", "pay", "ecocash", "paynow", "deposit", "rent"]):
        return AssistantReply(reply="Payments are currently recorded as pending references. The production version should connect Paynow for EcoCash, OneMoney, cards, deposits, rent, and viewing fees.")

    if any(word in lowered for word in ["manage", "management", "agent", "zimhomes managed", "wana imba managed"]):
        return AssistantReply(reply="Wana Imba Managed means we can help with tenant sourcing, rent collection, inspections, maintenance coordination, and owner statements. A typical fee target is 8% to 12% of collected rent.")

    if any(word in lowered for word in ["lease", "agreement", "document", "contract"]):
        return AssistantReply(reply="Lease and property-management agreement templates are already prepared. The app can later generate them from property, owner, tenant, and payment details.")

    return AssistantReply(reply="I can help you find accommodation, understand buying steps, list a property, book a viewing, manage a property, or explain payments. What would you like to do?")
