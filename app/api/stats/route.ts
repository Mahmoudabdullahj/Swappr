import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();

  const { count: listings } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true });

  const { data: userRows } = await supabase
    .from('items')
    .select('user_id');

  const traders = new Set((userRows ?? []).map((r: { user_id: string }) => r.user_id)).size;

  return NextResponse.json({ listings: listings ?? 0, traders });
}
