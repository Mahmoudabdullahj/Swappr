'use client';

import { useApp } from '@/lib/app-context';
import ItemsView from '@/components/views/ItemsView';

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
