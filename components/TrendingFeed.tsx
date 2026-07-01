'use client';

import { useEffect, useRef, useState } from 'react';
import type { CatalogItem, UserSession } from '@/lib/types';
import { Session } from '@/lib/session';
import ItemCard from './ItemCard';

interface TrendingFeedProps {
  session: UserSession | null;
  onOfferTrade?: (item: CatalogItem) => void;
  onSeeAll?: () => void;
}

export default function TrendingFeed({ session, onOfferTrade, onSeeAll }: TrendingFeedProps) {
  const [items, setItems]     = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast]     = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    fetch('/api/items?limit=8')
      .then((r) => r.json())
      .then((data) => { setItems(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [session]);

  if (!session) return null;

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }

  function handleClick(item: CatalogItem) {
    const s = Session.get();
    if (!s) return;
    Session.addView(s, { itemId: item.id, category: item.category, title: item.title, price: item.price });
    showToast(`Viewed: "${item.title}"`);
  }

  function handleLike(item: CatalogItem, liked: boolean) {
    if (!liked) return;
    const s = Session.get();
    if (!s) return;
    Session.addView(s, { itemId: item.id, category: item.category, title: item.title, price: item.price });
    showToast(`Liked: "${item.title}"`);
  }

  const heading  = 'Trending Near You';
  const tagLabel = 'Trending';

  return (
    <>
      <section aria-labelledby="trendingHeading">
        <header className="section-header">
          <h2 className="section-title" id="trendingHeading">{heading}</h2>
          <span className="feed-type-tag">{tagLabel}</span>
          <button className="section-link" onClick={onSeeAll} aria-label="See all items">See all →</button>
        </header>

        <div className="item-grid" role="list">
          {loading ? (
            <>
              <div className="item-card-skeleton" aria-hidden="true" />
              <div className="item-card-skeleton" aria-hidden="true" />
              <div className="item-card-skeleton" aria-hidden="true" />
              <div className="item-card-skeleton" aria-hidden="true" />
            </>
          ) : items.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <div className="empty-state-icon">🏙️</div>
              <p className="empty-state-text">No nearby listings yet.<br />Be the first to list something!</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} onClick={() => handleClick(item)}>
                <ItemCard
                  id={item.id}
                  title={item.title}
                  category={item.category}
                  condition={item.condition}
                  price={item.price}
                  img={item.img}
                  seller={item.seller}
                  dist={item.dist}
                  onOfferTrade={() => onOfferTrade?.(item)}
                  onLike={(liked) => handleLike(item, liked)}
                />
              </div>
            ))
          )}
        </div>
      </section>

      <div className={`activity-toast${toast ? ' show' : ''}`} aria-live="polite">{toast}</div>
    </>
  );
}
