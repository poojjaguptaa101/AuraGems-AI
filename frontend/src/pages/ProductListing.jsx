import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Filter, RefreshCw, Heart } from 'lucide-react';
import { getProducts, searchProducts } from '../api';
import ProductCard from '../components/ProductCard';

export default function ProductListing({ onViewProductDetails, wishlistItems = [], onToggleWishlist, onQuickView }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchExplanation, setActiveSearchExplanation] = useState(null);
  const [isAiSearchActive, setIsAiSearchActive] = useState(false);
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMaterial, setSelectedMaterial] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All');

  // Load initial products
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const all = await getProducts();
      setProducts(all);
      setFilteredProducts(all);
      setLoading(false);
    }
    loadData();
  }, []);

  // Standard local filtering
  useEffect(() => {
    if (isAiSearchActive) return; // skip standard filters if AI search is dominant

    let temp = [...products];

    // Filter by Wishlist Only
    if (showWishlistOnly) {
      const favIds = wishlistItems.map(item => item.id);
      temp = temp.filter(p => favIds.includes(p.id));
    }

    // Filter by Category
    if (selectedCategory !== 'All') {
      temp = temp.filter(p => p.category === selectedCategory);
    }

    // Filter by Material
    if (selectedMaterial !== 'All') {
      temp = temp.filter(p => p.material.toLowerCase().includes(selectedMaterial.toLowerCase()));
    }

    // Filter by Price Range
    if (selectedPriceRange !== 'All') {
      if (selectedPriceRange === 'under-500') {
        temp = temp.filter(p => p.price < 500);
      } else if (selectedPriceRange === '500-1000') {
        temp = temp.filter(p => p.price >= 500 && p.price <= 1000);
      } else if (selectedPriceRange === '1000-2000') {
        temp = temp.filter(p => p.price >= 1000 && p.price <= 2000);
      } else if (selectedPriceRange === 'over-2000') {
        temp = temp.filter(p => p.price > 2000);
      }
    }

    setFilteredProducts(temp);
  }, [selectedCategory, selectedMaterial, selectedPriceRange, products, isAiSearchActive, showWishlistOnly, wishlistItems]);

  // Execute NLP Smart Search
  const handleSmartSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      handleClearSearch();
      return;
    }

    setLoading(true);
    try {
      const data = await searchProducts(searchQuery);
      if (data && data.results) {
        setIsAiSearchActive(true);
        setShowWishlistOnly(false);
        const mapped = data.results.map(r => ({
          ...r.product,
          ai_explanation: r.ai_explanation,
          ai_score: r.score
        }));
        setFilteredProducts(mapped);
        
        if (mapped.length > 0) {
          setActiveSearchExplanation(`AuraGems AI parsed: "${searchQuery}". Found ${mapped.length} relevant items, sorted by matching relevance.`);
        } else {
          setActiveSearchExplanation(`No matching products found for "${searchQuery}". Try different keywords.`);
        }
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsAiSearchActive(false);
    setActiveSearchExplanation(null);
    setShowWishlistOnly(false);
    setFilteredProducts(products);
    setSelectedCategory('All');
    setSelectedMaterial('All');
    setSelectedPriceRange('All');
  };

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '3rem' }}>
      
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <span style={{ color: 'var(--accent-gold)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: '600' }}>
          Atelier Collection
        </span>
        <h1 style={{ fontSize: '2.5rem', marginTop: '0.5rem', marginBottom: '1.25rem' }}>
          Explore Our Creations
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '0.9rem' }}>
          Browse our catalog of handcrafted luxury rings, necklaces, bracelets, and earrings. Or search dynamically using our Natural Language AI.
        </p>
      </div>

      {/* Smart Search Bar Section */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '3rem' }}>
        <form onSubmit={handleSmartSearch} style={{ display: 'flex', gap: '1rem', width: '100%', flexWrap: 'wrap' }}>
          <div style={{ flexGrow: 1, position: 'relative', minWidth: '280px' }}>
            <Search className="w-5 h-5 text-text-muted" style={{ position: 'absolute', left: '14px', top: '13px' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask our AI... (e.g., 'gold emerald necklace under 1500' or 'silver studs')"
              className="form-input"
              style={{ paddingLeft: '2.75rem', height: '48px', fontSize: '0.95rem' }}
            />
          </div>
          <button 
            type="submit" 
            className="gold-btn" 
            style={{ height: '48px', minWidth: '160px', justifyContent: 'center' }}
          >
            <Sparkles className="w-4 h-4" /> AI Search
          </button>
          
          {(isAiSearchActive || showWishlistOnly) && (
            <button 
              type="button" 
              onClick={handleClearSearch}
              className="outline-btn"
              style={{ height: '48px', padding: '0 1.25rem' }}
            >
              Reset Filters
            </button>
          )}
        </form>

        {activeSearchExplanation && (
          <div className="glass-panel gold-border animate-fade-in" style={{
            marginTop: '1.25rem',
            padding: '1rem 1.25rem',
            background: 'var(--accent-gold-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            borderRadius: '4px'
          }}>
            <Sparkles className="w-5 h-5 text-accent-gold" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: '500' }}>
              {activeSearchExplanation}
            </span>
          </div>
        )}
      </div>

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2.5rem' }} className="listing-layout">
        
        {/* Left Side: Filters Column */}
        <div style={{ display: isAiSearchActive ? 'none' : 'flex', flexDirection: 'column', gap: '2rem' }} className="filters-sidebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <Filter className="w-4 h-4 text-accent-gold" />
            <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filters</h3>
          </div>

          {/* Wishlist only filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => setShowWishlistOnly(!showWishlistOnly)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                color: showWishlistOnly ? '#ff4d4d' : 'var(--text-secondary)',
                fontWeight: showWishlistOnly ? '600' : '400',
                textAlign: 'left'
              }}
            >
              <Heart className="w-4 h-4" style={{ fill: showWishlistOnly ? '#ff4d4d' : 'none' }} />
              <span>Show Wishlist Only ({wishlistItems.length})</span>
            </button>
          </div>

          {/* Category Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span className="form-label" style={{ marginBottom: '0.25rem' }}>Category</span>
            {['All', 'Rings', 'Necklaces', 'Earrings', 'Bracelets'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  textAlign: 'left',
                  fontSize: '0.85rem',
                  color: selectedCategory === cat ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  fontWeight: selectedCategory === cat ? '600' : '400',
                  padding: '2px 0'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Metal Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span className="form-label" style={{ marginBottom: '0.25rem' }}>Metal Type</span>
            {[
              { id: 'All', label: 'All Metals' },
              { id: 'Yellow Gold', label: '18k Yellow Gold' },
              { id: 'White Gold', label: '18k White Gold' },
              { id: 'Rose Gold', label: '18k Rose Gold' },
              { id: 'Platinum', label: 'Platinum' },
              { id: 'Silver', label: 'Sterling Silver' }
            ].map(metal => (
              <button
                key={metal.id}
                onClick={() => setSelectedMaterial(metal.id)}
                style={{
                  textAlign: 'left',
                  fontSize: '0.85rem',
                  color: selectedMaterial === metal.id ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  fontWeight: selectedMaterial === metal.id ? '600' : '400',
                  padding: '2px 0'
                }}
              >
                {metal.label}
              </button>
            ))}
          </div>

          {/* Price Range Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span className="form-label" style={{ marginBottom: '0.25rem' }}>Price Budget</span>
            {[
              { id: 'All', label: 'All Budgets' },
              { id: 'under-500', label: 'Under $500' },
              { id: '500-1000', label: '$500 - $1,000' },
              { id: '1000-2000', label: '$1,000 - $2,000' },
              { id: 'over-2000', label: 'Over $2,000' }
            ].map(price => (
              <button
                key={price.id}
                onClick={() => setSelectedPriceRange(price.id)}
                style={{
                  textAlign: 'left',
                  fontSize: '0.85rem',
                  color: selectedPriceRange === price.id ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  fontWeight: selectedPriceRange === price.id ? '600' : '400',
                  padding: '2px 0'
                }}
              >
                {price.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Products Grid */}
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', flexDirection: 'column', gap: '1rem' }}>
              <RefreshCw className="w-8 h-8 text-accent-gold" style={{ animation: 'spin 2s linear infinite' }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Searching atelier...</span>
            </div>
          ) : (
            <>
              {filteredProducts.length === 0 ? (
                <div className="glass-panel" style={{ padding: '5rem 2rem', textAlign: 'center' }}>
                  <h3 style={{ marginBottom: '1rem' }}>No products match your parameters</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                    We could not find any items matching your selected criteria or search phrase. Try adjusting your selections or query string.
                  </p>
                  <button onClick={handleClearSearch} className="gold-btn">Reset Search</button>
                </div>
              ) : (
                <div>
                  {(isAiSearchActive || showWishlistOnly) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <span>Showing {filteredProducts.length} filtered items</span>
                      <button onClick={handleClearSearch} style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}>Back to Standard Catalog</button>
                    </div>
                  )}

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: '2.5rem 2.0rem'
                  }}>
                    {filteredProducts.map((product) => {
                      const isLiked = wishlistItems.some(item => item.id === product.id);
                      return (
                        <div key={product.id} style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                          
                          {/* Wishlist Toggle Button Overlay */}
                          <button
                            onClick={(e) => { e.stopPropagation(); onToggleWishlist(product); }}
                            style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              zIndex: 10,
                              background: 'rgba(10,10,12,0.85)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '50%',
                              width: '32px',
                              height: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: isLiked ? '#ff4d4d' : 'var(--text-secondary)',
                              transition: 'color var(--transition-fast)'
                            }}
                            title={isLiked ? "Remove from Wishlist" : "Add to Wishlist"}
                          >
                            <Heart className="w-4 h-4" style={{ fill: isLiked ? '#ff4d4d' : 'none' }} />
                          </button>

                          <ProductCard 
                            product={product} 
                            onViewDetails={onViewProductDetails} 
                            onQuickView={onQuickView}
                          />
                          
                          {/* Display Match reason if AI search is active */}
                          {isAiSearchActive && product.ai_explanation && (
                            <div style={{
                              marginTop: '0.5rem',
                              fontSize: '0.7rem',
                              background: 'var(--bg-secondary)',
                              border: '1px solid var(--border-color)',
                              padding: '0.5rem',
                              borderRadius: '4px',
                              color: 'var(--text-secondary)'
                            }}>
                              {product.ai_explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .listing-layout {
            grid-template-columns: 1fr !important;
          }
          .filters-sidebar {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
