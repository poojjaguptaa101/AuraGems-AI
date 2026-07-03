import React, { useState } from 'react';
import { ShoppingBag, X, Trash2, ShieldCheck, CreditCard, Sparkles } from 'lucide-react';
import { useCart } from './context/CartContext';

// Components & Pages
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductListing from './pages/ProductListing';
import ProductDetails from './pages/ProductDetails';
import AIAssistantPage from './pages/AIAssistantPage';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(0); // 0: Idle, 1: Checkout Form, 2: Success

  // Cart operations
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

  // Mock checkout states
  const [cName, setCName] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cAddress, setCAddress] = useState('');

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!cName || !cEmail || !cAddress) return;
    setCheckoutStep(2); // Show success screen
    clearCart();
  };

  const handleViewProduct = (productId) => {
    setSelectedProductId(productId);
    setCurrentPage('product-details');
  };

  // Render correct page component based on currentPage state
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home setCurrentPage={setCurrentPage} setSelectedProductId={setSelectedProductId} />;
      case 'shop':
        return <ProductListing onViewProductDetails={handleViewProduct} />;
      case 'product-details':
        return (
          <ProductDetails 
            productId={selectedProductId} 
            onBack={() => setCurrentPage('shop')} 
            onViewProductDetails={handleViewProduct} 
          />
        );
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      
      {/* Header Navigation */}
      <Navbar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        onOpenCart={() => setCartOpen(true)} 
      />

      {/* Main Content Area */}
      <main style={{ flexGrow: 1, paddingBottom: '4rem' }}>
        {renderPage()}
      </main>

      {/* Footer Links */}
      <Footer setCurrentPage={setCurrentPage} />

      {/* ======================================================================= */}
      {/* SHOPPING BAG DRAWER (SLIDE OVER) */}
      {/* ======================================================================= */}
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
          {/* Drawer Panel */}
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
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingBag className="w-5 h-5 text-accent-gold" />
                <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)' }}>Shopping Bag</h3>
              </div>
              <button onClick={() => setCartOpen(false)} style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.currentTarget.style.color='white'} onMouseLeave={(e) => e.currentTarget.style.color='var(--text-secondary)'}>
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Drawer Cart Items list */}
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
                      
                      {/* Quantity control */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '2px', height: '28px' }}>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} style={{ width: '24px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>-</button>
                          <span style={{ width: '24px', fontSize: '0.8rem', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} style={{ width: '24px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>+</button>
                        </div>
                        <button onClick={() => removeFromCart(item.product.id)} style={{ color: 'var(--text-muted)' }} onMouseEnter={(e) => e.currentTarget.style.color='red'} onMouseLeave={(e) => e.currentTarget.style.color='var(--text-muted)'}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer Details */}
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

      {/* ======================================================================= */}
      {/* SECURE CHECKOUT DIALOG MODAL */}
      {/* ======================================================================= */}
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
          <div className="glass-panel" style={{
            width: '90%',
            maxWidth: '500px',
            backgroundColor: 'var(--bg-secondary)',
            padding: '2.5rem 2rem',
            borderRadius: '12px',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button 
              onClick={() => { setCheckoutStep(0); setCName(''); setCEmail(''); setCAddress(''); }}
              style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--text-secondary)' }}
            >
              <X className="w-5 h-5" />
            </button>

            {/* CHECKOUT STEP 1: FORM */}
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

            {/* CHECKOUT STEP 2: SUCCESS */}
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
                    Thank you for your purchase. An order confirmation containing receipt details has been sent to your email. Your handcrafted order will be packaged in our signature box and dispatched shortly with fully insured shipping.
                  </p>
                </div>
                <button 
                  onClick={() => { setCheckoutStep(0); setCartOpen(false); setCurrentPage('home'); }} 
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

      {/* Global CSS keyframe inject for animations in App */}
      <style>{`
        @keyframes fadeIn { 
          from { opacity: 0; } 
          to { opacity: 1; } 
        }
        @keyframes slideInRight { 
          from { transform: translateX(100%); } 
          to { transform: translateX(0); } 
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(212, 175, 55, 0); }
          100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
        }
      `}</style>
    </div>
  );
}
