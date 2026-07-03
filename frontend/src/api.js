// Frontend API Service Layer with Graceful Local Fallback

const API_BASE_URL = 'http://localhost:8000';

// Duplicate products list on client for instant fallback operations
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
    id: 4,
    name: "Eternity Diamond Tennis Bracelet",
    category: "Bracelets",
    price: 2450,
    material: "Platinum",
    gemstone: "Diamond",
    image_url: "/assets/products/bracelet_tennis.jpg",
    description: "A continuous line of individually-set, round brilliant-cut diamonds crafted in a flexible platinum setting. A classic luxury accessory that moves fluidly with the wrist, offering unmatched brilliance for high-end events.",
    specs: { weight: "12.1g", carats: "5.0 ct total diamond weight", dimensions: "Length: 7 inches", clarity: "VVS2", color: "F/G" },
    tags: ["classic", "luxury", "tennis-bracelet", "wedding", "anniversary", "diamond", "platinum"]
  },
  {
    id: 5,
    name: "Lumière Emerald Halo Pendant",
    category: "Necklaces",
    price: 1420,
    material: "18k White Gold",
    gemstone: "Emerald",
    image_url: "/assets/products/necklace_emerald.jpg",
    description: "Featuring a vivid green octagonal step-cut emerald sourced responsibly. Suspended from an 18k white gold cable chain, the vibrant emerald is framed by a sparkling square halo of round diamonds, symbolizing hope and harmony.",
    specs: { weight: "4.1g", carats: "1.5 ct emerald, 0.3 ct diamonds", dimensions: "Chain: 18 inches", clarity: "Slightly Included (natural)", color: "Vivid Green" },
    tags: ["emerald", "pendant", "classic", "gift", "birthday", "may-birthstone", "white-gold"]
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
  },
  {
    id: 7,
    name: "Solaria Gold Hoop Earrings",
    category: "Earrings",
    price: 310,
    material: "18k Yellow Gold",
    gemstone: "None",
    image_url: "/assets/products/earrings_hoops.jpg",
    description: "Classic and lightweight chunky hoops featuring an internal click clasp. Perfect for everyday wear, these 18k gold hoops are polished to a mirror finish and pair seamlessly with any look, from casual denim to office suits.",
    specs: { weight: "2.9g", carats: "N/A", dimensions: "Diameter: 25mm", clarity: "N/A", color: "Bright Gold" },
    tags: ["hoops", "minimalist", "daily-wear", "gold", "classic", "essential"]
  },
  {
    id: 8,
    name: "Selene Moonstone Ring",
    category: "Rings",
    price: 280,
    material: "Sterling Silver",
    gemstone: "Moonstone",
    image_url: "/assets/products/ring_moonstone.jpg",
    description: "A mystical round cabochon moonstone displaying a gorgeous blue adularescence sheen, claw-set on a sterling silver band engraved with delicate celestial details. Perfect for those who love bohemian and organic designs.",
    specs: { weight: "2.5g", carats: "1.2 ct", dimensions: "Ring size 7", clarity: "Translucent", color: "Iridescent Blue/White" },
    tags: ["boho", "celestial", "silver", "moonstone", "affordable", "daily-wear", "mystical"]
  },
  {
    id: 9,
    name: "Phoenix Ruby Statement Pendant",
    category: "Necklaces",
    price: 1850,
    material: "18k Yellow Gold",
    gemstone: "Ruby",
    image_url: "/assets/products/necklace_ruby.jpg",
    description: "A magnificent blood-red oval-cut ruby surrounded by intricate flame-like gold metalwork and diamond accents. This bold pendant hangs from an elegant 18k gold link chain, capturing passion and courage in its design.",
    specs: { weight: "6.8g", carats: "2.2 ct ruby", dimensions: "Chain: 20 inches", clarity: "Eye-clean", color: "Pigeon Blood Red" },
    tags: ["statement", "ruby", "bold", "luxury", "gold", "anniversary", "passion"]
  },
  {
    id: 10,
    name: "Iris Amethyst Sterling Studs",
    category: "Earrings",
    price: 190,
    material: "Sterling Silver",
    gemstone: "Amethyst",
    image_url: "/assets/products/earrings_amethyst.jpg",
    description: "Simple and elegant, these studs showcase vibrant purple cushion-cut amethyst gemstones held by four sterling silver prongs. Comfort-fit butterfly backings make them comfortable for daily wear.",
    specs: { weight: "1.8g", carats: "1.6 ct total weight", dimensions: "Size: 6mm x 6mm", clarity: "VVS", color: "Deep Violet" },
    tags: ["studs", "purple", "affordable", "daily-wear", "silver", "gift", "february-birthstone"]
  },
  {
    id: 11,
    name: "Verdant Vines Emerald Band",
    category: "Rings",
    price: 790,
    material: "18k Rose Gold",
    gemstone: "Emerald",
    image_url: "/assets/products/ring_emerald_band.jpg",
    description: "Inspired by nature, this stackable eternity-style band features round emeralds alternating with delicate rose gold leaves. A beautiful, organic design that adds color and texture to your ring stack.",
    specs: { weight: "2.8g", carats: "0.6 ct total emerald weight", dimensions: "Ring size 6.5", clarity: "Natural light inclusions", color: "Forest Green" },
    tags: ["nature", "rose-gold", "emerald", "stacking", "daily-wear", "gift", "unique"]
  },
  {
    id: 12,
    name: "Classic Akoya Pearl Strand",
    category: "Necklaces",
    price: 1100,
    material: "18k White Gold",
    gemstone: "Pearl",
    image_url: "/assets/products/necklace_pearl_strand.jpg",
    description: "A stunning 18-inch strand of perfectly matched, high-luster Akoya pearls, individually knotted and finished with an ornate white gold filigree clasp. The quintessential bridal accessory and a timeless heirloom piece.",
    specs: { weight: "28.5g", carats: "N/A", dimensions: "Length: 18 inches, Pearl size: 7.5 - 8mm", clarity: "Slightly blemished, excellent luster", color: "Creamy White with Rose Overtones" },
    tags: ["pearl", "classic", "bridal", "wedding", "heirloom", "white-gold", "traditional"]
  }
];

