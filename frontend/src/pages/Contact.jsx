import React, { useState } from 'react';
import { Mail, Phone, Clock, MapPin, Check } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState('general');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    
    // Simulate API request
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '3rem' }}>
      
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <span style={{ color: 'var(--accent-gold)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: '600' }}>Get in Touch</span>
        <h1 style={{ fontSize: '2.5rem', marginTop: '0.5rem' }}>We Welcome Your Visit</h1>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '3.5rem',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        
        {/* Left Column: Atelier Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-serif)', marginBottom: '0.75rem' }}>The AuraGems AI Atelier</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Whether you are looking to resize a ring, book a bespoke customization appointment, or seek guidance on diamond grades, our staff is here to help.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <MapPin className="w-5 h-5 text-accent-gold" style={{ marginTop: '2px' }} />
              <div>
                <h4 style={{ color: 'white', fontWeight: '600' }}>Location</h4>
                <p style={{ color: 'var(--text-secondary)' }}>Fifth Avenue, Suite 1200, New York, NY 10011</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <Phone className="w-5 h-5 text-accent-gold" style={{ marginTop: '2px' }} />
              <div>
                <h4 style={{ color: 'white', fontWeight: '600' }}>Telephone</h4>
                <p style={{ color: 'var(--text-secondary)' }}>+1 (800) 555-LUMI (5864)</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <Mail className="w-5 h-5 text-accent-gold" style={{ marginTop: '2px' }} />
              <div>
                <h4 style={{ color: 'white', fontWeight: '600' }}>E-mail Inquiry</h4>
                <p style={{ color: 'var(--text-secondary)' }}>atelier@auragems_aijewellery.com</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <Clock className="w-5 h-5 text-accent-gold" style={{ marginTop: '2px' }} />
              <div>
                <h4 style={{ color: 'white', fontWeight: '600' }}>Operating Hours</h4>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2px' }}>Monday – Friday: 10:00 AM – 7:00 PM</p>
                <p style={{ color: 'var(--text-secondary)' }}>Saturday: 11:00 AM – 5:00 PM (By appointment only)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="glass-panel" style={{ padding: '2.5rem 2rem', borderRadius: '8px' }}>
          
          {submitted ? (
            <div className="animate-fade-in" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              gap: '1.25rem',
              padding: '2rem 0'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'var(--accent-gold-muted)',
                border: '1px solid var(--border-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Check className="w-7 h-7 text-accent-gold" />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-serif)' }}>Inquiry Received</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>
                Thank you for contacting AuraGems AI Atelier. One of our jewellery concierges will respond to your email within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem', color: 'white' }}>
                Send an Inquiry
              </h3>
              
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="form-input" 
                  placeholder="E.g., Jane Doe"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input" 
                  placeholder="E.g., jane@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Inquiry Type</label>
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value)}
                  className="form-select"
                >
                  <option value="general">General Support</option>
                  <option value="consultation">Book Virtual Styling Consultation</option>
                  <option value="custom">Bespoke / Custom Jewelry Commission</option>
                  <option value="returns">Returns & Sizing Help</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Message Details</label>
                <textarea 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)}
                  className="form-textarea" 
                  rows="4" 
                  placeholder="Please describe your interest, sizing details, or gemstone selection..."
                  required
                ></textarea>
              </div>

              <button type="submit" className="gold-btn" style={{ justifyContent: 'center', height: '44px', marginTop: '0.5rem' }}>
                Submit Inquiry
              </button>
            </form>
          )}

        </div>
      </div>

    </div>
  );
}
