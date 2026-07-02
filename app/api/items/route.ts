import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search   = searchParams.get('search');
  const limit    = parseInt(searchParams.get('limit') || '20');

  const supabase = await createClient();

  let query = supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (category) query = query.eq('category', category);
  if (search)   query = query.ilike('title', `%${search}%`);

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const items = (data ?? []).map((row: Record<string, unknown>) => ({
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
  }));

  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const formData  = await request.formData();
  const title        = formData.get('title') as string;
  const category     = (formData.get('category') as string) || 'Other';
  const condition    = (formData.get('condition') as string) || 'good';
  const price        = parseInt((formData.get('price') as string) || '0');
  const userId       = user.id;
  const seller       = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Anonymous';
  const wantTitle    = (formData.get('wantTitle') as string) || null;
  const wantCategory = (formData.get('wantCategory') as string) || null;
  const wantAnything = formData.get('wantAnything') === 'true';
  const image        = formData.get('image') as File | null;

  let imgUrl = '';

  if (image && image.size > 0) {
    const ext      = image.name.split('.').pop() ?? 'jpg';
    const fileName = `${userId}/${Date.now()}.${ext}`;
    const buffer   = new Uint8Array(await image.arrayBuffer());

    const { data: upload, error: uploadErr } = await supabase.storage
      .from('items')
      .upload(fileName, buffer, { contentType: image.type, upsert: false });

    if (!uploadErr && upload) {
      const { data: { publicUrl } } = supabase.storage.from('items').getPublicUrl(fileName);
      imgUrl = publicUrl;
    }
  }

  const { data, error } = await supabase
    .from('items')
    .insert({ user_id: userId, title, category, condition, price, img: imgUrl, seller, want_title: wantTitle, want_category: wantCategory, want_anything: wantAnything })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
