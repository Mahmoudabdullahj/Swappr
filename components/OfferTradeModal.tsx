'use client';

import { useEffect, useState } from 'react';
import { MyItems, type MyItem } from '@/lib/my-items';
import { MyTrades, type TradeTarget } from '@/lib/my-trades';

interface Props {
  open: boolean;
  onClose: () => void;
  onListItem: () => void;
  refreshKey?: number;
  targetItem?: TradeTarget | null;
  onTradeSent?: () => void;
}

export default function OfferTradeModal({ open, onClose, onListItem, refreshKey, targetItem, onTradeSent }: Props) {
  const [items, setItems]     = useState<MyItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [sent, setSent]       = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setItems(MyItems.get());
      setSelected(null);
      setSent(false);
      setSending(false);
      setSendError(null);
    }
  }, [open, refreshKey]);

  async function handleSend() {
    if (!selected || sending) return;
    const offeredItem = items.find(i => i.id === selected);
    if (!offeredItem || !targetItem) return;
    setSending(true);
    setSendError(null);
    try {
      await MyTrades.add({
        offeredItemId:       offeredItem.id,
        offeredItemTitle:    offeredItem.title,
        offeredItemCategory: offeredItem.category,
        targetItemId:        targetItem.id,
        targetItemTitle:     targetItem.title,
        targetItemImg:       targetItem.img,
        targetItemSeller:    targetItem.seller,
        targetItemOwnerId:   targetItem.user_id,
      });
      onTradeSent?.();
      setSent(true);
      setTimeout(onClose, 1800);
    } catch {
      setSendError('Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className={`offer-overlay${open ? ' open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="offerTitle"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="offer-modal">

        {/* Header */}
        <div className="offer-modal-header">
          <h2 className="offer-modal-title" id="offerTitle">
            {sent ? 'Offer sent!' : items.length === 0 ? 'Offer a trade' : 'Which item are you offering?'}
          </h2>
          <button className="list-modal-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Sent confirmation ── */}
        {sent && (
          <div className="offer-sent">
            <div className="offer-sent-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="offer-sent-text">
              Your offer is on its way. We&apos;ll let you know as soon as they respond.
            </p>
          </div>
        )}

        {/* ── No items listed ── */}
        {!sent && items.length === 0 && (
          <div className="offer-empty">
            <div className="offer-empty-icon">📦</div>
            <p className="offer-empty-title">No items listed yet</p>
            <p className="offer-empty-sub">
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
          <div className="offer-body">
            <p className="offer-sub">Pick the item you want to put up for this trade.</p>

            <div className="offer-grid">
              {items.map((item) => (
                <button
                  key={item.id}
                  className={`offer-item${selected === item.id ? ' selected' : ''}`}
                  onClick={() => setSelected(item.id)}
                  aria-pressed={selected === item.id}
                >
                  <span className="offer-item-avatar">{item.title.charAt(0).toUpperCase()}</span>
                  <span className="offer-item-name">{item.title}</span>
                  <span className="offer-item-cat">{item.category || 'Other'}</span>
                  {selected === item.id && (
                    <span className="offer-item-check" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>

            {sendError && (
              <p style={{ color: '#e8473f', fontSize: 13, margin: '0 0 8px', textAlign: 'center' }}>{sendError}</p>
            )}
            <div className="offer-actions">
              <button className="offer-list-more" onClick={onListItem}>
                + List another item
              </button>
              <button
                className="list-submit-btn"
                onClick={handleSend}
                disabled={!selected || sending}
                style={{ opacity: selected && !sending ? 1 : 0.45, cursor: selected && !sending ? 'pointer' : 'not-allowed' }}
              >
                {sending ? 'Sending…' : 'Send Offer'}
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
