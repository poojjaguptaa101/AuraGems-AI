import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowLeft, RefreshCw, Sparkles, Check, Heart, ShieldCheck, DollarSign, Star, Camera, Compass } from 'lucide-react';
import { getProductById, getProducts } from '../api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetails({ 
  productId, 
  onBack, 
  onViewProductDetails, 
  wishlist = [], 
  onToggleWishlist 
}) {
  const { addToCart } = useCart();
  const [data, setData] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  
  // Interactive Angle Toggles
  const [activeAngle, setActiveAngle] = useState('front'); // front, side, macro
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    async function loadDetails() {
      setLoading(true);
      const res = await getProductById(productId);
      setData(res);
      setQuantity(1);
      setActiveAngle('front');
      setLoading(false);
      setAdded(false);

      // Track recently viewed
      if (res && res.product) {
        let history = JSON.parse(localStorage.getItem('auragems_recent') || '[]');
        history = history.filter(id => id !== res.product.id);
        history.unshift(res.product.id);
        history = history.slice(0, 4);
        localStorage.setItem('auragems_recent', JSON.stringify(history));
      }
    }
    if (productId) {
      loadDetails();
    }
  }, [productId]);

  // Load recently viewed details
  useEffect(() => {
    async function loadRecent() {
      const historyIds = JSON.parse(localStorage.getItem('auragems_recent') || '[]');
      if (historyIds.length > 1) {
        const all = await getProducts();
        // filter all matching history IDs except current product
        const filtered = all.filter(p => historyIds.includes(p.id) && p.id !== parseInt(productId));
        setRecentProducts(filtered);
      } else {
        setRecentProducts([]);
      }
    }
    if (!loading && data) {
      loadRecent();
    }
  }, [loading, productId, data]);

  const handleAddToCart = () => {
    if (data && data.product) {
      addToCart(data.product, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '500px', flexDirection: 'column', gap: '1rem' }}>
        <RefreshCw className="w-8 h-8 text-accent-gold" style={{ animation: 'spin 2s linear infinite' }} />
        <span>Fetching details from atelier...</span>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!data || !data.product) {
    return (
      <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
        <h2>Product Not Found</h2>
        <button onClick={onBack} className="outline-btn" style={{ marginTop: '2rem' }}>Go Back</button>
      </div>
    );
  }

  const { product, complete_the_look } = data;
  const isLiked = wishlist.some(item => item.id === product.id);

  // Compute image zoom styles for 360/macro mock
  const getImageStyles = () => {
    if (activeAngle === 'side') {
      return { transform: 'scale(1.1) rotate(15deg)', transition: 'transform 0.5s ease' };
    }
    if (activeAngle === 'macro') {
      return { transform: 'scale(1.6) translateY(-10%)', transition: 'transform 0.5s ease' };
    }
    return { transform: 'scale(1)', transition: 'transform 0.5s ease' };
  };

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '3rem' }}>
      
      {/* Back Button */}
      <button 
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--text-secondary)',
          fontSize: '0.85rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '2.5rem'
        }}
      >
        <ArrowLeft className="w-4 h-4" /> Back to Catalogue
      </button>

      {/* Main product showcase */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', marginBottom: '6rem' }}>
        
        {/* Left Column: Interactive Image Carousel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="glass-panel zoom-lens-container" style={{
            overflow: 'hidden',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-tertiary)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            aspectRatio: '1/1'
          }}>
            <img 
              src={product.image_url} 
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                ...getImageStyles()
              }}
              className="zoom-lens-img"
            />
          </div>

          {/* 360° Mock Angle Selectors */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={() => setActiveAngle('front')}
              className="glass-panel"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                borderColor: activeAngle === 'front' ? 'var(--accent-gold)' : 'var(--border-color)',
                color: activeAngle === 'front' ? 'white' : 'var(--text-secondary)'
              }}
            >
              <Camera className="w-3.5 h-3.5" /> Front View
            </button>
            <button 
              onClick={() => setActiveAngle('side')}
              className="glass-panel"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                borderColor: activeAngle === 'side' ? 'var(--accent-gold)' : 'var(--border-color)',
                color: activeAngle === 'side' ? 'white' : 'var(--text-secondary)'
              }}
            >
              <Compass className="w-3.5 h-3.5" /> 45° Angle
            </button>
            <button 
              onClick={() => setActiveAngle('macro')}
              className="glass-panel"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                borderColor: activeAngle === 'macro' ? 'var(--accent-gold)' : 'var(--border-color)',
                color: activeAngle === 'macro' ? 'white' : 'var(--text-secondary)'
              }}
            >
              <Sparkles className="w-3.5 h-3.5" /> Macro Gem
            </button>
          </div>
        </div>

        {/* Right Column: Info details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <span style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: '500' }}>
              {product.material} • {product.category}
            </span>
            <h1 style={{ fontSize: '2.25rem', fontFamily: 'var(--font-serif)', marginTop: '0.5rem', lineHeight: '1.2' }}>
              {product.name}
            </h1>
          </div>

          {/* Star ratings */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', color: '#ffc107', gap: '2px' }}>
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
            </div>
            <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: '500' }}>4.8 out of 5</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>| 24 Client Reviews</span>
          </div>

          <span style={{ fontSize: '1.75rem', fontWeight: '600', color: 'white' }}>
            ${product.price.toLocaleString()}
          </span>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.7' }}>
            {product.description}
          </p>

          {/* Available Sizes List */}
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <strong>Available Sizing:</strong>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              {['US 5', 'US 6', 'US 7', 'US 8'].map(size => (
                <span key={size} style={{
                  border: '1px solid var(--border-color)',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  borderRadius: '2px',
                  background: 'var(--bg-tertiary)',
                  color: 'white'
                }}>
                  {size}
                </span>
              ))}
            </div>
          </div>

          {/* Quantity Selector & Add to Cart & Wishlist */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', margin: '1rem 0', flexWrap: 'wrap' }}>
            
            {/* Quantity */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              backgroundColor: 'var(--bg-secondary)',
              height: '48px'
            }}>
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ width: '36px', height: '100%', color: 'var(--text-secondary)' }}>-</button>
              <span style={{ width: '36px', textAlign: 'center', fontSize: '0.95rem', fontWeight: '600' }}>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} style={{ width: '36px', height: '100%', color: 'var(--text-secondary)' }}>+</button>
            </div>

            {/* Add to Bag */}
            <button 
              onClick={handleAddToCart}
              className="gold-btn"
              style={{ flexGrow: 1, height: '48px', justifyContent: 'center', minWidth: '180px' }}
            >
              {added ? <><Check className="w-4 h-4" /> Added</> : <><ShoppingBag className="w-4 h-4" /> Add to Bag</>}
            </button>

            {/* Wishlist Heart Toggle */}
            <button
              onClick={() => onToggleWishlist(product)}
              style={{
                height: '48px',
                width: '48px',
                border: '1px solid ' + (isLiked ? '#ff4d4d' : 'var(--border-color)'),
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isLiked ? '#ff4d4d' : 'var(--text-secondary)',
                backgroundColor: isLiked ? 'rgba(255, 77, 77, 0.05)' : 'transparent',
                transition: 'border-color var(--transition-fast), color var(--transition-fast)'
              }}
              title={isLiked ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <Heart className="w-5 h-5" style={{ fill: isLiked ? '#ff4d4d' : 'none' }} />
            </button>
          </div>

          {/* Pricing Invoice Decomposition */}
          {product.pricing_breakdown && (
            <div className="glass-panel gold-border" style={{ padding: '1.25rem', backgroundColor: 'rgba(212, 175, 55, 0.01)' }}>
              <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-gold)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <DollarSign className="w-4 h-4" /> Dynamic Price Breakdown (Bullion rates sync)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Metal Cost ({product.pricing_breakdown.metal_weight} @ {product.pricing_breakdown.metal_rate_per_g})</span>
                  <span>${product.pricing_breakdown.metal_cost?.toFixed(2)}</span>
                </div>
                {product.pricing_breakdown.gemstone_appraisal > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Gemstone Appraisal Value</span>
                    <span>${product.pricing_breakdown.gemstone_appraisal?.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Artisanal Craftsmanship Fee</span>
                  <span>${product.pricing_breakdown.craftsmanship_fee?.toFixed(2)}</span>
                </div>
                <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '0.25rem 0' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'white', fontWeight: 'bold' }}>
                  <span>Total Dynamic Price</span>
                  <span>${product.price}</span>
                </div>
              </div>
            </div>
          )}

          {/* Specifications Table */}
          <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '0.5rem' }}>
            <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', color: 'white' }}>
              Atelier Specifications
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Material Composition</span>
                <span style={{ color: 'white', fontWeight: '500' }}>{product.material}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Gemstone Accent</span>
                <span style={{ color: 'white', fontWeight: '500' }}>{product.gemstone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Dimensions / Sizing</span>
                <span style={{ color: 'white', fontWeight: '500' }}>{product.specs.dimensions}</span>
              </div>
              {product.specs.carats !== 'N/A' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Carat Weight</span>
                  <span style={{ color: 'white', fontWeight: '500' }}>{product.specs.carats}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Metal Weight</span>
                <span style={{ color: 'white', fontWeight: '500' }}>{product.specs.weight}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ======================================================================= */}
      {/* RATINGS & REVIEWS CHARTS BLOCK */}
      {/* ======================================================================= */}
      <section style={{ borderTop: '1px solid var(--border-color)', paddingTop: '4rem', marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-serif)', marginBottom: '2.5rem' }}>Client Reviews</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3.5rem' }}>
          {/* Left star stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '3rem', fontWeight: 'bold', color: 'white' }}>4.8</span>
              <span style={{ color: 'var(--text-secondary)' }}>out of 5</span>
            </div>
            
            {/* Stars distributions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { stars: 5, pct: 85 },
                { stars: 4, pct: 10 },
                { stars: 3, pct: 5 },
                { stars: 2, pct: 0 },
                { stars: 1, pct: 0 }
              ].map(row => (
                <div key={row.stars} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem' }}>
                  <span style={{ width: '40px', color: 'var(--text-secondary)' }}>{row.stars} star</span>
                  <div style={{ flexGrow: 1, height: '6px', backgroundColor: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${row.pct}%`, height: '100%', backgroundColor: 'var(--accent-gold)' }}></div>
                  </div>
                  <span style={{ width: '30px', color: 'var(--text-secondary)', textAlign: 'right' }}>{row.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right reviews list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '600', color: 'white' }}>Victoria S.</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>2 weeks ago</span>
              </div>
              <div style={{ display: 'flex', color: '#ffc107', gap: '2px', marginBottom: '0.5rem' }}>
                <Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" />
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Absolutely stunning pieces. The packaging was beautiful and matching of high-end luxury stores.
              </p>
            </div>
            
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '600', color: 'white' }}>Christopher M.</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>1 month ago</span>
              </div>
              <div style={{ display: 'flex', color: '#ffc107', gap: '2px', marginBottom: '0.5rem' }}>
                <Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" />
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                My partner loved the ring. Customer support resized it for free within 4 days. Incredible craftsmanship!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Complete the Look (AI Recommendations) */}
      {complete_the_look && complete_the_look.length > 0 && (
        <section style={{ borderTop: '1px solid var(--border-color)', paddingTop: '4rem', marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
            <Sparkles className="w-5 h-5 text-accent-gold" />
            <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-serif)' }}>Complete the Look</h2>
            <span style={{
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              background: 'var(--accent-gold-muted)',
              color: 'var(--accent-gold)',
              padding: '0.2rem 0.5rem',
              borderRadius: '2px',
              fontWeight: '600'
            }}>
              98% Style Match
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '2rem'
          }}>
            {complete_the_look.map((item) => (
              <ProductCard 
                key={item.id} 
                product={item} 
                onViewDetails={(id) => {
                  onViewProductDetails(id);
                }} 
              />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed Items Section */}
      {recentProducts.length > 0 && (
        <section style={{ borderTop: '1px solid var(--border-color)', paddingTop: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-serif)' }}>Recently Viewed</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '2rem'
          }}>
            {recentProducts.map((item) => (
              <ProductCard 
                key={item.id} 
                product={item} 
                onViewDetails={(id) => {
                  onViewProductDetails(id);
                }} 
              />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
