'use client';

import dynamic from 'next/dynamic';
import { useApp } from '@/lib/app-context';

const ItemsView = dynamic(() => import('@/components/views/ItemsView'));

export default function ItemsPage() {
  const { session, myItems, openListItem, handleDeleteItem, handleMarkItemStatus } = useApp();

  return (
    <ItemsView
      session={session}
      myItems={myItems}
      onListItem={(skipWant) => openListItem(!!skipWant)}
      onDeleteItem={handleDeleteItem}
      onMarkItemStatus={handleMarkItemStatus}
    />
  );
}
