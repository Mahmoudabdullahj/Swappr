import { createClient } from '@/utils/supabase/server';
import { createServiceClient } from '@/utils/supabase/service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const db = createServiceClient();
  const received = new URL(request.url).searchParams.get('received') === 'true';

  const { data, error } = await db
    .from('trade_offers')
    .select('*')
    .eq(received ? 'target_item_owner_id' : 'sender_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (received) {
    return NextResponse.json(
      (data ?? []).map((row: Record<string, unknown>) => ({
        id:                   row.id,
        senderId:             row.sender_id,
        senderName:           row.sender_name,
        offeredItemId:        row.offered_item_id,
        offeredItemTitle:     row.offered_item_title,
        offeredItemCategory:  row.offered_item_category,
        targetItemId:         row.target_item_id,
        targetItemTitle:      row.target_item_title,
        targetItemImg:        row.target_item_img,
        status:               row.status,
        ts:                   new Date(row.created_at as string).getTime(),
      }))
    );
  }

  return NextResponse.json(
    (data ?? []).map((row: Record<string, unknown>) => ({
      id:                   row.id,
      offeredItemId:        row.offered_item_id,
      offeredItemTitle:     row.offered_item_title,
      offeredItemCategory:  row.offered_item_category,
      targetItemId:         row.target_item_id,
      targetItemTitle:      row.target_item_title,
      targetItemImg:        row.target_item_img,
      targetItemSeller:     row.target_item_seller,
      status:               row.status,
      ts:                   new Date(row.created_at as string).getTime(),
    }))
  );
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const db = createServiceClient();

  const body = await request.json();
  const {
    offeredItemId,
    offeredItemTitle,
    offeredItemCategory,
    targetItemId,
    targetItemTitle,
    targetItemImg,
    targetItemSeller,
  } = body;

  // Fetch real owner from DB — never trust client-supplied owner ID
  const { data: targetItem } = await db
    .from('items').select('user_id').eq('id', targetItemId).single();
  if (!targetItem)
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  const targetItemOwnerId = targetItem.user_id;

  const senderName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Anonymous';

  const { data, error } = await db
    .from('trade_offers')
    .insert({
      sender_id:             user.id,
      sender_name:           senderName,
      offered_item_id:       offeredItemId,
      offered_item_title:    offeredItemTitle,
      offered_item_category: offeredItemCategory,
      target_item_id:        targetItemId,
      target_item_title:     targetItemTitle,
      target_item_img:       targetItemImg,
      target_item_seller:    targetItemSeller,
      target_item_owner_id:  targetItemOwnerId,
    })
    .select()
    .single();

  if (error) {
    console.error('[POST /api/trades] insert error:', error);
    if (error.code === '23505' || error.message?.includes('unique_offered_target_pair')) {
      return NextResponse.json({ error: 'You have already offered this item for that listing.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Notify the item owner
  await db.from('notifications').insert({
    user_id:   targetItemOwnerId,
    type:      'trade_offer',
    title:     `${senderName} wants to trade`,
    body:      `Offering their ${offeredItemTitle} for your ${targetItemTitle}`,
    link_view: 'trades',
  });

  return NextResponse.json({
    id:                   data.id,
    offeredItemId:        data.offered_item_id,
    offeredItemTitle:     data.offered_item_title,
    offeredItemCategory:  data.offered_item_category,
    targetItemId:         data.target_item_id,
    targetItemTitle:      data.target_item_title,
    targetItemImg:        data.target_item_img,
    targetItemSeller:     data.target_item_seller,
    status:               data.status,
    ts:                   new Date(data.created_at).getTime(),
  }, { status: 201 });
}
