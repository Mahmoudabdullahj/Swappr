import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search   = searchParams.get('search');
  const limit    = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

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
    images:       Array.isArray(row.images) ? row.images : (row.img ? [row.img] : []),
    seller:       row.seller,
    sellerAvatar: row.seller_avatar ?? '',
    rating:       row.rating ?? 0,
    city:         row.city ?? '',
    dist:         row.dist ?? 0,
    wantTitle:    row.want_title ?? null,
    wantCategory: row.want_category ?? null,
    wantAnything: row.want_anything ?? false,
    description:  row.description ?? null,
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
  const description  = (formData.get('description') as string) || null;
  const imageFiles   = formData.getAll('image') as File[];

  const ALLOWED_MIME: Record<string, string> = {
    'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
  };

  const uploadedUrls: string[] = [];
  for (const image of imageFiles) {
    if (!image || image.size === 0) continue;
    if (!ALLOWED_MIME[image.type])
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    if (image.size > 10 * 1024 * 1024)
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    const raw    = Buffer.from(await image.arrayBuffer());
    const buffer = await sharp(raw)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
    const { data: upload, error: uploadErr } = await supabase.storage
      .from('items')
      .upload(fileName, buffer, { contentType: 'image/webp', upsert: false });
    if (!uploadErr && upload) {
      const { data: { publicUrl } } = supabase.storage.from('items').getPublicUrl(fileName);
      uploadedUrls.push(publicUrl);
    }
  }

  const imgUrl    = uploadedUrls[0] ?? '';
  const imgUrls   = uploadedUrls;

  const { data, error } = await supabase
    .from('items')
    .insert({ user_id: userId, title, category, brand: brand || null, model: model || null, specs: Object.keys(specs).length ? specs : null, condition, price, img: imgUrl, images: imgUrls, seller, want_title: wantTitle, want_category: wantCategory, want_anything: wantAnything, description: description || null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
