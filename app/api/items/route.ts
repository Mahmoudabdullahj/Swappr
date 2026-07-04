import { createClient } from '@/utils/supabase/server';
import { createServiceClient } from '@/utils/supabase/service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search   = searchParams.get('search');
  const limit    = parseInt(searchParams.get('limit') || '20');

  const supabase = await createClient();

  const ids = searchParams.get('ids')?.split(',').filter(Boolean) ?? [];

  let query = supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(ids.length > 0 ? 100 : limit);

  if (ids.length > 0) query = query.in('id', ids);
  if (category)       query = query.eq('category', category);
  if (search)         query = query.ilike('title', `%${search}%`);

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
    wantTitle:    row.want_title ?? null,
    wantCategory: row.want_category ?? null,
    wantAnything: row.want_anything ?? false,
  }));

  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const db = createServiceClient();

  const formData  = await request.formData();
  const title        = formData.get('title') as string;
  const category     = (formData.get('category') as string) || 'Other';
  const brand        = (formData.get('brand') as string) || null;
  const model        = (formData.get('model') as string) || null;
  const specsRaw     = (formData.get('specs') as string) || '{}';
  const specs        = (() => { try { return JSON.parse(specsRaw); } catch { return {}; } })();
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

  const { data, error } = await db
    .from('items')
    .insert({ user_id: userId, title, category, brand: brand || null, model: model || null, specs: Object.keys(specs).length ? specs : null, condition, price, img: imgUrl, seller, want_title: wantTitle, want_category: wantCategory, want_anything: wantAnything })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
