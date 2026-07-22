import { createClient } from '@/utils/supabase/server';
import { sendPushToUser } from '@/lib/push';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  // Verify the user is a participant
  const { data: convo } = await supabase
    .from('conversations')
    .select('id')
    .eq('id', id)
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
    .maybeSingle();

  if (!convo) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const messages = (data ?? []).map((row: Record<string, unknown>) => ({
    id:             row.id,
    conversationId: row.conversation_id,
    senderId:       row.sender_id,
    senderName:     row.sender_name,
    content:        row.content,
    imageUrl:       (row.image_url as string | null) ?? null,
    createdAt:      new Date(row.created_at as string).getTime(),
  }));

  return NextResponse.json(messages);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  // Verify participant
  const { data: convo } = await supabase
    .from('conversations')
    .select('id, user_a_id, user_b_id, user_a_name, user_b_name')
    .eq('id', id)
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
    .maybeSingle();

  if (!convo) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  const content = body.content?.trim() || '';
  const imageUrl = body.imageUrl?.trim() || null;
  if (!content && !imageUrl) return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });

  const senderName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Anonymous';

  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: id, sender_id: user.id, sender_name: senderName, content, image_url: imageUrl })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const lastMsg = content || '📷 Image';
  await supabase
    .from('conversations')
    .update({ last_message: lastMsg, last_message_at: new Date().toISOString() })
    .eq('id', id);

  const recipientId = convo.user_a_id === user.id ? convo.user_b_id : convo.user_a_id;
  await sendPushToUser(supabase, recipientId, {
    title: `New message from ${senderName}`,
    body:  lastMsg,
    url:   '/messages',
  });

  return NextResponse.json({
    id:             data.id,
    conversationId: data.conversation_id,
    senderId:       data.sender_id,
    senderName:     data.sender_name,
    content:        data.content,
    imageUrl:       (data.image_url as string | null) ?? null,
    createdAt:      new Date(data.created_at).getTime(),
  }, { status: 201 });
}
