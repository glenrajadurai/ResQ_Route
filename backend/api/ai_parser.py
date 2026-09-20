import os
import re
import json
import random
import logging

logger = logging.getLogger(__name__)

# Base reference coordinates for default disaster zone map visualization (e.g. Metro Disaster Area)
BASE_LAT = 29.7604  # Houston/Metro area reference
BASE_LNG = -95.3698

LOCATION_MAP = {
    "main st": (29.7604, -95.3698),
    "riverside dr": (29.7680, -95.3580),
    "park ave": (29.7520, -95.3750),
    "central high": (29.7710, -95.3820),
    "oak wood": (29.7450, -95.3620),
    "harbor blvd": (29.7820, -95.3410),
    "pine street": (29.7390, -95.3900),
    "elm street": (29.7650, -95.3510),
    "lakeview": (29.7890, -95.3670),
}

def parse_sos_text(text: str, api_key: str = None, parser_mode: str = "AUTO") -> dict:
    """
    Parses messy natural language SOS text into structured JSON data.
    - If parser_mode is "RULE_BASED", uses the rule-based heuristic engine without calling external APIs.
    - If parser_mode is "OPENAI" or "AUTO", attempts OpenAI API if key is available; otherwise uses intelligent NLP heuristics fallback.
    """
    effective_mode = (parser_mode or "AUTO").upper()
    effective_api_key = api_key or os.environ.get("OPENAI_API_KEY")
    
    if effective_mode != "RULE_BASED" and effective_api_key:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=effective_api_key)
            prompt = f"""
You are an emergency disaster response AI parsing real-time SOS requests.
Extract structured information from the following natural language request:

"{text}"

Return ONLY a valid JSON object with the following schema:
{{
  "urgency": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "category": "RESCUE" | "MEDICAL" | "FOOD_WATER" | "SHELTER" | "EVACUATION" | "OTHER",
  "items": ["list of specific items or assistance needed, e.g. insulin, drinking water, boat"],
  "address": "extracted street address, landmark, or location descriptor",
  "people_count": integer (estimated number of affected people, default 1),
  "contact_name": "name if mentioned or 'Anonymous'",
  "contact_phone": "phone number if mentioned or ''"
}}
"""
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            content = response.choices[0].message.content
            parsed = json.loads(content)
            
            # Enrich with geocoding
            coords = geocode_address(parsed.get("address", text))
            parsed["latitude"] = coords[0]
            parsed["longitude"] = coords[1]
            parsed["parsed_by"] = "OpenAI GPT-4o-mini"
            return parsed
        except Exception as e:
            logger.warning(f"OpenAI parsing failed or key invalid ({e}), falling back to NLP engine.")

    # Rule-Based Heuristic NLP Engine
    res = heuristic_nlp_parse(text)
    if effective_mode == "RULE_BASED":
        res["parsed_by"] = "Rule-Based Engine (Zero Keys)"
    return res

