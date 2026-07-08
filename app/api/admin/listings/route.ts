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
  const { data } = await db
    .from('items')
    .select('id, title, category, seller, img, created_at')
    .order('created_at', { ascending: false });

  return NextResponse.json(data ?? []);
}
