import sqlite3
import hashlib
import os
from typing import Optional, List, Dict, Any

DATABASE_PATH = os.path.join(os.path.dirname(__file__), "auragems.db")

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes SQLite database tables if they do not exist."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Wishlist Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS wishlist (
        user_id INTEGER,
        product_id INTEGER,
        PRIMARY KEY (user_id, product_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    
    # Cart Items Table (Database-backed Sync)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cart_items (
        user_id INTEGER,
        product_id INTEGER,
        quantity INTEGER DEFAULT 1,
        PRIMARY KEY (user_id, product_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    
    # Saved Style Profiles
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS saved_profiles (
        user_id INTEGER PRIMARY KEY,
        skin_tone TEXT,
        lifestyle TEXT,
        gemstone_pref TEXT,
        statement_pref TEXT,
        budget REAL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    
    conn.commit()
    conn.close()
    print("SQLite Database initialized successfully.")

# Password Hashing Helper
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

# ==========================================
# AUTH OPERATIONS
# ==========================================
def register_user(username: str, email: str, password_raw: str) -> Optional[int]:
    conn = get_db_connection()
    cursor = conn.cursor()
    password_hash = hash_password(password_raw)
    try:
        cursor.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
            (username.strip(), email.strip().lower(), password_hash)
        )
        conn.commit()
        user_id = cursor.lastrowid
        return user_id
    except sqlite3.IntegrityError:
        return None
    finally:
        conn.close()

def authenticate_user(username_or_email: str, password_raw: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    password_hash = hash_password(password_raw)
    
    cursor.execute(
        "SELECT id, username, email FROM users WHERE (username = ? OR email = ?) AND password_hash = ?",
        (username_or_email.strip(), username_or_email.strip().lower(), password_hash)
    )
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return {"id": user["id"], "username": user["username"], "email": user["email"]}
    return None

def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, email FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return {"id": user["id"], "username": user["username"], "email": user["email"]}
    return None

# ==========================================
# WISHLIST OPERATIONS
# ==========================================
def add_to_wishlist(user_id: int, product_id: int) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT OR IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)", (user_id, product_id))
        conn.commit()
        return True
    except Exception:
        return False
    finally:
        conn.close()

def remove_from_wishlist(user_id: int, product_id: int) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM wishlist WHERE user_id = ? AND product_id = ?", (user_id, product_id))
        conn.commit()
        return True
    except Exception:
        return False
    finally:
        conn.close()

def get_wishlist_ids(user_id: int) -> List[int]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT product_id FROM wishlist WHERE user_id = ?", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [row["product_id"] for row in rows]

# ==========================================
# CART DB OPERATIONS
# ==========================================
def sync_cart(user_id: int, items: List[Dict[str, int]]):
    """Syncs the user's cart from frontend with the database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Clear existing
        cursor.execute("DELETE FROM cart_items WHERE user_id = ?", (user_id,))
        # Insert current items
        for item in items:
            cursor.execute(
                "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)",
                (user_id, item["product_id"], item["quantity"])
            )
        conn.commit()
    except Exception as e:
        print(f"Error syncing cart: {e}")
    finally:
        conn.close()

def get_cart_items(user_id: int) -> List[Dict[str, int]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT product_id, quantity FROM cart_items WHERE user_id = ?", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [{"product_id": row["product_id"], "quantity": row["quantity"]} for row in rows]

# ==========================================
# SAVED STYLE PROFILES
# ==========================================
def save_style_profile(user_id: int, skin_tone: str, lifestyle: str, gemstone: str, statement: str, budget: float) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """INSERT OR REPLACE INTO saved_profiles (user_id, skin_tone, lifestyle, gemstone_pref, statement_pref, budget) 
               VALUES (?, ?, ?, ?, ?, ?)""",
            (user_id, skin_tone, lifestyle, gemstone, statement, budget)
        )
        conn.commit()
        return True
    except Exception:
        return False
    finally:
        conn.close()

def get_saved_profile(user_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT skin_tone, lifestyle, gemstone_pref, statement_pref, budget FROM saved_profiles WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            "skin_tone": row["skin_tone"],
            "lifestyle": row["lifestyle"],
            "gemstone_pref": row["gemstone_pref"],
            "statement_pref": row["statement_pref"],
            "budget": row["budget"]
        }
    return None

# Initialize tables when imported
init_db()
