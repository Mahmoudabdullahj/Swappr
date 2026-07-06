'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [done, setDone]         = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm)  { setError('Passwords do not match.'); return; }
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) { setError(err.message); setLoading(false); return; }
    setDone(true);
    setTimeout(() => router.push('/'), 2500);
  }

  return (
    <div className="login-screen" role="main" aria-label="Reset password">
      <div className="login-card">
        <div className="login-brand">
          <span className="login-logo" aria-label="Swappr">SW</span>
          <span className="login-wordmark">Swappr</span>
        </div>

        <h1 className="login-title">Set new password</h1>
        <p className="login-sub">Enter and confirm your new password below.</p>

        {done ? (
          <p style={{ fontSize: 13, color: 'var(--accent)', background: 'var(--accent-dim)', padding: '10px 14px', borderRadius: 10, lineHeight: 1.5 }}>
            Password updated! Redirecting…
          </p>
        ) : (
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="login-field">
              <label className="login-label" htmlFor="newPassword">New password</label>
              <input className="login-input" id="newPassword" type="password"
                placeholder="At least 6 characters" autoComplete="new-password" required
                value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            <div className="login-field">
              <label className="login-label" htmlFor="confirmPassword">Confirm password</label>
              <input className="login-input" id="confirmPassword" type="password"
                placeholder="Repeat new password" autoComplete="new-password" required
                value={confirm} onChange={e => setConfirm(e.target.value)} />
            </div>

            {error && <p className="login-error" role="alert">{error}</p>}

            <button className="login-btn" type="submit" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
