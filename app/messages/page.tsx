'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/app-context';
import type { Conversation } from '@/lib/types';
import MessagesView from '@/components/views/MessagesView';

function MessagesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, activeConvo, setActiveConvo, chatTarget, setChatTarget } = useApp();

  // Load conversation from ?convo=<id> URL param once authenticated
  useEffect(() => {
    if (!session) return;
    const convoId = searchParams.get('convo');
    if (!convoId || activeConvo?.id === convoId) return;
    fetch('/api/conversations')
      .then(r => r.json())
      .then((convos: Conversation[]) => {
        const found = Array.isArray(convos) ? convos.find(c => c.id === convoId) : null;
        if (found) setActiveConvo(found);
      })
      .catch(() => {});
  }, [session, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear activeConvo when leaving messages route
  useEffect(() => {
    return () => { setActiveConvo(null); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleConvoChange(convo: Conversation | null) {
    setActiveConvo(convo);
    router.replace(convo ? `/messages?convo=${convo.id}` : '/messages');
  }

  function handleViewChange(view: string) {
    router.push(view === 'discover' ? '/' : `/${view}`);
  }

  return (
    <MessagesView
      session={session}
      activeConvo={activeConvo}
      chatTarget={chatTarget}
      onConvoChange={handleConvoChange}
      onChatTargetChange={setChatTarget}
      onViewChange={handleViewChange}
    />
  );
}

export default function MessagesPage() {
  return (
    <Suspense>
      <MessagesPageInner />
    </Suspense>
  );
}
