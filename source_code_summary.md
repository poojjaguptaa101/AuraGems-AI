# Source Code: AuraGems AI Jewellery Platform

This document contains a structured compilation of the core source code files for the AuraGems AI platform. You can click on the file headers to open the files directly in your editor.

---

## 🐍 Backend Service (Python & FastAPI)

### 1. [backend/main.py](file:///C:/Users/Pooja/.gemini/antigravity/scratch/jewellery-ecommerce/backend/main.py)
*FastAPI REST API routes and schemas.*
```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import uvicorn
from dotenv import load_dotenv

load_dotenv()

from products import PRODUCTS
import ai_engine

app = FastAPI(
    title="AuraGems AI Jewellery Platform",
    description="Backend services powering AI jewellery search, styling suggestions, gift finders, and chat support.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchRequest(BaseModel):
    query: str = Field(..., example="gold ring under 1000")

class StyleRecommendationRequest(BaseModel):
    skin_tone: str = Field(..., example="Warm")
    lifestyle: str = Field(..., example="daily-wear")
    gemstone_pref: str = Field(..., example="Diamond")
    statement_pref: str = Field(..., example="Minimalist")
    budget: float = Field(..., example=1500.0)

class GiftRecommendationRequest(BaseModel):
    recipient: str = Field(..., example="Partner")
    occasion: str = Field(..., example="Anniversary")
    budget_tier: str = Field(..., example="tier2")

class ChatMessage(BaseModel):
    role: str = Field(..., example="user")
    content: str = Field(..., example="What is your return policy?")

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

@app.get("/")
def read_root():
    return {"message": "Welcome to AuraGems AI Jewellery AI REST API. Access /docs for documentation."}

@app.get("/api/products")
def get_all_products(category: Optional[str] = None):
    if category:
        filtered = [p for p in PRODUCTS if p["category"].lower() == category.lower()]
        return filtered
    return PRODUCTS

@app.get("/api/products/{product_id}")
def get_product_by_id(product_id: int):
    for product in PRODUCTS:
        if product["id"] == product_id:
            suggestions = [p for p in PRODUCTS if p["id"] != product_id and (p["category"] != product["category"] or p["material"] == product["material"])][:3]
            return {
                "product": product,
                "complete_the_look": suggestions
            }
    raise HTTPException(status_code=404, detail="Product not found")

@app.post("/api/products/search")
def search_products(req: SearchRequest):
    try:
        results = ai_engine.smart_search(req.query)
        return {"query": req.query, "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/recommendations/style")
def recommend_style(req: StyleRecommendationRequest):
    try:
        recommendation = ai_engine.recommend_by_style(
            skin_tone=req.skin_tone,
            lifestyle=req.lifestyle,
            gemstone_pref=req.gemstone_pref,
            statement_pref=req.statement_pref,
            budget=req.budget
        )
        return recommendation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/recommendations/gift")
def recommend_gift(req: GiftRecommendationRequest):
    try:
        recommendation = ai_engine.find_gifts_and_write_note(
            recipient=req.recipient,
            occasion=req.occasion,
            budget_tier=req.budget_tier
        )
        return recommendation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
def chatbot_interaction(req: ChatRequest):
    try:
        msgs_dict = [{"role": msg.role, "content": msg.content} for msg in req.messages]
        response = ai_engine.get_chat_response(msgs_dict)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
```

