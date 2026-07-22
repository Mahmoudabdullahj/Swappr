import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { type, name, email, message } = await req.json();
  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from('feedback').insert({
    type:    type || 'general',
    name:    name  || null,
    email:   email || null,
    message: message.trim(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
