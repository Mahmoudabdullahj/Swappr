'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ItemCardProps {
  id: string;
  title: string;
  category: string;
  condition: string;
  img: string;
  seller: string;
  dist: number;
  liked?: boolean;
  wantTitle?: string | null;
  wantCategory?: string | null;
  wantAnything?: boolean;
  onOfferTrade?: () => void;
  onLike?: (liked: boolean) => void;
}

const CONDITION_LABEL: Record<string, string> = {
  'new':       'New',
  'brand-new': 'New',
  'like-new':  'Like New',
  'good':      'Good',
  'fair':      'Fair',
  'parts':     'For Parts',
};

const CONDITION_CLASS: Record<string, string> = {
  'new':       'condition-new',
  'brand-new': 'condition-new',
  'like-new':  'condition-likenew',
  'good':      'condition-good',
  'fair':      'condition-fair',
};

export default function ItemCard({
  id,
  title,
  category,
  condition,
  img,
  seller,
  dist,
  liked: initialLiked = false,
  wantTitle,
  wantCategory,
  wantAnything,
  onOfferTrade,
  onLike,
}: ItemCardProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  useEffect(() => { setLiked(initialLiked); }, [initialLiked]);
  const condKey = condition.toLowerCase();
  const condLabel = CONDITION_LABEL[condKey] ?? condition;
  const condClass = CONDITION_CLASS[condKey] ?? 'condition-good';

  function handleLike(e: React.MouseEvent) {
    e.stopPropagation();
    const next = !liked;
    setLiked(next);
    onLike?.(next);
  }

  return (
    <article className="item-card" role="listitem" tabIndex={0} onClick={() => router.push(`/items/${id}`)}>

      {/* ── Image — purple border (ref image 1) ── */}
      <div className="card-image-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt={title} loading="lazy" />

        {/* Always-visible heart button — white circle, top-left */}
        <button
          className={`card-like-btn${liked ? ' liked' : ''}`}
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={handleLike}
        >
          {liked ? (
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          )}
        </button>

        {/* Condition badge — top-right */}
        <span className={`card-condition-badge ${condClass}`}>{condLabel}</span>
      </div>

      {/* ── Info below image ── */}
      <div className="card-info">
        <h3 className="card-title">{title}</h3>
        <p className="card-category">{category}</p>
        {(wantAnything || wantTitle || wantCategory) && (
          <p className="card-wants">
            <span className="card-wants-label">Wants</span>
            {wantAnything ? 'anything' : (wantTitle || wantCategory)}
          </p>
        )}

        {/* Distance pill */}
        <div className="card-meta">
          <span className="card-dist-pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
{dist > 0 ? `~${dist} km` : 'Nearby'} · {seller}
          </span>
        </div>

        {/* Offer trade */}
        <button
          className="btn-offer"
          aria-label={`Offer a trade for ${title}`}
          onClick={(e) => { e.stopPropagation(); onOfferTrade?.(); }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 16V4m0 0L3 8m4-4l4 4" /><path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          Offer Trade
        </button>
      </div>

    </article>
  );
}
