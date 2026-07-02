import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  // Get the current user's items that have wants defined
  const { data: myItems, error: myErr } = await supabase
    .from('items')
    .select('id, title, category, img, want_title, want_category, want_anything')
    .eq('user_id', user.id);

  if (myErr) return NextResponse.json({ error: myErr.message }, { status: 500 });
  if (!myItems || myItems.length === 0) return NextResponse.json([]);

  const results: Array<{
    id: string;
    matchedAt: number;
    myItem:    { id: string; title: string; img: string; category: string; };
    theirItem: { id: string; title: string; img: string; category: string; seller: string; ownerId: string; };
  }> = [];

  const seen = new Set<string>();

  for (const myItem of myItems) {
    const { want_title, want_category, want_anything } = myItem;
    if (!want_title && !want_category && !want_anything) continue;

    let query = supabase
      .from('items')
      .select('id, user_id, title, category, img, seller')
      .neq('user_id', user.id)
      .limit(30);

    if (!want_anything) {
      const filters: string[] = [];
      if (want_title)    filters.push(`title.ilike.%${want_title}%`);
      if (want_category) filters.push(`category.eq.${want_category}`);
      if (filters.length === 0) continue;
      query = query.or(filters.join(','));
    }

    const { data: candidates } = await query;

    for (const c of candidates ?? []) {
      const key = `${myItem.id}_${c.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      results.push({
        id:        key,
        matchedAt: Date.now(),
        myItem: {
          id:       myItem.id,
          title:    myItem.title,
          img:      myItem.img || '',
          category: myItem.category,
        },
        theirItem: {
          id:       c.id,
          title:    c.title,
          img:      c.img || '',
          category: c.category,
          seller:   c.seller,
          ownerId:  c.user_id,
        },
      });
    }
  }

  return NextResponse.json(results);
}
