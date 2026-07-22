import webpush from 'web-push';
import type { SupabaseClient } from '@supabase/supabase-js';

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

export async function sendPushToUser(
  db: SupabaseClient,
  userId: string,
  payload: PushPayload,
) {
  const { data: subs } = await db
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', userId);

  if (!subs?.length) return;

  const expired: string[] = [];

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload),
        );
      } catch (err: unknown) {
        if ((err as { statusCode?: number }).statusCode === 410) expired.push(sub.id);
      }
    }),
  );

  if (expired.length) {
    await db.from('push_subscriptions').delete().in('id', expired);
  }
}
