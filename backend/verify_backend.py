# Quick Validation Script for AuraGems AI AI Engine
import sys
from products import PRODUCTS
import ai_engine

def run_tests():
    print("=== STARTING BACKEND TEST SUITE ===")
    
    # 1. Test Products Database
    print(f"\n[Test 1] Loading Mock Products Database... ", end="")
    if len(PRODUCTS) == 12:
        print(f"PASSED! Loaded {len(PRODUCTS)} products.")
    else:
        print(f"FAILED! Expected 12 products, got {len(PRODUCTS)}")
        sys.exit(1)
        
    # 2. Test Smart NLP Search
    print("\n[Test 2] Smart NLP Search queries...")
    queries = [
        "gold ring under $1000",
        "emerald necklace",
        "affordable silver earrings"
    ]
    for q in queries:
        results = ai_engine.smart_search(q)
        print(f"  Query: '{q}' -> Found {len(results)} matches.")
        if results:
            best_match = results[0]["product"]
            print(f"    Best Match: {best_match['name']} (${best_match['price']})")
            print(f"    AI Explanation: {results[0]['ai_explanation']}")
        else:
            print("    Warning: No matches found.")
            
    # 3. Test Style Recommendation Quiz
    print("\n[Test 3] Style Profile Recommendation...")
    recs = ai_engine.recommend_by_style(
        skin_tone="Warm",
        lifestyle="evening-wear",
        gemstone_pref="Diamond",
        statement_pref="Bold",
        budget=2000.0
    )
    print(f"  Curated Set Items Count: {len(recs['recommended_set'])}")
    print(f"  Total Set Price: ${recs['total_price']}")
    print(f"  AI Style Explanation: {recs['style_explanation']}")
    if not recs['recommended_set']:
        print("  FAILED! Style recommendations are empty.")
        sys.exit(1)
        
    # 4. Test Gift Recommendation
    print("\n[Test 4] Gift Recommendation & Note Generation...")
    gift_res = ai_engine.find_gifts_and_write_note(
        recipient="Mother",
        occasion="Birthday",
        budget_tier="tier3"
    )
    print(f"  Recommended Gifts Count: {len(gift_res['gifts'])}")
    print(f"  AI Gift Card Note: '{gift_res['gift_card_note']}'")
    if not gift_res['gifts'] or not gift_res['gift_card_note']:
        print("  FAILED! Gift search or card note empty.")
        sys.exit(1)
        
    # 5. Test Chat Assistant (Local Fallback)
    print("\n[Test 5] Chat Assistant Sizing FAQ...")
    chat_reply = ai_engine.get_chat_response([
        {"role": "user", "content": "How do I find my ring size?"}
    ])
    print(f"  AuraGems AI Chat Reply Length: {len(chat_reply)} chars.")
    print(f"  AuraGems AI Reply Snippet:\n---\n{chat_reply[:180]}...\n---")
    if "Size" not in chat_reply:
        print("  FAILED! Sizing keywords not found in response.")
        sys.exit(1)

    print("\n=== ALL BACKEND TESTS COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    run_tests()
