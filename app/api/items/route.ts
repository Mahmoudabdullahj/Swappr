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

  // Detect matches: find items the new listing's owner wants
  if (wantAnything || wantTitle || wantCategory) {
    const { data: candidates } = await supabase
      .from('items')
      .select('id, user_id, title, category, img, seller')
      .neq('user_id', userId);

    const newWantTitle = (wantTitle || '').toLowerCase();
    const newWantCat   = wantCategory || '';

    const matched = (candidates ?? []).filter(other => {
      if (wantAnything) return true;
      const titleMatch = newWantTitle && other.title.toLowerCase().includes(newWantTitle);
      const catMatch   = newWantCat && other.category === newWantCat;
      return titleMatch || catMatch;
    });

    if (matched.length > 0) {
      await supabase.from('matches').upsert(
        matched.map(other => {
          const [aId, aOwner, aTitle, aImg, aCat, aSeller, bId, bOwner, bTitle, bImg, bCat, bSeller] =
            data.id < other.id
              ? [data.id, userId, title, imgUrl, category, seller, other.id, other.user_id, other.title, other.img, other.category, other.seller]
              : [other.id, other.user_id, other.title, other.img, other.category, other.seller, data.id, userId, title, imgUrl, category, seller];
          return { item_a_id: aId, item_a_owner_id: aOwner, item_a_title: aTitle, item_a_img: aImg, item_a_category: aCat, item_a_seller: aSeller, item_b_id: bId, item_b_owner_id: bOwner, item_b_title: bTitle, item_b_img: bImg, item_b_category: bCat, item_b_seller: bSeller };
        }),
        { onConflict: 'item_a_id,item_b_id', ignoreDuplicates: true }
      );
    }
  }

  return NextResponse.json(data, { status: 201 });
}
