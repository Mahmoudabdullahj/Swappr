import { createClient } from '@/utils/supabase/server';
import { createServiceClient } from '@/utils/supabase/service';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json([]);

  const db = createServiceClient();
  const { data } = await db
    .from('items')
    .select('id, title, category, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const items = (data ?? []).map((row: Record<string, unknown>) => ({
    id:       row.id,
    title:    row.title,
    category: row.category,
    ts:       new Date(row.created_at as string).getTime(),
  }));

  return NextResponse.json(items);
}
