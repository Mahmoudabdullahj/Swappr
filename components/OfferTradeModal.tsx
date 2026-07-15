'use client';

import { useEffect, useState } from 'react';
import type { MyItem } from '@/lib/my-items';
import { MyTrades, type TradeTarget } from '@/lib/my-trades';
import styles from './OfferTradeModal.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  onListItem: () => void;
  refreshKey?: number;
  targetItem?: TradeTarget | null;
  onTradeSent?: () => void;
  myItems?: MyItem[];
  alreadyOfferedIds?: Set<string>;
}

export default function OfferTradeModal({ open, onClose, onListItem, refreshKey, targetItem, onTradeSent, myItems = [], alreadyOfferedIds }: Props) {
  const [items, setItems]         = useState<MyItem[]>([]);
  const [selected, setSelected]   = useState<Set<string>>(new Set());
  const [sent, setSent]           = useState(false);
  const [sending, setSending]     = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setItems(myItems);
      setSelected(new Set());
      setSent(false);
      setSending(false);
      setSendError(null);
    }
  }, [open, refreshKey, myItems]);

  function toggleItem(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSend() {
    if (selected.size === 0 || sending || !targetItem) return;
    const offeredItems = items
      .filter(i => selected.has(i.id))
      .map(i => ({ id: i.id, title: i.title, category: i.category }));
    if (offeredItems.length === 0) return;
    setSending(true);
    setSendError(null);
    try {
      await MyTrades.add({
        offeredItems,
        targetItemId:      targetItem.id,
        targetItemTitle:   targetItem.title,
        targetItemImg:     targetItem.img,
        targetItemSeller:  targetItem.seller,
        targetItemOwnerId: targetItem.user_id,
      });
      onTradeSent?.();
      setSent(true);
      setTimeout(onClose, 1800);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setSendError(msg);
    } finally {
      setSending(false);
    }
  }

  const selectedItems = items.filter(i => selected.has(i.id));

  return (
    <div
      className={`${styles['offer-overlay']}${open ? ` ${styles.open}` : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="offerTitle"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles['offer-modal']}>

        {/* Header */}
        <div className={styles['offer-modal-header']}>
          <h2 className={styles['offer-modal-title']} id="offerTitle">
            {sent
              ? 'Offer sent!'
              : items.length === 0
              ? 'Offer a trade'
              : selected.size === 0
              ? 'Pick items to offer'
              : `${selected.size} item${selected.size > 1 ? 's' : ''} selected`}
          </h2>
          <button className="list-modal-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Sent confirmation ── */}
        {sent && (
          <div className={styles['offer-sent']}>
            <div className={styles['offer-sent-circle']}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className={styles['offer-sent-text']}>
              Your offer is on its way. We&apos;ll let you know as soon as they respond.
            </p>
          </div>
        )}

        {/* ── No items listed ── */}
        {!sent && items.length === 0 && (
          <div className={styles['offer-empty']}>
            <div className={styles['offer-empty-icon']}>📦</div>
            <p className={styles['offer-empty-title']}>No items listed yet</p>
            <p className={styles['offer-empty-sub']}>
              You need at least one listed item to make a trade offer.
            </p>
            <button className="list-continue-btn" onClick={onListItem}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              List an Item
            </button>
          </div>
        )}

        {/* ── Item picker ── */}
        {!sent && items.length > 0 && (
          <div className={styles['offer-body']}>
            <p className={styles['offer-sub']}>Select one or more items you want to put up for this trade.</p>

            <div className={styles['offer-grid']}>
              {items.map((item) => {
                const isAlreadyOffered = alreadyOfferedIds?.has(item.id) ?? false;
                const isSelected = selected.has(item.id);
                return (
                  <button
                    key={item.id}
                    className={`${styles['offer-item']}${isSelected ? ` ${styles.selected}` : ''}${isAlreadyOffered ? ` ${styles['already-offered']}` : ''}`}
                    onClick={() => { if (!isAlreadyOffered) toggleItem(item.id); }}
                    disabled={isAlreadyOffered}
                    aria-pressed={isSelected}
                    aria-disabled={isAlreadyOffered}
                  >
                    <span className={styles['offer-item-avatar']}>{item.title.charAt(0).toUpperCase()}</span>
                    <span className={styles['offer-item-name']}>{item.title}</span>
                    <span className={styles['offer-item-cat']}>{item.category || 'Other'}</span>
                    {isAlreadyOffered && (
                      <span className={styles['offer-item-already']} aria-hidden="true">Already Offered</span>
                    )}
                    {isSelected && !isAlreadyOffered && (
                      <span className={styles['offer-item-check']} aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selection summary */}
            {selectedItems.length > 0 && (
              <div className={styles['offer-summary']}>
                <span className={styles['offer-summary-label']}>Offering:</span>
                <div className={styles['offer-summary-chips']}>
                  {selectedItems.map(item => (
                    <span key={item.id} className={styles['offer-summary-chip']}>
                      {item.title}
                      <button
                        className={styles['offer-summary-chip-remove']}
                        onClick={() => toggleItem(item.id)}
                        aria-label={`Remove ${item.title}`}
                      >×</button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {sendError && (
              <p style={{ color: '#e8473f', fontSize: 13, margin: '0 0 8px', textAlign: 'center' }}>{sendError}</p>
            )}
            <div className={styles['offer-actions']}>
              <button className={styles['offer-list-more']} onClick={onListItem}>
                + List another item
              </button>
              <button
                className="list-submit-btn"
                onClick={handleSend}
                disabled={selected.size === 0 || sending}
                style={{ opacity: selected.size > 0 && !sending ? 1 : 0.45, cursor: selected.size > 0 && !sending ? 'pointer' : 'not-allowed' }}
              >
                {sending
                  ? 'Sending…'
                  : selected.size > 1
                  ? `Send Bundle (${selected.size})`
                  : 'Send Offer'}
                {!sending && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15" aria-hidden="true">
                    <path d="M7 16V4m0 0L3 8m4-4l4 4" /><path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
