export interface TradeTarget {
  id: string;
  title: string;
  category: string;
  img: string;
  seller: string;
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
  status: 'pending';
  ts: number;
}

const KEY = 'tx_my_trades';

export const MyTrades = {
  get(): TradeOffer[] {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); }
    catch { return []; }
  },

  add(offer: Omit<TradeOffer, 'id' | 'ts' | 'status'>): TradeOffer {
    const entry: TradeOffer = {
      ...offer,
      id: `trade_${Date.now()}`,
      status: 'pending',
      ts: Date.now(),
    };
    const current = MyTrades.get();
    localStorage.setItem(KEY, JSON.stringify([entry, ...current]));
    return entry;
  },
};
