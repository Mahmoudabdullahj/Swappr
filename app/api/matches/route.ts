import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .or(`item_a_owner_id.eq.${user.id},item_b_owner_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const matches = (data ?? []).map((row: Record<string, unknown>) => {
    const isA = row.item_a_owner_id === user.id;
    return {
      id:        row.id,
      matchedAt: new Date(row.created_at as string).getTime(),
      myItem: {
        id:       isA ? row.item_a_id       : row.item_b_id,
        title:    isA ? row.item_a_title    : row.item_b_title,
        img:      isA ? row.item_a_img      : row.item_b_img,
        category: isA ? row.item_a_category : row.item_b_category,
      },
      theirItem: {
        id:       isA ? row.item_b_id       : row.item_a_id,
        title:    isA ? row.item_b_title    : row.item_a_title,
        img:      isA ? row.item_b_img      : row.item_a_img,
        category: isA ? row.item_b_category : row.item_a_category,
        seller:   isA ? row.item_b_seller   : row.item_a_seller,
        ownerId:  isA ? row.item_b_owner_id : row.item_a_owner_id,
      },
    };
  });

  return NextResponse.json(matches);
}
