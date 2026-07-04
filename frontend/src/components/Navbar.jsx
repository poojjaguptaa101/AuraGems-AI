import React, { useState, useEffect } from 'react';
import { ShoppingBag, Sparkles, MessageSquare, Menu, X, Camera, Heart, User, LogOut, TrendingUp } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { fetchBullionRates } from '../api';

export default function Navbar({ 
  currentPage, 
  setCurrentPage, 
  onOpenCart, 
  user, 
  onLogout, 
  onOpenAuth,
  wishlistCount 
}) {
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tickerRates, setTickerRates] = useState(null);

  // Load bullion prices ticker
  useEffect(() => {
    async function loadRates() {
      const data = await fetchBullionRates();
      if (data && data.rates) {
        setTickerRates(data.rates);
      }
    }
    loadRates();
    const interval = setInterval(loadRates, 30000); // refresh rates every 30s
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'shop', label: 'Shop Catalogue' },
    { id: 'try-on', label: 'Virtual Try-On', icon: <Camera className="w-3.5 h-3.5 text-accent-gold" /> },
    { id: 'ai-assistant', label: 'AI Assistant', icon: <Sparkles className="w-3.5 h-3.5 text-accent-gold" /> },
    { id: 'about', label: 'Our Craft' },
    { id: 'contact', label: 'Contact' }
  ];

  const handleNavClick = (pageId) => {
    setCurrentPage(pageId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      
      {/* 1. SCROLLING COMMODITIES TICKER */}
      {tickerRates && (
        <div style={{
          backgroundColor: '#050507',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '0.35rem 0',
          fontSize: '0.7rem',
          color: 'var(--text-secondary)',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-gold)' }}>
            <TrendingUp className="w-3.5 h-3.5" />
            <span style={{ fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bullion Live:</span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', fontFamily: 'monospace' }}>
            <span>18k Gold: ${tickerRates["18k Yellow Gold"]?.toFixed(2)}/g</span>
            <span>White Gold: ${tickerRates["18k White Gold"]?.toFixed(2)}/g</span>
            <span>Platinum: ${tickerRates["Platinum"]?.toFixed(2)}/g</span>
            <span>Silver: ${tickerRates["Sterling Silver"]?.toFixed(2)}/g</span>
          </div>
        </div>
      )}

      {/* 2. MAIN HEADER BAR */}
      <nav className="glass-panel" style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        borderRadius: 0,
        padding: '1rem 0',
        background: 'rgba(10, 10, 12, 0.9)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Logo */}
          <button 
            onClick={() => handleNavClick('home')}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
          >
            <span style={{ 
              fontFamily: 'var(--font-serif)', 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              background: 'linear-gradient(135deg, #ffffff 0%, #d4af37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              AuraGems AI
            </span>
            <span style={{ fontSize: '0.55rem', letterSpacing: '0.45em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginTop: '-3px' }}>
              Fine Jewellery
            </span>
          </button>

          {/* Desktop Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }} className="desktop-only">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                style={{
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: currentPage === link.id ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  fontWeight: currentPage === link.id ? '600' : '400',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  borderBottom: currentPage === link.id ? '1px solid var(--accent-gold)' : '1px solid transparent',
                  paddingBottom: '2px',
                  transition: 'color var(--transition-fast)'
                }}
              >
                {link.icon}
                {link.label}
              </button>
            ))}
          </div>

          {/* Action Icons Panel */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            
            {/* Wishlist */}
            <button 
              onClick={() => handleNavClick('shop')} // Filters wishlist in Shop page
              style={{ position: 'relative', color: 'var(--text-secondary)' }}
              title="View Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-6px',
                  background: '#ff4d4d',
                  color: '#ffffff',
                  fontSize: '0.6rem',
                  fontWeight: 'bold',
                  borderRadius: '50%',
                  width: '15px',
                  height: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {wishlistCount}
                </span>
              )}
            </button>
            
            {/* Shopping cart */}
            <button 
              onClick={onOpenCart}
              style={{ position: 'relative', color: 'var(--text-secondary)' }}
              title="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-6px',
                  background: 'var(--accent-gold)',
                  color: '#0a0a0c',
                  fontSize: '0.6rem',
                  fontWeight: 'bold',
                  borderRadius: '50%',
                  width: '15px',
                  height: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* Profile Authenticated info */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'white', fontWeight: '500' }} className="desktop-only">
                  {user.username}
                </span>
                <button 
                  onClick={onLogout} 
                  title="Sign Out"
                  style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ff4d4d'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={onOpenAuth}
                style={{ 
                  fontSize: '0.75rem', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em', 
                  border: '1px solid var(--border-color)',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '4px',
                  color: 'white'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                Sign In
              </button>
            )}

            {/* Mobile menu trigger */}
            <button 
              className="mobile-only-btn" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ color: 'var(--text-secondary)', display: 'none' }}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu Drawer */}
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
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: currentPage === link.id ? 'var(--accent-gold)' : 'var(--text-primary)',
                  fontWeight: currentPage === link.id ? '600' : '400',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {link.icon}
                {link.label}
              </button>
            ))}
          </div>
        )}

        <style>{`
          @media (max-width: 768px) {
            .desktop-only { display: none !important; }
            .mobile-only-btn { display: block !important; }
          }
        `}</style>
      </nav>
    </div>
  );
}
