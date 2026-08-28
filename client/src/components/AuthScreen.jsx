import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import api from '../api/axios';

export default function AuthScreen({ onAuthSuccess }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const isSignup = mode === 'signup';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.includes('@') || !email.includes('.')) { 
      setError('Please enter a valid email address'); 
      return; 
    }
    if (password.length < 6) { 
      setError('Password must be at least 6 characters'); 
      return; 
    }
    if (isSignup && password !== confirmPassword) { 
      setError('Passwords do not match'); 
      return; 
    }
    if (isSignup && !agreeToTerms) {
      setError('You must agree to the Terms of Service & Privacy Policy');
      return;
    }
    setLoading(true);
    try {
      const endpoint = isSignup ? '/auth/signup' : '/auth/login';
      const response = await api.post(endpoint, { email, password });
      const { token, user } = response.data;
      localStorage.setItem('tj_token', token);
      localStorage.setItem('tj_email', user.email);
      onAuthSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-primary)', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '32px 16px',
      position: 'relative'
    }}>
      {/* Brand Logo Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{
            background: 'var(--accent-color)',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
          }}>
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <path d="M8 23 L16 9 L24 23" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M12 23 L16 16 L20 23" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="white" fillOpacity="0.4"/>
            </svg>
          </div>
          <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>
            TradeKonnect <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.06em', marginLeft: '4px' }}>ForexFlow!</span>
          </span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '500', margin: 0 }}>
          ForexFlow! Journal & Trading Analytics System
        </p>
      </div>

      {/* Main Clean Console Card */}
      <div style={{ 
        width: '100%', 
        maxWidth: '430px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px', 
        padding: '36px 32px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Mode Toggle Tabs */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-table-header)',
          padding: '3px',
          borderRadius: '8px',
          marginBottom: '24px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            style={{
              flex: 1,
              padding: '8px',
              fontSize: '12.5px',
              fontWeight: '700',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              background: mode === 'login' ? 'var(--bg-card)' : 'transparent',
              color: mode === 'login' ? 'var(--accent-color)' : 'var(--text-muted)',
              boxShadow: mode === 'login' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.18s ease'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); }}
            style={{
              flex: 1,
              padding: '8px',
              fontSize: '12.5px',
              fontWeight: '700',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              background: mode === 'signup' ? 'var(--bg-card)' : 'transparent',
              color: mode === 'signup' ? 'var(--accent-color)' : 'var(--text-muted)',
              boxShadow: mode === 'signup' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.18s ease'
            }}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email input */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="kite-input"
                style={{ paddingLeft: '36px' }}
                placeholder="admin@democompany.com"
                required
                id="auth-email"
              />
            </div>
          </div>

          {/* Password input */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="kite-input"
                style={{ paddingLeft: '36px', paddingRight: '36px' }}
                placeholder="Enter password"
                required
                id="auth-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Signup mode) */}
          {isSignup && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="kite-input"
                  style={{ paddingLeft: '36px' }}
                  placeholder="Repeat password"
                  required
                  id="auth-confirm-password"
                />
              </div>
            </div>
          )}

          {/* Terms Checkbox */}
          {isSignup && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '20px', userSelect: 'none' }}>
              <div 
                onClick={() => setAgreeToTerms(!agreeToTerms)}
                style={{
                  width: '17px',
                  height: '17px',
                  borderRadius: '4px',
                  border: `1.5px solid ${agreeToTerms ? 'var(--accent-color)' : 'var(--border-color)'}`,
                  background: agreeToTerms ? 'var(--accent-color)' : 'var(--bg-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  marginTop: '2px',
                  flexShrink: 0
                }}
              >
                {agreeToTerms && <Check size={11} strokeWidth={3} style={{ color: '#ffffff' }} />}
              </div>
              <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                I agree to the <span style={{ color: 'var(--accent-color)', fontWeight: '600' }}>Terms of Service</span> and <span style={{ color: 'var(--accent-color)', fontWeight: '600' }}>Privacy Policy</span>.
              </span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{ 
              background: '#fef2f2', 
              border: '1px solid #fecaca', 
              borderRadius: '8px', 
              padding: '10px 14px', 
              marginBottom: '18px' 
            }}>
              <p style={{ color: '#ef4444', fontSize: '12px', margin: 0, fontWeight: '600' }}>{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="kite-btn kite-btn-blue"
            style={{ 
              width: '100%', 
              padding: '11px 18px', 
              fontSize: '13px', 
              fontWeight: '700',
              borderRadius: '8px',
              justifyContent: 'center'
            }}
            id="auth-submit"
          >
            {loading ? 'Authenticating…' : isSignup ? 'Create Console Account' : 'Sign In to Console'}
            <ArrowRight size={14} />
          </button>
        </form>
      </div>

      {/* Console Footer Info */}
      <div style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '11.5px' }}>
        <span>ForexFlow Console v2.0 · Calm & Lightweight UI</span>
      </div>
    </div>
  );
}
