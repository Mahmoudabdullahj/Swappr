export interface CatalogItem {
  id: string;
  user_id: string;
  title: string;
  category: string;
  condition: string;
  price: number;
  img: string;
  seller: string;
  sellerAvatar: string;
  rating: number;
  city: string;
  dist: number;
  wants?: string[];
  featured?: boolean;
}

export interface SessionView {
  itemId: string;
  category: string;
  title: string;
  price: number;
  ts: number;
}

export interface UserSession {
  userId: string;
  displayName: string;
  loginAt: string;
  views: SessionView[];
  searches: Array<{ query: string; ts: number }>;
  profile: {
    topCategories: string[];
    topKeywords: string[];
    medianPrice: number | null;
  };
}
