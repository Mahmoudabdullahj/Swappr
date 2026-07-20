'use client';

import { useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useApp } from '@/lib/app-context';
import Navigation from '@/components/Navigation';

const LoginModal      = dynamic(() => import('@/components/LoginModal'),     { ssr: false });
const ListItemModal   = dynamic(() => import('@/components/ListItemModal'),   { ssr: false });
const OfferTradeModal = dynamic(() => import('@/components/OfferTradeModal'), { ssr: false });
const DiscoverView    = dynamic(() => import('@/components/views/DiscoverView'));

type View = 'discover' | 'items' | 'trades' | 'messages' | 'matches' | 'profile';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const {
    session, loggedIn, authLoading, handleLogin, handleLogout,
    notifications, unreadNotifCount, markNotificationsRead,
    likedIds, handleLikeToggle,
    myItems, myMatches, receivedTrades,
    refreshTrades, refreshMatches,
    searchQuery, searchResults, isSearching, handleSearch,
    mobileSearchOpen, setMobileSearchOpen,
    showListModal, setShowListModal, listSkipWant, setListSkipWant,
    showOfferModal, setShowOfferModal, tradeTarget,
    openOfferTrade, openListItem,
    offerRefreshKey, setOfferRefreshKey, setActiveConvo,
  } = useApp();

  const activeView: View = pathname === '/' ? 'discover'
    : (pathname.slice(1) as View);

  function handleViewChange(view: string) {
    if (view !== 'messages') setActiveConvo(null);
    router.push(view === 'discover' ? '/' : `/${view}`);
  }

  function toggleMobileSearch() {
    setMobileSearchOpen(prev => {
      if (!prev) setTimeout(() => mobileInputRef.current?.focus(), 50);
      return !prev;
    });
  }

  // On non-home routes, show DiscoverView as a search results overlay
  const showSearchOverlay = isSearching && pathname !== '/';

  return (
    <>
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

      <ListItemModal
        open={showListModal}
        onClose={() => { setShowListModal(false); setListSkipWant(false); }}
        onListed={() => { setOfferRefreshKey(k => k + 1); refreshMatches(); }}
        skipWantStep={listSkipWant}
      />

      <OfferTradeModal
        open={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        onListItem={() => openListItem(true)}
        refreshKey={offerRefreshKey}
        targetItem={tradeTarget}
        onTradeSent={refreshTrades}
        myItems={myItems}
      />

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
          onNotifNavigate={(view) => handleViewChange(view)}
        />

        {showSearchOverlay ? (
          <DiscoverView
            session={session}
            loggedIn={loggedIn}
            authLoading={authLoading}
            likedIds={likedIds}
            onLikeToggle={handleLikeToggle}
            onOfferTrade={openOfferTrade}
            onViewChange={handleViewChange}
            onListItem={(skipWant) => openListItem(!!skipWant)}
            searchQuery={searchQuery}
            searchResults={searchResults}
            isSearching={true}
            mobileSearchOpen={mobileSearchOpen}
          />
        ) : (
          children
        )}
      </div>
    </>
  );
}
