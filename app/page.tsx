'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { CatalogItem, UserSession, AppNotification } from '@/lib/types';
import type { MyItem } from '@/lib/my-items';
import { MyTrades, type TradeOffer, type ReceivedTradeOffer, type TradeTarget } from '@/lib/my-trades';
import { Session } from '@/lib/session';
import { createClient } from '@/utils/supabase/client';
import LoginModal from '@/components/LoginModal';
import ListItemModal from '@/components/ListItemModal';
import OfferTradeModal from '@/components/OfferTradeModal';
import Navigation from '@/components/Navigation';

const DiscoverView  = dynamic(() => import('@/components/views/DiscoverView'));
const ItemsView     = dynamic(() => import('@/components/views/ItemsView'));
const TradesView    = dynamic(() => import('@/components/views/TradesView'));
const MatchesView   = dynamic(() => import('@/components/views/MatchesView'));
const MessagesView  = dynamic(() => import('@/components/views/MessagesView'));
const ProfileView   = dynamic(() => import('@/components/views/ProfileView'));

type View = 'discover' | 'items' | 'trades' | 'messages' | 'matches' | 'profile';

const VALID_VIEWS: View[] = ['discover', 'items', 'trades', 'messages', 'matches', 'profile'];
function viewFromParams(): View {
  if (typeof window === 'undefined') return 'discover';
  const v = new URLSearchParams(window.location.search).get('v') as View;
  return VALID_VIEWS.includes(v) ? v : 'discover';
}

interface Match {
  id: string;
  matchedAt: number;
  myItem:    { id: string; title: string; img: string; category: string; };
  theirItem: { id: string; title: string; img: string; category: string; seller: string; ownerId: string; };
}

