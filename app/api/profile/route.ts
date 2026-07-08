import { createClient } from '@/utils/supabase/server';
import { createServiceClient } from '@/utils/supabase/service';
import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
};

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

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const form = await request.formData();
  const file = form.get('avatar') as File | null;
  if (!file || file.size === 0) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  if (!ALLOWED_MIME[file.type]) return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 400 });

  const ext = ALLOWED_MIME[file.type];
  const path = `avatars/${user.id}.${ext}`;
  const buffer = new Uint8Array(await file.arrayBuffer());

  const db = createServiceClient();
  const { error: uploadErr } = await db.storage
    .from('items')
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 });

  const { data: { publicUrl } } = db.storage.from('items').getPublicUrl(path);
  // Cache-bust so browsers don't serve the stale avatar after an update
  const avatarUrl = `${publicUrl}?t=${Date.now()}`;

  const { error: updateErr } = await supabase.auth.updateUser({
    data: { avatar_url: avatarUrl },
  });
  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  return NextResponse.json({ avatarUrl });
}
