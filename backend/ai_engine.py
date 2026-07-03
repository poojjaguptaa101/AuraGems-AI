import os
import re
import random
from typing import List, Dict, Any, Optional
from products import PRODUCTS

# Try to import google-generativeai for LLM integration
try:
    import google.generativeai as genai
    HAS_GEMINI = True
except ImportError:
    HAS_GEMINI = False

# Helper: Load API Key from environment or .env
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if HAS_GEMINI and GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    HAS_GEMINI = False  # Set to False if no key is provided, falling back to local NLP engine

# ==========================================
# FEATURE 1: SMART NLP SEARCH
# ==========================================
def smart_search(query: str) -> List[Dict[str, Any]]:
    if not query:
        return []
    
    query_lower = query.lower()
    
    # Extract price limit (e.g., "under 1000", "less than $500", "budget 800")
    price_limit = None
    price_matches = re.findall(r'(?:under|less than|below|budget|max|limit)?\s*[\$\£\€]?\s*(\d+)', query_lower)
    if price_matches:
        # Check if the query indicates a price threshold
        if any(term in query_lower for term in ["under", "less", "below", "max", "limit", "budget", "$"]):
            try:
                # Get the last number found, or look for specific indicator
                price_limit = float(price_matches[0])
            except ValueError:
                pass

    # Extract category keywords
    categories = []
    if "ring" in query_lower: categories.append("Rings")
    if "necklace" in query_lower or "choker" in query_lower or "pendant" in query_lower: categories.append("Necklaces")
    if "earring" in query_lower or "stud" in query_lower or "hoop" in query_lower: categories.append("Earrings")
    if "bracelet" in query_lower or "bangle" in query_lower or "strand" in query_lower: categories.append("Bracelets")
    
    # Extract material keywords
    materials = []
    if "gold" in query_lower:
        if "rose gold" in query_lower or "rose-gold" in query_lower:
            materials.append("Rose Gold")
        elif "white gold" in query_lower or "white-gold" in query_lower:
            materials.append("White Gold")
        elif "yellow gold" in query_lower or "yellow-gold" in query_lower:
            materials.append("Yellow Gold")
        else:
            materials.append("Gold") # General gold match
    if "platinum" in query_lower: materials.append("Platinum")
    if "silver" in query_lower or "sterling" in query_lower: materials.append("Silver")

    # Extract gemstone keywords
    gemstones = []
    if "diamond" in query_lower: gemstones.append("Diamond")
    if "sapphire" in query_lower: gemstones.append("Sapphire")
    if "emerald" in query_lower: gemstones.append("Emerald")
    if "pearl" in query_lower: gemstones.append("Pearl")
    if "ruby" in query_lower: gemstones.append("Ruby")
    if "moonstone" in query_lower: gemstones.append("Moonstone")
    if "no stone" in query_lower or "plain" in query_lower or "no gemstone" in query_lower: gemstones.append("None")

    # Extract style / occasion keywords
    style_tags = []
    for tag in ["proposal", "engagement", "classic", "minimalist", "luxury", "anniversary", "evening-wear", "regal", "statement", "gift", "wedding", "something-blue", "bold", "modern", "choker", "daily-wear", "layering", "feminine", "vintage", "bridesmaid", "hoops", "essential", "boho", "celestial", "affordable", "mystical", "studs", "purple", "stacking", "unique", "bridal", "heirloom", "traditional"]:
        if tag in query_lower or tag.replace("-", " ") in query_lower:
            style_tags.append(tag)

    results = []
    
    for product in PRODUCTS:
        score = 0
        match_reasons = []
        
        # Category Match
        if categories:
            if product["category"] in categories:
                score += 5
                match_reasons.append(f"Matches category '{product['category']}'")
            else:
                # Deduct score if category is specified but doesn't match
                score -= 3
        
        # Material Match
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
        
        # Gemstone Match
        if gemstones:
            if product["gemstone"] in gemstones:
                score += 5
                match_reasons.append(f"Matches gemstone '{product['gemstone']}'")
            else:
                score -= 1
                
        # Price Match
        if price_limit:
            if product["price"] <= price_limit:
                score += 4
                match_reasons.append(f"Within price limit (under ${price_limit:.0f})")
            else:
                # Hard filter: exclude if it exceeds price limit by more than 10%
                if product["price"] > price_limit * 1.1:
                    continue
                else:
                    score -= 5
        
        # Style Tag Match
        matched_tags = []
        for tag in style_tags:
            if tag in product["tags"] or tag in product["description"].lower() or tag in product["name"].lower():
                score += 2
                matched_tags.append(tag)
        if matched_tags:
            match_reasons.append(f"Matches style keywords: {', '.join(matched_tags)}")

        # General Text Search (fallback boost)
        text_match_count = 0
        words = query_lower.split()
        for word in words:
            if len(word) > 2 and word not in ["and", "the", "for", "with", "that"]:
                if word in product["name"].lower():
                    score += 3
                    text_match_count += 1
                elif word in product["description"].lower():
                    score += 1
                    text_match_count += 1
        
        if text_match_count > 0:
            match_reasons.append(f"Keyword search matches name/description")

        # Threshold to include
        if score > 0 or (not categories and not materials and not gemstones and not price_limit and text_match_count > 0):
            # Formulate AI Explanation
            explanation = ""
            if match_reasons:
                explanation = "AI Match Analysis: " + "; ".join(match_reasons) + "."
            else:
                explanation = "Selected based on matching keywords in description."
                
            results.append({
                "product": product,
                "score": score,
                "ai_explanation": explanation
            })
            
    # Sort results by score descending
    results.sort(key=lambda x: x["score"], reverse=True)
    return results

