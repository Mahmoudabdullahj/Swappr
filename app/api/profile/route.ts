import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { displayName } = await request.json();
  if (!displayName?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const { error } = await supabase.auth.updateUser({
    data: { display_name: displayName.trim() },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