### 2. [backend/ai_engine.py](file:///C:/Users/Pooja/.gemini/antigravity/scratch/jewellery-ecommerce/backend/ai_engine.py)
*The NLP search, Style set matcher, Gift note generator, and conversational chatbot logic.*
```python
import os
import re
import random
from typing import List, Dict, Any, Optional
from products import PRODUCTS

try:
    import google.generativeai as genai
    HAS_GEMINI = True
except ImportError:
    HAS_GEMINI = False

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if HAS_GEMINI and GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    HAS_GEMINI = False

# FEATURE 1: SMART NLP SEARCH
def smart_search(query: str) -> List[Dict[str, Any]]:
    if not query:
        return []
    
    query_lower = query.lower()
    
    price_limit = None
    price_matches = re.findall(r'(?:under|less than|below|budget|max|limit)?\s*[\$\£\€]?\s*(\d+)', query_lower)
    if price_matches:
        if any(term in query_lower for term in ["under", "less", "below", "max", "limit", "budget", "$"]):
            try:
                price_limit = float(price_matches[0])
            except ValueError:
                pass

    categories = []
    if "ring" in query_lower: categories.append("Rings")
    if "necklace" in query_lower or "choker" in query_lower or "pendant" in query_lower: categories.append("Necklaces")
    if "earring" in query_lower or "stud" in query_lower or "hoop" in query_lower: categories.append("Earrings")
    if "bracelet" in query_lower or "bangle" in query_lower or "strand" in query_lower: categories.append("Bracelets")
    
    materials = []
    if "gold" in query_lower:
        if "rose gold" in query_lower or "rose-gold" in query_lower: materials.append("Rose Gold")
        elif "white gold" in query_lower or "white-gold" in query_lower: materials.append("White Gold")
        elif "yellow gold" in query_lower or "yellow-gold" in query_lower: materials.append("Yellow Gold")
        else: materials.append("Gold")
    if "platinum" in query_lower: materials.append("Platinum")
    if "silver" in query_lower or "sterling" in query_lower: materials.append("Silver")

    gemstones = []
    for gem in ["diamond", "sapphire", "emerald", "pearl", "ruby", "moonstone"]:
        if gem in query_lower:
            gemstones.append(gem.capitalize())

    results = []
    for product in PRODUCTS:
        score = 0
        match_reasons = []
        
        if categories:
            if product["category"] in categories:
                score += 5
                match_reasons.append(f"Matches category '{product['category']}'")
            else:
                score -= 3
        
        if materials:
            matched_material = False
            for mat in materials:
                if mat == "Gold" and "Gold" in product["material"]:
                    score += 4
                    matched_material = True
                    match_reasons.append("Matches gold metal family")
                    break
                elif mat.lower() in product["material"].lower():
                    score += 5
                    matched_material = True
                    match_reasons.append(f"Matches metal '{product['material']}'")
                    break
            if not matched_material:
                score -= 1
        
        if gemstones:
            if product["gemstone"] in gemstones:
                score += 5
                match_reasons.append(f"Matches gemstone '{product['gemstone']}'")
            else:
                score -= 1
                
        if price_limit:
            if product["price"] <= price_limit:
                score += 4
                match_reasons.append(f"Within price limit (under ${price_limit:.0f})")
            else:
                if product["price"] > price_limit * 1.1:
                    continue
                else:
                    score -= 5
        
        matched_tags = [tag for tag in product["tags"] if tag in query_lower]
        if matched_tags:
            score += len(matched_tags) * 2
            match_reasons.append(f"Matches style keywords: {', '.join(matched_tags)}")

        text_match_count = 0
        for word in query_lower.split():
            if len(word) > 2 and word not in ["and", "the", "for", "with"]:
                if word in product["name"].lower():
                    score += 3
                    text_match_count += 1
                elif word in product["description"].lower():
                    score += 1
                    text_match_count += 1
        
        if text_match_count > 0:
            match_reasons.append(f"Keyword search matches name/description")

        if score > 0 or (not categories and not materials and not gemstones and not price_limit and text_match_count > 0):
            results.append({
                "product": product,
                "score": score,
                "ai_explanation": "AI Match Analysis: " + "; ".join(match_reasons) + "." if match_reasons else "Selected based on general keywords."
            })
            
    results.sort(key=lambda x: x["score"], reverse=True)
    return results

# FEATURE 2: STYLE PROFILE RECOMMENDER
def recommend_by_style(skin_tone: str, lifestyle: str, gemstone_pref: str, statement_pref: str, budget: float) -> Dict[str, Any]:
    preferred_metals = []
    if skin_tone.lower() == "warm":
        preferred_metals = ["18k Yellow Gold"]
    elif skin_tone.lower() == "cool":
        preferred_metals = ["Platinum", "Sterling Silver", "18k White Gold"]
    else:
        preferred_metals = ["18k Yellow Gold", "18k White Gold", "18k Rose Gold", "Platinum", "Sterling Silver"]
        
    budget_products = [p for p in PRODUCTS if p["price"] <= budget]
    if not budget_products:
        budget_products = PRODUCTS
        
    scored_products = []
    for product in budget_products:
        score = 0
        if any(m in product["material"] for m in preferred_metals):
            score += 4
        if gemstone_pref.lower() != "any":
            if product["gemstone"].lower() == gemstone_pref.lower() or (gemstone_pref.lower() == "none" and product["gemstone"] == "None"):
                score += 6
        if lifestyle.lower() == "daily-wear":
            if any(t in product["tags"] for t in ["daily-wear", "minimalist", "essential"]): score += 5
        elif lifestyle.lower() == "evening-wear":
            if any(t in product["tags"] for t in ["evening-wear", "statement", "luxury"]): score += 5
        elif lifestyle.lower() == "bold-trendy":
            if any(t in product["tags"] for t in ["bold", "modern", "unique"]): score += 5
                
        if statement_pref.lower() == "minimalist" and any(t in product["tags"] for t in ["minimalist", "essential", "studs"]): score += 5
        elif statement_pref.lower() == "bold" and any(t in product["tags"] for t in ["bold", "statement"]): score += 5
        elif statement_pref.lower() == "classic" and any(t in product["tags"] for t in ["classic", "traditional"]): score += 5
                
        scored_products.append((product, score))
        
    scored_products.sort(key=lambda x: x[1], reverse=True)
    rings = [p for p, s in scored_products if p["category"] == "Rings"]
    necklaces = [p for p, s in scored_products if p["category"] == "Necklaces"]
    others = [p for p, s in scored_products if p["category"] in ["Earrings", "Bracelets"]]
    
    selected_ring = rings[0] if rings else None
    selected_necklace = necklaces[0] if necklaces else None
    selected_other = others[0] if others else None
    
    set_items = [i for i in [selected_ring, selected_necklace, selected_other] if i]
    total_cost = sum(i["price"] for i in set_items)
    
    explanation = (
        f"AuraGems AI's Style Matchmaker has curated a personal jewellery wardrobe for you. "
        f"Since you have {skin_tone} skin undertones, we selected pieces highlighting "
        f"{'warm, radiant gold' if skin_tone.lower()=='warm' else 'crisp, glowing platinum and white metals' if skin_tone.lower()=='cool' else 'a harmonious mix of metals'}. "
        f"These items fit your {statement_pref} style preference and are tailored for a {lifestyle} lifestyle. "
        f"Together, this set creates a balanced, stunning look within your budget."
    )
    
    return {
        "recommended_set": set_items,
        "total_price": total_cost,
        "style_explanation": explanation
    }

# FEATURE 3: GIFT FINDER & NOTE GENERATOR
def find_gifts_and_write_note(recipient: str, occasion: str, budget_tier: str) -> Dict[str, Any]:
    min_p, max_p = 0, 99999
    if budget_tier == "tier1": max_p = 500
    elif budget_tier == "tier2": min_p, max_p = 500, 1000
    elif budget_tier == "tier3": min_p, max_p = 1000, 2000
        
    filtered = [p for p in PRODUCTS if min_p <= p["price"] <= max_p]
    if not filtered:
        filtered = sorted(PRODUCTS, key=lambda x: abs(x["price"] - (min_p + max_p)/2))[:3]
        
    scored = []
    for product in filtered:
        score = 0
        if occasion.lower() in product["tags"]: score += 5
        if recipient.lower() == "partner":
            if any(t in product["tags"] for t in ["engagement", "proposal", "anniversary"]): score += 5
            if product["category"] == "Rings": score += 3
        elif recipient.lower() == "mother" and any(t in product["tags"] for t in ["classic", "heirloom", "pearl"]): score += 5
        elif recipient.lower() in ["friend", "bridesmaid"]:
            if any(t in product["tags"] for t in ["affordable", "daily-wear", "stacking"]): score += 5
            if product["price"] > 1000: score -= 3
        scored.append((product, score))
        
    scored.sort(key=lambda x: x[1], reverse=True)
    top_3_gifts = [item[0] for item in scored[:3]]
    
    note_templates = {
        "anniversary": {
            "partner": "To my beloved Partner, another year of walking hand-in-hand, and my love for you has only grown deeper and brighter. This {gift_name} shines with the brilliance of our shared memories. Happy Anniversary.",
            "mother": "To my wonderful Mother, celebrating the beautiful legacy of love you and dad have built. May this {gift_name} serve as a token of my infinite gratitude. Happy Anniversary.",
        },
        "birthday": {
            "partner": "Happy Birthday to the one who makes my heart skip a beat. You bring joy and warmth into my life every single day. I hope this sparkling {gift_name} makes your day as beautiful as you are.",
            "mother": "Happy Birthday, Mom! Thank you for your warmth, wisdom, and unconditional love. May this exquisite {gift_name} remind you of how much you are cherished every time you wear it.",
            "friend": "Happy Birthday to my dearest friend! May your year ahead be filled with laughter, adventures, and beautiful sparkles. Wear this {gift_name} and remember our friendship always.",
        },
        "just_because": {
            "partner": "Just a little something to remind you that you are loved, appreciated, and thought of every single day. No occasion needed to celebrate you.",
            "mother": "Mom, just because you are always there for everyone else, I wanted to send a little sparkle just for you. Thank you for being my anchor."
        }
    }
    
    occ_key = occasion.lower().replace(" ", "_")
    rec_key = recipient.lower() if recipient.lower() in ["partner", "mother", "friend", "self"] else "friend"
    gift_name = top_3_gifts[0]["name"] if top_3_gifts else "exquisite piece"
    
    note = "To someone very special, wishing you joy, love, and a beautiful day. May this sparkling gift bring a smile to your face."
    if occ_key in note_templates and rec_key in note_templates[occ_key]:
        note = note_templates[occ_key][rec_key]
            
    note = note.format(gift_name=gift_name)
    return {"gifts": top_3_gifts, "gift_card_note": note}

# FEATURE 4: CHATBOT ASSISTANT
def get_chat_response(messages: List[Dict[str, str]]) -> str:
    user_query = messages[-1]["content"] if messages else ""
    
    if HAS_GEMINI:
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            system_prompt = (
                "You are AuraGems AI, the expert virtual jewellery stylist and customer assistant for 'AuraGems AI Jewellery'. "
                "You are warm, luxurious, highly knowledgeable, and helpful. "
                "Help the user find products, give styling advice, explain metal types, gemstone care, and handle FAQs. "
                "Here is our product catalogue for your reference:\n"
                f"{str(PRODUCTS)}\n\n"
                "Keep responses polite, luxury-oriented, and relatively concise. Format lists with bullet points. "
                "If referring to products, recommend specific items from our catalog by name with their price."
            )
            chat = model.start_chat(history=[
                {"role": "user", "parts": [system_prompt]},
                {"role": "model", "parts": ["Understood. I am AuraGems AI, your luxury jewellery stylist. How may I assist you today?"]}
            ])
            for msg in messages[:-1]:
                role = "user" if msg["role"] == "user" else "model"
                chat.send_message(msg["content"])
            response = chat.send_message(user_query)
            return response.text
        except Exception as e:
            pass

    query_lower = user_query.lower()
    if any(w in query_lower for w in ["size", "sizing", "measure", "ring size"]):
        return (
            "### Ring Sizing Guide\n\n"
            "Finding your perfect ring size is essential for comfort and style. Here are three simple methods to measure at home:\n\n"
            "1. **The Paper Strip Method**: Wrap a thin strip of paper around the base of your finger.\n"
            "2. **The Ring Check**: Take an existing, well-fitting ring and measure its internal diameter in millimeters.\n\n"
            "| Inside Diameter (mm) | US Ring Size | UK/AU Size |\n"
            "| :--- | :--- | :--- |\n"
            "| 16.5 mm | Size 6 | L ½ |\n"
            "| 17.3 mm | Size 7 | N ½ |\n"
            "| 18.1 mm | Size 8 | P ½ |\n\n"
            "*Need a custom size?* Contact our team at support@auragems_aijewellery.com."
        )
    elif any(w in query_lower for w in ["return", "exchange", "refund", "warranty"]):
        return (
            "### Returns & Warranty Policies\n\n"
            "At AuraGems AI, we want you to cherish your jewellery forever. We offer a **30-day complimentary return and exchange window** for all unworn items in their original packaging.\n\n"
            "- **Free Returns**: We provide pre-paid shipping labels.\n"
            "- **Exchanges**: Exchange for sizes within 30 days.\n"
            "- **Lifetime Warranty**: Platinum and Gold pieces include a lifetime warranty against manufacturing defects."
        )
    elif any(w in query_lower for w in ["clean", "care", "tarnish", "wash"]):
        return (
            "### Jewellery Care Tips\n\n"
            "- **Gold & Platinum**: Clean gently with a soft toothbrush in warm water and mild dish soap.\n"
            "- **Freshwater Pearls**: Wipe with a damp, soft cloth only. Never submerge in chemical cleaners.\n"
            "- **Emeralds**: Sensitive to thermal shock. Use lukewarm water, avoid steam cleaners."
        )
    elif any(w in query_lower for w in ["styling", "style", "wear", "match", "outfit"]):
        return (
            "### AuraGems AI Styling Consultation\n\n"
            "1. **Necklines & Necklaces**: V-Necks match drop pendants; high necklines coordinate with chokers.\n"
            "2. **Metals & Skin Tones**: Cool skin undertones glow in Platinum; warm undertones in Yellow Gold."
        )
    else:
        return (
            "Hello! I am **AuraGems AI**, your digital jewellery concierge. How can I help you sparkle today?\n\n"
            "You can ask me questions like:\n"
            "- *'How do I find my ring size?'*\n"
            "- *'What is your return policy?'*\n"
            "- *'Can you recommend a gold ring under $1000?'*"
        )
```