# ==========================================
# FEATURE 2: STYLE PROFILE RECOMMENDER
# ==========================================
def recommend_by_style(skin_tone: str, lifestyle: str, gemstone_pref: str, statement_pref: str, budget: float) -> Dict[str, Any]:
    # Skin tone mapping to metal
    # Warm -> Yellow Gold
    # Cool -> Platinum, Silver, White Gold
    # Neutral -> Rose Gold, Gold, Platinum
    preferred_metals = []
    if skin_tone.lower() == "warm":
        preferred_metals = ["18k Yellow Gold"]
    elif skin_tone.lower() == "cool":
        preferred_metals = ["Platinum", "Sterling Silver", "18k White Gold"]
    else:
        preferred_metals = ["18k Yellow Gold", "18k White Gold", "18k Rose Gold", "Platinum", "Sterling Silver"]
        
    # Filter products within budget
    budget_products = [p for p in PRODUCTS if p["price"] <= budget]
    if not budget_products:
        budget_products = PRODUCTS # Fallback if budget is too low
        
    # Score products based on preference alignment
    scored_products = []
    for product in budget_products:
        score = 0
        
        # Metal match
        if any(m in product["material"] for m in preferred_metals):
            score += 4
            
        # Gemstone preference
        if gemstone_pref.lower() != "any":
            if product["gemstone"].lower() == gemstone_pref.lower():
                score += 6
            elif gemstone_pref.lower() == "none" and product["gemstone"] == "None":
                score += 6
                
        # Statement / Lifestyle matching
        if lifestyle.lower() == "daily-wear":
            if "daily-wear" in product["tags"] or "minimalist" in product["tags"] or "essential" in product["tags"]:
                score += 5
            if product["price"] > 1000: # daily wear usually less pricey
                score -= 2
        elif lifestyle.lower() == "evening-wear":
            if "evening-wear" in product["tags"] or "statement" in product["tags"] or "luxury" in product["tags"]:
                score += 5
        elif lifestyle.lower() == "bold-trendy":
            if "bold" in product["tags"] or "modern" in product["tags"] or "unique" in product["tags"]:
                score += 5
                
        if statement_pref.lower() == "minimalist":
            if "minimalist" in product["tags"] or "essential" in product["tags"] or "studs" in product["tags"]:
                score += 5
        elif statement_pref.lower() == "bold":
            if "bold" in product["tags"] or "statement" in product["tags"]:
                score += 5
        elif statement_pref.lower() == "classic":
            if "classic" in product["tags"] or "traditional" in product["tags"] or "heirloom" in product["tags"]:
                score += 5
                
        scored_products.append((product, score))
        
    scored_products.sort(key=lambda x: x[1], reverse=True)
    
    # Try to form a coordinate set: 1 Ring, 1 Necklace, and 1 Earring/Bracelet
    rings = [p for p, s in scored_products if p["category"] == "Rings"]
    necklaces = [p for p, s in scored_products if p["category"] == "Necklaces"]
    others = [p for p, s in scored_products if p["category"] in ["Earrings", "Bracelets"]]
    
    # Select best in each category
    selected_ring = rings[0] if rings else None
    selected_necklace = necklaces[0] if necklaces else None
    selected_other = others[0] if others else None
    
    set_items = []
    total_cost = 0
    if selected_ring:
        set_items.append(selected_ring)
        total_cost += selected_ring["price"]
    if selected_necklace:
        set_items.append(selected_necklace)
        total_cost += selected_necklace["price"]
    if selected_other:
        set_items.append(selected_other)
        total_cost += selected_other["price"]
        
    # Generate custom explanation
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

