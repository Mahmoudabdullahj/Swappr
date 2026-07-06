import { createClient } from '@/utils/supabase/server';
import { createServiceClient } from '@/utils/supabase/service';
import { NextResponse } from 'next/server';

const ADMIN_EMAIL = 'mahmoudabdullahj@gmail.com';

export async function GET() {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const db = createServiceClient();
  const [
    { count: listings },
    { count: trades },
    { count: reports },
    { data: usersPage },
  ] = await Promise.all([
    db.from('items').select('*', { count: 'exact', head: true }),
    db.from('trade_offers').select('*', { count: 'exact', head: true }),
    db.from('reports').select('*', { count: 'exact', head: true }),
    db.auth.admin.listUsers({ perPage: 1 }),
  ]);

  return NextResponse.json({
    listings: listings ?? 0,
    trades:   trades   ?? 0,
    reports:  reports  ?? 0,
    users:    (usersPage as { total?: number } | null)?.total ?? 0,
  });
}
