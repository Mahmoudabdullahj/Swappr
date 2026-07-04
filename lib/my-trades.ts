export interface TradeTarget {
  id: string;
  title: string;
  category: string;
  img: string;
  seller: string;
  user_id: string;
}

export interface ReceivedTradeOffer {
  id: string;
  senderId: string;
  senderName: string;
  offeredItemId: string;
  offeredItemTitle: string;
  offeredItemCategory: string;
  targetItemId: string;
  targetItemTitle: string;
  targetItemImg: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  ts: number;
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
  status: 'pending' | 'accepted' | 'declined' | 'completed';
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

  async getReceived(): Promise<ReceivedTradeOffer[]> {
    try {
      const res = await fetch('/api/trades?received=true');
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  async respond(id: string, status: 'accepted' | 'declined'): Promise<void> {
    const res = await fetch(`/api/trades/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to respond to trade offer');
  },

  async complete(id: string): Promise<void> {
    const res = await fetch(`/api/trades/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    });
    if (!res.ok) throw new Error('Failed to mark trade as completed');
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
