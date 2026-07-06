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
  const SUBS: Record<Mode, string> = {
    signin: 'A local barter marketplace for Amman. No money — just fair trades.',
    signup: 'Create an account to start trading in Amman.',
    forgot: 'Enter your email and we\'ll send you a reset link.',
  };

  return (
    <div className="login-screen" role="main" aria-label="Login">
      <div className="login-card" role="dialog" aria-modal="true" aria-labelledby="loginTitle">

        <div className="login-brand">
          <span className="login-logo" aria-label="Swaparr">SW</span>
          <span className="login-wordmark">Swaparr</span>
        </div>

        <h1 className="login-title" id="loginTitle">{TITLES[mode]}</h1>
        <p className="login-sub">{SUBS[mode]}</p>

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