---

## ⚛️ Frontend Application (React & Vite)

### 3. [frontend/src/api.js](file:///C:/Users/Pooja/.gemini/antigravity/scratch/jewellery-ecommerce/frontend/src/api.js)
*Vite frontend API service layer featuring local browser-based fallback routines.*
```javascript
const API_BASE_URL = 'http://localhost:8000';

const LOCAL_PRODUCTS = [
  {
    id: 1,
    name: "Aurelia Diamond Solitaire Ring",
    category: "Rings",
    price: 1250,
    material: "18k Yellow Gold",
    gemstone: "Diamond",
    image_url: "/assets/products/ring_diamond.jpg",
    description: "An exquisite 18k yellow gold ring featuring a brilliant 1-carat round-cut diamond solitaire. Timeless, elegant, and designed to capture the light from every angle. Ideal for proposals, engagements, or celebrating major personal milestones.",
    specs: { weight: "3.5g", carats: "1.0 ct", dimensions: "Ring size 6 (resizable)", clarity: "VS1", color: "G/H" },
    tags: ["proposal", "engagement", "classic", "minimalist", "luxury", "anniversary", "gold"]
  },
  {
    id: 2,
    name: "Celestia Blue Sapphire Drop Earrings",
    category: "Earrings",
    price: 890,
    material: "Platinum",
    gemstone: "Sapphire",
    image_url: "/assets/products/earrings_sapphire.jpg",
    description: "These stunning drop earrings feature deep velvet-blue pear-cut sapphires encased in a halo of micropavé diamonds, suspended from platinum hoops. Perfect for adding a touch of regal elegance to evening wear.",
    specs: { weight: "5.2g", carats: "2.4 ct total sapphire weight", dimensions: "Length: 22mm", clarity: "Eye-clean", color: "Royal Blue" },
    tags: ["evening-wear", "regal", "statement", "gift", "wedding", "something-blue", "platinum"]
  },
  {
    id: 3,
    name: "Helios Gold Link Choker",
    category: "Necklaces",
    price: 620,
    material: "18k Yellow Gold",
    gemstone: "None",
    image_url: "/assets/products/necklace_gold_link.jpg",
    description: "A modern bold statement piece. This flat-lay herringbone chain sits perfectly at the collarbone, crafted in solid 18k yellow gold with a high-polish mirror finish. Designed for the confident woman who loves contemporary luxury.",
    specs: { weight: "8.4g", carats: "N/A", dimensions: "Length: 16 inches", clarity: "N/A", color: "Champagne Gold" },
    tags: ["bold", "modern", "choker", "minimalist", "daily-wear", "gold", "layering"]
  },
  {
    id: 6,
    name: "Rose Fleur Pearl Bracelet",
    category: "Bracelets",
    price: 480,
    material: "18k Rose Gold",
    gemstone: "Pearl",
    image_url: "/assets/products/bracelet_pearl.jpg",
    description: "A delicate rose gold chain adorned with five premium round freshwater pearls separated by delicate floral gold filigrees. A soft, feminine piece that embodies grace, romance, and vintage charm.",
    specs: { weight: "3.8g", carats: "N/A", dimensions: "Length: 6.5 - 7.5 inches adjustable", clarity: "AAA luster", color: "Soft Ivory / Pink Hue" },
    tags: ["pearl", "feminine", "rose-gold", "vintage", "daily-wear", "gift", "bridesmaid"]
  }
  // ... and other items.
];

async function postData(endpoint, data) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error(`Server returned error ${response.status}`);
  return response.json();
}

export async function getProducts(category = '') {
  try {
    const url = category ? `${API_BASE_URL}/api/products?category=${category}` : `${API_BASE_URL}/api/products`;
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (err) {
    if (category) return LOCAL_PRODUCTS.filter(p => p.category.toLowerCase() === category.toLowerCase());
    return LOCAL_PRODUCTS;
  }
}

export async function getProductById(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (err) {
    const product = LOCAL_PRODUCTS.find(p => p.id === parseInt(id));
    if (!product) return null;
    const suggestions = LOCAL_PRODUCTS.filter(p => p.id !== product.id && (p.category !== product.category || p.material === product.material)).slice(0, 3);
    return { product, complete_the_look: suggestions };
  }
}

export async function searchProducts(query) {
  try {
    return await postData('/api/products/search', { query });
  } catch (err) {
    const queryLower = query.toLowerCase();
    const categories = [];
    if (queryLower.includes("ring")) categories.push("Rings");
    if (queryLower.includes("necklace")) categories.push("Necklaces");
    if (queryLower.includes("earring")) categories.push("Earrings");
    if (queryLower.includes("bracelet")) categories.push("Bracelets");
    
    let priceLimit = null;
    const priceMatches = queryLower.match(/(?:under|less than|below|budget|max|limit)?\s*\$?\s*(\d+)/);
    if (priceMatches && (queryLower.includes("under") || queryLower.includes("$"))) {
      priceLimit = parseFloat(priceMatches[1]);
    }

    const results = [];
    LOCAL_PRODUCTS.forEach(product => {
      let score = 0;
      const matchReasons = [];

      if (categories.includes(product.category)) {
        score += 5;
        matchReasons.push(`Matches category '${product.category}'`);
      }
      if (priceLimit && product.price <= priceLimit) {
        score += 4;
        matchReasons.push(`Under budget limit`);
      }
      if (score > 0) {
        results.push({
          product,
          score,
          ai_explanation: "AI Match Analysis: " + matchReasons.join("; ") + "."
        });
      }
    });
    return { query, results };
  }
}

export async function getStyleRecommendations(skinTone, lifestyle, gemstonePref, statementPref, budget) {
  try {
    return await postData('/api/recommendations/style', {
      skin_tone: skinTone,
      lifestyle,
      gemstone_pref: gemstonePref,
      statement_pref: statementPref,
      budget: parseFloat(budget)
    });
  } catch (err) {
    const filtered = LOCAL_PRODUCTS.filter(p => p.price <= budget);
    const recommendedSet = filtered.slice(0, 3);
    const explanation = `AuraGems AI Style Matchmaker selected pieces highlighting complementary tones for your skin undertone.`;
    return { recommended_set: recommendedSet, total_price: budget, style_explanation: explanation };
  }
}

export async function getGiftRecommendations(recipient, occasion, budgetTier) {
  try {
    return await postData('/api/recommendations/gift', {
      recipient,
      occasion,
      budget_tier: budgetTier
    });
  } catch (err) {
    const topGifts = LOCAL_PRODUCTS.slice(0, 3);
    return { gifts: topGifts, gift_card_note: `Happy ${occasion}! May this beautiful gift bring a smile to your face.` };
  }
}

export async function sendChatMessage(messages) {
  try {
    return await postData('/api/chat', { messages });
  } catch (err) {
    const lastMsg = messages[messages.length - 1].content.toLowerCase();
    let responseText = "Hello! I am AuraGems AI, your personal jewellery concierge.";
    if (lastMsg.includes("size")) {
      responseText = "To find your ring size, wrap a paper strip around your finger, measure in mm, and match to size charts.";
    }
    return { response: responseText };
  }
}
```

