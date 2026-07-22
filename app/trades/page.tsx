'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/app-context';
import type { ChatTarget } from '@/lib/types';
import TradesView from '@/components/views/TradesView';

export default function TradesPage() {
  const router = useRouter();
  const {
    session, myTrades, receivedTrades,
    handleTradeResponse, handleMarkTradeComplete,
    setChatTarget, setActiveConvo,
  } = useApp();

  function handleViewChange(view: string) {
    router.push(view === 'discover' ? '/' : `/${view}`);
  }

  function openChat(target: ChatTarget) {
    setActiveConvo(null);
    setChatTarget(target);
    router.push('/messages');
  }

  return (
    <TradesView
      session={session}
      myTrades={myTrades}
      receivedTrades={receivedTrades}
      onTradeResponse={handleTradeResponse}
      onMarkTradeComplete={handleMarkTradeComplete}
      onOpenChat={openChat}
      onViewChange={handleViewChange}
    />
  );
}
