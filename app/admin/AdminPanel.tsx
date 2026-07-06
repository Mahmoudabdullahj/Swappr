'use client';

import { useEffect, useState } from 'react';
import { CATEGORY_ICONS } from '@/lib/category-icons';

type Tab = 'stats' | 'reports' | 'listings' | 'users';

interface Stats    { users: number; listings: number; trades: number; reports: number; }
interface Report   { id: string; reporterEmail: string; reportedEmail: string; reason: string; itemId: string | null; createdAt: string; }
interface Listing  { id: string; title: string; category: string; seller: string; img: string | null; created_at: string; }
interface AdminUser { id: string; email: string; displayName: string; joinedAt: string; listings: number; }

export default function AdminPanel() {
  const [tab, setTab]           = useState<Tab>('stats');
  const [stats, setStats]       = useState<Stats | null>(null);
  const [reports, setReports]   = useState<Report[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [users, setUsers]       = useState<AdminUser[]>([]);

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    if (tab === 'reports')  fetch('/api/admin/reports').then(r => r.json()).then(d => setReports(Array.isArray(d) ? d : [])).catch(() => {});
    if (tab === 'listings') fetch('/api/admin/listings').then(r => r.json()).then(d => setListings(Array.isArray(d) ? d : [])).catch(() => {});
    if (tab === 'users')    fetch('/api/admin/users').then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d : [])).catch(() => {});
  }, [tab]);

  function dismissReport(id: string) {
    fetch(`/api/admin/reports/${id}`, { method: 'DELETE' });
    setReports(r => r.filter(x => x.id !== id));
  }

  function deleteListing(id: string) {
    if (!confirm('Delete this listing permanently?')) return;
    fetch(`/api/admin/listings/${id}`, { method: 'DELETE' });
    setListings(l => l.filter(x => x.id !== id));
  }

  const STAT_CARDS = [
    { label: 'Users',    value: stats?.users    },
    { label: 'Listings', value: stats?.listings  },
    { label: 'Trades',   value: stats?.trades    },
    { label: 'Reports',  value: stats?.reports   },
  ];

  const TAB_COUNTS: Partial<Record<Tab, number>> = {
    reports:  reports.length,
    listings: listings.length,
    users:    users.length,
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 16px 60px' }}>
      <div className="my-items-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="my-items-title">Admin Panel</h1>
          <p className="my-items-count">Swappr dashboard</p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {(['stats', 'reports', 'listings', 'users'] as Tab[]).map(t => (
          <button
            key={t}
            className={`filter-chip${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {TAB_COUNTS[t] ? <span className="filter-chip-count">{TAB_COUNTS[t]}</span> : null}
          </button>
        ))}
      </div>

      {/* ── Stats ── */}
      {tab === 'stats' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
          {STAT_CARDS.map(({ label, value }) => (
            <div key={label} style={{
              background: 'var(--color-surface)',
              border: '1.5px solid var(--color-border)',
              borderRadius: 16,
              padding: '22px 24px',
            }}>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>{label}</p>
              <p style={{ fontSize: 36, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', lineHeight: 1 }}>
                {value ?? '—'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Reports ── */}
      {tab === 'reports' && (
        <div className="my-items-list" role="list">
          {reports.length === 0 && (
            <p className="my-items-count" style={{ marginTop: 40, textAlign: 'center' }}>No open reports.</p>
          )}
          {reports.map(r => (
            <div key={r.id} className="my-item-card" role="listitem">
              <div className="my-item-info">
                <p className="my-item-title">{r.reason}</p>
                <p className="my-item-meta">
                  <span style={{ color: 'var(--color-text-secondary)' }}>From</span>{' '}{r.reporterEmail}
                  &ensp;{'→'}&ensp;
                  <span style={{ color: 'var(--color-text-secondary)' }}>Against</span>{' '}{r.reportedEmail}
                </p>
                {r.itemId && (
                  <p className="my-item-meta">
                    <a href={`/items/${r.itemId}`} target="_blank" rel="noopener noreferrer"
                      style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
                      View item →
                    </a>
                  </p>
                )}
                <p className="my-item-meta">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => dismissReport(r.id)}
                style={{
                  background: 'none', border: '1.5px solid var(--color-border)', borderRadius: 8,
                  padding: '6px 14px', cursor: 'pointer', fontSize: 13,
                  color: 'var(--color-text-secondary)', fontWeight: 600, flexShrink: 0,
                }}
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Listings ── */}
      {tab === 'listings' && (
        <div className="my-items-list" role="list">
          {listings.length === 0 && (
            <p className="my-items-count" style={{ marginTop: 40, textAlign: 'center' }}>No listings.</p>
          )}
          {listings.map(l => {
            const Icon = CATEGORY_ICONS[l.category] ?? CATEGORY_ICONS['Other'];
            return (
              <div key={l.id} className="my-item-card" role="listitem">
                {l.img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.img} alt="" className="my-item-avatar my-item-avatar--img" />
                ) : (
                  <div className="my-item-avatar my-item-avatar--icon">
                    <Icon size={22} strokeWidth={1.5} />
                  </div>
                )}
                <div className="my-item-info">
                  <p className="my-item-title">{l.title}</p>
                  <p className="my-item-meta">
                    <span className="my-item-cat-tag">{l.category}</span>
                    <span className="my-item-dot" aria-hidden="true">·</span>
                    {l.seller}
                    <span className="my-item-dot" aria-hidden="true">·</span>
                    {new Date(l.created_at).toLocaleDateString()}
                  </p>
                </div>
                <a href={`/items/${l.id}`} target="_blank" rel="noopener noreferrer"
                  style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}>
                  View
                </a>
                <button
                  onClick={() => deleteListing(l.id)}
                  style={{
                    background: 'none', border: '1.5px solid #e8473f', borderRadius: 8,
                    padding: '6px 14px', cursor: 'pointer', fontSize: 13,
                    color: '#e8473f', fontWeight: 600, flexShrink: 0,
                  }}
                >
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Users ── */}
      {tab === 'users' && (
        <div className="my-items-list" role="list">
          {users.length === 0 && (
            <p className="my-items-count" style={{ marginTop: 40, textAlign: 'center' }}>No users.</p>
          )}
          {users.map(u => (
            <div key={u.id} className="my-item-card" role="listitem">
              <div className="my-item-avatar my-item-avatar--icon">
                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                  {(u.displayName || u.email || '?').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="my-item-info">
                <p className="my-item-title">{u.displayName || '—'}</p>
                <p className="my-item-meta">
                  {u.email}
                  <span className="my-item-dot" aria-hidden="true">·</span>
                  {u.listings} listing{u.listings !== 1 ? 's' : ''}
                  <span className="my-item-dot" aria-hidden="true">·</span>
                  Joined {new Date(u.joinedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