# ==========================================
# FEATURE 3: GIFT FINDER & NOTE GENERATOR
# ==========================================
def find_gifts_and_write_note(recipient: str, occasion: str, budget_tier: str) -> Dict[str, Any]:
    # Budget tiers
    # tier1: < $500
    # tier2: $500 - $1000
    # tier3: $1000 - $2000
    # tier4: Unlimited / All
    min_p, max_p = 0, 99999
    if budget_tier == "tier1":
        max_p = 500
    elif budget_tier == "tier2":
        min_p, max_p = 500, 1000
    elif budget_tier == "tier3":
        min_p, max_p = 1000, 2000
    elif budget_tier == "tier4":
        min_p = 0
        
    filtered = [p for p in PRODUCTS if min_p <= p["price"] <= max_p]
    if not filtered:
        # Fallback to nearest products
        filtered = sorted(PRODUCTS, key=lambda x: abs(x["price"] - (min_p + max_p)/2))[:3]
        
    # Recipient preference matching
    scored = []
    for product in filtered:
        score = 0
        
        # Occasion tags
        if occasion.lower() in product["tags"]:
            score += 5
            
        # Target recipient heuristics
        if recipient.lower() == "partner":
            if "engagement" in product["tags"] or "proposal" in product["tags"] or "anniversary" in product["tags"]:
                score += 5
            if product["category"] == "Rings":
                score += 3
        elif recipient.lower() == "mother":
            if "classic" in product["tags"] or "heirloom" in product["tags"] or "pearl" in product["tags"]:
                score += 5
        elif recipient.lower() == "friend" or recipient.lower() == "bridesmaid":
            if "affordable" in product["tags"] or "daily-wear" in product["tags"] or "stacking" in product["tags"]:
                score += 5
            if product["price"] > 1000:
                score -= 3 # usually friends get slightly more modest gifts
        elif recipient.lower() == "self":
            if "daily-wear" in product["tags"] or "modern" in product["tags"]:
                score += 3
                
        scored.append((product, score))
        
    scored.sort(key=lambda x: x[1], reverse=True)
    top_3_gifts = [item[0] for item in scored[:3]]
    
    # AI Note Generator (Local)
    note_templates = {
        "anniversary": {
            "partner": "To my beloved Partner, another year of walking hand-in-hand, and my love for you has only grown deeper and brighter. This {gift_name} shines with the brilliance of our shared memories. Happy Anniversary.",
            "mother": "To my wonderful Mother, celebrating the beautiful legacy of love you and dad have built. May this {gift_name} serve as a token of my infinite gratitude. Happy Anniversary.",
            "self": "Celebrating personal growth, resilience, and a year of achievements. A beautiful {gift_name} to mark this milestone. Cheers to self-love!"
        },
        "birthday": {
            "partner": "Happy Birthday to the one who makes my heart skip a beat. You bring joy and warmth into my life every single day. I hope this sparkling {gift_name} makes your day as beautiful as you are.",
            "mother": "Happy Birthday, Mom! Thank you for your warmth, wisdom, and unconditional love. May this exquisite {gift_name} remind you of how much you are cherished every time you wear it.",
            "friend": "Happy Birthday to my dearest friend! May your year ahead be filled with laughter, adventures, and beautiful sparkles. Wear this {gift_name} and remember our friendship always.",
            "self": "Happy Birthday to me! Another year wiser, bolder, and ready to shine. Adorning myself with this gorgeous {gift_name} to celebrate my day."
        },
        "wedding": {
            "partner": "To my beautiful bride/groom, on our wedding day. Today, our lives become one. Let this {gift_name} be a physical token of my vow to love, honor, and cherish you for all eternity.",
            "mother": "Mom, on this special wedding milestone, thank you for guiding me to this beautiful moment. Wearing your blessings and this lovely {gift_name} close to my heart.",
            "friend": "Wishing you both a lifetime of love, laughter, and happily ever afters! So thrilled to stand by your side. May this {gift_name} add a touch of sparkle to your special journey.",
        },
        "graduation": {
            "partner": "Congratulations on this incredible achievement! I am so proud of your hard work and brilliance. May this {gift_name} inspire you as you step into your bright future.",
            "mother": "To my mom, who supported me through every late night and exam. This graduation is as much yours as it is mine. Thank you for everything. Wear this {gift_name} with pride.",
            "friend": "You did it! Cheers to the late nights, endless coffee, and now, a shiny diploma. This {gift_name} is to remind you that you can achieve anything you set your mind to.",
            "self": "Graduated! Hard work pays off, and now it is time to step out into the world. Treating myself to this {gift_name} as a symbol of my dedication and success."
        },
        "just_because": {
            "partner": "Just a little something to remind you that you are loved, appreciated, and thought of every single day. No occasion needed to celebrate you.",
            "mother": "Mom, just because you are always there for everyone else, I wanted to send a little sparkle just for you. Thank you for being my anchor.",
            "friend": "Thinking of you and sending good vibes! Just because you are an amazing friend who deserves a bit of joy. Hope you love this {gift_name}!",
            "self": "Because self-care is not selfish, and sometimes a little sparkle is exactly what the soul needs. Treating myself just because I deserve it."
        }
    }
    
    # Resolve the template
    occ_key = occasion.lower().replace(" ", "_")
    rec_key = recipient.lower() if recipient.lower() in ["partner", "mother", "friend", "self"] else "friend"
    
    gift_name = top_3_gifts[0]["name"] if top_3_gifts else "exquisite piece"
    
    # Fetch template
    note = "To someone very special, wishing you joy, love, and a beautiful day. May this sparkling gift bring a smile to your face."
    if occ_key in note_templates:
        if rec_key in note_templates[occ_key]:
            note = note_templates[occ_key][rec_key]
        elif "friend" in note_templates[occ_key]:
            note = note_templates[occ_key]["friend"]
            
    note = note.format(gift_name=gift_name)
    
    return {
        "gifts": top_3_gifts,
        "gift_card_note": note
    }

