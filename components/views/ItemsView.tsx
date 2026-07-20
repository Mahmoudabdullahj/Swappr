'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { UserSession } from '@/lib/types';
import type { MyItem } from '@/lib/my-items';
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

interface ItemsViewProps {
  session: UserSession | null;
  myItems: MyItem[];
  onListItem: (skipWant?: boolean) => void;
  onDeleteItem: (id: string, title: string) => void;
  onMarkItemStatus: (id: string, status: 'active' | 'traded') => void;
}

export default function ItemsView({
  myItems,
  onListItem,
  onDeleteItem,
  onMarkItemStatus,
}: ItemsViewProps) {
  const [myItemsCat, setMyItemsCat] = useState<string | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{ id: string; title: string } | null>(null);
  const [markTradedItemId, setMarkTradedItemId] = useState<string | null>(null);

  const cats = [...new Set(myItems.map(i => i.category))];
  const filtered = myItemsCat ? myItems.filter(i => i.category === myItemsCat) : myItems;

  function handleDeleteClick(id: string, title: string) {
    setDeleteConfirmItem({ id, title });
  }

  function confirmDelete() {
    if (!deleteConfirmItem) return;
    onDeleteItem(deleteConfirmItem.id, deleteConfirmItem.title);
    setDeleteConfirmItem(null);
  }

  function confirmMarkTraded() {
    if (!markTradedItemId) return;
    onMarkItemStatus(markTradedItemId, 'traded');
    setMarkTradedItemId(null);
  }

  return (
    <>
      {/* Delete item confirmation modal */}
      {deleteConfirmItem && (
        <div
          className="confirm-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirmDeleteTitle"
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteConfirmItem(null); }}
        >
          <div className="confirm-modal">
            <h2 className="confirm-modal-title" id="confirmDeleteTitle">Remove listing?</h2>
            <p className="confirm-modal-body">&ldquo;{deleteConfirmItem.title}&rdquo; will be permanently removed from your listings.</p>
            <div className="confirm-modal-actions">
              <button className="confirm-cancel-btn" onClick={() => setDeleteConfirmItem(null)}>Cancel</button>
              <button className="confirm-ok-btn" style={{ background: '#e53e3e' }} onClick={confirmDelete}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Mark as traded confirmation modal */}
      {markTradedItemId && (
        <div
          className="confirm-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirmTradedTitle"
          onClick={(e) => { if (e.target === e.currentTarget) setMarkTradedItemId(null); }}
        >
          <div className="confirm-modal">
            <h2 className="confirm-modal-title" id="confirmTradedTitle">Mark as traded?</h2>
            <p className="confirm-modal-body">This will mark the item as traded and remove it from active listings.</p>
            <div className="confirm-modal-actions">
              <button className="confirm-cancel-btn" onClick={() => setMarkTradedItemId(null)}>Cancel</button>
              <button className="confirm-ok-btn" onClick={confirmMarkTraded}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      <main className="content" id="view-items">
        <div className="my-items-header">
          <div>
            <h1 className="my-items-title">My Items</h1>
            {myItems.length > 0 && (
              <p className="my-items-count">{myItems.length} listing{myItems.length !== 1 ? 's' : ''}</p>
            )}
          </div>
          <button className="btn-primary" onClick={() => onListItem()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="btn-label">List Item</span>
          </button>
        </div>

        {myItems.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 60 }}>
            <div className="empty-state-icon">📦</div>
            <p className="empty-state-text">You haven&apos;t listed anything yet.</p>
            <button className="btn-primary" style={{ marginTop: 20, display: 'inline-flex' }} onClick={() => onListItem()}>
              List your first item
            </button>
          </div>
        ) : (
          <>
            {cats.length > 1 && (
              <div className="my-items-filters" role="tablist" aria-label="Filter by category">
                <button
                  className={`filter-chip${!myItemsCat ? ' active' : ''}`}
                  role="tab"
                  aria-selected={!myItemsCat}
                  onClick={() => setMyItemsCat(null)}
                >
                  All <span className="filter-chip-count">{myItems.length}</span>
                </button>
                {cats.map(cat => (
                  <button
                    key={cat}
                    className={`filter-chip${myItemsCat === cat ? ' active' : ''}`}
                    role="tab"
                    aria-selected={myItemsCat === cat}
                    onClick={() => setMyItemsCat(cat)}
                  >
                    {cat} <span className="filter-chip-count">{myItems.filter(i => i.category === cat).length}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="my-items-list" role="list">
              {filtered.map((item) => (
                <div key={item.id} className="my-item-card" role="listitem">
                  {item.img ? (
                    <Image
                      className="my-item-avatar my-item-avatar--img"
                      src={item.img}
                      alt=""
                      width={46}
                      height={46}
                      aria-hidden="true"
                    />
                  ) : (() => {
                    const Icon = CATEGORY_ICONS[item.category] ?? CATEGORY_ICONS['Other'];
                    return (
                      <div className="my-item-avatar my-item-avatar--icon" aria-hidden="true">
                        <Icon size={22} strokeWidth={1.5} />
                      </div>
                    );
                  })()}
                  <div className="my-item-info">
                    <p className="my-item-title">{item.title}</p>
                    <p className="my-item-meta">
                      <span className="my-item-cat-tag">{item.category}</span>
                      <span className="my-item-dot" aria-hidden="true">·</span>
                      {timeAgo(item.ts)}
                    </p>
                  </div>
                  <span className={`my-item-status${item.status === 'traded' ? ' traded' : ''}`} aria-label="Listing status">
                    {item.status === 'traded' ? 'Traded' : 'Active'}
                  </span>
                  {item.status === 'active' && (
                    <button
                      className="my-item-traded-btn"
                      onClick={() => setMarkTradedItemId(item.id)}
                      aria-label={`Mark ${item.title} as traded`}
                    >
                      Mark as traded
                    </button>
                  )}
                  <button
                    className="my-item-delete"
                    onClick={() => handleDeleteClick(item.id, item.title)}
                    aria-label={`Remove ${item.title}`}
                    title="Remove listing"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" /><path d="M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
