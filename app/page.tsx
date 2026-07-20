'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/app-context';

const DiscoverView = dynamic(() => import('@/components/views/DiscoverView'));

export default function Page() {
  const router = useRouter();
  const {
    session, loggedIn, authLoading,
    likedIds, handleLikeToggle,
    openOfferTrade, openListItem,
    searchQuery, searchResults, isSearching,
    mobileSearchOpen,
  } = useApp();

  function handleViewChange(view: string) {
    router.push(view === 'discover' ? '/' : `/${view}`);
  }

  return (
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
      isSearching={isSearching}
      mobileSearchOpen={mobileSearchOpen}
    />
  );
}