# ==========================================
# FEATURE 4: AURAGEMS AI CHAT ASSISTANT
# ==========================================
def get_chat_response(messages: List[Dict[str, str]]) -> str:
    """
    Processes chat conversations.
    If a GEMINI_API_KEY is available, we query the live Gemini model.
    Otherwise, we use our local rule-matching/intent-categorization engine.
    """
    user_query = messages[-1]["content"] if messages else ""
    
    # 1. LIVE GEMINI PATH (if configured)
    if HAS_GEMINI:
        try:
            # Build history for Gemini
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
            
            # Format history for Gemini API
            chat = model.start_chat(history=[
                {"role": "user", "parts": [system_prompt]},
                {"role": "model", "parts": ["Understood. I am AuraGems AI, your luxury jewellery stylist. How may I assist you today?"]}
            ])
            
            # Append other message history if any
            for msg in messages[:-1]:
                role = "user" if msg["role"] == "user" else "model"
                chat.send_message(msg["content"])
                
            response = chat.send_message(user_query)
            return response.text
        except Exception as e:
            # Fallback to local if API call fails
            print(f"Gemini API Error, falling back to local: {e}")
            pass

    # 2. LOCAL NLP & RULE-BASED MATCHING ENGINE (Robust fallback)
    query_lower = user_query.lower()
    
    # Intent: Sizing
    if any(w in query_lower for w in ["size", "sizing", "measure", "ring size"]):
        return (
            "### Ring Sizing Guide\n\n"
            "Finding your perfect ring size is essential for comfort and style. Here are three simple methods to measure at home:\n\n"
            "1. **The Paper Strip Method**: Wrap a thin strip of paper around the base of your finger. Mark where the paper overlaps, measure the length in millimeters with a ruler, and match it to our size chart.\n"
            "2. **The Ring Check**: Take an existing, well-fitting ring and measure its internal diameter in millimeters.\n\n"
            "| Inside Diameter (mm) | US Ring Size | UK/AU Size |\n"
            "| :--- | :--- | :--- |\n"
            "| 16.5 mm | Size 6 | L ½ |\n"
            "| 17.3 mm | Size 7 | N ½ |\n"
            "| 18.1 mm | Size 8 | P ½ |\n"
            "| 19.0 mm | Size 9 | R ½ |\n\n"
            "*Need a custom size?* Contact our team at support@auragems_aijewellery.com, and we can handcraft half-sizes for most designs."
        )
        
    # Intent: Returns / Exchanges
    elif any(w in query_lower for w in ["return", "exchange", "refund", "guarantee", "warranty"]):
        return (
            "### Returns & Warranty Policies\n\n"
            "At AuraGems AI, we want you to cherish your jewellery forever. We offer a **30-day complimentary return and exchange window** for all unworn items in their original packaging.\n\n"
            "- **Free Returns**: We provide pre-paid shipping labels for all domestic returns.\n"
            "- **Exchanges**: You can exchange any ring for a different size within 30 days of purchase.\n"
            "- **Lifetime Warranty**: All our premium pieces (18k Gold, Platinum) come with a lifetime warranty against manufacturing defects, including complimentary stone tightening and professional cleaning once a year.\n\n"
            "*Please note:* Custom engraved pieces and bespoke orders are final sale."
        )
        
    # Intent: Care & Maintenance
    elif any(w in query_lower for w in ["clean", "care", "tarnish", "wash", "maintain"]):
        return (
            "### Jewellery Care Tips\n\n"
            "To keep your precious pieces sparkling for generations, follow these care guidelines:\n\n"
            "- **Gold & Platinum**: Clean gently with a soft toothbrush in warm water and mild dish soap. Dry thoroughly with a lint-free cloth.\n"
            "- **Freshwater Pearls**: Pearls are organic and delicate. Put them on *after* applying perfume and makeup. Clean by wiping with a damp, soft cloth only. Never submerge in chemical cleaners.\n"
            "- **Emeralds & Gemstones**: Emeralds are natural stones that can be sensitive to thermal shock. Avoid hot steam or ultrasonic cleaners. Use lukewarm water.\n"
            "- **Storage**: Store each piece separately in a soft pouch or lined jewellery box compartment to prevent scratches."
        )
        
    # Intent: Product category matching
    elif any(w in query_lower for w in ["ring", "rings"]):
        rings = [p for p in PRODUCTS if p["category"] == "Rings"]
        ring_list = "\n".join([f"- **{r['name']}** (${r['price']}): {r['description'][:100]}..." for r in rings])
        return (
            "We have a stunning selection of rings in our collection! Here are a few curated choices:\n\n"
            f"{ring_list}\n\n"
            "Would you like me to help you filter by metal type (Gold/Silver/Platinum) or find a specific ring for an engagement?"
        )
        
    elif any(w in query_lower for w in ["necklace", "necklaces", "choker", "pendant"]):
        necklaces = [p for p in PRODUCTS if p["category"] == "Necklaces"]
        neck_list = "\n".join([f"- **{n['name']}** (${n['price']}): {n['description'][:100]}..." for n in necklaces])
        return (
            "Our necklaces range from elegant everyday chains to breathtaking focal pendants:\n\n"
            f"{neck_list}\n\n"
            "Are you looking for a statement piece or something delicate for layering?"
        )
        
    elif any(w in query_lower for w in ["earring", "earrings", "studs"]):
        earrings = [p for p in PRODUCTS if p["category"] == "Earrings"]
        ear_list = "\n".join([f"- **{e['name']}** (${e['price']}): {e['description'][:100]}..." for e in earrings])
        return (
            "Adorn your ears with our premium studs and drop earrings:\n\n"
            f"{ear_list}\n\n"
            "I can recommend the perfect studs for daily wear or elegant drops for a wedding!"
        )

    # Intent: Styling Advice
    elif any(w in query_lower for w in ["styling", "style", "wear", "match", "outfit", "dress"]):
        return (
            "### AuraGems AI Styling Consultation\n\n"
            "As your personal stylist, here are a few rules of thumb for pairing jewellery:\n\n"
            "1. **Necklines & Necklaces**:\n"
            "   - **V-Necks** pair beautifully with drop pendants like our *Lumière Emerald Halo Pendant* ($1,420).\n"
            "   - **Crew Necks and Off-the-Shoulder** tops are ideal for collarbone chokers, like our *Helios Gold Link Choker* ($620).\n"
            "2. **Metals & Skin Tones**:\n"
            "   - Cool skin undertones (blue/purple veins) glow in **Platinum** or **Sterling Silver**.\n"
            "   - Warm skin undertones (greenish veins) are ilauragems_aited by **18k Yellow Gold**.\n"
            "3. **Day to Night Transition**:\n"
            "   - Pair simple *Solaria Gold Hoops* ($310) with a blazer during the day, then swap them for the *Celestia Sapphire Drop Earrings* ($890) for instant night-time glamour."
        )

    # Generic Fallback
    else:
        return (
            "Hello! I am **AuraGems AI**, your digital jewellery concierge. How can I help you sparkle today?\n\n"
            "You can ask me questions like:\n"
            "- *'How do I find my ring size?'*\n"
            "- *'What is your return policy?'*\n"
            "- *'Can you recommend a gold ring under $1000?'*\n"
            "- *'How should I clean my emerald pendant?'*\n\n"
            "You can also use our **AI Assistant** tab to build a customized style profile or search our collections using natural language!"
        )
