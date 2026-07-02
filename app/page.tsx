'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { CatalogItem, UserSession } from '@/lib/types';
import type { MyItem } from '@/lib/my-items';
import { MyTrades, type TradeOffer, type TradeTarget } from '@/lib/my-trades';
import { Session } from '@/lib/session';
import { createClient } from '@/utils/supabase/client';
import LandingPage from '@/components/LandingPage';
import LoginModal from '@/components/LoginModal';
import OfferTradeModal from '@/components/OfferTradeModal';
import Navigation from '@/components/Navigation';
import CategoryGrid from '@/components/CategoryGrid';
import TrendingFeed from '@/components/TrendingFeed';
import ItemCard from '@/components/ItemCard';
import ListItemModal from '@/components/ListItemModal';

type View = 'discover' | 'items' | 'trades' | 'messages' | 'matches' | 'profile';

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

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: number;
}

interface ChatTarget {
  userId: string;
  userName: string;
  itemId?: string;
  itemTitle?: string;
  itemImg?: string;
}

const AVATAR_COLORS = ['#5b2ee8', '#e8473f', '#2196f3', '#4caf50', '#ff9800', '#9c27b0'];

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// Human-readable names for category slugs
const CATEGORY_NAMES: Record<string, string> = {
  electronics: 'Electronics',
  laptops:     'Laptops',
  cameras:     'Cameras',
  gaming:      'Gaming',
  watches:     'Smartwatches',
  headphones:  'Headphones',
  instruments: 'Instruments',
  fashion:     'Fashion',
  books:       'Books',
  sports:      'Sports',
  furniture:   'Furniture',
  toys:        'Toys',
};

const CATEGORY_SLUG_MAP: Record<string, string> = {
  electronics: 'Electronics',
  cameras:     'Cameras',
  gaming:      'Gaming',
  instruments: 'Instruments',
  fashion:     'Fashion',
  laptops:     'Laptops',
  watches:     'Watches',
  headphones:  'Headphones',
  books:       'Books',
  sports:      'Sports',
  furniture:   'Furniture',
  toys:        'Toys',
};

