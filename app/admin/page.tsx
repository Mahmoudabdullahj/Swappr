import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import AdminPanel from './AdminPanel';

const ADMIN_EMAIL = 'mahmoudabdullahj@gmail.com';

export const metadata: Metadata = { robots: { index: false } };

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) notFound();
  return <AdminPanel />;
}