### 4. [frontend/src/index.css](file:///C:/Users/Pooja/.gemini/antigravity/scratch/jewellery-ecommerce/frontend/src/index.css)
*Luxury CSS styling vars and dynamic animations.*
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');

:root {
  --font-serif: 'Playfair Display', Georgia, serif;
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  
  --bg-primary: #0a0a0c;
  --bg-secondary: #121216;
  --bg-tertiary: #1b1b22;
  --accent-gold: #d4af37;
  --accent-gold-hover: #e6c875;
  --accent-gold-muted: rgba(212, 175, 55, 0.15);
  --text-primary: #f5f5f7;
  --text-secondary: #a1a1aa;
  --border-color: rgba(255, 255, 255, 0.08);
  --border-gold: rgba(212, 175, 55, 0.25);
  --shadow-gold: 0 0 15px rgba(212, 175, 55, 0.2);
}

body {
  font-family: var(--font-sans);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
}

h1, h2, h3, h4 {
  font-family: var(--font-serif);
}

.glass-panel {
  background: rgba(18, 18, 22, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-color);
}

.gold-text {
  background: linear-gradient(135deg, #f7e7ce 0%, #d4af37 50%, #aa7c11 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.gold-btn {
  background: linear-gradient(135deg, #d4af37 0%, #aa7c11 100%);
  color: #0a0a0c;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
}

.gold-btn:hover {
  background: linear-gradient(135deg, #e6c875 0%, #c5a059 100%);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
```
