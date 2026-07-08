'use client';

import { useState, useEffect } from 'react';
import type { MyItem } from '@/lib/my-items';
import OfferTradeModal from './OfferTradeModal';
import ListItemModal from './ListItemModal';

interface Props {
  item: {
    id: string;
    title: string;
    category: string;
    img: string;
    seller: string;
    user_id: string;
  };
}

export default function OfferTradeButton({ item }: Props) {
  const [showOffer, setShowOffer]           = useState(false);
  const [showList, setShowList]             = useState(false);
  const [refreshKey, setRefreshKey]         = useState(0);
  const [myItems, setMyItems]               = useState<MyItem[]>([]);
  const [alreadyOfferedIds, setAlreadyOfferedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      fetch('/api/items/mine').then(r => r.json()),
      fetch('/api/trades').then(r => r.json()),
    ]).then(([itemsData, tradesData]) => {
      setMyItems(Array.isArray(itemsData) ? itemsData : []);
      const offeredIds = new Set<string>(
        Array.isArray(tradesData)
          ? tradesData
              .filter((t: { targetItemId: string }) => t.targetItemId === item.id)
              .map((t: { offeredItemId: string }) => t.offeredItemId)
          : []
      );
      setAlreadyOfferedIds(offeredIds);
    }).catch(() => {});
  }, [refreshKey, item.id]);

  return (
    <>
      <button
        className="btn-offer item-detail-offer-btn"
        aria-label={`Offer a trade for ${item.title}`}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%' }}
        onClick={() => setShowOffer(true)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" width="14" height="14" aria-hidden="true">
          <path d="M7 16V4m0 0L3 8m4-4l4 4" />
          <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
        </svg>
        Offer Trade
      </button>

      <OfferTradeModal
        open={showOffer}
        onClose={() => setShowOffer(false)}
        onListItem={() => { setShowOffer(false); setShowList(true); }}
        refreshKey={refreshKey}
        targetItem={{ id: item.id, title: item.title, category: item.category, img: item.img, seller: item.seller, user_id: item.user_id }}
        myItems={myItems}
        alreadyOfferedIds={alreadyOfferedIds}
      />

      <ListItemModal
        open={showList}
        onClose={() => setShowList(false)}
        onListed={() => { setShowList(false); setRefreshKey(k => k + 1); setShowOffer(true); }}
        skipWantStep
      />
    </>
  );
}
