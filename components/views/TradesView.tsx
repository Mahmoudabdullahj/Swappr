'use client';

import { useState } from 'react';
import type { UserSession } from '@/lib/types';
import type { TradeOffer, ReceivedTradeOffer } from '@/lib/my-trades';
import styles from './TradesView.module.css';

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface ChatTarget {
  userId: string;
  userName: string;
  itemId?: string;
  itemTitle?: string;
  itemImg?: string;
}

interface TradesViewProps {
  session: UserSession | null;
  myTrades: TradeOffer[];
  receivedTrades: ReceivedTradeOffer[];
  onTradeResponse: (id: string, status: 'accepted' | 'declined') => void;
  onMarkTradeComplete: (id: string) => void;
  onOpenChat: (target: ChatTarget) => void;
  onViewChange: (view: string) => void;
}

export default function TradesView({
  myTrades,
  receivedTrades,
  onTradeResponse,
  onMarkTradeComplete,
  onOpenChat,
  onViewChange,
}: TradesViewProps) {
  const [tradesTab, setTradesTab] = useState<'sent' | 'received'>('sent');

  return (
    <main className="content" id="view-trades">
      <div className="my-items-header">
        <div>
          <h1 className="my-items-title">My Trades</h1>
        </div>
      </div>

      {/* Sent / Received tabs */}
      <div className={styles['trades-tabs']} role="tablist">
        <button
          className={`${styles['trades-tab']}${tradesTab === 'sent' ? ` ${styles.active}` : ''}`}
          role="tab"
          aria-selected={tradesTab === 'sent'}
          onClick={() => setTradesTab('sent')}
        >
          Sent
          {myTrades.length > 0 && <span className="filter-chip-count">{myTrades.length}</span>}
        </button>
        <button
          className={`${styles['trades-tab']}${tradesTab === 'received' ? ` ${styles.active}` : ''}`}
          role="tab"
          aria-selected={tradesTab === 'received'}
          onClick={() => setTradesTab('received')}
        >
          Received
          {receivedTrades.filter(t => t.status === 'pending').length > 0 && (
            <span className={`filter-chip-count ${styles['filter-chip-count-pending']}`}>{receivedTrades.filter(t => t.status === 'pending').length}</span>
          )}
        </button>
      </div>

      {/* Sent tab */}
      {tradesTab === 'sent' && (
        myTrades.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 60 }}>
            <div className="empty-state-icon">🔄</div>
            <p className="empty-state-text">You haven&apos;t sent any trade offers yet.</p>
            <p className={styles['empty-state-sub']}>Browse items and click &ldquo;Offer Trade&rdquo; to get started.</p>
            <button className="btn-primary" style={{ marginTop: 20, display: 'inline-flex' }} onClick={() => onViewChange('discover')}>
              Browse Items
            </button>
          </div>
        ) : (
          <div className={styles['trades-list']} role="list">
            {myTrades.map((trade) => (
              <div key={trade.id} className={styles['trade-card']} role="listitem">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className={styles['trade-target-img']} src={trade.targetItemImg} alt={trade.targetItemTitle} />
                <div className={styles['trade-info']}>
                  <p className={styles['trade-target-title']}>{trade.targetItemTitle}</p>
                  <p className={styles['trade-meta']}>
                    <span>by {trade.targetItemSeller}</span>
                    <span className="my-item-dot" aria-hidden="true">·</span>
                    <span>you offered <strong>{trade.offeredItemTitle}</strong></span>
                  </p>
                  <p className={styles['trade-time']}>{timeAgo(trade.ts)}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <span className={`${styles['trade-status-badge']}${trade.status !== 'pending' ? ` ${styles[trade.status]}` : ''}`}>
                    {trade.status === 'accepted' ? 'Accepted' : trade.status === 'declined' ? 'Declined' : trade.status === 'completed' ? 'Completed' : 'Pending'}
                  </span>
                  {trade.status === 'accepted' && (
                    <>
                      <button
                        className={styles['trade-message-btn']}
                        onClick={() => onOpenChat({ userId: trade.targetItemOwnerId, userName: trade.targetItemSeller, itemId: trade.targetItemId, itemTitle: trade.targetItemTitle, itemImg: trade.targetItemImg })}
                      >
                        Message
                      </button>
                      <button
                        className={styles['trade-complete-btn']}
                        onClick={() => onMarkTradeComplete(trade.id)}
                      >
                        Mark Complete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Received tab */}
      {tradesTab === 'received' && (
        receivedTrades.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 60 }}>
            <div className="empty-state-icon">📬</div>
            <p className="empty-state-text">No incoming trade offers yet.</p>
            <p className={styles['empty-state-sub']}>When someone offers to trade with you, it will appear here.</p>
          </div>
        ) : (
          <div className={styles['trades-list']} role="list">
            {receivedTrades.map((trade) => (
              <div key={trade.id} className={`${styles['trade-card']} ${styles['received-trade-card']}`} role="listitem">
                <div className={styles['received-trade-avatar']} aria-hidden="true">
                  {trade.senderName.charAt(0).toUpperCase()}
                </div>
                <div className={styles['trade-info']}>
                  <p className={styles['trade-target-title']}>{trade.senderName}</p>
                  <p className={styles['trade-meta']}>
                    <span>offering <strong>{trade.offeredItemTitle}</strong></span>
                    <span className="my-item-dot" aria-hidden="true">·</span>
                    <span>for your <strong>{trade.targetItemTitle}</strong></span>
                  </p>
                  <p className={styles['trade-time']}>{timeAgo(trade.ts)}</p>
                  {trade.status === 'pending' && (
                    <div className={styles['trade-respond-btns']}>
                      <button
                        className={styles['trade-accept-btn']}
                        onClick={() => onTradeResponse(trade.id, 'accepted')}
                      >
                        Accept
                      </button>
                      <button
                        className={styles['trade-decline-btn']}
                        onClick={() => onTradeResponse(trade.id, 'declined')}
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <span className={`${styles['trade-status-badge']}${trade.status !== 'pending' ? ` ${styles[trade.status]}` : ''}`}>
                    {trade.status === 'accepted' ? 'Accepted' : trade.status === 'declined' ? 'Declined' : trade.status === 'completed' ? 'Completed' : 'Pending'}
                  </span>
                  {trade.status === 'accepted' && (
                    <button
                      className={styles['trade-message-btn']}
                      onClick={() => onOpenChat({ userId: trade.senderId, userName: trade.senderName, itemId: trade.targetItemId, itemTitle: trade.targetItemTitle, itemImg: trade.targetItemImg })}
                    >
                      Message
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </main>
  );
}
