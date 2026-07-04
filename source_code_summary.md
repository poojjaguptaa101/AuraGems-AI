# Source Code Index: AuraGems AI Portfolio Platform

This document contains a structured index of the core full-stack files for AuraGems AI.

---

## 🐍 Relational Database & Pricing Engines

### 1. [backend/database.py](file:///C:/Users/Pooja/.gemini/antigravity/scratch/jewellery-ecommerce/backend/database.py)
*Handles user accounts, secure hashing, wishlists, cart syncing, and style profile schemas.*
```python
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
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS wishlist (
        user_id INTEGER,
        product_id INTEGER,
        PRIMARY KEY (user_id, product_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cart_items (
        user_id INTEGER,
        product_id INTEGER,
        quantity INTEGER DEFAULT 1,
        PRIMARY KEY (user_id, product_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
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

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

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
        return cursor.lastrowid
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

# ... Other database helpers (get_wishlist_ids, sync_cart, save_style_profile).
```

### 2. [backend/pricing.py](file:///C:/Users/Pooja/.gemini/antigravity/scratch/jewellery-ecommerce/backend/pricing.py)
*Background commodity pricing simulation engine based on gold/platinum live rates.*
```python
import time
import random
import threading
import re
from typing import Dict, Any, List

LIVE_RATES = {
    "18k Yellow Gold": 75.25,
    "18k White Gold": 76.80,
    "18k Rose Gold": 75.95,
    "Platinum": 35.40,
    "Sterling Silver": 0.95
}

GEMSTONE_VALUES = {
    "Diamond": 950.00,
    "Sapphire": 520.00,
    "Emerald": 780.00,
    "Pearl": 240.00,
    "Ruby": 1100.00,
    "Moonstone": 120.00,
    "None": 0.00
}

CRAFTSMANSHIP_FEES = {
    "Rings": 180.00,
    "Necklaces": 250.00,
    "Earrings": 200.00,
    "Bracelets": 220.00
}

rates_lock = threading.Lock()

def simulate_market_fluctuations():
    global LIVE_RATES
    while True:
        time.sleep(30)
        with rates_lock:
            for metal in LIVE_RATES:
                fluctuation = random.uniform(-0.004, 0.004)
                LIVE_RATES[metal] = round(LIVE_RATES[metal] * (1 + fluctuation), 2)

ticker_thread = threading.Thread(target=simulate_market_fluctuations, daemon=True)
ticker_thread.start()

def calculate_product_price(product: Dict[str, Any]) -> Dict[str, Any]:
    rates = get_live_rates()
    metal_family = "Sterling Silver"
    for metal in rates:
        if metal.lower() in product["material"].lower():
            metal_family = metal
            break
            
    live_metal_rate = rates.get(metal_family, 0.95)
    weight = parse_weight(product["specs"]["weight"])
    metal_cost = round(weight * live_metal_rate, 2)
    gem_value = GEMSTONE_VALUES.get(product["gemstone"], 0.0)
    
    carats_str = product["specs"].get("carats", "N/A")
    carat_match = re.search(r"([0-9.]+)", carats_str)
    if carat_match and product["gemstone"] != "None":
        carat_weight = float(carat_match.group(1))
        gem_value = round(gem_value * carat_weight, 2)
        
    craft_fee = CRAFTSMANSHIP_FEES.get(product["category"], 150.00)
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
```

---

## 🎨 Interactive Graphics & UI Modules

### 3. [frontend/src/pages/TryOn.jsx](file:///C:/Users/Pooja/.gemini/antigravity/scratch/jewellery-ecommerce/frontend/src/pages/TryOn.jsx)
*Webcam video frame capture and Canvas transformation overlay try-on module.*
```javascript
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, RotateCcw, Download } from 'lucide-react';
import { getProducts } from '../api';

export default function TryOn() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [useWebcam, setUseWebcam] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [scale, setScale] = useState(0.5);
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(0.85);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [overlayPos, setOverlayPos] = useState({ x: 150, y: 150 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (useWebcam && videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    } else if (uploadedImage) {
      ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);
    }
    
    if (selectedProduct) {
      const img = new Image();
      img.src = selectedProduct.image_url;
      img.onload = () => {
        ctx.save();
        ctx.translate(overlayPos.x, overlayPos.y);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.globalAlpha = opacity;
        
        const baseSize = 150;
        const width = baseSize * scale;
        const height = baseSize * scale;
        ctx.drawImage(img, -width / 2, -height / 2, width, height);
        ctx.restore();
      };
    }
  }, [selectedProduct, useWebcam, uploadedImage, overlayPos, scale, rotation, opacity]);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    
    const clickRadius = 80 * scale;
    const dist = Math.sqrt((x - overlayPos.x) ** 2 + (y - overlayPos.y) ** 2);
    if (dist < clickRadius) {
      isDragging.current = true;
      dragStart.current = { x: x - overlayPos.x, y: y - overlayPos.y };
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    
    setOverlayPos({ x: x - dragStart.current.x, y: y - dragStart.current.y });
  };

  const handleDownload = () => {
    const url = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "AuraGems_AI_Virtual_Fitting.png";
    link.href = url;
    link.click();
  };

  // ... Drag and drop, webcam hooks, file uploading selectors.
}
```

### 4. [frontend/src/components/DevConsole.jsx](file:///C:/Users/Pooja/.gemini/antigravity/scratch/jewellery-ecommerce/frontend/src/components/DevConsole.jsx)
*Slide-over AI parameters controller and live execution latency log visualizer.*
```javascript
import React, { useState, useEffect } from 'react';
import { Settings, Cpu, Activity, Clock } from 'lucide-react';

export default function DevConsole({ isOpen, onClose }) {
  const [model, setModel] = useState('Local Matcher Engine');
  const [temperature, setTemperature] = useState(0.2);
  const [telemetry, setTelemetry] = useState({ logs: [], active_model: '', temperature: 0.2 });
  const [expandedLog, setExpandedLog] = useState(null);

  const fetchTelemetry = async () => {
    const res = await fetch('http://localhost:8000/api/dev/telemetry');
    if (res.ok) setTelemetry(await res.json());
  };

  const handleSaveConfig = async (newModel, newTemp) => {
    await fetch('http://localhost:8000/api/dev/telemetry/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: newModel, temperature: parseFloat(newTemp) })
    });
  };

  // ... Poll logs, display request prompts and response metrics.
}
```
