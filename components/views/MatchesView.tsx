'use client';

import type { UserSession, CatalogItem } from '@/lib/types';
import type { TradeTarget } from '@/lib/my-trades';
import { CATEGORY_ICONS } from '@/lib/category-icons';

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface Match {
  id: string;
  matchedAt: number;
  myItem:    { id: string; title: string; img: string; category: string; };
  theirItem: { id: string; title: string; img: string; category: string; seller: string; ownerId: string; };
}

interface ChatTarget {
  userId: string;
  userName: string;
  itemId?: string;
  itemTitle?: string;
  itemImg?: string;
}

interface MatchesViewProps {
  session: UserSession | null;
  myMatches: Match[];
  newMatch: Match | null;
  showMatchModal: boolean;
  onCloseMatchModal: () => void;
  onOpenChat: (target: ChatTarget) => void;
  onOfferTrade: (target: TradeTarget) => void;
  onListItem: (skipWant?: boolean) => void;
  onViewChange: (view: string) => void;
}

export default function MatchesView({
  myMatches,
  newMatch,
  showMatchModal,
  onCloseMatchModal,
  onOpenChat,
  onOfferTrade,
  onListItem,
  onViewChange,
}: MatchesViewProps) {
  return (
    <>
      {/* Match modal */}
      <div
        className={`modal-overlay${showMatchModal ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!showMatchModal}
        aria-labelledby="modalTitle"
        onClick={(e) => { if (e.target === e.currentTarget) onCloseMatchModal(); }}
      >
        <div className="match-modal">
          <div className="confetti-wrapper" aria-hidden="true">
            {[
              { l:'10%', bg:'#5b2ee8', delay:'0.1s', dur:'1.2s' },
              { l:'25%', bg:'#c8e63c', delay:'0.2s', dur:'1.5s' },
              { l:'40%', bg:'#5b2ee8', delay:'0.05s', dur:'1.3s' },
              { l:'55%', bg:'#111',    delay:'0.3s', dur:'1.1s', round:true },
              { l:'70%', bg:'#5b2ee8', delay:'0.15s', dur:'1.4s' },
              { l:'85%', bg:'#c8e63c', delay:'0.25s', dur:'1.6s' },
              { l:'18%', bg:'#111',    delay:'0.35s', dur:'1.2s', round:true },
              { l:'62%', bg:'#5b2ee8', delay:'0.1s',  dur:'1.8s' },
              { l:'78%', bg:'#c8e63c', delay:'0.4s',  dur:'1.3s', round:true },
            ].map((c, i) => (
              <div key={i} className="confetti-piece" style={{
                left: c.l, background: c.bg,
                animationDelay: c.delay, animationDuration: c.dur,
                ...(c.round ? { borderRadius: '50%' } : {}),
              }} />
            ))}
          </div>
          <span className="modal-emoji" aria-hidden="true">🎉</span>
          <h2 className="modal-title" id="modalTitle">You&apos;ve got a match!</h2>
          <p className="modal-sub">
            <strong>{newMatch?.theirItem.seller}</strong> has exactly what you&apos;re looking for.
          </p>
          <div className="modal-swap-row" aria-label="Trade preview">
            <div className="modal-item">
              {newMatch?.myItem.img
                ? /* eslint-disable-next-line @next/next/no-img-element */ <img className="modal-item-img" src={newMatch.myItem.img} alt={newMatch.myItem.title} />
                : <div className="modal-item-img modal-item-placeholder">{newMatch?.myItem.title.charAt(0)}</div>
              }
              <span className="modal-item-label">{newMatch?.myItem.title}</span>
            </div>
            <div className="modal-swap-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 16V4m0 0L3 8m4-4l4 4" /><path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
            <div className="modal-item">
              {newMatch?.theirItem.img
                ? /* eslint-disable-next-line @next/next/no-img-element */ <img className="modal-item-img" src={newMatch.theirItem.img} alt={newMatch.theirItem.title} />
                : <div className="modal-item-img modal-item-placeholder">{newMatch?.theirItem.title.charAt(0)}</div>
              }
              <span className="modal-item-label">{newMatch?.theirItem.title}</span>
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn-secondary" onClick={onCloseMatchModal}>Maybe Later</button>
            <button className="btn-modal-primary" onClick={() => { onCloseMatchModal(); onViewChange('matches'); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 16V4m0 0L3 8m4-4l4 4" /><path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              View Match
            </button>
          </div>
        </div>
      </div>

      <main className="content" id="view-matches">
        <div className="my-items-header">
          <div>
            <h1 className="my-items-title">Matches</h1>
            {myMatches.length > 0 && (
              <p className="my-items-count">{myMatches.length} match{myMatches.length !== 1 ? 'es' : ''} found</p>
            )}
          </div>
        </div>

        {myMatches.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 60 }}>
            <div className="empty-state-icon">🤝</div>
            <p className="empty-state-text">No matches yet.</p>
            <p className="empty-state-sub">List an item and tell us what you want. We&apos;ll find someone listing exactly that who also wants what you have.</p>
            <button className="btn-primary" style={{ marginTop: 20, display: 'inline-flex' }} onClick={() => onListItem()}>
              List an Item
            </button>
          </div>
        ) : (
          <div className="matches-list" role="list">
            {myMatches.map((match) => (
              <div key={match.id} className="match-card" role="listitem">
                {/* My item */}
                <div className="match-side">
                  {match.myItem.img
                    ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={match.myItem.img} alt={match.myItem.title} className="match-img" />
                    : (() => { const Icon = CATEGORY_ICONS[match.myItem.category] ?? CATEGORY_ICONS['Other']; return <div className="match-img-placeholder"><Icon size={24} strokeWidth={1.5} /></div>; })()
                  }
                  <div className="match-item-info">
                    <p className="match-item-label">You&apos;re offering</p>
                    <p className="trade-target-title">{match.myItem.title}</p>
                    <p className="trade-time">{match.myItem.category}</p>
                  </div>
                </div>

                <div className="match-swap-icon" aria-hidden="true">⇄</div>

                {/* Their item */}
                <div className="match-side">
                  {match.theirItem.img
                    ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={match.theirItem.img} alt={match.theirItem.title} className="match-img" />
                    : (() => { const Icon = CATEGORY_ICONS[match.theirItem.category] ?? CATEGORY_ICONS['Other']; return <div className="match-img-placeholder"><Icon size={24} strokeWidth={1.5} /></div>; })()
                  }
                  <div className="match-item-info">
                    <p className="match-item-label">You want</p>
                    <p className="trade-target-title">{match.theirItem.title}</p>
                    <p className="trade-meta">by {match.theirItem.seller}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="match-actions">
                  <p className="trade-time">{timeAgo(match.matchedAt)}</p>
                  <button
                    className="list-submit-btn"
                    style={{ padding: '8px 18px', fontSize: 13 }}
                    onClick={() => onOfferTrade({ id: match.theirItem.id, title: match.theirItem.title, img: match.theirItem.img, category: match.theirItem.category, seller: match.theirItem.seller, user_id: match.theirItem.ownerId })}
                  >
                    Offer Trade
                  </button>
                  <button
                    className="match-msg-btn"
                    onClick={() => onOpenChat({ userId: match.theirItem.ownerId, userName: match.theirItem.seller, itemId: match.theirItem.id, itemTitle: match.theirItem.title, itemImg: match.theirItem.img })}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" aria-hidden="true">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
