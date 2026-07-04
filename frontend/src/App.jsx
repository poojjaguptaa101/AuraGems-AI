import React, { useState, useEffect } from 'react';
import { ShoppingBag, X, Trash2, ShieldCheck, CreditCard, Sparkles, Settings, Heart, Star, Eye } from 'lucide-react';
import { useCart } from './context/CartContext';
import { getWishlist, addToWishlist, removeFromWishlist, syncCart, fetchCart } from './api';

// Components & Pages
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductListing from './pages/ProductListing';
import ProductDetails from './pages/ProductDetails';
import AIAssistantPage from './pages/AIAssistantPage';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import TryOn from './pages/TryOn';
import AuthModal from './components/AuthModal';
import DevConsole from './components/DevConsole';

export default function App() {
  const [appLoading, setAppLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(0); 

  // Authentication states
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);

  // Dev Console states
  const [devConsoleOpen, setDevConsoleOpen] = useState(false);

  // Wishlist state
  const [wishlist, setWishlist] = useState([]);

  // Quick View states
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Confetti particles list
  const [confetti, setConfetti] = useState([]);

  // Cart operations
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart, addToCart } = useCart();

  // Mock checkout fields
  const [cName, setCName] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cAddress, setCAddress] = useState('');

  // 1. Initial startup loading timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // 2. Cursor Spotlight coordinate tracker
  useEffect(() => {
    const handleMouseMove = (e) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 3. User Session restore
  useEffect(() => {
    const savedUser = localStorage.getItem('auragems_user');
    const savedToken = localStorage.getItem('auragems_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);

  // 4. Load User specific data (wishlist + DB cart sync)
  useEffect(() => {
    async function loadUserData() {
      if (token) {
        const favs = await getWishlist(token);
        setWishlist(favs);
        
        const dbCart = await fetchCart(token);
        if (dbCart && dbCart.length > 0) {
          dbCart.forEach(item => {
            addToCart(item.product, item.quantity);
          });
        }
      } else {
        setWishlist([]);
      }
    }
    loadUserData();
  }, [token]);

  // 5. Sync cart state changes with database
  useEffect(() => {
    if (token && cart.length > 0) {
      syncCart(cart, token);
    }
  }, [cart, token]);

  const handleAuthSuccess = (userProfile, sessionToken) => {
    setUser(userProfile);
    setToken(sessionToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('auragems_token');
    localStorage.removeItem('auragems_user');
    setUser(null);
    setToken(null);
    clearCart();
    setWishlist([]);
    setCurrentPage('home');
  };

  const handleToggleWishlist = async (product) => {
    if (!token) {
      setAuthOpen(true);
      return;
    }
    const exists = wishlist.some(item => item.id === product.id);
    if (exists) {
      setWishlist(prev => prev.filter(item => item.id !== product.id));
      await removeFromWishlist(product.id, token);
    } else {
      setWishlist(prev => [...prev, product]);
      await addToWishlist(product.id, token);
    }
  };

  // Trigger celebration sparkles
  const triggerConfetti = () => {
    const pieces = [];
    for (let i = 0; i < 60; i++) {
      pieces.push({
        id: i,
        left: Math.random() * 100 + "vw",
        delay: Math.random() * 1.5 + "s",
        drift: (Math.random() * 100 - 50) + "px",
        color: Math.random() > 0.5 ? '#d4af37' : '#f7e7ce'
      });
    }
    setConfetti(pieces);
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!cName || !cEmail || !cAddress) return;
    setCheckoutStep(2); // Success step
    triggerConfetti();
    clearCart();
  };

  const handleViewProduct = (productId) => {
    setQuickViewProduct(null);
    setSelectedProductId(productId);
    setCurrentPage('product-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home setCurrentPage={setCurrentPage} setSelectedProductId={setSelectedProductId} />;
      case 'shop':
        return (
          <ProductListing 
            onViewProductDetails={handleViewProduct} 
            wishlistItems={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onQuickView={(p) => setQuickViewProduct(p)}
          />
        );
      case 'product-details':
        return (
          <ProductDetails 
            productId={selectedProductId} 
            onBack={() => setCurrentPage('shop')} 
            onViewProductDetails={handleViewProduct} 
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
          />
        );
      case 'try-on':
        return <TryOn />;
      case 'ai-assistant':
        return (
          <AIAssistantPage 
            onViewProductDetails={handleViewProduct} 
            setCurrentPage={setCurrentPage}
            setSelectedProductId={setSelectedProductId}
          />
        );
      case 'about':
        return <AboutUs />;
      case 'contact':
        return <Contact />;
      default:
        return <Home setCurrentPage={setCurrentPage} setSelectedProductId={setSelectedProductId} />;
    }
  };

  // Free shipping variables
  const freeShippingThreshold = 2000;
  const freeShippingProgress = Math.min(100, (cartTotal / freeShippingThreshold) * 100);

  if (appLoading) {
    return (
      <div className="loader-overlay">
        <Sparkles className="loader-diamond" />
        <h2 style={{ fontSize: '1.85rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '1.5rem', color: 'white', fontFamily: 'var(--font-serif)' }}>
          AURA GEMS AI
        </h2>
        <span style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Loading Luxury...
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      
      {/* Dynamic Cursor Spotlight & Gold Dust particles */}
      <div className="spotlight-bg"></div>
      <div className="gold-dust"></div>

      {/* Header Navigation */}
      <Navbar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        onOpenCart={() => setCartOpen(true)}
        user={user}
        onLogout={handleLogout}
        onOpenAuth={() => setAuthOpen(true)}
        wishlistCount={wishlist.length}
      />

      {/* Main Content Area */}
      <main style={{ flexGrow: 1, paddingBottom: '4rem' }}>
        {renderPage()}
      </main>

      {/* Footer */}
      <Footer setCurrentPage={setCurrentPage} />

      {/* FLOATING DEVELOPER PANEL BUTTON */}
      <button
        onClick={() => setDevConsoleOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          background: 'var(--bg-tertiary)',
          color: 'var(--accent-gold)',
          border: '1px solid var(--border-gold)',
          boxShadow: 'var(--shadow-gold)',
          borderRadius: '50%',
          width: '52px',
          height: '52px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 998,
          cursor: 'pointer',
          animation: 'pulse 3s infinite'
        }}
        title="Open AI Developer Config Panel"
      >
        <Settings className="w-5 h-5" style={{ animation: 'spin 10s linear infinite' }} />
      </button>

      {/* ======================================================================= */}
      {/* MODALS & DRAWERS */}
      {/* ======================================================================= */}
      
      {/* 1. Auth Overlay */}
      {authOpen && (
        <AuthModal 
          onClose={() => setAuthOpen(false)} 
          onAuthSuccess={handleAuthSuccess} 
        />
      )}

      {/* 2. Dev Debug Panel */}
      <DevConsole 
        isOpen={devConsoleOpen} 
        onClose={() => setDevConsoleOpen(false)} 
      />

      {/* 3. Quick View Modal Overlay */}
      {quickViewProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 1060,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn var(--transition-fast) forwards'
        }}
        onClick={() => setQuickViewProduct(null)}
        >
          <div className="glass-panel gold-border" style={{
            width: '90%',
            maxWidth: '750px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '12px',
            padding: '2.5rem',
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2.5rem'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setQuickViewProduct(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--text-secondary)' }}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left side image */}
            <div style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src={quickViewProduct.image_url} 
                alt={quickViewProduct.name}
                style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
              />
            </div>

            {/* Right side info details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
              <div>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--accent-gold)', letterSpacing: '0.05em' }}>
                  {quickViewProduct.material} • {quickViewProduct.category}
                </span>
                <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-serif)', marginTop: '0.25rem', color: 'white' }}>
                  {quickViewProduct.name}
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.35rem', fontWeight: 'bold', color: 'white' }}>${quickViewProduct.price.toLocaleString()}</span>
                <div style={{ display: 'flex', alignItems: 'center', color: '#ffc107', fontSize: '0.8rem', gap: '2px', borderLeft: '1px solid var(--border-color)', paddingLeft: '0.5rem', marginLeft: '0.5rem' }}>
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span style={{ color: 'white', fontWeight: '500' }}>4.8</span>
                  <span style={{ color: 'var(--text-muted)' }}>(18 reviews)</span>
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {quickViewProduct.description}
              </p>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <strong>Sizes available:</strong> US 5, US 6, US 7, US 8 (Handcrafted resize)
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  onClick={() => { addToCart(quickViewProduct); setQuickViewProduct(null); }}
                  className="gold-btn"
                  style={{ flexGrow: 1, justifyContent: 'center', height: '40px' }}
                >
                  Add To Bag
                </button>
                <button 
                  onClick={() => handleViewProduct(quickViewProduct.id)}
                  className="outline-btn"
                  style={{ flexGrow: 1, justifyContent: 'center', height: '40px' }}
                >
                  Full Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Shopping Bag Drawer */}
      {cartOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          zIndex: 999,
          display: 'flex',
          justifyContent: 'flex-end',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn var(--transition-fast) forwards'
        }}
        onClick={() => setCartOpen(false)}
        >
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '440px',
            height: '100%',
            backgroundColor: 'var(--bg-secondary)',
            borderLeft: '1px solid var(--border-color)',
            borderRadius: 0,
            display: 'flex',
            flexDirection: 'column',
            padding: '2rem',
            boxShadow: 'var(--shadow-lg)',
            animation: 'slideInRight var(--transition-normal) forwards'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingBag className="w-5 h-5 text-accent-gold" />
                <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)' }}>Shopping Bag</h3>
              </div>
              <button onClick={() => setCartOpen(false)} style={{ color: 'var(--text-secondary)' }}>
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Free Shipping Progress bar */}
            {cart.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Priority Delivery Meter</span>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>{Math.round(freeShippingProgress)}%</span>
                </div>
                <div style={{ width: '100%', height: '5px', backgroundColor: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${freeShippingProgress}%`, height: '100%', background: 'linear-gradient(90deg, #aa7c11, #d4af37)', borderRadius: '3px', transition: 'width 0.4s ease' }}></div>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Sparkles className="w-3 h-3 text-accent-gold" />
                  {cartTotal < freeShippingThreshold 
                    ? `Spend $${(freeShippingThreshold - cartTotal).toLocaleString()} more for free priority shipping!`
                    : "Complimentary priority courier delivery unlocked!"
                  }
                </span>
              </div>
            )}

            <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingRight: '4px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                  <ShoppingBag className="w-12 h-12 text-text-muted" />
                  <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Your shopping bag is empty.</span>
                  <button 
                    onClick={() => { setCartOpen(false); setCurrentPage('shop'); }} 
                    className="outline-btn"
                    style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                    <img 
                      src={item.product.image_url} 
                      alt={item.product.name} 
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{item.product.material}</span>
                      <h4 style={{ fontSize: '0.9rem', color: 'white', fontFamily: 'var(--font-serif)', lineHeight: '1.3' }}>{item.product.name}</h4>
                      <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'white', marginTop: '4px' }}>${item.product.price.toLocaleString()}</span>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '2px', height: '28px' }}>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} style={{ width: '24px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>-</button>
                          <span style={{ width: '24px', fontSize: '0.8rem', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} style={{ width: '24px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>+</button>
                        </div>
                        <button onClick={() => removeFromCart(item.product.id)} style={{ color: 'var(--text-muted)' }}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                  <span style={{ fontWeight: 'bold', color: 'white' }}>${cartTotal.toLocaleString()}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                  <ShieldCheck className="w-3.5 h-3.5 text-accent-gold" />
                  <span>Complimentary packaging & insured shipping included.</span>
                </div>
                <button 
                  onClick={() => setCheckoutStep(1)} 
                  className="gold-btn" 
                  style={{ justifyContent: 'center', height: '48px' }}
                >
                  Proceed to Secure Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Checkout Dialog Modal */}
      {checkoutStep > 0 && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(6px)',
          animation: 'fadeIn var(--transition-fast) forwards'
        }}>
          {/* Confetti sparkle overlay on checkout success step */}
          {checkoutStep === 2 && confetti.map(piece => (
            <div 
              key={piece.id}
              className="confetti-piece"
              style={{
                left: piece.left,
                animationDelay: piece.delay,
                backgroundColor: piece.color,
                '--drift-x': piece.drift
              }}
            />
          ))}

          <div className="glass-panel" style={{
            width: '90%',
            maxWidth: '500px',
            backgroundColor: 'var(--bg-secondary)',
            padding: '2.5rem 2rem',
            borderRadius: '12px',
            position: 'relative'
          }}>
            <button 
              onClick={() => { setCheckoutStep(0); setCName(''); setCEmail(''); setCAddress(''); setConfetti([]); }}
              style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--text-secondary)' }}
            >
              <X className="w-5 h-5" />
            </button>

            {checkoutStep === 1 && (
              <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-serif)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CreditCard className="w-5 h-5 text-accent-gold" /> Secure Checkout
                </h3>
                <div style={{ height: '1px', backgroundColor: 'var(--border-color)' }}></div>
                
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" value={cName} onChange={(e) => setCName(e.target.value)} className="form-input" placeholder="E.g., Jane Doe" required />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" value={cEmail} onChange={(e) => setCEmail(e.target.value)} className="form-input" placeholder="E.g., jane@example.com" required />
                </div>

                <div className="form-group">
                  <label className="form-label">Shipping Address</label>
                  <input type="text" value={cAddress} onChange={(e) => setCAddress(e.target.value)} className="form-input" placeholder="Street Address, City, Zip Code" required />
                </div>

                <div style={{
                  background: 'var(--bg-tertiary)',
                  padding: '1rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '0.5rem'
                }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Charge:</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent-gold)' }}>${cartTotal.toLocaleString()}</span>
                </div>

                <button type="submit" className="gold-btn" style={{ justifyContent: 'center', height: '48px', marginTop: '0.5rem' }}>
                  Place Order
                </button>
              </form>
            )}

            {checkoutStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.5rem', padding: '1rem 0' }}>
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: 'var(--accent-gold-muted)',
                  border: '1px solid var(--border-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'pulse 2s infinite'
                }}>
                  <Sparkles className="w-8 h-8 text-accent-gold" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.65rem', fontFamily: 'var(--font-serif)', color: 'white', marginBottom: '0.5rem' }}>Order Placed Successfully</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>
                    Thank you for your purchase. An order confirmation containing receipt details has been sent to your email. Your order will be packaged in our signature box and dispatched shortly with fully insured shipping.
                  </p>
                </div>
                <button 
                  onClick={() => { setCheckoutStep(0); setCartOpen(false); setCurrentPage('home'); setConfetti([]); }} 
                  className="gold-btn"
                  style={{ width: '100%', justifyContent: 'center', height: '44px' }}
                >
                  Return to Home
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
