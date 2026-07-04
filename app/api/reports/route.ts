import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { reportedUserId, reason, itemId } = await request.json();
  if (!reportedUserId || !reason?.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  if (reportedUserId === user.id) {
    return NextResponse.json({ error: 'Cannot report yourself' }, { status: 400 });
  }

  const { error } = await supabase.from('reports').insert({
    reporter_id:      user.id,
    reported_user_id: reportedUserId,
    reason:           reason.trim(),
    item_id:          itemId || null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