// Helper: safe HTTP POST wrapper
async function postData(endpoint, data) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error(`Server returned error ${response.status}`);
  }
  return response.json();
}

// 1. Fetch Products
export async function getProducts(category = '') {
  try {
    const url = category ? `${API_BASE_URL}/api/products?category=${category}` : `${API_BASE_URL}/api/products`;
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (err) {
    console.warn("Backend offline. Falling back to local products list.");
    if (category) {
      return LOCAL_PRODUCTS.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    return LOCAL_PRODUCTS;
  }
}

// 2. Fetch Product By ID
export async function getProductById(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (err) {
    console.warn(`Backend offline. Finding product id ${id} locally.`);
    const product = LOCAL_PRODUCTS.find(p => p.id === parseInt(id));
    if (!product) return null;
    const suggestions = LOCAL_PRODUCTS.filter(p => p.id !== product.id && (p.category !== product.category || p.material === product.material)).slice(0, 3);
    return { product, complete_the_look: suggestions };
  }
}

// 3. Smart Search (NLP)
export async function searchProducts(query) {
  try {
    return await postData('/api/products/search', { query });
  } catch (err) {
    console.warn("Backend offline. Running Smart Search locally.");
    const queryLower = query.toLowerCase();
    
    // Parse categories
    const categories = [];
    if (queryLower.includes("ring")) categories.push("Rings");
    if (queryLower.includes("necklace") || queryLower.includes("choker") || queryLower.includes("pendant")) categories.push("Necklaces");
    if (queryLower.includes("earring") || queryLower.includes("stud") || queryLower.includes("hoop")) categories.push("Earrings");
    if (queryLower.includes("bracelet") || queryLower.includes("bangle") || queryLower.includes("strand")) categories.push("Bracelets");
    
    // Parse metals
    const metals = [];
    if (queryLower.includes("gold")) {
      if (queryLower.includes("rose gold") || queryLower.includes("rose-gold")) metals.push("Rose Gold");
      else if (queryLower.includes("white gold") || queryLower.includes("white-gold")) metals.push("White Gold");
      else if (queryLower.includes("yellow gold") || queryLower.includes("yellow-gold")) metals.push("Yellow Gold");
      else metals.push("Gold");
    }
    if (queryLower.includes("platinum")) metals.push("Platinum");
    if (queryLower.includes("silver") || queryLower.includes("sterling")) metals.push("Silver");

    // Parse gems
    const gemstones = [];
    ['diamond', 'sapphire', 'emerald', 'pearl', 'ruby', 'moonstone'].forEach(g => {
      if (queryLower.includes(g)) gemstones.push(g.charAt(0).toUpperCase() + g.slice(1));
    });

    // Parse price limits
    let priceLimit = null;
    const priceMatches = queryLower.match(/(?:under|less than|below|budget|max|limit)?\s*\$?\s*(\d+)/);
    if (priceMatches && (queryLower.includes("under") || queryLower.includes("less") || queryLower.includes("budget") || queryLower.includes("$"))) {
      priceLimit = parseFloat(priceMatches[1]);
    }

    const results = [];
    LOCAL_PRODUCTS.forEach(product => {
      let score = 0;
      const matchReasons = [];

      if (categories.length > 0) {
        if (categories.includes(product.category)) {
          score += 5;
          matchReasons.push(`Matches category '${product.category}'`);
        } else {
          score -= 3;
        }
      }

      if (metals.length > 0) {
        let matchedMetal = false;
        metals.forEach(m => {
          if (m === "Gold" && product.material.includes("Gold")) {
            score += 4;
            matchedMetal = true;
            matchReasons.push("Matches gold metal family");
          } else if (product.material.toLowerCase().includes(m.toLowerCase())) {
            score += 5;
            matchedMetal = true;
            matchReasons.push(`Matches metal '${product.material}'`);
          }
        });
        if (!matchedMetal) score -= 1;
      }

      if (gemstones.length > 0) {
        if (gemstones.includes(product.gemstone)) {
          score += 5;
          matchReasons.push(`Matches gemstone '${product.gemstone}'`);
        } else {
          score -= 1;
        }
      }

      if (priceLimit) {
        if (product.price <= priceLimit) {
          score += 4;
          matchReasons.push(`Within price limit (under $${priceLimit})`);
        } else {
          if (product.price > priceLimit * 1.1) return; // skip
          score -= 5;
        }
      }

      // Keyword matches
      let textMatch = false;
      queryLower.split(/\s+/).forEach(word => {
        if (word.length > 2 && !['and', 'the', 'for', 'with'].includes(word)) {
          if (product.name.toLowerCase().includes(word)) {
            score += 3;
            textMatch = true;
          } else if (product.description.toLowerCase().includes(word)) {
            score += 1;
            textMatch = true;
          }
        }
      });
      if (textMatch) matchReasons.push("Matches query keywords");

      if (score > 0) {
        results.push({
          product,
          score,
          ai_explanation: matchReasons.length > 0 ? "AI Match Analysis: " + matchReasons.join("; ") + "." : "Selected based on general keywords."
        });
      }
    });

    results.sort((a, b) => b.score - a.score);
    return { query, results };
  }
}

// 4. Style Questionnaire
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
    console.warn("Backend offline. Processing Style Profile locally.");
    
    let preferredMetals = [];
    if (skinTone.toLowerCase() === 'warm') preferredMetals = ['Yellow Gold', 'Gold'];
    else if (skinTone.toLowerCase() === 'cool') preferredMetals = ['Platinum', 'Silver', 'White Gold'];
    else preferredMetals = ['Yellow Gold', 'White Gold', 'Rose Gold', 'Platinum', 'Silver'];

    const filtered = LOCAL_PRODUCTS.filter(p => p.price <= budget);
    const scored = filtered.map(product => {
      let score = 0;
      if (preferredMetals.some(m => product.material.includes(m))) score += 4;
      if (gemstonePref.toLowerCase() !== 'any') {
        if (product.gemstone.toLowerCase() === gemstonePref.toLowerCase()) score += 6;
      }
      if (lifestyle === 'daily-wear') {
        if (product.tags.includes('daily-wear') || product.tags.includes('minimalist')) score += 5;
      } else if (lifestyle === 'evening-wear') {
        if (product.tags.includes('evening-wear') || product.tags.includes('statement')) score += 5;
      } else if (lifestyle === 'bold-trendy') {
        if (product.tags.includes('bold') || product.tags.includes('modern')) score += 5;
      }

      if (statementPref === 'minimalist') {
        if (product.tags.includes('minimalist') || product.tags.includes('studs')) score += 5;
      } else if (statementPref === 'bold') {
        if (product.tags.includes('bold') || product.tags.includes('statement')) score += 5;
      } else if (statementPref === 'classic') {
        if (product.tags.includes('classic') || product.tags.includes('traditional')) score += 5;
      }

      return { product, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const rings = scored.filter(item => item.product.category === 'Rings');
    const necklaces = scored.filter(item => item.product.category === 'Necklaces');
    const others = scored.filter(item => ['Earrings', 'Bracelets'].includes(item.product.category));

    const recommendedSet = [];
    let totalPrice = 0;

    if (rings.length > 0) {
      recommendedSet.push(rings[0].product);
      totalPrice += rings[0].product.price;
    }
    if (necklaces.length > 0) {
      recommendedSet.push(necklaces[0].product);
      totalPrice += necklaces[0].product.price;
    }
    if (others.length > 0) {
      recommendedSet.push(others[0].product);
      totalPrice += others[0].product.price;
    }

    const explanation = `AuraGems AI's Style Matchmaker has curated a personal jewellery wardrobe for you. Since you have ${skinTone} skin undertones, we selected pieces highlighting ${skinTone.toLowerCase() === 'warm' ? 'warm, radiant gold' : skinTone.toLowerCase() === 'cool' ? 'crisp, glowing platinum and white metals' : 'a harmonious mix of metals'}. These items fit your ${statementPref} style preference and are tailored for a ${lifestyle} lifestyle. Together, this set creates a balanced, stunning look within your budget.`;

    return { recommended_set: recommendedSet, total_price: totalPrice, style_explanation: explanation };
  }
}

// 5. Gift Recommendation Finder
export async function getGiftRecommendations(recipient, occasion, budgetTier) {
  try {
    return await postData('/api/recommendations/gift', {
      recipient,
      occasion,
      budget_tier: budgetTier
    });
  } catch (err) {
    console.warn("Backend offline. Generating Gift recommendations locally.");
    
    let minP = 0, maxP = 99999;
    if (budgetTier === 'tier1') maxP = 500;
    else if (budgetTier === 'tier2') { minP = 500; maxP = 1000; }
    else if (budgetTier === 'tier3') { minP = 1000; maxP = 2000; }

    const inRange = LOCAL_PRODUCTS.filter(p => p.price >= minP && p.price <= maxP);
    const scored = inRange.map(product => {
      let score = 0;
      if (product.tags.includes(occasion.toLowerCase())) score += 5;
      if (recipient.toLowerCase() === 'partner') {
        if (product.tags.includes('engagement') || product.tags.includes('anniversary')) score += 5;
        if (product.category === 'Rings') score += 3;
      } else if (recipient.toLowerCase() === 'mother') {
        if (product.tags.includes('classic') || product.tags.includes('pearl')) score += 5;
      } else if (recipient.toLowerCase() === 'friend') {
        if (product.tags.includes('affordable') || product.tags.includes('daily-wear')) score += 5;
      }
      return { product, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const topGifts = scored.slice(0, 3).map(item => item.product);

    const giftName = topGifts.length > 0 ? topGifts[0].name : "exquisite jewellery";

    const notes = {
      anniversary: {
        partner: `To my beloved Partner, another year of walking hand-in-hand, and my love for you has only grown deeper and brighter. This ${giftName} shines with the brilliance of our shared memories. Happy Anniversary.`,
        mother: `To my wonderful Mother, celebrating the beautiful legacy of love you and dad have built. May this ${giftName} serve as a token of my infinite gratitude. Happy Anniversary.`,
      },
      birthday: {
        partner: `Happy Birthday to the one who makes my heart skip a beat. You bring joy and warmth into my life every single day. I hope this sparkling ${giftName} makes your day as beautiful as you are.`,
        mother: `Happy Birthday, Mom! Thank you for your warmth, wisdom, and unconditional love. May this exquisite ${giftName} remind you of how much you are cherished every time you wear it.`,
        friend: `Happy Birthday to my dearest friend! May your year ahead be filled with laughter, adventures, and beautiful sparkles. Wear this ${giftName} and remember our friendship always.`,
      },
      just_because: {
        partner: `Just a little something to remind you that you are loved, appreciated, and thought of every single day. No occasion needed to celebrate you.`,
        mother: `Mom, just because you are always there for everyone else, I wanted to send a little sparkle just for you. Thank you for being my anchor.`
      }
    };

    const occKey = occasion.toLowerCase().includes('anniversary') ? 'anniversary' : occasion.toLowerCase().includes('birthday') ? 'birthday' : 'just_because';
    const recKey = recipient.toLowerCase() in ['partner', 'mother', 'friend'] ? recipient.toLowerCase() : 'friend';

    let giftNote = `To someone very special, wishing you joy, love, and a beautiful day. May this sparkling gift of ${giftName} bring a smile to your face.`;
    if (notes[occKey] && notes[occKey][recKey]) {
      giftNote = notes[occKey][recKey];
    }

    return { gifts: topGifts, gift_card_note: giftNote };
  }
}

// 6. Chat Widget Messaging
export async function sendChatMessage(messages) {
  try {
    return await postData('/api/chat', { messages });
  } catch (err) {
    console.warn("Backend offline. Generating Chat reply locally.");
    const lastMsg = messages[messages.length - 1].content.toLowerCase();
    
    let responseText = "";
    if (lastMsg.includes("size") || lastMsg.includes("sizing") || lastMsg.includes("measure")) {
      responseText = "### Ring Sizing Guide\n\nFinding your perfect ring size is essential for comfort and style. Here are two simple methods to measure at home:\n\n1. **The Paper Strip Method**: Wrap a thin strip of paper around the base of your finger. Mark where the paper overlaps, measure the length in millimeters with a ruler, and match it to our size chart.\n2. **The Ring Check**: Take an existing, well-fitting ring and measure its internal diameter in millimeters.\n\n| Inside Diameter (mm) | US Ring Size | UK/AU Size |\n| :--- | :--- | :--- |\n| 16.5 mm | Size 6 | L ½ |\n| 17.3 mm | Size 7 | N ½ |\n| 18.1 mm | Size 8 | P ½ |\n| 19.0 mm | Size 9 | R ½ |\n\n*Need a custom size?* Contact our team at support@auragems_aijewellery.com, and we can handcraft half-sizes for most designs.";
    } else if (lastMsg.includes("return") || lastMsg.includes("exchange") || lastMsg.includes("refund") || lastMsg.includes("warranty")) {
      responseText = "### Returns & Warranty Policies\n\nAt AuraGems AI, we want you to cherish your jewellery forever. We offer a **30-day complimentary return and exchange window** for all unworn items in their original packaging.\n\n- **Free Returns**: We provide pre-paid shipping labels for all domestic returns.\n- **Exchanges**: You can exchange any ring for a different size within 30 days of purchase.\n- **Lifetime Warranty**: All our premium pieces (18k Gold, Platinum) come with a lifetime warranty against manufacturing defects, including complimentary stone tightening and professional cleaning once a year.";
    } else if (lastMsg.includes("clean") || lastMsg.includes("care") || lastMsg.includes("tarnish") || lastMsg.includes("wash") || lastMsg.includes("maintain")) {
      responseText = "### Jewellery Care Tips\n\nTo keep your precious pieces sparkling for generations, follow these care guidelines:\n\n- **Gold & Platinum**: Clean gently with a soft toothbrush in warm water and mild dish soap. Dry thoroughly with a lint-free cloth.\n- **Freshwater Pearls**: Pearls are organic and delicate. Put them on *after* applying perfume and makeup. Clean by wiping with a damp, soft cloth only.\n- **Emeralds & Gemstones**: Emeralds are natural stones that can be sensitive to thermal shock. Avoid hot steam or ultrasonic cleaners. Use lukewarm water.";
    } else if (lastMsg.includes("ring")) {
      responseText = "We have a stunning selection of rings in our collection! Here are a few curated choices:\n\n- **Aurelia Diamond Solitaire Ring** ($1250): An exquisite 18k yellow gold ring featuring a brilliant 1-carat round-cut diamond solitaire.\n- **Selene Moonstone Ring** ($280): A mystical round cabochon moonstone displaying a gorgeous blue adularescence sheen.\n- **Verdant Vines Emerald Band** ($790): Inspired by nature, this stackable eternity-style band features round emeralds alternating with delicate rose gold leaves.\n\nWould you like me to help you filter by metal type (Gold/Silver/Platinum) or find a specific ring for an engagement?";
    } else if (lastMsg.includes("styling") || lastMsg.includes("style") || lastMsg.includes("wear") || lastMsg.includes("match") || lastMsg.includes("outfit")) {
      responseText = "### AuraGems AI Styling Consultation\n\nAs your personal stylist, here are a few rules of thumb for pairing jewellery:\n\n1. **Necklines & Necklaces**:\n   - **V-Necks** pair beautifully with drop pendants like our *Lumière Emerald Halo Pendant* ($1,420).\n   - **Crew Necks and Off-the-Shoulder** tops are ideal for collarbone chokers, like our *Helios Gold Link Choker* ($620).\n2. **Metals & Skin Tones**:\n   - Cool skin undertones (blue/purple veins) glow in **Platinum** or **Sterling Silver**.\n   - Warm skin undertones (greenish veins) are ilauragems_aited by **18k Yellow Gold**.";
    } else {
      responseText = "Hello! I am **AuraGems AI**, your digital jewellery concierge. How can I help you sparkle today?\n\nYou can ask me questions like:\n- *'How do I find my ring size?'*\n- *'What is your return policy?'*\n- *'Can you recommend a gold ring under $1000?'*\n- *'How should I clean my emerald pendant?'*\n\nYou can also use our **AI Assistant** tab to build a customized style profile or search our collections using natural language!";
    }

    return { response: responseText };
  }
}
