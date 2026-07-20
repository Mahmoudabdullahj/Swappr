'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/app-context';

const ProfileView = dynamic(() => import('@/components/views/ProfileView'));

export default function ProfilePage() {
  const router = useRouter();
  const {
    session, setSession, handleLogout,
    savedItems, savedLoading, likedIds, handleLikeToggle,
    myItems, myTrades,
    openOfferTrade,
  } = useApp();

  function handleViewChange(view: string) {
    router.push(view === 'discover' ? '/' : `/${view}`);
  }

  return (
    <ProfileView
      session={session}
      savedItems={savedItems}
      savedLoading={savedLoading}
      likedIds={likedIds}
      myItems={myItems}
      myTrades={myTrades}
      onLikeToggle={handleLikeToggle}
      onOfferTrade={openOfferTrade}
      onViewChange={handleViewChange}
      onSessionUpdate={setSession}
      onLogout={handleLogout}
    />
  );
}
