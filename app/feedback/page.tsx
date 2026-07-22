'use client';

import { useState } from 'react';
import Link from 'next/link';

const TYPES = [
  { value: 'general',  label: 'General' },
  { value: 'bug',      label: 'Bug report' },
  { value: 'feature',  label: 'Feature request' },
];

export default function FeedbackPage() {
  const [type, setType]         = useState('general');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [message, setMessage]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]         = useState(false);
  const [error, setError]       = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) { setError('Please write your feedback before submitting.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, name: name.trim() || null, email: email.trim() || null, message: message.trim() }),
      });
      if (!res.ok) throw new Error('Failed to submit');
      setDone(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="legal-page">
      <header className="legal-header">
        <Link href="/" className="legal-logo">
          <img src="/logo.png" alt="Baddel" style={{ height: 44 }} />
        </Link>
      </header>

      <main className="legal-content" style={{ maxWidth: 560 }}>
        {done ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>🙏</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Thanks for your feedback!</h1>
            <p style={{ color: 'var(--muted)', marginBottom: 32 }}>
              We read every submission and use it to improve Baddel.
            </p>
            <Link href="/" style={{
              display: 'inline-block', padding: '12px 28px',
              background: 'var(--accent)', color: '#fff',
              borderRadius: 10, fontWeight: 700, textDecoration: 'none',
              fontSize: 15,
            }}>
              Back to Baddel
            </Link>
          </div>
        ) : (
          <>
            <h1 style={{ marginBottom: 6 }}>Share feedback</h1>
            <p className="legal-date" style={{ marginBottom: 32 }}>
              Tell us what's working, what's broken, or what you'd love to see next.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Type */}
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                  Type
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {TYPES.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      style={{
                        padding: '8px 18px',
                        borderRadius: 999,
                        border: `2px solid ${type === t.value ? 'var(--accent)' : 'var(--border)'}`,
                        background: type === t.value ? 'var(--accent-dim)' : 'transparent',
                        color: type === t.value ? 'var(--accent)' : 'var(--fg)',
                        fontWeight: 600, fontSize: 13, cursor: 'pointer',
                        transition: 'all .15s',
                        fontFamily: 'inherit',
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  Your feedback <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <textarea
                  value={message}
                  onChange={e => { setMessage(e.target.value); setError(''); }}
                  placeholder="Tell us what's on your mind…"
                  rows={5}
                  required
                  style={{
                    width: '100%', padding: '12px 14px',
                    border: `1.5px solid ${error ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 10, fontSize: 14,
                    fontFamily: 'inherit', color: 'var(--fg)',
                    background: 'var(--surface)',
                    resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color .15s',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.target.style.borderColor = error ? 'var(--accent)' : 'var(--border)')}
                />
              </div>

              {/* Name + Email (optional) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Name', value: name, setter: setName, placeholder: 'Optional' },
                  { label: 'Email', value: email, setter: setEmail, placeholder: 'Optional' },
                ].map(({ label, value, setter, placeholder }) => (
                  <div key={label}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                      {label}
                    </label>
                    <input
                      type={label === 'Email' ? 'email' : 'text'}
                      value={value}
                      onChange={e => setter(e.target.value)}
                      placeholder={placeholder}
                      style={{
                        width: '100%', padding: '11px 14px',
                        border: '1.5px solid var(--border)',
                        borderRadius: 10, fontSize: 14,
                        fontFamily: 'inherit', color: 'var(--fg)',
                        background: 'var(--surface)',
                        outline: 'none', boxSizing: 'border-box',
                        transition: 'border-color .15s',
                      }}
                      onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                    />
                  </div>
                ))}
              </div>

              {error && (
                <p style={{ fontSize: 13, color: 'var(--accent)', margin: 0 }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  alignSelf: 'flex-start', padding: '13px 32px',
                  background: 'var(--accent)', color: '#fff',
                  border: 'none', borderRadius: 10,
                  fontSize: 15, fontWeight: 700,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1,
                  fontFamily: 'inherit',
                  transition: 'opacity .15s',
                }}
              >
                {submitting ? 'Sending…' : 'Send feedback'}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
