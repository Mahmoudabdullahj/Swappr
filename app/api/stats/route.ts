import { createServiceClient } from '@/utils/supabase/service';
import { NextResponse } from 'next/server';

export async function GET() {
  const db = createServiceClient();

  const { count: listings } = await db
    .from('items')
    .select('*', { count: 'exact', head: true });

  const { data: userRows } = await db
    .from('items')
    .select('user_id');

  const traders = new Set((userRows ?? []).map((r: { user_id: string }) => r.user_id)).size;

  return NextResponse.json({ listings: listings ?? 0, traders });
}
