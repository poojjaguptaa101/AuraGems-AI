# Expanded Validation Script for AuraGems AI Full-Stack Engine
import sys
import os
import sqlite3
from products import PRODUCTS
import ai_engine
import database
import pricing

def run_tests():
    print("=== STARTING AURAGEMS AI FULL-STACK TEST SUITE ===")
    
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
            
    # 3. Test SQLite Database Initialization & Auth
    print("\n[Test 3] SQLite Database & User Authentication...")
    # Initialize DB
    database.init_db()
    if not os.path.exists(database.DATABASE_PATH):
        print(f"  FAILED! database file '{database.DATABASE_PATH}' not found.")
        sys.exit(1)
    print("  PASSED! SQLite database created.")
    
    # Test registration (with random username to prevent integrity unique errors on re-run)
    import random
    rand_id = random.randint(1000, 9999)
    test_user = f"test_user_{rand_id}"
    test_email = f"test_{rand_id}@example.com"
    test_pass = "secure_password_123"
    
    user_id = database.register_user(test_user, test_email, test_pass)
    if user_id:
        print(f"  PASSED! User registered with ID {user_id}.")
    else:
        print("  FAILED! User registration integrity error.")
        sys.exit(1)
        
    # Test Authentication
    auth_profile = database.authenticate_user(test_user, test_pass)
    if auth_profile and auth_profile["username"] == test_user:
        print("  PASSED! Authentication success with username.")
    else:
        print("  FAILED! Authentication rejected valid credentials.")
        sys.exit(1)

    # 4. Test Wishlist & Cart Sync
    print("\n[Test 4] Wishlist and Cart DB Sync operations...")
    # Add to wishlist
    database.add_to_wishlist(user_id, 3) # Helios Gold Link Choker
    database.add_to_wishlist(user_id, 5) # Lumière Emerald Halo Pendant
    favs = database.get_wishlist_ids(user_id)
    print(f"  Wishlist product IDs retrieved: {favs}")
    if 3 in favs and 5 in favs:
        print("  PASSED! Wishlist add and fetch works.")
    else:
        print("  FAILED! Wishlist item not returned.")
        sys.exit(1)
        
    # Sync cart
    cart_items = [
        {"product_id": 1, "quantity": 2},
        {"product_id": 6, "quantity": 1}
    ]
    database.sync_cart(user_id, cart_items)
    db_cart = database.get_cart_items(user_id)
    print(f"  Cart items in DB: {db_cart}")
    if len(db_cart) == 2 and db_cart[0]["product_id"] == 1:
         print("  PASSED! Cart sync database write & read successful.")
    else:
        print("  FAILED! Cart sync items incorrect.")
        sys.exit(1)

    # 5. Test Live Pricing Calculations
    print("\n[Test 5] Dynamic Commodity Pricing Engine...")
    rates = pricing.get_live_rates()
    print(f"  Live bullion rates loaded: {rates}")
    
    test_prod = PRODUCTS[0] # Aurelia Diamond Solitaire Ring
    calc = pricing.calculate_product_price(test_prod)
    print(f"  Product: {test_prod['name']}")
    print(f"    Dynamic Price: ${calc['live_price']}")
    print(f"    Invoice Breakdown: {calc['breakdown']}")
    if calc['live_price'] > 0:
        print("  PASSED! Commodity pricing calculation success.")
    else:
        print("  FAILED! Computed price zero or invalid.")
        sys.exit(1)

    print("\n=== ALL FULL-STACK CORE TESTS COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    run_tests()
