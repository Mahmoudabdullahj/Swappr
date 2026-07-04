import { createClient } from '@/utils/supabase/server';
import { createServiceClient } from '@/utils/supabase/service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const db = createServiceClient();

  const { data: convo } = await db
    .from('conversations')
    .select('id')
    .eq('id', id)
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
    .maybeSingle();

  if (!convo) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data, error } = await db
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

  const db = createServiceClient();

  const { data: convo } = await db
    .from('conversations')
    .select('id')
    .eq('id', id)
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
    .maybeSingle();

  if (!convo) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  const content = body.content?.trim();
  if (!content) return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });

  const senderName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Anonymous';

  const { data, error } = await db
    .from('messages')
    .insert({ conversation_id: id, sender_id: user.id, sender_name: senderName, content })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await db
    .from('conversations')
    .update({ last_message: content, last_message_at: new Date().toISOString() })
    .eq('id', id);

  return NextResponse.json({
    id:             data.id,
    conversationId: data.conversation_id,
    senderId:       data.sender_id,
    senderName:     data.sender_name,
    content:        data.content,
    createdAt:      new Date(data.created_at).getTime(),
  }, { status: 201 });
}
