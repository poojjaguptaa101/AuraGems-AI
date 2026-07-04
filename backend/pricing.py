import time
import random
import threading
import re
from typing import Dict, Any, List

# Live Commodity Rates per gram (Initial Baseline)
# Standard industry conversions (approx. $75/gram for 18k Yellow Gold, $35/gram for Platinum, $1/gram for Silver)
LIVE_RATES = {
    "18k Yellow Gold": 75.25,
    "18k White Gold": 76.80,
    "18k Rose Gold": 75.95,
    "Platinum": 35.40,
    "Sterling Silver": 0.95
}

# Gemstone Base Values
GEMSTONE_VALUES = {
    "Diamond": 950.00,
    "Sapphire": 520.00,
    "Emerald": 780.00,
    "Pearl": 240.00,
    "Ruby": 1100.00,
    "Moonstone": 120.00,
    "None": 0.00
}

# Craftsmanship fees based on category complexity
CRAFTSMANSHIP_FEES = {
    "Rings": 180.00,
    "Necklaces": 250.00,
    "Earrings": 200.00,
    "Bracelets": 220.00
}

# Lock for thread safety
rates_lock = threading.Lock()

def simulate_market_fluctuations():
    """Runs in a background thread to slightly fluctuate metal prices every 30 seconds."""
    global LIVE_RATES
    while True:
        time.sleep(30)
        with rates_lock:
            for metal in LIVE_RATES:
                # Fluctuate by -0.4% to +0.4%
                fluctuation = random.uniform(-0.004, 0.004)
                LIVE_RATES[metal] = round(LIVE_RATES[metal] * (1 + fluctuation), 2)
                # Keep silver bounds realistic
                if LIVE_RATES[metal] < 0.2:
                    LIVE_RATES[metal] = 0.5

# Start background pricing thread automatically on import
ticker_thread = threading.Thread(target=simulate_market_fluctuations, daemon=True)
ticker_thread.start()

def get_live_rates() -> Dict[str, float]:
    with rates_lock:
        return dict(LIVE_RATES)

def parse_weight(weight_str: str) -> float:
    """Extracts numeric weight from strings like '3.5g' or '12.1g'."""
    try:
        match = re.search(r"([0-9.]+)", weight_str)
        if match:
            return float(match.group(1))
    except ValueError:
        pass
    return 3.0 # Default fallback weight if parsing fails

def calculate_product_price(product: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes dynamic pricing components:
    Price = (Metal Weight * Live Rate) + Gemstone Appraisal + Craftsmanship
    """
    rates = get_live_rates()
    
    # 1. Resolve Metal Rate
    metal_family = "Sterling Silver"
    for metal in rates:
        if metal.lower() in product["material"].lower():
            metal_family = metal
            break
            
    live_metal_rate = rates.get(metal_family, 0.95)
    weight = parse_weight(product["specs"]["weight"])
    metal_cost = round(weight * live_metal_rate, 2)
    
    # 2. Gemstone appraisal value
    gem_value = GEMSTONE_VALUES.get(product["gemstone"], 0.0)
    
    # Scale gemstone value based on carats spec if applicable
    carats_str = product["specs"].get("carats", "N/A")
    carat_match = re.search(r"([0-9.]+)", carats_str)
    if carat_match and product["gemstone"] != "None":
        carat_weight = float(carat_match.group(1))
        # Simple scaling
        gem_value = round(gem_value * carat_weight, 2)
        
    # 3. Craftsmanship Fee
    craft_fee = CRAFTSMANSHIP_FEES.get(product["category"], 150.00)
    
    # 4. Total Dynamic Price
    total_price = int(metal_cost + gem_value + craft_fee)
    
    return {
        "id": product["id"],
        "live_price": total_price,
        "breakdown": {
            "metal_weight": f"{weight}g",
            "metal_rate_per_g": f"${live_metal_rate:.2f}",
            "metal_cost": metal_cost,
            "gemstone_appraisal": gem_value,
            "craftsmanship_fee": craft_fee,
            "total": total_price
        }
    }
