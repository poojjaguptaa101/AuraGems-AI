import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowLeft, RefreshCw, Sparkles, Check } from 'lucide-react';
import { getProductById } from '../api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetails({ productId, onBack, onViewProductDetails }) {
  const { addToCart } = useCart();
  const [data, setData] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function loadDetails() {
      setLoading(true);
      const res = await getProductById(productId);
      setData(res);
      setQuantity(1);
      setLoading(false);
      setAdded(false);
    }
    if (productId) {
      loadDetails();
    }
  }, [productId]);

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
        onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <ArrowLeft className="w-4 h-4" /> Back to Catalogue
      </button>

      {/* Main product showcase */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', marginBottom: '6rem' }}>
        
        {/* Left Column: Image */}
        <div className="glass-panel" style={{
          overflow: 'hidden',
          borderRadius: '8px',
          backgroundColor: 'var(--bg-tertiary)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative'
        }}>
          <img 
            src={product.image_url} 
            alt={product.name}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '480px',
              objectFit: 'cover'
            }}
          />
        </div>

        {/* Right Column: Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <span style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '500' }}>
              {product.material} • {product.category}
            </span>
            <h1 style={{ fontSize: '2.25rem', fontFamily: 'var(--font-serif)', marginTop: '0.5rem', lineHeight: '1.2' }}>
              {product.name}
            </h1>
          </div>

          <span style={{ fontSize: '1.75rem', fontWeight: '600', color: 'white' }}>
            ${product.price.toLocaleString()}
          </span>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.7' }}>
            {product.description}
          </p>

          {/* Quantity Selector & Add to Cart */}
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', margin: '1rem 0' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              backgroundColor: 'var(--bg-secondary)',
              height: '48px'
            }}>
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                style={{ width: '40px', height: '100%', color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
              >
                -
              </button>
              <span style={{ width: '40px', textAlign: 'center', fontSize: '0.95rem', fontWeight: '600' }}>
                {quantity}
              </span>
              <button 
                onClick={() => setQuantity(q => q + 1)}
                style={{ width: '40px', height: '100%', color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
              >
                +
              </button>
            </div>

            <button 
              onClick={handleAddToCart}
              className="gold-btn"
              style={{ flexGrow: 1, height: '48px', justifyContent: 'center' }}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" /> Added to Bag
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" /> Add to Shopping Bag
                </>
              )}
            </button>
          </div>

          {/* Specifications Table */}
          <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1rem' }}>
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
              {product.specs.clarity !== 'N/A' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Clarity & Grade</span>
                  <span style={{ color: 'white', fontWeight: '500' }}>{product.specs.clarity} ({product.specs.color})</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Complete the Look (AI Recommendations) */}
      {complete_the_look && complete_the_look.length > 0 && (
        <section style={{ borderTop: '1px solid var(--border-color)', paddingTop: '4rem' }}>
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
              AI Recommended
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2rem'
          }}>
            {complete_the_look.map((item) => (
              <ProductCard 
                key={item.id} 
                product={item} 
                onViewDetails={(id) => {
                  onViewProductDetails(id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} 
              />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