def heuristic_nlp_parse(text: str) -> dict:
    text_lower = text.lower()
    
    # 1. Determine Urgency
    critical_keywords = ["trapped", "drowning", "can't breathe", "bleeding", "insulin", "infant", "unconscious", "heart", "flood rising fast", "fire", "chest pain", "critical"]
    high_keywords = ["urgent", "elderly", "baby", "wheelchair", "medicine", "injured", "stuck", "evacuate", "sick", "astmatic", "disabled"]
    medium_keywords = ["food", "water", "diapers", "blanket", "charger", "flashlight", "battery", "supplies"]
    
    if any(k in text_lower for k in critical_keywords):
        urgency = "CRITICAL"
    elif any(k in text_lower for k in high_keywords):
        urgency = "HIGH"
    elif any(k in text_lower for k in medium_keywords):
        urgency = "MEDIUM"
    else:
        urgency = "LOW"

    # 2. Determine Category
    if any(k in text_lower for k in ["trapped", "boat", "roof", "drowning", "rescue", "rising water"]):
        category = "RESCUE"
    elif any(k in text_lower for k in ["medical", "insulin", "medicine", "injured", "doctor", "hospital", "asthma", "bandage"]):
        category = "MEDICAL"
    elif any(k in text_lower for k in ["food", "water", "drinking", "milk", "baby food", "bread", "ration"]):
        category = "FOOD_WATER"
    elif any(k in text_lower for k in ["shelter", "blanket", "dry", "tarp", "tent"]):
        category = "SHELTER"
    elif any(k in text_lower for k in ["evacuate", "transport", "ride", "car", "pickup"]):
        category = "EVACUATION"
    else:
        category = "OTHER"

    # 3. Extract Items Needed
    items = []
    item_catalog = [
        "drinking water", "baby food", "insulin", "first aid kit", "dry blankets", 
        "boat rescue", "wheelchair", "flashlight", "canned food", "diapers", 
        "asthma inhaler", "power bank", "warm clothes"
    ]
    for item in item_catalog:
        if item in text_lower or item.split()[0] in text_lower:
            items.append(item.title())
            
    if not items:
        if category == "FOOD_WATER":
            items = ["Emergency Rations", "Drinking Water"]
        elif category == "RESCUE":
            items = ["Rescue Boat / Team"]
        elif category == "MEDICAL":
            items = ["Medical Aid"]
        elif category == "SHELTER":
            items = ["Blankets", "Tarp"]
        else:
            items = ["General Emergency Assistance"]

    # 4. Extract Address / Location Clues
    address_match = re.search(r'\b(\d+\s+[\w\s]+(?:st|street|rd|road|ave|avenue|blvd|boulevard|dr|drive|ln|lane|ct|court))\b', text, re.IGNORECASE)
    landmark_match = re.search(r'\b(?:at|near|by|in)\s+([A-Z][a-z0-9\s]{3,30})', text)
    
    if address_match:
        address = address_match.group(1).title()
    elif landmark_match:
        address = f"Near {landmark_match.group(1).strip()}"
    else:
        # Fallback extract first capitalization or sentence phrase
        address = "Metro Disaster Zone (Sector 4)"

    # 5. Extract People Count
    count_match = re.search(r'\b(\d+)\s*(?:people|persons|adults|kids|children|family|elderly)\b', text_lower)
    people_count = int(count_match.group(1)) if count_match else 1
    if "family" in text_lower and people_count == 1:
        people_count = 4

    # 6. Extract Phone / Contact Name
    phone_match = re.search(r'\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b', text)
    contact_phone = phone_match.group(0) if phone_match else ""

    coords = geocode_address(address, text)

    return {
        "urgency": urgency,
        "category": category,
        "items": items,
        "address": address,
        "latitude": coords[0],
        "longitude": coords[1],
        "people_count": people_count,
        "contact_name": "Disaster Victim",
        "contact_phone": contact_phone,
        "parsed_by": "ResQ Heuristic Engine"
    }

def geocode_address(address: str, fallback_seed_text: str = "") -> tuple:
    """
    Translates address string into realistic map latitude/longitude coordinates within the active disaster zone.
    """
    address_lower = address.lower()
    for loc_key, coords in LOCATION_MAP.items():
        if loc_key in address_lower:
            # add small random variance so multiple pins at same street don't overlap completely
            return (
                coords[0] + (random.random() - 0.5) * 0.003,
                coords[1] + (random.random() - 0.5) * 0.003
            )
            
    # Deterministic coordinate hash based on address text string
    seed = sum(ord(c) for c in (address + fallback_seed_text))
    random.seed(seed)
    lat_offset = (random.random() - 0.5) * 0.06
    lng_offset = (random.random() - 0.5) * 0.06
    random.seed() # reset seed
    
    return (round(BASE_LAT + lat_offset, 5), round(BASE_LNG + lng_offset, 5))