interface Conversation {
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

interface ChatTarget {
  userId: string;
  userName: string;
  itemId?: string;
  itemTitle?: string;
  itemImg?: string;
}

export default function Page() {
  const [session, setSession]               = useState<UserSession | null>(null);
  const [loggedIn, setLoggedIn]             = useState(false);
  const [authLoading, setAuthLoading]       = useState(true);
  const [activeView, setActiveView]         = useState<View>('discover');

  // Global modals
  const [showListModal, setShowListModal]   = useState(false);
  const [listSkipWant, setListSkipWant]     = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [tradeTarget, setTradeTarget]       = useState<TradeTarget | null>(null);
  const [offerRefreshKey, setOfferRefreshKey] = useState(0);

  // Likes / wishlist — seed from localStorage for instant restore on refresh
  const [likedIds, setLikedIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('swappr_liked_ids');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });
  const [savedItems, setSavedItems]   = useState<CatalogItem[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const unreadNotifCount = notifications.filter(n => !n.read).length;

  // Cross-view chat state (set by openChat, read by MessagesView)
  const [activeConvo, setActiveConvo]   = useState<Conversation | null>(null);
  const [chatTarget, setChatTarget]     = useState<ChatTarget | null>(null);

  // Items (needed by ProfileView stats + OfferTradeModal)
  const [myItems, setMyItems]           = useState<MyItem[]>([]);

  // Trades (needed by ProfileView stats + TradesView)
  const [myTrades, setMyTrades]         = useState<TradeOffer[]>([]);
  const [receivedTrades, setReceivedTrades] = useState<ReceivedTradeOffer[]>([]);
  const [tradesRefreshKey, setTradesRefreshKey] = useState(0);

  // Matches
  const [myMatches, setMyMatches]       = useState<Match[]>([]);
  const [matchesRefreshKey, setMatchesRefreshKey] = useState(0);
  const [newMatch, setNewMatch]         = useState<Match | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const seenMatchIds = useRef<Set<string>>(new Set());

  // Mobile search
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState<CatalogItem[]>([]);
  const mobileInputRef  = useRef<HTMLInputElement>(null);
  const searchDebounce  = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (searchDebounce.current) clearTimeout(searchDebounce.current); }, []);

  // ── Auth ──
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s?.user) {
        const stored = Session.get();
        const us: UserSession = stored?.userId === s.user.id
          ? { ...stored, memberSince: stored.memberSince ?? s.user.created_at, avatarUrl: s.user.user_metadata?.avatar_url }
          : {
              userId: s.user.id,
              displayName: s.user.user_metadata?.display_name || s.user.email?.split('@')[0] || 'User',
              avatarUrl: s.user.user_metadata?.avatar_url,
              loginAt: new Date().toISOString(),
              memberSince: s.user.created_at,
              views: [], searches: [],
              profile: { topCategories: [], topKeywords: [], medianPrice: null },
            };
        Session.save(us);
        setSession(us);
        setLoggedIn(true);
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s?.user) {
        const stored = Session.get();
        const us: UserSession = stored?.userId === s.user.id
          ? { ...stored, memberSince: stored.memberSince ?? s.user.created_at, avatarUrl: s.user.user_metadata?.avatar_url }
          : {
              userId: s.user.id,
              displayName: s.user.user_metadata?.display_name || s.user.email?.split('@')[0] || 'User',
              avatarUrl: s.user.user_metadata?.avatar_url,
              loginAt: new Date().toISOString(),
              memberSince: s.user.created_at,
              views: [], searches: [],
              profile: { topCategories: [], topKeywords: [], medianPrice: null },
            };
        Session.save(us);
        setSession(us);
        setLoggedIn(true);
      } else {
        setSession(null);
        setLoggedIn(false);
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Fetch my items ──
  useEffect(() => {
    if (!session) { setMyItems([]); return; }
    fetch('/api/items/mine')
      .then(r => r.json())
      .then(data => setMyItems(Array.isArray(data) ? data : []))
      .catch(() => setMyItems([]));
  }, [session, offerRefreshKey]);

  // ── Auto-open offer modal when landing with ?offer=<id> ──
  useEffect(() => {
    if (!session) return;
    const offerId = new URLSearchParams(window.location.search).get('offer');
    if (!offerId) return;
    window.history.replaceState({}, '', '/');
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

  // ── Notifications ──
  useEffect(() => {
    if (!session) { setNotifications([]); return; }
    fetch('/api/notifications')
      .then(r => r.json())
      .then(data => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [session]);

  useEffect(() => {
    if (!session) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${session.userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${session.userId}` },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          setNotifications(prev => [{
            id:        row.id as string,
            type:      row.type as 'trade_offer' | 'new_message',
            title:     row.title as string,
            body:      (row.body as string) ?? null,
            linkView:  (row.link_view as string) ?? null,
            read:      false,
            createdAt: new Date(row.created_at as string).getTime(),
          }, ...prev]);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session]);

  function markNotificationsRead() {
    if (unreadNotifCount === 0) return;
    fetch('/api/notifications', { method: 'PATCH' }).catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  // ── Sync likes with DB when session loads ──
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

  // ── Load saved item objects whenever liked IDs change ──
  useEffect(() => {
    if (likedIds.size === 0) { setSavedItems([]); return; }
    const ids = Array.from(likedIds).join(',');
    setSavedLoading(true);
    fetch(`/api/items?ids=${encodeURIComponent(ids)}`)
      .then(r => r.json())
      .then(data => { setSavedItems(Array.isArray(data) ? data : []); setSavedLoading(false); })
      .catch(() => setSavedLoading(false));
  }, [likedIds]);

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

  // ── Trade handlers ──
  async function handleTradeResponse(id: string, status: 'accepted' | 'declined') {
    setReceivedTrades(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    try {
      await MyTrades.respond(id, status);
    } catch {
      setTradesRefreshKey(k => k + 1);
    }
  }

  async function handleMarkTradeComplete(id: string) {
    setMyTrades(prev => prev.map(t => t.id === id ? { ...t, status: 'completed' } : t));
    try {
      await MyTrades.complete(id);
    } catch {
      setTradesRefreshKey(k => k + 1);
    }
  }

  // ── Item handlers (passed down to ItemsView) ──
  async function handleDeleteItem(id: string, _title: string) {
    const prev = myItems;
    setMyItems(items => items.filter(i => i.id !== id));
    const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
    if (!res.ok) setMyItems(prev);
  }

  async function handleMarkItemStatus(id: string, status: 'active' | 'traded') {
    const prev = myItems;
    setMyItems(items => items.map(i => i.id === id ? { ...i, status } : i));
    const res = await fetch(`/api/items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) setMyItems(prev);
  }

  // ── openChat — cross-view handler ──
  const conversationsRef = useRef<Conversation[]>([]);
  // keep ref in sync so openChat always has fresh data without being in its dep array
  useEffect(() => { conversationsRef.current = []; }, []); // initial placeholder

  function openChat(target: ChatTarget) {
    // We don't keep conversations in root state; MessagesView owns them.
    // Pass through to MessagesView by setting activeConvo/chatTarget directly.
    // MessagesView will check its own conversations list on mount.
    setActiveConvo(null);
    setChatTarget(target);
    handleViewChange('messages');
  }

  // ── Auth handlers ──
  function handleLogin(newSession: UserSession) {
    Session.save(newSession);
    setSession(newSession);
    setLoggedIn(true);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    Session.destroy();
    localStorage.removeItem('swappr_liked_ids');
    setSession(null);
    setLoggedIn(false);
    setLikedIds(new Set());
    setSavedItems([]);
  }

  // ── Navigation ──
  function handleViewChange(view: string) {
    const v = view as View;
    setActiveView(v);
    if (v !== 'messages') setActiveConvo(null);
    const url = v === 'discover' ? '/' : `/?v=${v}`;
    history.pushState({}, '', url);
  }

  function handleConvoChange(convo: Conversation | null) {
    setActiveConvo(convo);
    const url = convo ? `/?v=messages&convo=${convo.id}` : '/?v=messages';
    history.replaceState({}, '', url);
  }

  // Re-apply param view + convo once auth resolves
  useEffect(() => {
    if (authLoading || !loggedIn) return;
    const params = new URLSearchParams(window.location.search);
    const v = viewFromParams();
    if (v !== 'discover') setActiveView(v);
    const convoId = params.get('convo');
    if (convoId && v === 'messages') {
      fetch('/api/conversations')
        .then(r => r.json())
        .then((convos: Conversation[]) => {
          const found = Array.isArray(convos) ? convos.find(c => c.id === convoId) : null;
          if (found) setActiveConvo(found);
        })
        .catch(() => {});
    }
  }, [authLoading, loggedIn]);

  useEffect(() => {
    const initial = viewFromParams();
    if (initial !== 'discover') setActiveView(initial);

    function onPopState() {
      const v = viewFromParams();
      setActiveView(v);
      if (v !== 'messages') setActiveConvo(null);
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // ── Search ──
  function handleSearch(q: string) {
    setSearchQuery(q);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    if (q.length < 2) { setSearchResults([]); return; }
    searchDebounce.current = setTimeout(() => {
      fetch(`/api/items?search=${encodeURIComponent(q)}&limit=50`)
        .then((r) => r.json())
        .then(setSearchResults)
        .catch(() => setSearchResults([]));
      if (session) {
        const updated = Session.addSearch(session, q);
        setSession(updated);
      }
    }, 400);
  }

  function toggleMobileSearch() {
    setMobileSearchOpen((prev) => {
      if (!prev) setTimeout(() => mobileInputRef.current?.focus(), 50);
      return !prev;
    });
  }

  const isSearching = searchQuery.trim().length >= 2;

  return (
    <>
      {/* Login screen — only after auth check confirms no session */}
      {!authLoading && !loggedIn && (
        <LoginModal onLogin={handleLogin} />
      )}

      {/* Mobile search overlay */}
      <div
        className={`mobile-search-overlay${mobileSearchOpen ? ' open' : ''}`}
        role="search"
        aria-label="Search items"
        onClick={(e) => { if (e.target === e.currentTarget) toggleMobileSearch(); }}
      >
        <div className="mobile-search-inner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={mobileInputRef}
            type="search"
            placeholder="Search items, categories..."
            autoComplete="off"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <button className="mobile-search-cancel" onClick={toggleMobileSearch}>Cancel</button>
        </div>
      </div>

      {/* List item modal */}
      <ListItemModal
        open={showListModal}
        onClose={() => { setShowListModal(false); setListSkipWant(false); }}
        onListed={() => { setOfferRefreshKey(k => k + 1); setMatchesRefreshKey(k => k + 1); }}
        skipWantStep={listSkipWant}
      />

      {/* Offer trade modal */}
      <OfferTradeModal
        open={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        onListItem={() => { setListSkipWant(true); setShowListModal(true); }}
        refreshKey={offerRefreshKey}
        targetItem={tradeTarget}
        onTradeSent={() => setTradesRefreshKey(k => k + 1)}
        myItems={myItems}
      />

      {/* ── App shell ── */}
      <div className="app-shell">

        <Navigation
          activeView={activeView}
          onViewChange={handleViewChange}
          session={loggedIn ? session : null}
          onLogout={handleLogout}
          onListItem={() => setShowListModal(true)}
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          onMobileSearchToggle={toggleMobileSearch}
          tradesCount={receivedTrades.filter(t => t.status === 'pending').length}
          matchCount={myMatches.length}
          msgCount={0}
          notifCount={unreadNotifCount}
          notifications={notifications}
          onNotifOpen={markNotificationsRead}
          onNotifNavigate={(view) => handleViewChange(view as View)}
        />

        {(activeView === 'discover' || isSearching) && (
          <DiscoverView
            session={session}
            loggedIn={loggedIn}
            authLoading={authLoading}
            likedIds={likedIds}
            onLikeToggle={handleLikeToggle}
            onOfferTrade={(item) => { setTradeTarget(item); setShowOfferModal(true); }}
            onViewChange={handleViewChange}
            onListItem={(skipWant) => { setListSkipWant(!!skipWant); setShowListModal(true); }}
            searchQuery={searchQuery}
            searchResults={searchResults}
            isSearching={isSearching}
            mobileSearchOpen={mobileSearchOpen}
          />
        )}

        {!isSearching && activeView === 'items' && (
          <ItemsView
            session={session}
            myItems={myItems}
            onListItem={(skipWant) => { setListSkipWant(!!skipWant); setShowListModal(true); }}
            onDeleteItem={handleDeleteItem}
            onMarkItemStatus={handleMarkItemStatus}
          />
        )}

        {!isSearching && activeView === 'trades' && (
          <TradesView
            session={session}
            myTrades={myTrades}
            receivedTrades={receivedTrades}
            onTradeResponse={handleTradeResponse}
            onMarkTradeComplete={handleMarkTradeComplete}
            onOpenChat={openChat}
            onViewChange={handleViewChange}
          />
        )}

        {!isSearching && activeView === 'matches' && (
          <MatchesView
            session={session}
            myMatches={myMatches}
            newMatch={newMatch}
            showMatchModal={showMatchModal}
            onCloseMatchModal={() => setShowMatchModal(false)}
            onOpenChat={openChat}
            onOfferTrade={(target) => { setTradeTarget(target); setShowOfferModal(true); }}
            onListItem={(skipWant) => { setListSkipWant(!!skipWant); setShowListModal(true); }}
            onViewChange={handleViewChange}
          />
        )}

        {!isSearching && activeView === 'messages' && (
          <MessagesView
            session={session}
            activeConvo={activeConvo}
            chatTarget={chatTarget}
            onConvoChange={handleConvoChange}
            onChatTargetChange={setChatTarget}
            onViewChange={handleViewChange}
          />
        )}

        {!isSearching && activeView === 'profile' && (
          <ProfileView
            session={session}
            savedItems={savedItems}
            savedLoading={savedLoading}
            likedIds={likedIds}
            myItems={myItems}
            myTrades={myTrades}
            onLikeToggle={handleLikeToggle}
            onOfferTrade={(item) => { setTradeTarget(item); setShowOfferModal(true); }}
            onViewChange={handleViewChange}
            onSessionUpdate={setSession}
            onLogout={handleLogout}
          />
        )}

      </div>
    </>
  );
}
