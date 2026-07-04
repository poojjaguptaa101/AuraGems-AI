from fastapi import FastAPI, HTTPException, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import uvicorn
import time
from dotenv import load_dotenv

# Load environment variables (.env file)
load_dotenv()

from products import PRODUCTS
import ai_engine
import database
import pricing

app = FastAPI(
    title="AuraGems AI Jewellery AI Platform",
    description="Extended backend services with SQLite database, authentication, wishlist system, and live market pricing.",
    version="2.0.0"
)

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# DEVELOPER TELEMETRY STORAGE
# ==========================================
DEV_TELEMETRY = {
    "active_model": "Local Matcher Engine",
    "temperature": 0.2,
    "system_prompt": "You are AuraGems AI, the virtual jewellery stylist. Keep responses polite and concise.",
    "logs": []
}

# ==========================================
# AUTH MIDDLEWARE / HELPER
# ==========================================
def get_authenticated_user_id(authorization: Optional[str] = Header(None)) -> int:
    """Helper to parse Bearer token (simulated as user_id for client-only auth simplicity)."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    try:
        parts = authorization.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            user_id = int(parts[1])
            user = database.get_user_by_id(user_id)
            if user:
                return user_id
    except ValueError:
        pass
    raise HTTPException(status_code=401, detail="Invalid session token")

# ==========================================
# PYDANTIC SCHEMAS
# ==========================================
class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

class LoginRequest(BaseModel):
    username_or_email: str
    password: str

class WishlistRequest(BaseModel):
    product_id: int

class CartItemSchema(BaseModel):
    product_id: int
    quantity: int

class CartSyncRequest(BaseModel):
    items: List[CartItemSchema]

class SaveProfileRequest(BaseModel):
    skin_tone: str
    lifestyle: str
    gemstone_pref: str
    statement_pref: str
    budget: float

class DevConsoleConfigRequest(BaseModel):
    model: str
    temperature: float

class SearchRequest(BaseModel):
    query: str

class StyleRecommendationRequest(BaseModel):
    skin_tone: str
    lifestyle: str
    gemstone_pref: str
    statement_pref: str
    budget: float

class GiftRecommendationRequest(BaseModel):
    recipient: str
    occasion: str
    budget_tier: str

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

# ==========================================
# DYNAMIC PRICING INJECTION HELPERS
# ==========================================
def get_dynamically_priced_products() -> List[Dict[str, Any]]:
    """Injects live computed price structures into our baseline products array."""
    list_out = []
    for p in PRODUCTS:
        price_calc = pricing.calculate_product_price(p)
        p_copy = dict(p)
        p_copy["price"] = price_calc["live_price"]
        p_copy["pricing_breakdown"] = price_calc["breakdown"]
        list_out.append(p_copy)
    return list_out

def get_priced_product_by_id(product_id: int) -> Optional[Dict[str, Any]]:
    priced_list = get_dynamically_priced_products()
    for p in priced_list:
        if p["id"] == product_id:
            return p
    return None

# ==========================================
# AUTH ENDPOINTS
# ==========================================
@app.post("/api/auth/register")
def register(req: RegisterRequest):
    user_id = database.register_user(req.username, req.email, req.password)
    if not user_id:
        raise HTTPException(status_code=400, detail="Username or email already exists")
    
    # Return user profile and simulated bearer token
    return {
        "user": {"id": user_id, "username": req.username, "email": req.email},
        "token": f"Bearer {user_id}"
    }

@app.post("/api/auth/login")
def login(req: LoginRequest):
    user = database.authenticate_user(req.username_or_email, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username, email, or password")
    
    return {
        "user": user,
        "token": f"Bearer {user['id']}"
    }

@app.get("/api/auth/me")
def get_me(authorization: Optional[str] = Header(None)):
    user_id = get_authenticated_user_id(authorization)
    user = database.get_user_by_id(user_id)
    return {"user": user}

# ==========================================
# WISHLIST & CART ENDPOINTS
# ==========================================
@app.get("/api/wishlist")
def get_wishlist(authorization: Optional[str] = Header(None)):
    user_id = get_authenticated_user_id(authorization)
    wishlist_ids = database.get_wishlist_ids(user_id)
    # Return full product structures
    all_products = get_dynamically_priced_products()
    return [p for p in all_products if p["id"] in wishlist_ids]

@app.post("/api/wishlist/add")
def wishlist_add(req: WishlistRequest, authorization: Optional[str] = Header(None)):
    user_id = get_authenticated_user_id(authorization)
    success = database.add_to_wishlist(user_id, req.product_id)
    if not success:
        raise HTTPException(status_code=400, detail="Unable to add to wishlist")
    return {"message": "Product added to wishlist"}

@app.post("/api/wishlist/remove")
def wishlist_remove(req: WishlistRequest, authorization: Optional[str] = Header(None)):
    user_id = get_authenticated_user_id(authorization)
    success = database.remove_from_wishlist(user_id, req.product_id)
    if not success:
        raise HTTPException(status_code=400, detail="Unable to remove from wishlist")
    return {"message": "Product removed from wishlist"}

@app.post("/api/cart/sync")
def cart_sync(req: CartSyncRequest, authorization: Optional[str] = Header(None)):
    user_id = get_authenticated_user_id(authorization)
    items_list = [{"product_id": item.product_id, "quantity": item.quantity} for item in req.items]
    database.sync_cart(user_id, items_list)
    return {"message": "Cart synchronized successfully"}

@app.get("/api/cart")
def cart_get(authorization: Optional[str] = Header(None)):
    user_id = get_authenticated_user_id(authorization)
    items = database.get_cart_items(user_id)
    
    # Enrich cart items with product data
    all_products = get_dynamically_priced_products()
    enriched = []
    for item in items:
        prod = next((p for p in all_products if p["id"] == item["product_id"]), None)
        if prod:
            enriched.append({"product": prod, "quantity": item["quantity"]})
    return enriched

# ==========================================
# COMMODITY PRICES TICKER
# ==========================================
@app.get("/api/pricing/rates")
def get_bullion_rates():
    """Retrieve live trading commodity prices for Gold/Silver/Platinum."""
    return {
        "timestamp": time.time(),
        "rates": pricing.get_live_rates()
    }

# ==========================================
# DEVELOPER CONFIG PANEL
# ==========================================
@app.get("/api/dev/telemetry")
def get_telemetry():
    return DEV_TELEMETRY

@app.post("/api/dev/telemetry/config")
def update_telemetry_config(req: DevConsoleConfigRequest):
    global DEV_TELEMETRY
    DEV_TELEMETRY["active_model"] = req.model
    DEV_TELEMETRY["temperature"] = req.temperature
    # Toggle Gemini API active key checks
    if "Gemini" in req.model:
        ai_engine.HAS_GEMINI = bool(os.environ.get("GEMINI_API_KEY"))
    else:
        ai_engine.HAS_GEMINI = False
    return {"message": "Developer configurations updated"}

# ==========================================
# CORE CATALOGUE & AI ROUTERS (Updated with live prices)
# ==========================================
@app.get("/api/products")
def get_all_products(category: Optional[str] = None):
    priced_list = get_dynamically_priced_products()
    if category:
        filtered = [p for p in priced_list if p["category"].lower() == category.lower()]
        return filtered
    return priced_list

@app.get("/api/products/{product_id}")
def get_product_by_id(product_id: int):
    prod = get_priced_product_by_id(product_id)
    if prod:
        # Complete look recommendations
        all_priced = get_dynamically_priced_products()
        suggestions = [p for p in all_priced if p["id"] != product_id and (p["category"] != prod["category"] or p["material"] == prod["material"])][:3]
        return {
            "product": prod,
            "complete_the_look": suggestions
        }
    raise HTTPException(status_code=404, detail="Product not found")

@app.post("/api/products/search")
def search_products(req: SearchRequest):
    t0 = time.time()
    try:
        # Re-map backend products temporarily to use dynamic values in AI search
        all_priced = get_dynamically_priced_products()
        original_products = ai_engine.PRODUCTS
        ai_engine.PRODUCTS = all_priced # swap
        
        results = ai_engine.smart_search(req.query)
        
        # restore
        ai_engine.PRODUCTS = original_products
        
        latency = int((time.time() - t0) * 1000)
        
        # Log event in Telemetry
        log_entry = {
            "timestamp": time.strftime("%H:%M:%S"),
            "event": f"Smart Search: '{req.query}'",
            "latency_ms": latency,
            "prompt": f"System prompt searching database with query: {req.query}",
            "response": f"Found {len(results)} items."
        }
        DEV_TELEMETRY["logs"].insert(0, log_entry)
        
        return {"query": req.query, "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/recommendations/style")
def recommend_style(req: StyleRecommendationRequest, authorization: Optional[str] = Header(None)):
    t0 = time.time()
    try:
        # If logged in, save the style profile
        try:
            user_id = get_authenticated_user_id(authorization)
            database.save_style_profile(
                user_id, req.skin_tone, req.lifestyle, req.gemstone_pref, req.statement_pref, req.budget
            )
        except Exception:
            pass # ignore if guest user
            
        all_priced = get_dynamically_priced_products()
        original_products = ai_engine.PRODUCTS
        ai_engine.PRODUCTS = all_priced
        
        recommendation = ai_engine.recommend_by_style(
            skin_tone=req.skin_tone,
            lifestyle=req.lifestyle,
            gemstone_pref=req.gemstone_pref,
            statement_pref=req.statement_pref,
            budget=req.budget
        )
        
        ai_engine.PRODUCTS = original_products
        latency = int((time.time() - t0) * 1000)
        
        log_entry = {
            "timestamp": time.strftime("%H:%M:%S"),
            "event": f"Style Profile: {req.skin_tone} undertone, {req.lifestyle}",
            "latency_ms": latency,
            "prompt": f"Recommender request: Tone={req.skin_tone}, Gem={req.gemstone_pref}, Budget={req.budget}",
            "response": f"Curated set totaling ${recommendation['total_price']}"
        }
        DEV_TELEMETRY["logs"].insert(0, log_entry)
        
        return recommendation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/recommendations/gift")
def recommend_gift(req: GiftRecommendationRequest):
    t0 = time.time()
    try:
        all_priced = get_dynamically_priced_products()
        original_products = ai_engine.PRODUCTS
        ai_engine.PRODUCTS = all_priced
        
        recommendation = ai_engine.find_gifts_and_write_note(
            recipient=req.recipient,
            occasion=req.occasion,
            budget_tier=req.budget_tier
        )
        
        ai_engine.PRODUCTS = original_products
        latency = int((time.time() - t0) * 1000)
        
        log_entry = {
            "timestamp": time.strftime("%H:%M:%S"),
            "event": f"Gift Finder: {req.recipient} for {req.occasion}",
            "latency_ms": latency,
            "prompt": f"Gift match request: Recipient={req.recipient}, Occasion={req.occasion}, Tier={req.budget_tier}",
            "response": f"Selected {len(recommendation['gifts'])} options. Message length: {len(recommendation['gift_card_note'])} chars."
        }
        DEV_TELEMETRY["logs"].insert(0, log_entry)
        
        return recommendation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
def chatbot_interaction(req: ChatRequest):
    t0 = time.time()
    try:
        all_priced = get_dynamically_priced_products()
        original_products = ai_engine.PRODUCTS
        ai_engine.PRODUCTS = all_priced
        
        msgs_dict = [{"role": msg.role, "content": msg.content} for msg in req.messages]
        response = ai_engine.get_chat_response(msgs_dict)
        
        ai_engine.PRODUCTS = original_products
        latency = int((time.time() - t0) * 1000)
        
        log_entry = {
            "timestamp": time.strftime("%H:%M:%S"),
            "event": f"Conversational chat inquiry",
            "latency_ms": latency,
            "prompt": f"Dialogue history (last query: '{req.messages[-1].content}')",
            "response": f"{response[:100]}..."
        }
        DEV_TELEMETRY["logs"].insert(0, log_entry)
        
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    database.init_db()
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
