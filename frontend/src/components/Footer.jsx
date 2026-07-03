import React from 'react';
import { Mail, Phone, MapPin, Sparkles } from 'lucide-react';

export default function Footer({ setCurrentPage }) {
  const handleNavClick = (pageId) => {
    setCurrentPage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={{
      backgroundColor: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-color)',
      padding: '4.5rem 0 2rem 0',
      marginTop: '6rem'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3.5rem'
        }}>
          {/* Brand Info */}
          <div>
            <span style={{ 
              fontFamily: 'var(--font-serif)', 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              background: 'linear-gradient(135deg, #ffffff 0%, #d4af37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'block',
              marginBottom: '1rem'
            }}>
              AURAGEMS AI
            </span>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Crafting timeless luxury and exquisite diamond collections. Empowered by artificial intelligence to provide your perfect styling matches.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => handleNavClick('ai-assistant')}
                className="outline-btn" 
                style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', borderRadius: '4px' }}
              >
                <Sparkles className="w-3.5 h-3.5" /> AI Assistant Hub
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem', color: 'white' }}>
              Collections
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <button onClick={() => handleNavClick('shop')} style={{ textAlign: 'left' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>All Jewellery</button>
              <button onClick={() => handleNavClick('shop')} style={{ textAlign: 'left' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>Diamond Rings</button>
              <button onClick={() => handleNavClick('shop')} style={{ textAlign: 'left' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>Gemstone Earrings</button>
              <button onClick={() => handleNavClick('shop')} style={{ textAlign: 'left' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>Gold Chokers</button>
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem', color: 'white' }}>
              Assistance
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <button onClick={() => handleNavClick('ai-assistant')} style={{ textAlign: 'left' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>Ring Size Guide</button>
              <button onClick={() => handleNavClick('ai-assistant')} style={{ textAlign: 'left' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>Warranty & Repairs</button>
              <button onClick={() => handleNavClick('ai-assistant')} style={{ textAlign: 'left' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>Returns & Refunds</button>
              <button onClick={() => handleNavClick('contact')} style={{ textAlign: 'left' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>Book Consultation</button>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem', color: 'white' }}>
              Atelier Info
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                <MapPin className="w-4 h-4 text-accent-gold" />
                <span>Fifth Avenue, Suite 1200, New York</span>
              </div>
              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                <Phone className="w-4 h-4 text-accent-gold" />
                <span>+1 (800) 555-LUMI</span>
              </div>
              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                <Mail className="w-4 h-4 text-accent-gold" />
                <span>atelier@auragems_aijewellery.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '2rem 0' }}></div>

        {/* Bottom Panel */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <span>© {new Date().getFullYear()} AuraGems AI Fine Jewellery LLC. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Privacy Policy</span>
            <span>Terms & Conditions</span>
            <span>Sitemap</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
