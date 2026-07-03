import React, { useState } from 'react';
import { ShoppingBag, Sparkles, MessageSquare, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Navbar({ currentPage, setCurrentPage, onOpenCart }) {
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'shop', label: 'Shop Catalogue' },
    { id: 'ai-assistant', label: 'AI Assistant', icon: <Sparkles className="w-3.5 h-3.5 text-accent-gold" /> },
    { id: 'about', label: 'Our Craft' },
    { id: 'contact', label: 'Contact Us' }
  ];

  const handleNavClick = (pageId) => {
    setCurrentPage(pageId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      borderRadius: 0,
      padding: '1.25rem 0',
      background: 'rgba(10, 10, 12, 0.85)'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Brand Logo */}
        <button 
          onClick={() => handleNavClick('home')}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
        >
          <span style={{ 
            fontFamily: 'var(--font-serif)', 
            fontSize: '1.65rem', 
            fontWeight: '600', 
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            background: 'linear-gradient(135deg, #ffffff 0%, #d4af37 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            AuraGems AI
          </span>
          <span style={{ fontSize: '0.6rem', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginTop: '-2px' }}>
            Fine Jewellery
          </span>
        </button>

        {/* Desktop Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }} className="desktop-only">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              style={{
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: currentPage === link.id ? 'var(--accent-gold)' : 'var(--text-secondary)',
                fontWeight: currentPage === link.id ? '600' : '400',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                borderBottom: currentPage === link.id ? '1px solid var(--accent-gold)' : '1px solid transparent',
                paddingBottom: '2px',
                transition: 'color var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                if (currentPage !== link.id) e.target.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                if (currentPage !== link.id) e.target.style.color = 'var(--text-secondary)';
              }}
            >
              {link.icon}
              {link.label}
            </button>
          ))}
        </div>

        {/* Action Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button 
            onClick={() => handleNavClick('ai-assistant')}
            title="AI Assistant Hub"
            style={{ color: 'var(--text-secondary)', transition: 'color var(--transition-fast)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-gold)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          
          <button 
            onClick={onOpenCart}
            style={{ position: 'relative', color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-8px',
                background: 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)',
                color: '#0a0a0c',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                borderRadius: '50%',
                width: '17px',
                height: '17px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
              }}>
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-only-btn" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ color: 'var(--text-secondary)', display: 'none' }}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="glass-panel" style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          borderLeft: 'none',
          borderRight: 'none',
          borderBottom: '1px solid var(--border-color)',
          borderRadius: 0,
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          background: 'var(--bg-secondary)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              style={{
                fontSize: '0.95rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: currentPage === link.id ? 'var(--accent-gold)' : 'var(--text-primary)',
                fontWeight: currentPage === link.id ? '600' : '400',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                textAlign: 'left',
                padding: '0.5rem 0'
              }}
            >
              {link.icon}
              {link.label}
            </button>
          ))}
        </div>
      )}

      {/* Custom Inline styles to handle media queries for navbar responsive display */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-only-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
