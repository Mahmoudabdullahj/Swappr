'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { CatalogItem, UserSession, AppNotification, Match, Conversation, ChatTarget } from '@/lib/types';
import type { MyItem } from '@/lib/my-items';
import { MyTrades, type TradeOffer, type ReceivedTradeOffer, type TradeTarget } from '@/lib/my-trades';
import { Session } from '@/lib/session';
import { getClient } from '@/utils/supabase/lazy-client';

interface AppContextValue {
  // Auth
  session: UserSession | null;
  loggedIn: boolean;
  authLoading: boolean;
  handleLogin: (s: UserSession) => void;
  handleLogout: () => Promise<void>;
  setSession: React.Dispatch<React.SetStateAction<UserSession | null>>;

  // Notifications
  notifications: AppNotification[];
  unreadNotifCount: number;
  markNotificationsRead: () => void;

  // Likes
  likedIds: Set<string>;
  savedItems: CatalogItem[];
  savedLoading: boolean;
  handleLikeToggle: (item: CatalogItem, liked: boolean) => void;

  // My Items
  myItems: MyItem[];
  setMyItems: React.Dispatch<React.SetStateAction<MyItem[]>>;
  refreshItems: () => void;
  handleDeleteItem: (id: string, title: string) => Promise<void>;
  handleMarkItemStatus: (id: string, status: 'active' | 'traded') => Promise<void>;

  // Trades
  myTrades: TradeOffer[];
  receivedTrades: ReceivedTradeOffer[];
  refreshTrades: () => void;
  handleTradeResponse: (id: string, status: 'accepted' | 'declined') => Promise<void>;
  handleMarkTradeComplete: (id: string) => Promise<void>;

  // Matches
  myMatches: Match[];
  newMatch: Match | null;
  showMatchModal: boolean;
  setShowMatchModal: (v: boolean) => void;
  refreshMatches: () => void;

  // Search
  searchQuery: string;
  searchResults: CatalogItem[];
  isSearching: boolean;
  handleSearch: (q: string) => void;
  mobileSearchOpen: boolean;
  setMobileSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Modals
  showListModal: boolean;
  setShowListModal: React.Dispatch<React.SetStateAction<boolean>>;
  listSkipWant: boolean;
  setListSkipWant: React.Dispatch<React.SetStateAction<boolean>>;
  showOfferModal: boolean;
  setShowOfferModal: React.Dispatch<React.SetStateAction<boolean>>;
  tradeTarget: TradeTarget | null;
  setTradeTarget: React.Dispatch<React.SetStateAction<TradeTarget | null>>;
  openOfferTrade: (item: TradeTarget) => void;
  openListItem: (skipWant?: boolean) => void;

  // Cross-page chat
  chatTarget: ChatTarget | null;
  setChatTarget: React.Dispatch<React.SetStateAction<ChatTarget | null>>;
  activeConvo: Conversation | null;
  setActiveConvo: React.Dispatch<React.SetStateAction<Conversation | null>>;

