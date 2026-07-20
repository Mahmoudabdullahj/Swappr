export interface CatalogItem {
  id: string;
  user_id: string;
  title: string;
  category: string;
  condition: string;
  price: number;
  img: string;
  images?: string[];
  seller: string;
  sellerAvatar: string;
  rating: number;
  city: string;
  dist: number;
  wants?: string[];
  featured?: boolean;
  wantTitle?: string | null;
  wantCategory?: string | null;
  wantAnything?: boolean;
  description?: string | null;
}

export interface SessionView {
  itemId: string;
  category: string;
  title: string;
  price: number;
  ts: number;
}

export interface AppNotification {
  id: string;
  type: 'trade_offer' | 'new_message';
  title: string;
  body: string | null;
  linkView: string | null;
  read: boolean;
  createdAt: number;
}

export interface UserSession {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  loginAt: string;
  memberSince?: string;
  views: SessionView[];
  searches: Array<{ query: string; ts: number }>;
  profile: {
    topCategories: string[];
    topKeywords: string[];
    medianPrice: number | null;
  };
}

export interface Match {
  id: string;
  matchedAt: number;
  myItem: { id: string; title: string; img: string; category: string; };
  theirItem: { id: string; title: string; img: string; category: string; seller: string; ownerId: string; };
}

export interface Conversation {
  id: string;
  otherUserId: string;
  otherUserName: string;
  itemId?: string | null;
  itemTitle?: string | null;
  itemImg?: string | null;
  lastMessage?: string | null;
  lastMessageAt?: number | null;
  createdAt: number;
}

export interface ChatTarget {
  userId: string;
  userName: string;
  itemId?: string;
  itemTitle?: string;
  itemImg?: string;
}
