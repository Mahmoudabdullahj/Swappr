'use client';

import { useEffect, useRef, useState } from 'react';
import type { UserSession, AppNotification } from '@/lib/types';

function notifTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

type View = 'discover' | 'items' | 'trades' | 'messages' | 'matches' | 'profile';

interface NavigationProps {
  activeView: View;
  onViewChange: (view: View) => void;
  session: UserSession | null;
  onLogout: () => void;
  onListItem: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onMobileSearchToggle: () => void;
  matchCount?: number;
  msgCount?: number;
  tradesCount?: number;
  notifCount?: number;
  notifications?: AppNotification[];
  onNotifOpen?: () => void;
  onNotifNavigate?: (view: string) => void;
}

const NAV_LINKS: { view: View; label: string }[] = [
  { view: 'discover',  label: 'Home' },
  { view: 'items',     label: 'My Items' },
  { view: 'trades',    label: 'My Trades' },
  { view: 'matches',   label: 'Matches' },
  { view: 'messages',  label: 'Messages' },
];

export default function Navigation({
  activeView,
  onViewChange,
  session,
  onLogout,
  onListItem,
  searchQuery,
  onSearchChange,
  onMobileSearchToggle,
  matchCount = 0,
  msgCount = 0,
  tradesCount = 0,
  notifCount = 0,
  notifications = [],
  onNotifOpen,
  onNotifNavigate,
}: NavigationProps) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [navAvatarError, setNavAvatarError] = useState(false);

  useEffect(() => {
    if (!notifOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setHidden(y > lastY.current && y > 80);
      lastY.current = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* ── Horizontal top bar ── */}
      <header className={`topbar${hidden ? ' nav-hidden' : ''}`}>

        {/* Logo — left */}
        <div className="topbar-logo" onClick={() => onViewChange('discover')} role="button" tabIndex={0} style={{ cursor: 'pointer' }}>
          <img src="/logo-nav.png" alt="Baddel" width={100} height={100} style={{ height: 100 }} />
        </div>

        {/* Nav links — center */}
        <nav className="topbar-nav" aria-label="Main navigation">
          {NAV_LINKS.map(({ view, label }) => (
            <button
              key={view}
              className={`topbar-nav-link${activeView === view ? ' active' : ''}`}
              aria-current={activeView === view ? 'page' : undefined}
              onClick={() => onViewChange(view)}
            >
              {label}
              {view === 'trades'   && tradesCount > 0 && <span className="nav-badge" aria-label={`${tradesCount} pending offers`} />}
              {view === 'matches'  && matchCount  > 0 && <span className="nav-badge" aria-label={`${matchCount} matches`} />}
              {view === 'messages' && msgCount    > 0 && <span className="nav-badge" aria-label={`${msgCount} messages`} />}
            </button>
          ))}
        </nav>

        {/* Actions — right */}
        <div className="topbar-actions">
          {/* Desktop search */}
          <label className="search-bar" htmlFor="searchInput" aria-label="Search items">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              id="searchInput"
              placeholder="Search items..."
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </label>

          {/* Mobile home icon */}
          <button className="btn-icon mobile-search-btn" aria-label="Go to home" onClick={() => onViewChange('discover')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </button>

          {/* Notification bell */}
          {session && (
            <div className="notif-wrapper" ref={notifRef}>
              <button
                className="btn-icon notif-bell"
                aria-label={notifCount > 0 ? `${notifCount} unread notifications` : 'Notifications'}
                onClick={() => {
                  const opening = !notifOpen;
                  setNotifOpen(opening);
                  if (opening) onNotifOpen?.();
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden="true">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {notifCount > 0 && (
                  <span className="notif-badge" aria-hidden="true">
                    {notifCount > 9 ? '9+' : notifCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="notif-dropdown" role="menu" aria-label="Notifications">
                  <div className="notif-dropdown-header">Notifications</div>
                  {notifications.length === 0 ? (
                    <div className="notif-empty">All caught up!</div>
                  ) : (
                    notifications.slice(0, 10).map(n => (
                      <button
                        key={n.id}
                        className={`notif-item${n.read ? '' : ' unread'}`}
                        role="menuitem"
                        onClick={() => {
                          if (n.linkView) onNotifNavigate?.(n.linkView);
                          setNotifOpen(false);
                        }}
                      >
                        <span className="notif-icon" aria-hidden="true">
                          {n.type === 'trade_offer' ? '🔄' : '💬'}
                        </span>
                        <div className="notif-text">
                          <p className="notif-title">{n.title}</p>
                          {n.body && <p className="notif-body">{n.body}</p>}
                          <p className="notif-time">{notifTimeAgo(n.createdAt)}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Session indicator */}
          {session && (
            <div className="session-indicator">
              <button
                className="session-profile-btn"
                onClick={() => onViewChange('profile')}
                aria-label={`View profile for ${session.displayName}`}
                title="View profile"
              >
                <span className="nav-avatar" aria-hidden="true">
                  {(session.avatarUrl && !navAvatarError)
                    ? <img src={session.avatarUrl} alt="" onError={() => setNavAvatarError(true)} />
                    : session.displayName.charAt(0).toUpperCase()
                  }
                </span>
                <span className="session-name">{session.displayName}</span>
              </button>
              <button className="session-logout" onClick={onLogout} aria-label="Log out" title="Log out">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          )}

          {/* List Item CTA */}
          <button className="btn-primary" onClick={(e) => { e.stopPropagation(); onListItem(); }} aria-label="List a new item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="btn-label">List Item</span>
          </button>
        </div>

      </header>

      {/* ── Mobile bottom navigation ── */}
      <nav className="bottom-nav" aria-label="Mobile navigation">

        <button
          className={`bottom-nav-item${activeView === 'discover' ? ' active' : ''}`}
          onClick={() => onViewChange('discover')}
          aria-current={activeView === 'discover' ? 'page' : undefined}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
          <span>Home</span>
        </button>

        <button
          className={`bottom-nav-item${activeView === 'items' ? ' active' : ''}`}
          onClick={() => onViewChange('items')}
          aria-current={activeView === 'items' ? 'page' : undefined}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden="true">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
          <span>My Items</span>
        </button>

        {/* Center List Item button */}
        <button className="bottom-nav-cta" onClick={onListItem} aria-label="List a new item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        <button
          className={`bottom-nav-item${activeView === 'matches' ? ' active' : ''}`}
          onClick={() => onViewChange('matches')}
          aria-current={activeView === 'matches' ? 'page' : undefined}
        >
          <div style={{ position: 'relative', display: 'flex' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden="true">
              <path d="M7 16V4m0 0L3 8m4-4l4 4" /><path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            {matchCount > 0 && <span className="bottom-badge" aria-label={`${matchCount} matches`} />}
          </div>
          <span>Matches</span>
        </button>

        <button
          className={`bottom-nav-item${activeView === 'messages' ? ' active' : ''}`}
          onClick={() => onViewChange('messages')}
          aria-current={activeView === 'messages' ? 'page' : undefined}
        >
          <div style={{ position: 'relative', display: 'flex' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {msgCount > 0 && <span className="bottom-badge" aria-label={`${msgCount} messages`} />}
          </div>
          <span>Messages</span>
        </button>

      </nav>
    </>
  );
}