  // Refresh keys (for triggering re-fetches)
  offerRefreshKey: number;
  setOfferRefreshKey: React.Dispatch<React.SetStateAction<number>>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession]             = useState<UserSession | null>(null);
  const [loggedIn, setLoggedIn]           = useState(false);
  const [authLoading, setAuthLoading]     = useState(true);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const unreadNotifCount = notifications.filter(n => !n.read).length;

  const [likedIds, setLikedIds] = useState<Set<string>>(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('swappr_liked_ids') : null;
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });
  const [savedItems, setSavedItems]     = useState<CatalogItem[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);

  const [myItems, setMyItems]           = useState<MyItem[]>([]);
  const [myTrades, setMyTrades]         = useState<TradeOffer[]>([]);
  const [receivedTrades, setReceivedTrades] = useState<ReceivedTradeOffer[]>([]);
  const [tradesRefreshKey, setTradesRefreshKey] = useState(0);

  const [myMatches, setMyMatches]       = useState<Match[]>([]);
  const [matchesRefreshKey, setMatchesRefreshKey] = useState(0);
  const [newMatch, setNewMatch]         = useState<Match | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const seenMatchIds = useRef<Set<string>>(new Set());

  const [showListModal, setShowListModal]     = useState(false);
  const [listSkipWant, setListSkipWant]       = useState(false);
  const [showOfferModal, setShowOfferModal]   = useState(false);
  const [tradeTarget, setTradeTarget]         = useState<TradeTarget | null>(null);
  const [offerRefreshKey, setOfferRefreshKey] = useState(0);

  const [chatTarget, setChatTarget]   = useState<ChatTarget | null>(null);
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);

  const [searchQuery, setSearchQuery]     = useState('');
  const [searchResults, setSearchResults] = useState<CatalogItem[]>([]);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const supabaseRef = useRef<any>(null);

  // ── Auth ──
  useEffect(() => {
    let cancelled = false;
    let sub: { unsubscribe: () => void } | null = null;

    getClient().then((supabase) => {
      if (cancelled) return;
      supabaseRef.current = supabase;

      supabase.auth.getSession().then(({ data: { session: s } }) => {
        if (cancelled) return;
        if (s?.user) {
          const stored = Session.get();
          const us: UserSession = stored?.userId === s.user.id
            ? { ...stored, memberSince: stored.memberSince ?? s.user.created_at, avatarUrl: s.user.user_metadata?.avatar_url }
            : { userId: s.user.id, displayName: s.user.user_metadata?.display_name || s.user.email?.split('@')[0] || 'User', avatarUrl: s.user.user_metadata?.avatar_url, loginAt: new Date().toISOString(), memberSince: s.user.created_at, views: [], searches: [], profile: { topCategories: [], topKeywords: [], medianPrice: null } };
          Session.save(us);
          setSession(us);
          setLoggedIn(true);
        }
        setAuthLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
        if (cancelled) return;
        if (s?.user) {
          const stored = Session.get();
          const us: UserSession = stored?.userId === s.user.id
            ? { ...stored, memberSince: stored.memberSince ?? s.user.created_at, avatarUrl: s.user.user_metadata?.avatar_url }
            : { userId: s.user.id, displayName: s.user.user_metadata?.display_name || s.user.email?.split('@')[0] || 'User', avatarUrl: s.user.user_metadata?.avatar_url, loginAt: new Date().toISOString(), memberSince: s.user.created_at, views: [], searches: [], profile: { topCategories: [], topKeywords: [], medianPrice: null } };
          Session.save(us);
          setSession(us);
          setLoggedIn(true);
        } else {
          setSession(null);
          setLoggedIn(false);
        }
        setAuthLoading(false);
      });
      sub = subscription;
    });

    return () => { cancelled = true; sub?.unsubscribe(); };
  }, []);

  // ── Auto-open offer modal from ?offer=<id> URL param ──
  useEffect(() => {
    if (!session) return;
    const offerId = new URLSearchParams(window.location.search).get('offer');
    if (!offerId) return;
    window.history.replaceState({}, '', window.location.pathname);
    fetch(`/api/items?ids=${offerId}`)
      .then(r => r.json())
      .then((items: CatalogItem[]) => {
        const item = items[0];
        if (!item) return;
        setTradeTarget({ id: item.id, title: item.title, category: item.category, img: item.img, seller: item.seller, user_id: item.user_id });
        setShowOfferModal(true);
      })
      .catch(() => {});
  }, [session]);

  // ── Fetch my items ──
  useEffect(() => {
    if (!session) { setMyItems([]); return; }
    fetch('/api/items/mine')
      .then(r => r.json())
      .then(data => setMyItems(Array.isArray(data) ? data : []))
      .catch(() => setMyItems([]));
  }, [session, offerRefreshKey]);

  // ── Fetch trades ──
  useEffect(() => {
    MyTrades.get().then(setMyTrades).catch(() => setMyTrades([]));
    MyTrades.getReceived().then(setReceivedTrades).catch(() => setReceivedTrades([]));
  }, [tradesRefreshKey]);

  // ── Fetch matches ──
  useEffect(() => {
    if (!session) { setMyMatches([]); return; }
    fetch('/api/matches')
      .then(r => r.json())
      .then((data: Match[]) => {
        if (!Array.isArray(data)) return;
        setMyMatches(data);
        const isFirstLoad = seenMatchIds.current.size === 0;
        const freshMatches = data.filter(m => !seenMatchIds.current.has(m.id));
        data.forEach(m => seenMatchIds.current.add(m.id));
        if (!isFirstLoad && freshMatches.length > 0) {
          setNewMatch(freshMatches[0]);
          setShowMatchModal(true);
        }
      })
      .catch(() => setMyMatches([]));
  }, [session, matchesRefreshKey]);

  // ── Fetch notifications ──
  useEffect(() => {
    if (!session) { setNotifications([]); return; }
    fetch('/api/notifications')
      .then(r => r.json())
      .then(data => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [session]);

  // ── Realtime notification subscription ──
  useEffect(() => {
    if (!session || !supabaseRef.current) return;
    const supabase = supabaseRef.current;
    const channel = supabase
      .channel(`notifications:${session.userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${session.userId}` },
        (payload: { new: Record<string, unknown> }) => {
          const row = payload.new;
          setNotifications(prev => [{
            id: row.id as string, type: row.type as 'trade_offer' | 'new_message',
            title: row.title as string, body: (row.body as string) ?? null,
            linkView: (row.link_view as string) ?? null, read: false,
            createdAt: new Date(row.created_at as string).getTime(),
          }, ...prev]);
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session]);

  // ── Sync likes with DB ──
  useEffect(() => {
    if (!session) return;
    fetch('/api/likes')
      .then(r => r.json())
      .then((ids: string[]) => {
        if (!Array.isArray(ids)) return;
        setLikedIds(new Set(ids));
        localStorage.setItem('swappr_liked_ids', JSON.stringify(ids));
      })
      .catch(() => {});
  }, [session]);

  // ── Load saved item objects when liked IDs change ──
  useEffect(() => {
    if (likedIds.size === 0) { setSavedItems([]); return; }
    const ids = Array.from(likedIds).join(',');
    setSavedLoading(true);
    fetch(`/api/items?ids=${encodeURIComponent(ids)}`)
      .then(r => r.json())
      .then(data => { setSavedItems(Array.isArray(data) ? data : []); setSavedLoading(false); })
      .catch(() => setSavedLoading(false));
  }, [likedIds]);

  // ── Debounce cleanup ──
  useEffect(() => () => { if (searchDebounce.current) clearTimeout(searchDebounce.current); }, []);

  function markNotificationsRead() {
    if (unreadNotifCount === 0) return;
    fetch('/api/notifications', { method: 'PATCH' }).catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  function handleLikeToggle(item: CatalogItem, liked: boolean) {
    setLikedIds(prev => {
      const next = new Set(prev);
      liked ? next.add(item.id) : next.delete(item.id);
      localStorage.setItem('swappr_liked_ids', JSON.stringify([...next]));
      return next;
    });
    if (liked) {
      setSavedItems(prev => prev.some(i => i.id === item.id) ? prev : [item, ...prev]);
      fetch('/api/likes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ itemId: item.id }) }).catch(() => {});
    } else {
      setSavedItems(prev => prev.filter(i => i.id !== item.id));
      fetch(`/api/likes?itemId=${encodeURIComponent(item.id)}`, { method: 'DELETE' }).catch(() => {});
    }
  }

  async function handleTradeResponse(id: string, status: 'accepted' | 'declined') {
    setReceivedTrades(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    try { await MyTrades.respond(id, status); }
    catch { setTradesRefreshKey(k => k + 1); }
  }

  async function handleMarkTradeComplete(id: string) {
    setMyTrades(prev => prev.map(t => t.id === id ? { ...t, status: 'completed' } : t));
    try { await MyTrades.complete(id); }
    catch { setTradesRefreshKey(k => k + 1); }
  }

  async function handleDeleteItem(id: string, _title: string) {
    const prev = myItems;
    setMyItems(items => items.filter(i => i.id !== id));
    const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
    if (!res.ok) setMyItems(prev);
  }

  async function handleMarkItemStatus(id: string, status: 'active' | 'traded') {
    const prev = myItems;
    setMyItems(items => items.map(i => i.id === id ? { ...i, status } : i));
    const res = await fetch(`/api/items/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    if (!res.ok) setMyItems(prev);
  }

  function handleLogin(newSession: UserSession) {
    Session.save(newSession);
    setSession(newSession);
    setLoggedIn(true);
  }

  async function handleLogout() {
    const supabase = supabaseRef.current ?? await getClient();
    await supabase.auth.signOut();
    Session.destroy();
    localStorage.removeItem('swappr_liked_ids');
    setSession(null);
    setLoggedIn(false);
    setLikedIds(new Set());
    setSavedItems([]);
  }

  function openOfferTrade(item: TradeTarget) {
    setTradeTarget(item);
    setShowOfferModal(true);
  }

  function openListItem(skipWant = false) {
    setListSkipWant(skipWant);
    setShowListModal(true);
  }

  function handleSearch(q: string) {
    setSearchQuery(q);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    if (q.length < 2) { setSearchResults([]); return; }
    searchDebounce.current = setTimeout(() => {
      fetch(`/api/items?search=${encodeURIComponent(q)}&limit=50`)
        .then(r => r.json())
        .then(setSearchResults)
        .catch(() => setSearchResults([]));
      if (session) {
        const updated = Session.addSearch(session, q);
        setSession(updated);
      }
    }, 400);
  }

  const value: AppContextValue = {
    session, loggedIn, authLoading, handleLogin, handleLogout, setSession,
    notifications, unreadNotifCount, markNotificationsRead,
    likedIds, savedItems, savedLoading, handleLikeToggle,
    myItems, setMyItems, refreshItems: () => setOfferRefreshKey(k => k + 1), handleDeleteItem, handleMarkItemStatus,
    myTrades, receivedTrades, refreshTrades: () => setTradesRefreshKey(k => k + 1), handleTradeResponse, handleMarkTradeComplete,
    myMatches, newMatch, showMatchModal, setShowMatchModal, refreshMatches: () => setMatchesRefreshKey(k => k + 1),
    searchQuery, searchResults, isSearching: searchQuery.trim().length >= 2, handleSearch, mobileSearchOpen, setMobileSearchOpen,
    showListModal, setShowListModal, listSkipWant, setListSkipWant,
    showOfferModal, setShowOfferModal, tradeTarget, setTradeTarget, openOfferTrade, openListItem,
    chatTarget, setChatTarget, activeConvo, setActiveConvo,
    offerRefreshKey, setOfferRefreshKey,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