export default function Page() {
  const [session, setSession]               = useState<UserSession | null>(null);
  const [existingSession, setExistingSession] = useState<UserSession | null>(null);
  const [loggedIn, setLoggedIn]             = useState(false);
  const [activeView, setActiveView]         = useState<View>('discover');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showListModal, setShowListModal]   = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerRefreshKey, setOfferRefreshKey] = useState(0);
  const [tradeTarget, setTradeTarget]       = useState<TradeTarget | null>(null);
  const [myTrades, setMyTrades]             = useState<TradeOffer[]>([]);
  const [tradesRefreshKey, setTradesRefreshKey] = useState(0);
  const [myMatches, setMyMatches]           = useState<Match[]>([]);
  const [matchesRefreshKey, setMatchesRefreshKey] = useState(0);
  const [newMatch, setNewMatch]             = useState<Match | null>(null);
  const seenMatchIds = useRef<Set<string>>(new Set());
  const [listSkipWant, setListSkipWant]     = useState(false);
  const [discoverSubView, setDiscoverSubView] = useState<'exact-matches' | 'trending' | null>(null);
  const [myItems, setMyItems]               = useState<MyItem[]>([]);
  const [myItemsCat, setMyItemsCat]         = useState<string | null>(null);
  const [bannerVisible, setBannerVisible]   = useState(true);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery]       = useState('');
  const [searchResults, setSearchResults]   = useState<CatalogItem[]>([]);
  const [categoryItems, setCategoryItems]   = useState<CatalogItem[]>([]);
  const [allFeedItems, setAllFeedItems]     = useState<CatalogItem[]>([]);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Messages
  const [conversations, setConversations]     = useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo]         = useState<Conversation | null>(null);
  const [chatTarget, setChatTarget]           = useState<ChatTarget | null>(null);
  const [messages, setMessages]               = useState<Message[]>([]);
  const [chatInput, setChatInput]             = useState('');
  const [chatSending, setChatSending]         = useState(false);
  const [convoLoading, setConvoLoading]       = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const convoRefreshKey = useRef(0);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s?.user) {
        const stored = Session.get();
        const us: UserSession = stored?.userId === s.user.id ? stored : {
          userId: s.user.id,
          displayName: s.user.user_metadata?.display_name || s.user.email?.split('@')[0] || 'User',
          loginAt: new Date().toISOString(),
          views: [], searches: [],
          profile: { topCategories: [], topKeywords: [], medianPrice: null },
        };
        Session.save(us);
        setSession(us);
        setExistingSession(us);
        setLoggedIn(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s?.user) {
        const stored = Session.get();
        const us: UserSession = stored?.userId === s.user.id ? stored : {
          userId: s.user.id,
          displayName: s.user.user_metadata?.display_name || s.user.email?.split('@')[0] || 'User',
          loginAt: new Date().toISOString(),
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
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setMyItems([]); return; }
    fetch('/api/items/mine')
      .then(r => r.json())
      .then(data => setMyItems(Array.isArray(data) ? data : []))
      .catch(() => setMyItems([]));
  }, [session, offerRefreshKey]);

  useEffect(() => {
    MyTrades.get().then(setMyTrades).catch(() => setMyTrades([]));
  }, [tradesRefreshKey]);

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

  const fetchConversations = useCallback(() => {
    if (!session) { setConversations([]); return; }
    fetch('/api/conversations')
      .then(r => r.json())
      .then(data => setConversations(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [session]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // Load messages when a conversation is opened
  useEffect(() => {
    if (!activeConvo) { setMessages([]); return; }
    fetch(`/api/conversations/${activeConvo.id}/messages`)
      .then(r => r.json())
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [activeConvo]);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real-time: subscribe to new messages in the active conversation
  useEffect(() => {
    if (!activeConvo || !session) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${activeConvo.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConvo.id}` },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          setMessages(prev => {
            if (prev.some(m => m.id === row.id)) return prev;
            return [...prev, {
              id:             row.id as string,
              conversationId: row.conversation_id as string,
              senderId:       row.sender_id as string,
              senderName:     row.sender_name as string,
              content:        row.content as string,
              createdAt:      new Date(row.created_at as string).getTime(),
            }];
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeConvo, session]);

  async function sendMessage(content: string, targetConvo?: Conversation) {
    const convo = targetConvo ?? activeConvo;
    if (!content.trim() || chatSending) return;
    setChatSending(true);
    try {
      if (convo) {
        // Send to existing conversation
        const res = await fetch(`/api/conversations/${convo.id}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        });
        if (!res.ok) throw new Error();
        fetchConversations();
      } else if (chatTarget) {
        // Create new conversation with first message
        const res = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetUserId:   chatTarget.userId,
            targetUserName: chatTarget.userName,
            itemId:         chatTarget.itemId,
            itemTitle:      chatTarget.itemTitle,
            itemImg:        chatTarget.itemImg,
            message:        content,
          }),
        });
        if (!res.ok) throw new Error();
        const { conversationId } = await res.json();
        // Load the new conversation
        const convosRes = await fetch('/api/conversations');
        const convos: Conversation[] = await convosRes.json();
        setConversations(Array.isArray(convos) ? convos : []);
        const created = convos.find(c => c.id === conversationId) ?? null;
        setActiveConvo(created);
        setChatTarget(null);
      }
      setChatInput('');
    } catch {
      // silent — user will see message didn't appear
    } finally {
      setChatSending(false);
    }
  }

  function openChat(target: ChatTarget) {
    // Check if a conversation already exists with this user
    const existing = conversations.find(
      c => c.otherUserId === target.userId
    );
    if (existing) {
      setActiveConvo(existing);
      setChatTarget(null);
    } else {
      setActiveConvo(null);
      setChatTarget(target);
    }
    setActiveView('messages');
  }

  useEffect(() => {
    if (!activeCategory) { setCategoryItems([]); return; }
    const cat = CATEGORY_SLUG_MAP[activeCategory];
    if (!cat) { setCategoryItems([]); return; }
    fetch(`/api/items?category=${encodeURIComponent(cat)}&limit=50`)
      .then((r) => r.json())
      .then(setCategoryItems)
      .catch(() => setCategoryItems([]));
  }, [activeCategory]);

  useEffect(() => {
    if (discoverSubView !== 'trending') return;
    fetch('/api/items?limit=100')
      .then((r) => r.json())
      .then(setAllFeedItems)
      .catch(() => setAllFeedItems([]));
  }, [discoverSubView]);

  async function handleDeleteItem(id: string) {
    await fetch(`/api/items/${id}`, { method: 'DELETE' });
    setMyItems(prev => prev.filter(i => i.id !== id));
  }

  function handleLogin(newSession: UserSession) {
    Session.save(newSession);
    setSession(newSession);
    setExistingSession(newSession);
    setLoggedIn(true);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    Session.destroy();
    setSession(null);
    setLoggedIn(false);
    setExistingSession(null);
    setBannerVisible(true);
  }

  function handleViewChange(view: View) {
    setActiveView(view);
    setActiveCategory(null);
    setDiscoverSubView(null);
  }

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
      {/* Login screen — only when not logged in */}
      {!loggedIn && (
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

      {/* Match modal */}
      <div
        className={`modal-overlay${showMatchModal ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modalTitle"
        onClick={(e) => { if (e.target === e.currentTarget) setShowMatchModal(false); }}
      >
        <div className="match-modal">
          <div className="confetti-wrapper" aria-hidden="true">
            {[
              { l:'10%', bg:'#5b2ee8', delay:'0.1s', dur:'1.2s' },
              { l:'25%', bg:'#c8e63c', delay:'0.2s', dur:'1.5s' },
              { l:'40%', bg:'#5b2ee8', delay:'0.05s', dur:'1.3s' },
              { l:'55%', bg:'#111',    delay:'0.3s', dur:'1.1s', round:true },
              { l:'70%', bg:'#5b2ee8', delay:'0.15s', dur:'1.4s' },
              { l:'85%', bg:'#c8e63c', delay:'0.25s', dur:'1.6s' },
              { l:'18%', bg:'#111',    delay:'0.35s', dur:'1.2s', round:true },
              { l:'62%', bg:'#5b2ee8', delay:'0.1s',  dur:'1.8s' },
              { l:'78%', bg:'#c8e63c', delay:'0.4s',  dur:'1.3s', round:true },
            ].map((c, i) => (
              <div key={i} className="confetti-piece" style={{
                left: c.l, background: c.bg,
                animationDelay: c.delay, animationDuration: c.dur,
                ...(c.round ? { borderRadius: '50%' } : {}),
              }} />
            ))}
          </div>
          <span className="modal-emoji" aria-hidden="true">🎉</span>
          <h2 className="modal-title" id="modalTitle">You&apos;ve got a match!</h2>
          <p className="modal-sub">
            <strong>{newMatch?.theirItem.seller}</strong> has exactly what you&apos;re looking for.
          </p>
          <div className="modal-swap-row" aria-label="Trade preview">
            <div className="modal-item">
              {newMatch?.myItem.img
                ? /* eslint-disable-next-line @next/next/no-img-element */ <img className="modal-item-img" src={newMatch.myItem.img} alt={newMatch.myItem.title} />
                : <div className="modal-item-img modal-item-placeholder">{newMatch?.myItem.title.charAt(0)}</div>
              }
              <span className="modal-item-label">{newMatch?.myItem.title}</span>
            </div>
            <div className="modal-swap-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 16V4m0 0L3 8m4-4l4 4" /><path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
            <div className="modal-item">
              {newMatch?.theirItem.img
                ? /* eslint-disable-next-line @next/next/no-img-element */ <img className="modal-item-img" src={newMatch.theirItem.img} alt={newMatch.theirItem.title} />
                : <div className="modal-item-img modal-item-placeholder">{newMatch?.theirItem.title.charAt(0)}</div>
              }
              <span className="modal-item-label">{newMatch?.theirItem.title}</span>
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn-secondary" onClick={() => setShowMatchModal(false)}>Maybe Later</button>
            <button className="btn-modal-primary" onClick={() => { setShowMatchModal(false); handleViewChange('matches'); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 16V4m0 0L3 8m4-4l4 4" /><path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              View Match
            </button>
          </div>
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
          matchCount={myMatches.length}
          msgCount={conversations.length}
        />

        {/* ── SEARCH RESULTS VIEW ── */}
        {isSearching && (
          <main className="content" id="view-search">
            <header className="section-header">
              <h2 className="section-title">Results for &ldquo;{searchQuery}&rdquo;</h2>
              <span className="section-count">{searchResults.length} item{searchResults.length !== 1 ? 's' : ''}</span>
            </header>
            {searchResults.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <p className="empty-state-text">No items found for &ldquo;{searchQuery}&rdquo;</p>
              </div>
            ) : (
              <div className="item-grid" role="list">
                {searchResults.map((item) => (
                  <ItemCard key={item.id} {...item} onOfferTrade={() => { setTradeTarget(item); setShowOfferModal(true); }} />
                ))}
              </div>
            )}
          </main>
        )}

        {/* ── CATEGORY VIEW ── */}
        {!isSearching && activeView === 'discover' && activeCategory && (
          <main className="content" id="view-category">
            <div className="category-page-header">
              <button className="back-btn" onClick={() => setActiveCategory(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
                </svg>
                Back
              </button>
              <h1 className="category-page-title">
                {CATEGORY_NAMES[activeCategory] ?? activeCategory}
              </h1>
              <span className="category-item-count">{categoryItems.length} listings</span>
            </div>

            <div className="item-grid" role="list">
              {categoryItems.length === 0 ? (
                <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                  <div className="empty-state-icon">🔍</div>
                  <p className="empty-state-text">
                    No listings in this category yet.<br />Be the first to list something!
                  </p>
                  <button
                    className="btn-primary"
                    style={{ marginTop: 20, display: 'inline-flex' }}
                    onClick={() => setShowListModal(true)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    List an Item
                  </button>
                </div>
              ) : (
                categoryItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    category={item.category}
                    condition={item.condition}
                    price={item.price}
                    img={item.img}
                    seller={item.seller}
                    dist={item.dist}
                    onOfferTrade={() => { setTradeTarget(item); setShowOfferModal(true); }}
                  />
                ))
              )}
            </div>
          </main>
        )}

        {/* ── DISCOVER VIEW ── */}
        {!isSearching && activeView === 'discover' && !activeCategory && (
          discoverSubView === 'exact-matches' ? (
            /* ── Exact Matches full page ── */
            <main className="content" id="view-exact-matches">
              <div className="feed-page-header">
                <button className="back-btn" onClick={() => setDiscoverSubView(null)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <div>
                  <h1 className="feed-page-title">Exact Matches</h1>
                  <p className="feed-page-sub">Coming soon</p>
                </div>
              </div>
              <div className="empty-state" style={{ marginTop: 60 }}>
                <div className="empty-state-icon">🤝</div>
                <p className="empty-state-text">Exact match alerts are coming soon.</p>
              </div>
            </main>

          ) : discoverSubView === 'trending' ? (
            /* ── Trending full page ── */
            <main className="content" id="view-trending">
              <div className="feed-page-header">
                <button className="back-btn" onClick={() => setDiscoverSubView(null)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <div>
                  <h1 className="feed-page-title">Trending Near You</h1>
                  <p className="feed-page-sub">Popular items in your area · {allFeedItems.length} listings</p>
                </div>
              </div>
              <div className="item-grid" role="list">
                {allFeedItems.map((item) => (
                  <ItemCard key={item.id} {...item} onOfferTrade={() => { setTradeTarget(item); setShowOfferModal(true); }} />
                ))}
              </div>
            </main>

          ) : (
            /* ── Normal discover view ── */
            <LandingPage embedded loggedIn={loggedIn}>

              <main className="content" id="view-discover">

                {/* Match alert banner — hidden until real match system is built */}
                {false && bannerVisible && (
                  <section aria-label="Match notification" aria-live="polite">
                    <div className="match-banner">
                      <div className="match-pulse" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </div>
                      <div className="match-banner-text">
                        <p className="match-banner-title">New Exact Match Found</p>
                        <p className="match-banner-sub">
                          <strong>Karim A.</strong> wants your Sony headphones and is offering the Fujifilm X-T30 — <strong>~8 km away</strong>
                        </p>
                      </div>
                      <div className="match-items-preview" aria-hidden="true">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="match-thumb" src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80" alt="Sony WH-1000XM5" />
                        <div className="match-swap-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M7 16V4m0 0L3 8m4-4l4 4" /><path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="match-thumb" src="https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=100&q=80" alt="Fujifilm X-T30" />
                      </div>
                      <button className="btn-match" onClick={() => setShowMatchModal(true)}>
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        View Match
                      </button>
                      <button className="btn-dismiss" onClick={() => setBannerVisible(false)} aria-label="Dismiss">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </section>
                )}

                {/* Category grid */}
                <CategoryGrid onSelect={(slug) => setActiveCategory(slug)} />


                {/* Trending / Recommended feed (post-login) */}
                {loggedIn && (
                  <TrendingFeed
                    session={session}
                    onOfferTrade={(item) => { setTradeTarget(item); setShowOfferModal(true); }}
                    onSeeAll={() => setDiscoverSubView('trending')}
                  />
                )}

              </main>

            </LandingPage>
          )
        )}

        {/* ── MY ITEMS VIEW ── */}
        {!isSearching && activeView === 'items' && (() => {
          const cats = [...new Set(myItems.map(i => i.category))];
          const filtered = myItemsCat ? myItems.filter(i => i.category === myItemsCat) : myItems;
          return (
            <main className="content" id="view-items">
              <div className="my-items-header">
                <div>
                  <h1 className="my-items-title">My Items</h1>
                  {myItems.length > 0 && (
                    <p className="my-items-count">{myItems.length} listing{myItems.length !== 1 ? 's' : ''}</p>
                  )}
                </div>
                <button className="btn-primary" onClick={() => setShowListModal(true)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span className="btn-label">List Item</span>
                </button>
              </div>

              {myItems.length === 0 ? (
                <div className="empty-state" style={{ marginTop: 60 }}>
                  <div className="empty-state-icon">📦</div>
                  <p className="empty-state-text">You haven&apos;t listed anything yet.</p>
                  <button className="btn-primary" style={{ marginTop: 20, display: 'inline-flex' }} onClick={() => setShowListModal(true)}>
                    List your first item
                  </button>
                </div>
              ) : (
                <>
                  {cats.length > 1 && (
                    <div className="my-items-filters" role="tablist" aria-label="Filter by category">
                      <button
                        className={`filter-chip${!myItemsCat ? ' active' : ''}`}
                        role="tab"
                        aria-selected={!myItemsCat}
                        onClick={() => setMyItemsCat(null)}
                      >
                        All <span className="filter-chip-count">{myItems.length}</span>
                      </button>
                      {cats.map(cat => (
                        <button
                          key={cat}
                          className={`filter-chip${myItemsCat === cat ? ' active' : ''}`}
                          role="tab"
                          aria-selected={myItemsCat === cat}
                          onClick={() => setMyItemsCat(cat)}
                        >
                          {cat} <span className="filter-chip-count">{myItems.filter(i => i.category === cat).length}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="my-items-list" role="list">
                    {filtered.map((item, idx) => (
                      <div key={item.id} className="my-item-card" role="listitem">
                        <div
                          className="my-item-avatar"
                          style={{ background: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}
                          aria-hidden="true"
                        >
                          {item.title.charAt(0).toUpperCase()}
                        </div>
                        <div className="my-item-info">
                          <p className="my-item-title">{item.title}</p>
                          <p className="my-item-meta">
                            <span className="my-item-cat-tag">{item.category}</span>
                            <span className="my-item-dot" aria-hidden="true">·</span>
                            {timeAgo(item.ts)}
                          </p>
                        </div>
                        <span className="my-item-status" aria-label="Listing status">Active</span>
                        <button
                          className="my-item-delete"
                          onClick={() => handleDeleteItem(item.id)}
                          aria-label={`Remove ${item.title}`}
                          title="Remove listing"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6" /><path d="M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </main>
          );
        })()}

        {/* ── MY TRADES VIEW ── */}
        {!isSearching && activeView === 'trades' && (
          <main className="content" id="view-trades">
            <div className="my-items-header">
              <div>
                <h1 className="my-items-title">My Trades</h1>
                {myTrades.length > 0 && (
                  <p className="my-items-count">{myTrades.length} offer{myTrades.length !== 1 ? 's' : ''} sent</p>
                )}
              </div>
            </div>

            {myTrades.length === 0 ? (
              <div className="empty-state" style={{ marginTop: 60 }}>
                <div className="empty-state-icon">🔄</div>
                <p className="empty-state-text">You haven&apos;t sent any trade offers yet.</p>
                <p className="empty-state-sub">Browse items and click &ldquo;Offer Trade&rdquo; to get started.</p>
                <button className="btn-primary" style={{ marginTop: 20, display: 'inline-flex' }} onClick={() => handleViewChange('discover')}>
                  Browse Items
                </button>
              </div>
            ) : (
              <div className="trades-list" role="list">
                {myTrades.map((trade) => (
                  <div key={trade.id} className="trade-card" role="listitem">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="trade-target-img" src={trade.targetItemImg} alt={trade.targetItemTitle} />
                    <div className="trade-info">
                      <p className="trade-target-title">{trade.targetItemTitle}</p>
                      <p className="trade-meta">
                        <span>by {trade.targetItemSeller}</span>
                        <span className="my-item-dot" aria-hidden="true">·</span>
                        <span>you offered <strong>{trade.offeredItemTitle}</strong></span>
                      </p>
                      <p className="trade-time">{timeAgo(trade.ts)}</p>
                    </div>
                    <span className="trade-status-badge">Pending</span>
                  </div>
                ))}
              </div>
            )}
          </main>
        )}

        {/* ── MATCHES VIEW ── */}
        {!isSearching && activeView === 'matches' && (
          <main className="content" id="view-matches">
            <div className="my-items-header">
              <div>
                <h1 className="my-items-title">Matches</h1>
                {myMatches.length > 0 && (
                  <p className="my-items-count">{myMatches.length} match{myMatches.length !== 1 ? 'es' : ''} found</p>
                )}
              </div>
            </div>

            {myMatches.length === 0 ? (
              <div className="empty-state" style={{ marginTop: 60 }}>
                <div className="empty-state-icon">🤝</div>
                <p className="empty-state-text">No matches yet.</p>
                <p className="empty-state-sub">List an item and tell us what you want — we&apos;ll find someone listing exactly that who also wants what you have.</p>
                <button className="btn-primary" style={{ marginTop: 20, display: 'inline-flex' }} onClick={() => setShowListModal(true)}>
                  List an Item
                </button>
              </div>
            ) : (
              <div className="matches-list" role="list">
                {myMatches.map((match) => (
                  <div key={match.id} className="match-card" role="listitem">
                    {/* My item */}
                    <div className="match-side">
                      {match.myItem.img
                        ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={match.myItem.img} alt={match.myItem.title} className="match-img" />
                        : <div className="match-img-placeholder">{match.myItem.title.charAt(0)}</div>
                      }
                      <div className="match-item-info">
                        <p className="match-item-label">You&apos;re offering</p>
                        <p className="trade-target-title">{match.myItem.title}</p>
                        <p className="trade-time">{match.myItem.category}</p>
                      </div>
                    </div>

                    <div className="match-swap-icon" aria-hidden="true">⇄</div>

                    {/* Their item */}
                    <div className="match-side">
                      {match.theirItem.img
                        ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={match.theirItem.img} alt={match.theirItem.title} className="match-img" />
                        : <div className="match-img-placeholder">{match.theirItem.title.charAt(0)}</div>
                      }
                      <div className="match-item-info">
                        <p className="match-item-label">You want</p>
                        <p className="trade-target-title">{match.theirItem.title}</p>
                        <p className="trade-meta">by {match.theirItem.seller}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="match-actions">
                      <p className="trade-time">{timeAgo(match.matchedAt)}</p>
                      <button
                        className="list-submit-btn"
                        style={{ padding: '8px 18px', fontSize: 13 }}
                        onClick={() => {
                          setTradeTarget({ id: match.theirItem.id, title: match.theirItem.title, img: match.theirItem.img, category: match.theirItem.category, seller: match.theirItem.seller, user_id: match.theirItem.ownerId });
                          setShowOfferModal(true);
                        }}
                      >
                        Offer Trade
                      </button>
                      <button
                        className="match-msg-btn"
                        onClick={() => openChat({ userId: match.theirItem.ownerId, userName: match.theirItem.seller, itemId: match.theirItem.id, itemTitle: match.theirItem.title, itemImg: match.theirItem.img })}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" aria-hidden="true">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        Message
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        )}

        {/* ── MESSAGES VIEW ── */}
        {!isSearching && activeView === 'messages' && (
          <main className="content" id="view-messages" style={{ padding: 0, maxWidth: '100%', gap: 0 }}>

            {/* ── Chat view (conversation open) ── */}
            {(activeConvo || chatTarget) ? (
              <div className="chat-view">
                <div className="chat-header">
                  <button
                    className="back-btn"
                    onClick={() => { setActiveConvo(null); setChatTarget(null); setConvoLoading(false); }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                  <div className="chat-header-info">
                    <div className="chat-avatar" aria-hidden="true">
                      {(activeConvo?.otherUserName ?? chatTarget?.userName ?? '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="chat-other-name">{activeConvo?.otherUserName ?? chatTarget?.userName}</p>
                      {(activeConvo?.itemTitle ?? chatTarget?.itemTitle) && (
                        <p className="chat-item-context">re: {activeConvo?.itemTitle ?? chatTarget?.itemTitle}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="chat-messages" role="log" aria-live="polite" aria-label="Chat messages">
                  {messages.length === 0 && !chatTarget && (
                    <div className="chat-empty">Start of your conversation</div>
                  )}
                  {messages.length === 0 && chatTarget && (
                    <div className="chat-empty">Say hi to {chatTarget.userName}!</div>
                  )}
                  {messages.map((msg) => {
                    const isMine = msg.senderId === session?.userId;
                    return (
                      <div key={msg.id} className={`chat-message${isMine ? ' sent' : ' recv'}`}>
                        {!isMine && <span className="chat-sender-name">{msg.senderName}</span>}
                        <div className="chat-bubble">{msg.content}</div>
                        <span className="chat-time">{timeAgo(msg.createdAt)}</span>
                      </div>
                    );
                  })}
                  <div ref={chatBottomRef} />
                </div>

                <form
                  className="chat-input-area"
                  onSubmit={(e) => { e.preventDefault(); sendMessage(chatInput); }}
                >
                  <input
                    className="chat-input"
                    type="text"
                    placeholder="Type a message…"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    autoComplete="off"
                  />
                  <button
                    className="chat-send-btn"
                    type="submit"
                    disabled={!chatInput.trim() || chatSending}
                    aria-label="Send message"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  </button>
                </form>
              </div>

            ) : (
              /* ── Conversation list ── */
              <div style={{ padding: '40px', maxWidth: 720, margin: '0 auto', width: '100%' }}>
                <div className="my-items-header">
                  <div>
                    <h1 className="my-items-title">Messages</h1>
                    {conversations.length > 0 && (
                      <p className="my-items-count">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
                    )}
                  </div>
                </div>

                {convoLoading ? (
                  <div className="empty-state" style={{ marginTop: 60 }}>
                    <p className="empty-state-text">Loading…</p>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="empty-state" style={{ marginTop: 60 }}>
                    <div className="empty-state-icon">💬</div>
                    <p className="empty-state-text">No messages yet.</p>
                    <p className="empty-state-sub">Go to a match and tap &ldquo;Message&rdquo; to start a conversation.</p>
                    <button className="btn-primary" style={{ marginTop: 20, display: 'inline-flex' }} onClick={() => handleViewChange('matches')}>
                      View Matches
                    </button>
                  </div>
                ) : (
                  <div className="conversations-list" role="list">
                    {conversations.map((convo) => (
                      <button
                        key={convo.id}
                        className="conversation-item"
                        role="listitem"
                        onClick={() => { setActiveConvo(convo); setChatTarget(null); }}
                      >
                        <div className="conversation-avatar" aria-hidden="true">
                          {convo.otherUserName.charAt(0).toUpperCase()}
                        </div>
                        <div className="conversation-info">
                          <div className="conversation-row">
                            <span className="conversation-name">{convo.otherUserName}</span>
                            {convo.lastMessageAt && (
                              <span className="conversation-time">{timeAgo(convo.lastMessageAt)}</span>
                            )}
                          </div>
                          {convo.itemTitle && (
                            <p className="conversation-context">re: {convo.itemTitle}</p>
                          )}
                          {convo.lastMessage && (
                            <p className="conversation-last">{convo.lastMessage}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        )}

        {/* Placeholder views */}
        {!isSearching && activeView !== 'discover' && activeView !== 'items' && activeView !== 'trades' && activeView !== 'matches' && activeView !== 'messages' && (
          <main className="content">
            <div className="empty-state">
              <div className="empty-state-icon">
                {({ profile: '👤' } as Record<string, string>)[activeView]}
              </div>
              <p className="empty-state-text" style={{ textTransform: 'capitalize' }}>
                {activeView} — coming soon.
              </p>
            </div>
          </main>
        )}

      </div>
    </>
  );
}
