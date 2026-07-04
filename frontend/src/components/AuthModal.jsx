import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck } from 'lucide-react';

export default function AuthModal({ onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const API_BASE_URL = 'http://localhost:8000';
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { username_or_email: username, password } 
      : { username, email, password };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'An error occurred during authentication');
      }

      // Save to localStorage
      localStorage.setItem('auragems_token', data.token);
      localStorage.setItem('auragems_user', JSON.stringify(data.user));
      
      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      animation: 'fadeIn var(--transition-fast) forwards'
    }}
    onClick={onClose}
    >
      <div 
        className="glass-panel gold-border" 
        style={{
          width: '90%',
          maxWidth: '400px',
          padding: '2.5rem 2rem',
          borderRadius: '12px',
          position: 'relative',
          backgroundColor: 'var(--bg-secondary)',
          boxShadow: 'var(--shadow-lg)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Branding header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ 
            fontFamily: 'var(--font-serif)', 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            background: 'linear-gradient(135deg, #ffffff 0%, #d4af37 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            AuraGems AI
          </span>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>
            {isLogin ? 'Sign in to your atelier profile' : 'Create your styling account'}
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255,0,0,0.1)',
            border: '1px solid rgba(255,0,0,0.2)',
            borderRadius: '4px',
            padding: '0.75rem',
            color: '#ff4d4d',
            fontSize: '0.8rem',
            marginBottom: '1.25rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{isLogin ? 'Username or Email' : 'Username'}</label>
            <div style={{ position: 'relative' }}>
              <User className="w-4 h-4 text-text-muted" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={isLogin ? "jane_doe or jane@example.com" : "jane_doe"}
                className="form-input" 
                style={{ paddingLeft: '2.5rem', height: '40px' }}
                required 
              />
            </div>
          </div>

          {!isLogin && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail className="w-4 h-4 text-text-muted" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="form-input" 
                  style={{ paddingLeft: '2.5rem', height: '40px' }}
                  required 
                />
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Secure Password</label>
            <div style={{ position: 'relative' }}>
              <Lock className="w-4 h-4 text-text-muted" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input" 
                style={{ paddingLeft: '2.5rem', height: '40px' }}
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="gold-btn" 
            style={{ height: '44px', justifyContent: 'center', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : isLogin ? 'Access Profile' : 'Register Profile'}
          </button>
        </form>

        {/* Footer switch link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {isLogin ? (
            <>
              New to AuraGems?{' '}
              <button 
                onClick={() => { setIsLogin(false); setError(''); }}
                style={{ color: 'var(--accent-gold)', textDecoration: 'underline', fontWeight: '500' }}
              >
                Register here
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button 
                onClick={() => { setIsLogin(true); setError(''); }}
                style={{ color: 'var(--accent-gold)', textDecoration: 'underline', fontWeight: '500' }}
              >
                Sign in
              </button>
            </>
          )}
        </div>

        {/* Insured security notice */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          justifyContent: 'center',
          fontSize: '0.65rem',
          color: 'var(--text-muted)',
          marginTop: '1.5rem',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1rem'
        }}>
          <ShieldCheck className="w-3.5 h-3.5 text-accent-gold" />
          <span>AuraGems secure SSL encrypted connection.</span>
        </div>

      </div>
    </div>
  );
}
