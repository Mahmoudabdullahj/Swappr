import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

function mapItem(row: Record<string, unknown>) {
  return {
    id:           row.id,
    user_id:      row.user_id,
    title:        row.title,
    category:     row.category,
    condition:    row.condition,
    price:        row.price,
    img:          row.img,
    seller:       row.seller,
    sellerAvatar: row.seller_avatar ?? '',
    rating:       row.rating ?? 0,
    city:         row.city ?? '',
    dist:         row.dist ?? 0,
    wantTitle:    row.want_title ?? null,
    wantCategory: row.want_category ?? null,
    wantAnything: row.want_anything ?? false,
  };
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const full = new URL(request.url).searchParams.get('full') === 'true';

  const { data: likes, error } = await supabase
    .from('user_likes')
    .select('item_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const itemIds = (likes ?? []).map((r: { item_id: string }) => r.item_id);

  if (!full) return NextResponse.json(itemIds);

  if (itemIds.length === 0) return NextResponse.json([]);

  const { data: items, error: itemsError } = await supabase
    .from('items')
    .select('*')
    .in('id', itemIds);

  if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 });

  // Return in liked order (most recently liked first)
  const itemMap = new Map((items ?? []).map((i: Record<string, unknown>) => [i.id as string, i]));
  const ordered = itemIds.map(id => itemMap.get(id)).filter((i): i is Record<string, unknown> => i !== undefined);
  return NextResponse.json(ordered.map(mapItem));
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { itemId } = await request.json();
  if (!itemId) return NextResponse.json({ error: 'itemId required' }, { status: 400 });

  const { error } = await supabase
    .from('user_likes')
    .upsert({ user_id: user.id, item_id: itemId }, { onConflict: 'user_id,item_id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const itemId = new URL(request.url).searchParams.get('itemId');
  if (!itemId) return NextResponse.json({ error: 'itemId required' }, { status: 400 });

  const { error } = await supabase
    .from('user_likes')
    .delete()
    .eq('user_id', user.id)
    .eq('item_id', itemId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
