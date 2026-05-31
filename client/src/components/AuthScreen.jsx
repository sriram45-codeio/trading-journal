import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';

export default function AuthScreen({ onAuthSuccess }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isSignup = mode === 'signup';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.includes('@') || !email.includes('.')) { setError('Please enter a valid email address'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (isSignup && password !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const endpoint = isSignup ? '/auth/signup' : '/auth/login';
      const response = await api.post(endpoint, { email, password });
      const { token, user } = response.data;
      localStorage.setItem('tj_token', token);
      localStorage.setItem('tj_email', user.email);
      onAuthSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', transition: 'background-color 0.2s ease' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        {/* Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--accent-color) 0%, var(--accent-hover) 100%)',
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-btn)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(255, 87, 34, 0.25)'
            }}>
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                <path d="M8 23 L16 9 L24 23" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <path d="M12 23 L16 16 L20 23" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="white" fillOpacity="0.4"/>
              </svg>
            </div>
            <span style={{ fontSize: '21px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>
              ForexFlow
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '500' }}>Track. Analyze. Improve.</p>
        </div>

        {/* Auth Card */}
        <div className="kite-card" style={{ borderRadius: 'var(--radius-card)', padding: '32px 28px', background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          {/* Toggle Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '24px' }}>
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1,
                  paddingBottom: '12px',
                  fontSize: '13px',
                  fontWeight: '600',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: mode === m ? 'var(--accent-color)' : 'var(--text-muted)',
                  borderBottom: mode === m ? '2.5px solid var(--accent-color)' : '2.5px solid transparent',
                  marginBottom: '-1.5px',
                  transition: 'all 0.2s ease',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="kite-input"
                placeholder="you@example.com"
                required
                id="auth-email"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="kite-input"
                  placeholder="Min. 6 characters"
                  style={{ paddingRight: '38px' }}
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

            {isSignup && (
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="kite-input"
                  placeholder="Repeat password"
                  required
                  id="auth-confirm-password"
                />
              </div>
            )}

            {error && (
              <div style={{ background: 'rgba(223,81,76,0.06)', border: '1px solid rgba(223,81,76,0.2)', borderRadius: 'var(--radius-badge)', padding: '10px 14px', marginBottom: '16px' }}>
                <p style={{ color: '#df514c', fontSize: '12px', margin: 0, fontWeight: '500' }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="kite-btn kite-btn-orange"
              style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', fontSize: '13px', marginTop: '6px', borderRadius: 'var(--radius-btn)' }}
              id="auth-submit"
            >
              {loading ? 'Please wait…' : isSignup ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', marginTop: '24px' }}>
            {isSignup ? 'Already have an account? ' : "Don't have an account? "}
            <button
              onClick={() => { setMode(isSignup ? 'login' : 'signup'); setError(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '12px', fontWeight: '600', padding: 0 }}
            >
              {isSignup ? 'Sign in' : 'Create one'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
