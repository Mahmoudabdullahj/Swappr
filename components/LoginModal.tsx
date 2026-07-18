'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { UserSession } from '@/lib/types';

interface LoginModalProps {
  onLogin: (session: UserSession) => void;
}

type Mode = 'signin' | 'signup' | 'forgot';

export default function LoginModal({ onLogin }: LoginModalProps) {
  const [mode, setMode]               = useState<Mode>('signin');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [message, setMessage]         = useState('');

  function switchMode(m: Mode) { setMode(m); setError(''); setMessage(''); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    const supabase = createClient();
    try {
      if (mode === 'forgot') {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/reset-password',
        });
        if (err) throw err;
        setMessage('Check your email for a password reset link.');
        setLoading(false);
        return;
      }
      if (mode === 'signup') {
        const name = displayName.trim() || email.split('@')[0];
        const { data, error: err } = await supabase.auth.signUp({
          email, password,
          options: { data: { display_name: name } },
        });
        if (err) throw err;
        if (data.user && !data.session) {
          setMessage('Check your email and click the confirmation link to continue.');
          setLoading(false);
          return;
        }
        if (data.user && data.session) onLogin(buildSession(data.user.id, name));
      } else {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        const name = data.user.user_metadata?.display_name || email.split('@')[0];
        onLogin(buildSession(data.user.id, name));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  function buildSession(userId: string, name: string): UserSession {
    return {
      userId, displayName: name, loginAt: new Date().toISOString(),
      views: [], searches: [],
      profile: { topCategories: [], topKeywords: [], medianPrice: null },
    };
  }

  const TITLES: Record<Mode, string> = {
    signin: 'Trade what you have.',
    signup: 'Join Swaparr',
    forgot: 'Reset your password',
  };
  return (
    <div className="login-screen" role="main" aria-label="Login">
      <div className="login-card" role="dialog" aria-modal="true" aria-labelledby="loginTitle">

        <div className="login-brand">
          <img src="/logo.png" alt="Baddel" style={{ height: 72 }} />
        </div>

        <h1 className="login-title" id="loginTitle">{TITLES[mode]}</h1>

        {/* Sign In / Sign Up toggle — hidden in forgot mode */}
        {mode !== 'forgot' && (
          <div style={{ display:'flex', background:'var(--bg-surface)', borderRadius:12, padding:4, gap:4 }}>
            {(['signin','signup'] as Mode[]).map((m) => (
              <button key={m} type="button" onClick={() => switchMode(m)} style={{
                flex:1, padding:'8px 0', borderRadius:8, border:'none', cursor:'pointer',
                fontFamily:'var(--font-display)', fontWeight:700, fontSize:13,
                background: mode===m ? '#fff' : 'transparent',
                color: mode===m ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: mode===m ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
                transition:'all .15s',
              }}>
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>
        )}

        {mode !== 'forgot' && (
          <>
            <button type="button" onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: window.location.origin },
              });
            }} style={{
              width: '100%', padding: '10px 16px', borderRadius: 10,
              border: '1.5px solid var(--border)', background: '#fff',
              cursor: 'pointer', fontWeight: 600, fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: 'var(--font-body)', color: '#111',
            }}>
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.8-3.4-11.4-8.1l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.2C37 39 44 34 44 24c0-1.3-.1-2.7-.4-3.9z"/>
              </svg>
              Continue with Google
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>or continue with email</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
          </>
        )}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {mode === 'signup' && (
            <div className="login-field">
              <label className="login-label" htmlFor="loginName">Your name</label>
              <input className="login-input" id="loginName" type="text"
                placeholder="e.g. Ahmad Kareem" autoComplete="name"
                value={displayName} onChange={e => setDisplayName(e.target.value)} />
            </div>
          )}

          <div className="login-field">
            <label className="login-label" htmlFor="loginEmail">Email</label>
            <input className="login-input" id="loginEmail" type="email"
              placeholder="you@example.com" autoComplete="email" required
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          {mode !== 'forgot' && (
            <div className="login-field">
              <label className="login-label" htmlFor="loginPassword">Password</label>
              <input className="login-input" id="loginPassword" type="password"
                placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required
                value={password} onChange={e => setPassword(e.target.value)} />
              {mode === 'signin' && (
                <button type="button" onClick={() => switchMode('forgot')}
                  style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', padding:'4px 0 0', fontSize:12, alignSelf:'flex-start' }}>
                  Forgot password?
                </button>
              )}
            </div>
          )}

          {error && <p className="login-error" role="alert">{error}</p>}

          {message && (
            <p style={{ fontSize:13, color:'var(--accent)', background:'var(--accent-dim)', padding:'10px 14px', borderRadius:10, lineHeight:1.5 }}>
              {message}
            </p>
          )}

          <button className="login-btn" type="submit" disabled={loading} style={{ marginTop:4 }}>
            {loading ? 'Please wait…'
              : mode === 'signin' ? 'Sign In'
              : mode === 'signup' ? 'Create Account'
              : 'Send Reset Link'}
          </button>
        </form>

        {mode === 'forgot' ? (
          <p className="login-terms">
            <button type="button" onClick={() => switchMode('signin')}
              style={{ background:'none', border:'none', color:'var(--accent)', fontWeight:600, cursor:'pointer', padding:0, fontSize:'inherit' }}>
              ← Back to Sign In
            </button>
          </p>
        ) : (
          <p className="login-terms">
            {mode === 'signin' ? 'No account yet? ' : 'Already have an account? '}
            <button type="button" onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
              style={{ background:'none', border:'none', color:'var(--accent)', fontWeight:600, cursor:'pointer', padding:0, fontSize:'inherit' }}>
              {mode === 'signin' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        )}
        {mode === 'signup' && (
          <p className="login-terms" style={{ marginTop: 8 }}>
            By signing up you agree to our{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>Privacy Policy</a>.
          </p>
        )}

      </div>
    </div>
  );
}
