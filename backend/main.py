from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import uvicorn
from dotenv import load_dotenv

# Load environment variables (.env file)
load_dotenv()

from products import PRODUCTS
import ai_engine

app = FastAPI(
    title="AuraGems AI Jewellery AI Platform",
    description="Backend services powering AI jewellery search, styling suggestions, gift finders, and chat support.",
    version="1.0.0"
)

# CORS configurations to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend URL (e.g., http://localhost:5173)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# PYDANTIC SCHEMAS
# ==========================================

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
    budget_tier: str = Field(..., example="tier2")  # tier1, tier2, tier3, tier4

class ChatMessage(BaseModel):
    role: str = Field(..., example="user")  # 'user' or 'model'
    content: str = Field(..., example="What is your return policy?")

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

# ==========================================
# ENDPOINTS
# ==========================================

@app.get("/")
def read_root():
    return {"message": "Welcome to AuraGems AI Jewellery AI REST API. Access /docs for documentation."}

@app.get("/api/products")
def get_all_products(category: Optional[str] = None):
    """Retrieve all products in the catalogue. Can optionally filter by category."""
    if category:
        filtered = [p for p in PRODUCTS if p["category"].lower() == category.lower()]
        return filtered
    return PRODUCTS

@app.get("/api/products/{product_id}")
def get_product_by_id(product_id: int):
    """Retrieve detailed specifications for a specific product ID."""
    for product in PRODUCTS:
        if product["id"] == product_id:
            # Add matching suggestions to complete the look
            suggestions = [p for p in PRODUCTS if p["id"] != product_id and (p["category"] != product["category"] or p["material"] == product["material"])][:3]
            return {
                "product": product,
                "complete_the_look": suggestions
            }
    raise HTTPException(status_code=404, detail="Product not found")

@app.post("/api/products/search")
def search_products(req: SearchRequest):
    """Smart Natural Language search query parsing and products matching."""
    try:
        results = ai_engine.smart_search(req.query)
        return {"query": req.query, "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/recommendations/style")
def recommend_style(req: StyleRecommendationRequest):
    """Generates coordinate sets of jewellery based on skin tone and styling quiz responses."""
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
    """Finds perfect gifts based on occasion/recipient and generates custom note card."""
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
    """Conversational AI bot matching user styling questions or store FAQs."""
    try:
        # Convert Pydantic model to list of dicts for engine
        msgs_dict = [{"role": msg.role, "content": msg.content} for msg in req.messages]
        response = ai_engine.get_chat_response(msgs_dict)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
