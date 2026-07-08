import { createClient } from '@/utils/supabase/server';
import { createServiceClient } from '@/utils/supabase/service';
import { NextResponse } from 'next/server';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? '';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const db = createServiceClient();
  await db.from('items').delete().eq('id', params.id);
  return NextResponse.json({ ok: true });
}
