import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Heart, Search, Gift, Star } from 'lucide-react';
import { getProducts } from '../api';
import ProductCard from '../components/ProductCard';

export default function Home({ setCurrentPage, setSelectedProductId }) {
  const [featured, setFeatured] = useState([]);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);

  const reviews = [
    {
      name: "Eleanor Vance",
      location: "Beverly Hills",
      text: "AuraGems AI helped me choose the perfect platinum anniversary solitaire. The undertone matching was incredibly accurate, and the final coordinate set exceeded my expectations.",
      stars: 5
    },
    {
      name: "Marcus Aurelius",
      location: "London",
      text: "As someone who finds jewelry shopping intimidating, the AI Gift Finder was a godsend. It recommended a beautiful emerald pendant and drafted a card note that made my mother cry tears of joy.",
      stars: 5
    },
    {
      name: "Sonia Gupta",
      location: "Mumbai",
      text: "The Smart Search understood exactly what I wanted. I typed 'gold hoop earrings under 500' and it gave me the exact mirror finish loops. Truly premium experience.",
      stars: 5
    }
  ];

  useEffect(() => {
    async function loadFeatured() {
      const all = await getProducts();
      setFeatured(all.slice(0, 4));
    }
    loadFeatured();
  }, []);

  // Review rotate timer
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveReviewIndex(idx => (idx + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '8rem' }}>
      
      {/* 1. CINEMATIC LUXURY HERO SECTION */}
      <section style={{
        position: 'relative',
        height: '90vh',
        minHeight: '600px',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(rgba(10, 10, 12, 0.3) 0%, rgba(7, 7, 9, 0.98) 100%)',
        overflow: 'hidden',
        padding: '0'
      }}>
        {/* Full-width visual background */}
        <img 
          src="/assets/hero_jewellery.png" 
          alt="AuraGems Luxury Collections"
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

        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: '650px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            <div style={{ display: 'inline-flex', alignSelf: 'flex-start' }}>
              <span className="glass-panel gold-border" style={{
                color: 'var(--accent-gold)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                background: 'rgba(10, 10, 12, 0.6)'
              }}>
                <Sparkles className="w-4 h-4" /> Introducing AuraGems AI
              </span>
            </div>
            
            <h1 style={{
              fontSize: '4rem',
              lineHeight: '1.1',
              fontFamily: 'var(--font-serif)',
              color: '#ffffff',
              fontWeight: '400',
              textShadow: '0 4px 15px rgba(0,0,0,0.5)'
            }}>
              Discover <br/>
              <span className="gold-text">Timeless Luxury</span>
            </h1>
            
            <p style={{ 
              color: '#ffffff', 
              fontSize: '1.25rem', 
              lineHeight: '1.6', 
              fontWeight: '300',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic'
            }}>
              AI-powered recommendations crafted for your unique style.
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setCurrentPage('shop')} 
                className="gold-btn"
                style={{ height: '48px', padding: '0 2rem' }}
              >
                Explore Collection <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setCurrentPage('ai-assistant')} 
                className="outline-btn"
                style={{ height: '48px', padding: '0 2rem', color: '#ffffff', borderColor: '#ffffff' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'var(--accent-gold)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#ffffff'; }}
              >
                Try AI Stylist
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. AI SERVICES HIGHLIGHT */}
      <section className="container" style={{ padding: '2rem 0' }}>
        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 4.5rem auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)' }}>AI-Powered Shopping Experience</h2>
          <div style={{ width: '80px', height: '1.5px', backgroundColor: 'var(--accent-gold)', margin: '0 auto' }}></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.7' }}>
            Discover how we combine master-craftsmanship with state-of-the-art artificial intelligence to revolutionize your shopping experience.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2.5rem'
        }}>
          {/* Card 1: Style Matchmaker */}
          <div className="glass-panel" style={{ padding: '3rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'var(--accent-gold-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles className="w-5 h-5 text-accent-gold" />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-serif)' }}>AI Style Profile Builder</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.7' }}>
              Take our interactive quiz. AuraGems matches your skin undertone and fashion style to build cohesive set recommendations (Ring + Necklace + Bracelet).
            </p>
            <button 
              onClick={() => setCurrentPage('ai-assistant')} 
              style={{ color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: '600', marginTop: 'auto', alignSelf: 'flex-start' }}
            >
              Build Profile <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Smart Search */}
          <div className="glass-panel" style={{ padding: '3rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'var(--accent-gold-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Search className="w-5 h-5 text-accent-gold" />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-serif)' }}>Smart NLP Search</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.7' }}>
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
          <div className="glass-panel" style={{ padding: '3rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'var(--accent-gold-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Gift className="w-5 h-5 text-accent-gold" />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-serif)' }}>AI Gift Assistant</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.7' }}>
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
      <section className="container" style={{ padding: '2rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span style={{ color: 'var(--accent-gold)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: '600' }}>Selected Pieces</span>
            <h2 style={{ fontSize: '2.5rem', marginTop: '0.5rem', fontFamily: 'var(--font-serif)' }}>The Signature Line</h2>
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '3rem 2.5rem'
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

      {/* 4. LUXURY REVIEWS CAROUSEL */}
      <section style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '5.5rem 0' }}>
        <div className="container" style={{ maxWidth: '800px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          <div>
            <span style={{ color: 'var(--accent-gold)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: '600' }}>Client Testimonials</span>
            <h2 style={{ fontSize: '2.25rem', fontFamily: 'var(--font-serif)', marginTop: '0.5rem' }}>Bespoke Impressions</h2>
          </div>

          <div className="glass-panel" style={{ padding: '3rem 2rem', position: 'relative', minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {/* Stars */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem', color: 'var(--accent-gold)', marginBottom: '1.25rem' }}>
              {[...Array(reviews[activeReviewIndex].stars)].map((_, i) => (
                <Star key={i} className="w-4.5 h-4.5 fill-current" />
              ))}
            </div>
            
            <p style={{
              fontSize: '1.15rem',
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              lineHeight: '1.8',
              color: '#ffffff',
              marginBottom: '1.5rem',
              animation: 'fadeIn 0.5s ease-out'
            }}>
              "{reviews[activeReviewIndex].text}"
            </p>
            
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'white', letterSpacing: '0.05em' }}>
              {reviews[activeReviewIndex].name} — <span style={{ color: 'var(--text-secondary)', fontWeight: '400' }}>{reviews[activeReviewIndex].location}</span>
            </span>
          </div>

          {/* Dots Indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
            {reviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveReviewIndex(idx)}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: activeReviewIndex === idx ? 'var(--accent-gold)' : 'var(--text-muted)',
                  transition: 'background var(--transition-fast)'
                }}
              />
            ))}
          </div>

        </div>
      </section>

      {/* 5. VALUE PROPOSITION */}
      <section className="container" style={{ padding: '2rem 0' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '4.5rem',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            <ShieldCheck className="w-12 h-12 text-accent-gold" />
            <h4 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-serif)' }}>Lifetime Warranty</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '300px', lineHeight: '1.7' }}>
              Every single piece is backed by our master-atelier lifetime warranty for sizing adjustment, cleaning, and stone setting.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            <Heart className="w-12 h-12 text-accent-gold" />
            <h4 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-serif)' }}>Ethically Sourced</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '300px', lineHeight: '1.7' }}>
              We source our diamonds and metal materials exclusively from certified conflict-free partners adhering to the Kimberley Process.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            <Sparkles className="w-12 h-12 text-accent-gold" />
            <h4 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-serif)' }}>Tailored Sizing</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '300px', lineHeight: '1.7' }}>
              Custom ring sizes can be hand-crafted at no extra cost. Connect with our styling bot for measuring methods.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
