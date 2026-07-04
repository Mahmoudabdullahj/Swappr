import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { id } = await params;
  const { status } = await request.json();
  if (!['accepted', 'declined'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  // Fetch offer to verify the current user is the recipient
  const { data: offer, error: fetchError } = await supabase
    .from('trade_offers')
    .select('*')
    .eq('id', id)
    .eq('target_item_owner_id', user.id)
    .single();

  if (fetchError || !offer) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (offer.status !== 'pending') return NextResponse.json({ error: 'Already responded' }, { status: 409 });

  const { error } = await supabase
    .from('trade_offers')
    .update({ status })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify the sender
  const responderName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Someone';
  await supabase.from('notifications').insert({
    user_id:   offer.sender_id,
    type:      'trade_offer',
    title:     status === 'accepted'
      ? `${responderName} accepted your trade offer!`
      : `${responderName} declined your trade offer.`,
    body:      `Re: ${offer.offered_item_title} for ${offer.target_item_title}`,
    link_view: 'trades',
  });

  return NextResponse.json({ ok: true });
}
