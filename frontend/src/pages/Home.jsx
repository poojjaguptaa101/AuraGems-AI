import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Heart, Search, Gift } from 'lucide-react';
import { getProducts } from '../api';
import ProductCard from '../components/ProductCard';

export default function Home({ setCurrentPage, setSelectedProductId }) {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    async function loadFeatured() {
      const all = await getProducts();
      setFeatured(all.slice(0, 4)); // Show first 4 items
    }
    loadFeatured();
  }, []);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '5.5rem' }}>
      
      {/* 1. HERO BANNER */}
      <section style={{
        position: 'relative',
        height: '80vh',
        minHeight: '500px',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(rgba(10, 10, 12, 0.4) 0%, rgba(10, 10, 12, 0.95) 100%)',
        overflow: 'hidden'
      }}>
        {/* Background Image */}
        <img 
          src="/assets/hero_jewellery.png" 
          alt="Luxury Jewellery Collection"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: -1,
            transform: 'scale(1.02)'
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <span style={{
              color: 'var(--accent-gold)',
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Sparkles className="w-4 h-4" /> Introducing AuraGems AI AI
            </span>
            
            <h1 style={{
              fontSize: '3.25rem',
              lineHeight: '1.15',
              fontFamily: 'var(--font-serif)',
              color: '#ffffff',
              fontWeight: '400'
            }}>
              Timeless Elegance, <br/>
              <span className="gold-text">Crafted for You.</span>
            </h1>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7' }}>
              Explore an exquisite collection of ethically-sourced fine jewellery. Let our Artificial Intelligence assistant coordinate your personal styling profile or select the ultimate gift.
            </p>

            <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setCurrentPage('shop')} 
                className="gold-btn"
              >
                Explore Catalogue <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setCurrentPage('ai-assistant')} 
                className="outline-btn"
              >
                Consult AI Stylist
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. AI SERVICES HIGHLIGHT */}
      <section className="container">
        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3.5rem auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '2.25rem' }}>AI-Powered Shopping</h2>
          <div style={{ width: '60px', height: '1px', backgroundColor: 'var(--accent-gold)', margin: '0 auto' }}></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Discover how we combine master-craftsmanship with state-of-the-art artificial intelligence to revolutionize your shopping experience.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          {/* Card 1: Style Matchmaker */}
          <div className="glass-panel" style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ width: '45px', height: '45px', borderRadius: '8px', background: 'var(--accent-gold-muted)', display: 'flex', alignItems: 'center', justifyContext: 'center', justifyContent: 'center' }}>
              <Sparkles className="w-5 h-5 text-accent-gold" />
            </div>
            <h3 style={{ fontSize: '1.25rem' }}>AI Style Profile Builder</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>
              Take our interactive quiz. AuraGems AI matches your skin undertone and fashion style to build cohesive set recommendations (Ring + Necklace + Bracelet).
            </p>
            <button 
              onClick={() => setCurrentPage('ai-assistant')} 
              style={{ color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: '600', marginTop: 'auto', alignSelf: 'flex-start' }}
            >
              Build Profile <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Smart Search */}
          <div className="glass-panel" style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ width: '45px', height: '45px', borderRadius: '8px', background: 'var(--accent-gold-muted)', display: 'flex', alignItems: 'center', justifyContext: 'center', justifyContent: 'center' }}>
              <Search className="w-5 h-5 text-accent-gold" />
            </div>
            <h3 style={{ fontSize: '1.25rem' }}>Smart NLP Search</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>
              Type like you talk. Search our atelier using natural phrases like "gold sapphire rings under $1000" and get instant scoring and matches.
            </p>
            <button 
              onClick={() => setCurrentPage('shop')} 
              style={{ color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: '600', marginTop: 'auto', alignSelf: 'flex-start' }}
            >
              Try Smart Search <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Gift Planner */}
          <div className="glass-panel" style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ width: '45px', height: '45px', borderRadius: '8px', background: 'var(--accent-gold-muted)', display: 'flex', alignItems: 'center', justifyContext: 'center', justifyContent: 'center' }}>
              <Gift className="w-5 h-5 text-accent-gold" />
            </div>
            <h3 style={{ fontSize: '1.25rem' }}>AI Gift Assistant</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>
              Find the perfect token of appreciation. Select budget and occasion, and our AI will draft a highly personalized, custom greeting card.
            </p>
            <button 
              onClick={() => setCurrentPage('ai-assistant')} 
              style={{ color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: '600', marginTop: 'auto', alignSelf: 'flex-start' }}
            >
              Plan a Gift <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
          <div>
            <span style={{ color: 'var(--accent-gold)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: '600' }}>Selected Pieces</span>
            <h2 style={{ fontSize: '2.25rem', marginTop: '0.5rem' }}>The Signature Line</h2>
          </div>
          <button 
            onClick={() => setCurrentPage('shop')} 
            style={{ color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '600', borderBottom: '1px solid var(--accent-gold)', paddingBottom: '3px' }}
          >
            View All Collection <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2rem'
        }}>
          {featured.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onViewDetails={(id) => {
                setSelectedProductId(id);
                setCurrentPage('product-details');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
            />
          ))}
        </div>
      </section>

      {/* 4. VALUE PROPOSITION */}
      <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '5.5rem 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '3.5rem',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <ShieldCheck className="w-10 h-10 text-accent-gold" />
            <h4 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)' }}>Lifetime Warranty</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '300px' }}>
              Every single piece is backed by our master-atelier lifetime warranty for sizing adjustment, cleaning, and stone setting.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Heart className="w-10 h-10 text-accent-gold" />
            <h4 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)' }}>Ethically Sourced</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '300px' }}>
              We source our diamonds and metal materials exclusively from certified conflict-free partners adhering to the Kimberly Process.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Sparkles className="w-10 h-10 text-accent-gold" />
            <h4 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)' }}>Tailored Sizing</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '300px' }}>
              Custom ring sizes can be hand-crafted at no extra cost. Connect with our styling bot for measuring methods.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
