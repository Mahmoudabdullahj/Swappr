import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const received = new URL(request.url).searchParams.get('received') === 'true';

  const { data, error } = await supabase
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

  const body = await request.json();
  const {
    offeredItemId,
    offeredItemTitle,
    offeredItemCategory,
    targetItemId,
    targetItemTitle,
    targetItemImg,
    targetItemSeller,
    targetItemOwnerId,
  } = body;

  const senderName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Anonymous';

  const { data, error } = await supabase
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Notify the item owner — use a service client so RLS doesn't block inserting for another user
  try {
    await supabase.from('notifications').insert({
      user_id:   targetItemOwnerId,
      type:      'trade_offer',
      title:     `${senderName} wants to trade`,
      body:      `Offering their ${offeredItemTitle} for your ${targetItemTitle}`,
      link_view: 'trades',
    });
  } catch { /* notification failure is non-fatal */ }

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
