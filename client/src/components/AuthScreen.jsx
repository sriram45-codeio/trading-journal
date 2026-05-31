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

  // Simulated Google Login States
  const [showSimulatedModal, setShowSimulatedModal] = useState(false);
  const [simulatedEmail, setSimulatedEmail] = useState('');
  const [customSimulatedEmail, setCustomSimulatedEmail] = useState('');
  const [simulatedStep, setSimulatedStep] = useState('select'); // 'select' | 'loading'

  const isSignup = mode === 'signup';

  // Dynamically load Google GSI SDK to support real OAuth if Client ID is configured
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    return () => {
      try {
        document.body.removeChild(script);
      } catch (err) {}
    };
  }, []);

  const handleGoogleClick = () => {
    setError('');
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (clientId && window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleLoginResponse
      });
      window.google.accounts.id.prompt();
    } else {
      // Fall back to our beautiful error-free simulated accounts picker modal!
      setShowSimulatedModal(true);
      setSimulatedStep('select');
    }
  };

  const handleGoogleLoginResponse = async (response) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/google', { credential: response.credential });
      const { token, user } = res.data;
      localStorage.setItem('tj_token', token);
      localStorage.setItem('tj_email', user.email);
      onAuthSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const executeSimulatedLogin = async (selectedEmail) => {
    setSimulatedEmail(selectedEmail);
    setSimulatedStep('loading');
    
    // Simulate beautiful Google Account selection network roundtrip
    setTimeout(async () => {
      try {
        // Send custom mock token payload
        const res = await api.post('/auth/google', { credential: `mock_${selectedEmail}` });
        const { token, user } = res.data;
        localStorage.setItem('tj_token', token);
        localStorage.setItem('tj_email', user.email);
        setShowSimulatedModal(false);
        onAuthSuccess();
      } catch (err) {
        setError(err.response?.data?.error || 'Simulated Google login failed');
        setShowSimulatedModal(false);
      } finally {
        setSimulatedStep('select');
      }
    }, 1200);
  };

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
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #09090b 80%)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '24px 16px', 
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Visual background ambient glow circles */}
      <div style={{ position: 'absolute', width: '350px', height: '350px', borderRadius: '50%', background: 'rgba(124, 58, 237, 0.15)', filter: 'blur(80px)', top: '-10%', left: '-10%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(249, 115, 22, 0.1)', filter: 'blur(100px)', bottom: '-10%', right: '-10%', pointerEvents: 'none' }} />
      
      <div style={{ width: '100%', maxWidth: '420px', zIndex: 10 }}>
        {/* ForexFlow Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--accent-color) 0%, var(--accent-hover) 100%)',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(255, 87, 34, 0.3)'
            }}>
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                <path d="M8 23 L16 9 L24 23" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <path d="M12 23 L16 16 L20 23" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="white" fillOpacity="0.4"/>
              </svg>
            </div>
            <span style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px' }}>
              ForexFlow
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '500', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Track. Analyze. Improve.
          </p>
        </div>

        {/* Premium glow edge card */}
        <div style={{ 
          background: 'rgba(23, 23, 27, 0.95)',
          border: '1.5px solid rgba(255, 255, 255, 0.07)',
          borderRadius: '24px', 
          padding: '40px 32px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 50px rgba(124, 58, 237, 0.08)',
          position: 'relative'
        }}>
          {/* Card Title & Info */}
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff', margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
              {isSignup ? 'Create your ForexFlow account' : 'Sign in to ForexFlow'}
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0 }}>
              {isSignup ? 'Get started with your free account today.' : 'Welcome back! Please enter your details.'}
            </p>
          </div>

          {/* Social Continue with Google Button */}
          <button
            type="button"
            onClick={handleGoogleClick}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '11px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.03)',
              color: '#ffffff',
              fontSize: '13.5px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              outline: 'none',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '10px', display: 'block' }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.87-4.53-2.87-7.09z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Continue with Google
          </button>

          {/* OR Separator Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '22px 0', gap: '12px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email field */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.3)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 16px 11px 38px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  placeholder="name@example.com"
                  required
                  id="auth-email"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#7c3aed';
                    e.target.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.02)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password field */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.3)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 38px 11px 38px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  placeholder="Min. 6 characters"
                  required
                  id="auth-password"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#7c3aed';
                    e.target.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.02)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center' }}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Confirm Password field (if Signup) */}
            {isSignup && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.3)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 16px 11px 38px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      background: 'rgba(255, 255, 255, 0.02)',
                      color: '#ffffff',
                      fontSize: '13px',
                      outline: 'none',
                      transition: 'all 0.15s ease',
                    }}
                    placeholder="Repeat password"
                    required
                    id="auth-confirm-password"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#7c3aed';
                      e.target.style.background = 'rgba(255, 255, 255, 0.04)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      e.target.style.background = 'rgba(255, 255, 255, 0.02)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
            )}

            {/* Terms checkbox if signup */}
            {isSignup && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '22px', userSelect: 'none' }}>
                <div 
                  onClick={() => setAgreeToTerms(!agreeToTerms)}
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '5px',
                    border: `1.5px solid ${agreeToTerms ? '#7c3aed' : 'rgba(255, 255, 255, 0.15)'}`,
                    background: agreeToTerms ? '#7c3aed' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    marginTop: '2px',
                    flexShrink: 0
                  }}
                >
                  {agreeToTerms && <Check size={11} strokeWidth={3} style={{ color: '#ffffff' }} />}
                </div>
                <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', lineHeight: '1.4' }}>
                  I agree to the <span style={{ color: '#7c3aed', cursor: 'pointer', fontWeight: '500' }}>Terms of Service</span> and <span style={{ color: '#7c3aed', cursor: 'pointer', fontWeight: '500' }}>Privacy Policy</span>.
                </span>
              </div>
            )}

            {/* General Error Message */}
            {error && (
              <div style={{ 
                background: 'rgba(223, 81, 76, 0.08)', 
                border: '1.5px solid rgba(223, 81, 76, 0.25)', 
                borderRadius: '12px', 
                padding: '12px 16px', 
                marginBottom: '20px' 
              }}>
                <p style={{ color: '#ef4444', fontSize: '12.5px', margin: 0, fontWeight: '600' }}>{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{ 
                width: '100%', 
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', 
                color: '#ffffff',
                border: 'none',
                padding: '12px 18px', 
                fontSize: '13.5px', 
                fontWeight: '700',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 15px rgba(109, 40, 217, 0.35)',
                outline: 'none'
              }}
              id="auth-submit"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(109, 40, 217, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(109, 40, 217, 0.35)';
              }}
            >
              {loading ? 'Please wait…' : isSignup ? 'Create Account' : 'Sign In'}
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Switch Mode Footer */}
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginTop: '28px', margin: '28px 0 0 0' }}>
            {isSignup ? 'Already have an account? ' : "Don't have an account? "}
            <button
              onClick={() => { setMode(isSignup ? 'login' : 'signup'); setError(''); }}
              style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: '13px', fontWeight: '700', padding: 0, marginLeft: '4px' }}
              onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
              onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
            >
              {isSignup ? 'Sign in' : 'Create one'}
            </button>
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* GORGEOUS FALLBACK SIMULATED GOOGLE ACCOUNTS PICKER MODAL */}
      {/* ========================================================================= */}
      {showSimulatedModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          {/* Keyframes injection for circular spinner */}
          <style>{`
            @keyframes simulated-spin {
              to { transform: rotate(360deg); }
            }
            .simulated-spinner {
              animation: simulated-spin 0.8s linear infinite;
            }
          `}</style>

          <div style={{
            background: '#ffffff',
            color: '#1f2937',
            width: '100%',
            maxWidth: '380px',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            padding: '28px',
            position: 'relative',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            {/* Modal close X */}
            {simulatedStep === 'select' && (
              <button 
                onClick={() => setShowSimulatedModal(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  border: 'none',
                  background: 'transparent',
                  color: '#9ca3af',
                  fontSize: '20px',
                  cursor: 'pointer',
                  fontWeight: '400',
                  padding: '4px'
                }}
              >
                ✕
              </button>
            )}

            {simulatedStep === 'select' ? (
              <>
                {/* Google Logo Header */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" style={{ margin: '0 auto 12px', display: 'block' }}>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.87-4.53-2.87-7.09z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 6px 0' }}>Sign in with Google</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>to continue to <strong style={{ color: '#7c3aed' }}>ForexFlow</strong></p>
                </div>

                {/* Account Selection Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Mock Account 1 */}
                  <div 
                    onClick={() => executeSimulatedLogin('alex.rivera@gmail.com')}
                    style={simulatedAccountBoxStyle}
                    className="simulated-acc-hover"
                  >
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%', background: '#7c3aed', color: '#ffffff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', flexShrink: 0
                    }}>
                      A
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#1f2937' }}>Alex Rivera</div>
                      <div style={{ fontSize: '11.5px', color: '#6b7280' }}>alex.rivera@gmail.com</div>
                    </div>
                  </div>

                  {/* Mock Account 2 */}
                  <div 
                    onClick={() => executeSimulatedLogin('sarah.jenkins@gmail.com')}
                    style={simulatedAccountBoxStyle}
                  >
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%', background: '#10b981', color: '#ffffff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', flexShrink: 0
                    }}>
                      S
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#1f2937' }}>Sarah Jenkins</div>
                      <div style={{ fontSize: '11.5px', color: '#6b7280' }}>sarah.jenkins@gmail.com</div>
                    </div>
                  </div>

                  {/* Divider line */}
                  <div style={{ height: '1px', background: '#e5e7eb', margin: '6px 0' }} />

                  {/* Custom Account Input Form */}
                  <div style={{ padding: '4px 0' }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '600', color: '#4b5563', textAlign: 'left' }}>Use another account:</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="email"
                        value={customSimulatedEmail}
                        onChange={(e) => setCustomSimulatedEmail(e.target.value)}
                        placeholder="Type any Gmail address..."
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '12.5px',
                          outline: 'none',
                          color: '#1f2937',
                          background: '#f9fafb'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customSimulatedEmail.includes('@')) {
                            executeSimulatedLogin(customSimulatedEmail);
                          }
                        }}
                        disabled={!customSimulatedEmail.includes('@')}
                        style={{
                          padding: '8px 14px',
                          background: '#7c3aed',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: customSimulatedEmail.includes('@') ? 'pointer' : 'not-allowed',
                          opacity: customSimulatedEmail.includes('@') ? 1 : 0.6
                        }}
                      >
                        Sign in
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '24px', fontSize: '11.5px', color: '#9ca3af', lineHeight: '1.4', textAlign: 'center' }}>
                  To make things easy to demo, ForexFlow simulated sign-in doesn't require password or setup.
                </div>
              </>
            ) : (
              /* Simulated Authentication Loader Step */
              <div style={{ textAlign: 'center', padding: '36px 0' }}>
                {/* Google-like circular progress spinner */}
                <div style={{
                  display: 'inline-block',
                  width: '42px',
                  height: '42px',
                  border: '3.5px solid #f3f3f3',
                  borderTop: '3.5px solid #4285F4',
                  borderRadius: '50%',
                  marginBottom: '20px'
                }} className="simulated-spinner" />
                
                <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: '0 0 6px 0' }}>Connecting to ForexFlow</h4>
                <p style={{ fontSize: '12.5px', color: '#6b7280', margin: 0 }}>Signing you in as <strong>{simulatedEmail}</strong>...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Styled helper for account chooser rows
const simulatedAccountBoxStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1px solid #e5e7eb',
  cursor: 'pointer',
  transition: 'background 0.15s ease, border-color 0.15s ease',
  background: '#ffffff'
};

// Add standard interactive styles using hover logic in inline components
const originalOnMouseEnter = (e) => {
  e.currentTarget.style.background = '#f9fafb';
  e.currentTarget.style.borderColor = '#d1d5db';
};
const originalOnMouseLeave = (e) => {
  e.currentTarget.style.background = '#ffffff';
  e.currentTarget.style.borderColor = '#e5e7eb';
};

// Inject standard mouse events dynamically
setTimeout(() => {
  const chooserElements = document.querySelectorAll('.simulated-acc-hover');
  chooserElements.forEach(el => {
    el.addEventListener('mouseenter', originalOnMouseEnter);
    el.addEventListener('mouseleave', originalOnMouseLeave);
  });
}, 500);
