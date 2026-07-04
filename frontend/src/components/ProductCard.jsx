import React from 'react';
import { ShoppingBag, Eye, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, onViewDetails, onQuickView }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleQuickViewClick = (e) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  return (
    <div 
      className="glass-panel animate-fade-in" 
      onClick={() => onViewDetails(product.id)}
      style={{
        cursor: 'pointer',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'transform var(--transition-normal), border-color var(--transition-normal), box-shadow var(--transition-normal)',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.borderColor = 'var(--accent-gold)';
        e.currentTarget.style.boxShadow = 'var(--shadow-gold)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border-color)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
    >
      {/* Gemstone Tag */}
      {product.gemstone !== 'None' && (
        <span style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: 'rgba(10, 10, 12, 0.85)',
          color: 'var(--accent-gold)',
          border: '1px solid var(--border-gold)',
          padding: '0.2rem 0.5rem',
          fontSize: '0.65rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontWeight: 'bold',
          borderRadius: '2px',
          zIndex: 2
        }}>
          {product.gemstone}
        </span>
      )}

      {/* Image Container */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '100%', overflow: 'hidden', backgroundColor: 'var(--bg-tertiary)' }}>
        <img 
          src={product.image_url} 
          alt={product.name}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease'
          }}
          className="zoom-image-target"
        />
        {/* Overlay hover details */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          opacity: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transition: 'opacity var(--transition-fast)',
          zIndex: 1
        }}
        className="card-overlay"
        >
          <button 
            onClick={handleQuickViewClick}
            style={{
              background: '#ffffff',
              color: '#0a0a0c',
              borderRadius: '30px',
              padding: '0.6rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: 'var(--shadow-md)',
              fontSize: '0.75rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.background = 'var(--accent-gold)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#ffffff'; }}
          >
            <Eye className="w-4 h-4" /> Quick View
          </button>
        </div>
      </div>

      {/* Product Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
            {product.material}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#ffc107', fontSize: '0.7rem' }}>
            <Star className="w-3 h-3 fill-current" />
            <span style={{ color: 'white', fontWeight: '500' }}>4.8</span>
          </div>
        </div>

        <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', flexGrow: 1, fontFamily: 'var(--font-serif)', color: 'white', lineHeight: '1.3' }}>
          {product.name}
        </h3>

        {/* Sizes Indicator */}
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          Sizes: US 6, 7, 8 (Resizable)
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginTop: 'auto',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '0.75rem'
        }}>
          <span style={{ fontSize: '1.05rem', fontWeight: '600', color: '#ffffff' }}>
            ${product.price.toLocaleString()}
          </span>
          
          <button 
            onClick={handleAddToCart}
            style={{
              background: 'var(--accent-gold-muted)',
              color: 'var(--accent-gold)',
              border: '1px solid var(--border-gold)',
              borderRadius: '4px',
              padding: '0.45rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background var(--transition-fast), color var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-gold)';
              e.currentTarget.style.color = '#0a0a0c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--accent-gold-muted)';
              e.currentTarget.style.color = 'var(--accent-gold)';
            }}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
      <style>{`
        .glass-panel:hover .card-overlay {
          opacity: 1 !important;
        }
        .glass-panel:hover .zoom-image-target {
          transform: scale(1.10) !important;
        }
      `}</style>
    </div>
  );
}
