import React from 'react';
import { Sparkles, ShieldCheck, Heart } from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="container animate-fade-in" style={{ paddingTop: '3rem', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '4.5rem' }}>
      
      {/* Brand Mission */}
      <section style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <span style={{ color: 'var(--accent-gold)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: '600' }}>Our Story</span>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)' }}>AuraGems AI Craftsmanship</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.8', maxWidth: '700px', margin: '0 auto' }}>
          Established on the foundations of heritage and innovation, AuraGems AI Fine Jewellery designs and handcrafts stunning, luxury diamond sets that elevate daily dress and capture the brilliance of life's milestones.
        </p>
      </section>

      {/* Craftsmanship Details */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-serif)' }}>Designed at Our New York Atelier</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.7' }}>
            Every curve and facet is carefully considered. Our in-house artists begin with organic sketches before constructing high-precision 3D models. 
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.7' }}>
            Next, master goldsmiths cast our custom 18k yellow, white, and rose golds, followed by manual gem-setting under state-of-the-art microscopes to ensure each diamond is locked securely for lifetimes.
          </p>
        </div>
        <div className="glass-panel" style={{
          padding: '2.5rem',
          border: '1px solid var(--border-gold)',
          boxShadow: 'var(--shadow-gold)',
          backgroundColor: 'rgba(212, 175, 55, 0.02)'
        }}>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--accent-gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles className="w-5 h-5" /> The AuraGems AI Guarantee
          </h3>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', listStyleType: 'none', paddingLeft: 0 }}>
            <li>• Complimentary lifetime professional inspection and deep cleaning.</li>
            <li>• Free ring size modifications within the first 6 months.</li>
            <li>• Custom certification documents outlining stone clarity, color grades, and origin.</li>
          </ul>
        </div>
      </section>

      {/* Sustainable Values */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-serif)', textAlign: 'center' }}>Our Ethical Standards</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <ShieldCheck className="w-8 h-8 text-accent-gold" />
            <h3 style={{ fontSize: '1.15rem' }}>The Kimberley Process</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.6' }}>
              We enforce strict compliance with the Kimberley Process to verify that 100% of our diamonds are sourced from conflict-free zones.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Heart className="w-8 h-8 text-accent-gold" />
            <h3 style={{ fontSize: '1.15rem' }}>Recycled Platinum & Gold</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.6' }}>
              To minimize planetary impact, 85% of our platinum and gold metal is refined from verified post-consumer recycled luxury goods.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Sparkles className="w-8 h-8 text-accent-gold" />
            <h3 style={{ fontSize: '1.15rem' }}>Responsible Sourcing</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.6' }}>
              Our emeralds, sapphires, and rubies are tracked from mines in Colombia and Madagascar to maintain transparency and fair labor standards.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
