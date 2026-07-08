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
