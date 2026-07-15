'use client';

import { useEffect, useRef, useState } from 'react';
import type { CatalogItem, UserSession } from '@/lib/types';
import type { MyItem } from '@/lib/my-items';
import type { TradeOffer } from '@/lib/my-trades';
import { Session } from '@/lib/session';
import ItemCard from '@/components/ItemCard';
import styles from './ProfileView.module.css';

interface ProfileViewProps {
  session: UserSession | null;
  savedItems: CatalogItem[];
  savedLoading: boolean;
  likedIds: Set<string>;
  myItems: MyItem[];
  myTrades: TradeOffer[];
  onLikeToggle: (item: CatalogItem, liked: boolean) => void;
  onOfferTrade: (item: CatalogItem) => void;
  onViewChange: (view: string) => void;
  onSessionUpdate: (newSession: UserSession) => void;
  onLogout: () => void;
}

export default function ProfileView({
  session,
  savedItems,
  savedLoading,
  likedIds,
  myItems,
  myTrades,
  onLikeToggle,
  onOfferTrade,
  onViewChange,
  onSessionUpdate,
  onLogout,
}: ProfileViewProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [settingsName, setSettingsName] = useState('');
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Reset broken-image flag whenever the URL changes (e.g. after a new upload)
  useEffect(() => { setAvatarError(false); }, [session?.avatarUrl]);

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!settingsName.trim()) return;
    setSettingsSaving(true);
    setSettingsMsg('');
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: settingsName }),
      });
      if (!res.ok) throw new Error('Failed to save');
      if (session) {
        const updated = { ...session, displayName: settingsName.trim() };
        Session.save(updated);
        onSessionUpdate(updated);
      }
      setSettingsMsg('Saved!');
    } catch {
      setSettingsMsg('Failed to save. Try again.');
    } finally {
      setSettingsSaving(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !session) return;
    setAvatarUploading(true);
    try {
      const form = new FormData();
      form.append('avatar', file);
      const res = await fetch('/api/profile', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Upload failed');
      const { avatarUrl } = await res.json();
      const updated = { ...session, avatarUrl };
      Session.save(updated);
      onSessionUpdate(updated);
    } catch {
      // upload failed — keep existing avatar
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  }

  return (
    <main className="content" id="view-profile">

      {/* Profile card */}
      <div className={styles['profile-card']}>
        <button
          className={`${styles['profile-avatar']}${avatarUploading ? ` ${styles.uploading}` : ''}`}
          onClick={() => avatarInputRef.current?.click()}
          aria-label="Change profile picture"
          disabled={avatarUploading}
        >
          {(session?.avatarUrl && !avatarError)
            ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={session.avatarUrl} alt="" className={styles['profile-avatar-img']} onError={() => setAvatarError(true)} />
            : <span aria-hidden="true">{session?.displayName.charAt(0).toUpperCase()}</span>
          }
          <span className={styles['profile-avatar-overlay']} aria-hidden="true">
            {avatarUploading
              ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            }
          </span>
        </button>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleAvatarUpload}
        />
        <div className={styles['profile-info']}>
          <h1 className={styles['profile-name']}>{session?.displayName}</h1>
          {session?.memberSince && (
            <p className={styles['profile-since']}>
              Member since {new Date(session.memberSince).toLocaleDateString('en-JO', { month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>
        <button
          className={styles['profile-settings-btn']}
          aria-label="Settings"
          onClick={() => { setSettingsName(session?.displayName || ''); setSettingsMsg(''); setShowSettings(s => !s); }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className={styles['settings-panel']}>
          <h2 className={styles['settings-title']}>Settings</h2>
          <form onSubmit={handleSaveSettings} className={styles['settings-form']}>
            <label className={styles['settings-label']} htmlFor="settings-name">Display Name</label>
            <input
              id="settings-name"
              className={styles['settings-input']}
              value={settingsName}
              onChange={e => setSettingsName(e.target.value)}
              maxLength={40}
              placeholder="Your display name"
            />
            {settingsMsg && (
              <p className={`${styles['settings-msg']}${settingsMsg === 'Saved!' ? ` ${styles.ok}` : ` ${styles.err}`}`}>{settingsMsg}</p>
            )}
            <button type="submit" className={styles['settings-save-btn']} disabled={settingsSaving}>
              {settingsSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
          <button
            className="settings-logout-btn"
            onClick={onLogout}
            style={{ marginTop: 24 }}
          >
            Sign Out
          </button>
        </div>
      )}

      {/* Stats */}
      <div className={styles['profile-stats']}>
        <div className={styles['profile-stat']}>
          <span className={styles['profile-stat-value']}>{myItems.length}</span>
          <span className={styles['profile-stat-label']}>Listings</span>
        </div>
        <div className={styles['profile-stat']}>
          <span className={styles['profile-stat-value']}>{myTrades.length}</span>
          <span className={styles['profile-stat-label']}>Trades Sent</span>
        </div>
        <div className={styles['profile-stat']}>
          <span className={styles['profile-stat-value']}>{likedIds.size}</span>
          <span className={styles['profile-stat-label']}>Saved</span>
        </div>
      </div>

      {/* Saved items */}
      <div className={styles['profile-section-header']}>
        <h2 className={styles['profile-section-title']}>Saved Items</h2>
        {savedItems.length > 0 && (
          <span className="section-count">{savedItems.length} item{savedItems.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {savedLoading ? (
        <div className="item-grid" role="list">
          <div className="item-card-skeleton" aria-hidden="true" />
          <div className="item-card-skeleton" aria-hidden="true" />
          <div className="item-card-skeleton" aria-hidden="true" />
        </div>
      ) : savedItems.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 32 }}>
          <div className="empty-state-icon">🤍</div>
          <p className="empty-state-text">No saved items yet.</p>
          <p className="empty-state-sub">Tap the heart on any item to save it here.</p>
          <button className="btn-primary" style={{ marginTop: 20, display: 'inline-flex' }} onClick={() => onViewChange('discover')}>
            Browse Items
          </button>
        </div>
      ) : (
        <div className="item-grid" role="list">
          {savedItems.map(item => (
            <ItemCard
              key={item.id}
              {...item}
              liked={true}
              onLike={(l) => onLikeToggle(item, l)}
              onOfferTrade={() => onOfferTrade(item)}
            />
          ))}
        </div>
      )}

      <footer className={styles['profile-legal-footer']}>
        <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
        <span aria-hidden="true">·</span>
        <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>
      </footer>
    </main>
  );
}
