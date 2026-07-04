import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json([]);

  const { data } = await supabase
    .from('items')
    .select('id, title, category, created_at, status')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const items = (data ?? []).map((row) => ({
    id:       row.id,
    title:    row.title,
    category: row.category,
    ts:       new Date(row.created_at).getTime(),
    status:   (row.status as string) || 'active',
  }));

  return NextResponse.json(items);
}
