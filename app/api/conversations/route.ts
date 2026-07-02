import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const convos = (data ?? []).map((row: Record<string, unknown>) => {
    const isA = row.user_a_id === user.id;
    return {
      id:              row.id,
      otherUserId:     isA ? row.user_b_id : row.user_a_id,
      otherUserName:   isA ? (row.user_b_name || 'User') : (row.user_a_name || 'User'),
      itemId:          row.item_id ?? null,
      itemTitle:       row.item_title ?? null,
      itemImg:         row.item_img ?? null,
      lastMessage:     row.last_message ?? null,
      lastMessageAt:   row.last_message_at ? new Date(row.last_message_at as string).getTime() : null,
      createdAt:       new Date(row.created_at as string).getTime(),
    };
  });

  return NextResponse.json(convos);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await request.json();
  const { targetUserId, targetUserName, itemId, itemTitle, itemImg, message } = body;

  if (!targetUserId || !message?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const senderName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Anonymous';
  const msgText = message.trim();

  // Check if conversation already exists between these two users
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .or(
      `and(user_a_id.eq.${user.id},user_b_id.eq.${targetUserId}),` +
      `and(user_a_id.eq.${targetUserId},user_b_id.eq.${user.id})`
    )
    .maybeSingle();

  let convoId: string;

  if (existing?.id) {
    convoId = existing.id as string;
    // Update last_message
    await supabase
      .from('conversations')
      .update({ last_message: msgText, last_message_at: new Date().toISOString() })
      .eq('id', convoId);
  } else {
    const { data: newConvo, error: createErr } = await supabase
      .from('conversations')
      .insert({
        user_a_id:    user.id,
        user_a_name:  senderName,
        user_b_id:    targetUserId,
        user_b_name:  targetUserName || 'User',
        item_id:      itemId || null,
        item_title:   itemTitle || null,
        item_img:     itemImg || null,
        last_message: msgText,
        last_message_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (createErr) return NextResponse.json({ error: createErr.message }, { status: 500 });
    convoId = newConvo.id as string;
  }

  const { error: msgErr } = await supabase
    .from('messages')
    .insert({
      conversation_id: convoId,
      sender_id:       user.id,
      sender_name:     senderName,
      content:         msgText,
    });

  if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 });

  return NextResponse.json({ conversationId: convoId }, { status: 201 });
}
