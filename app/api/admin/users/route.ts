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
  const [{ data: usersPage }, { data: items }] = await Promise.all([
    db.auth.admin.listUsers({ perPage: 1000 }),
    db.from('items').select('user_id'),
  ]);

  const listingCounts = new Map<string, number>();
  (items ?? []).forEach(i => {
    listingCounts.set(i.user_id, (listingCounts.get(i.user_id) ?? 0) + 1);
  });

  return NextResponse.json(
    (usersPage?.users ?? []).map(u => ({
      id:          u.id,
      email:       u.email,
      displayName: (u.user_metadata?.display_name as string) ?? '',
      joinedAt:    u.created_at,
      listings:    listingCounts.get(u.id) ?? 0,
    }))
  );
}
