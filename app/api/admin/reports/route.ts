import { createClient } from '@/utils/supabase/server';
import { createServiceClient } from '@/utils/supabase/service';
import { NextResponse } from 'next/server';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? '';

export async function GET() {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const db = createServiceClient();
  const [{ data: reports }, { data: usersPage }] = await Promise.all([
    db.from('reports')
      .select('id, reporter_id, reported_user_id, reason, item_id, created_at')
      .order('created_at', { ascending: false }),
    db.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const userMap = new Map<string, string>();
  (usersPage?.users ?? []).forEach(u => userMap.set(u.id, u.email ?? u.id));

  return NextResponse.json(
    (reports ?? []).map(r => ({
      id:            r.id,
      reporterEmail: userMap.get(r.reporter_id)      ?? r.reporter_id,
      reportedEmail: userMap.get(r.reported_user_id) ?? r.reported_user_id,
      reason:        r.reason,
      itemId:        r.item_id,
      createdAt:     r.created_at,
    }))
  );
}
