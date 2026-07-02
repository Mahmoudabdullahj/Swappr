export interface TradeTarget {
  id: string;
  title: string;
  category: string;
  img: string;
  seller: string;
  user_id: string;
}

export interface TradeOffer {
  id: string;
  offeredItemId: string;
  offeredItemTitle: string;
  offeredItemCategory: string;
  targetItemId: string;
  targetItemTitle: string;
  targetItemImg: string;
  targetItemSeller: string;
  status: 'pending' | 'accepted' | 'declined';
  ts: number;
}

export const MyTrades = {
  async get(): Promise<TradeOffer[]> {
    try {
      const res = await fetch('/api/trades');
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  async add(offer: {
    offeredItemId: string;
    offeredItemTitle: string;
    offeredItemCategory: string;
    targetItemId: string;
    targetItemTitle: string;
    targetItemImg: string;
    targetItemSeller: string;
    targetItemOwnerId: string;
  }): Promise<TradeOffer> {
    const res = await fetch('/api/trades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(offer),
    });
    if (!res.ok) throw new Error('Failed to send trade offer');
    return res.json();
  },
};
