import { createClient, type SupabaseClient, type RealtimeChannel } from '@supabase/supabase-js';

// Singleton Supabase client for realtime only (no auth/db) — subscribes to
// broadcast channels that the API pushes new-message events to, and sends
// ephemeral typing events client-to-client. Replaces the old Socket.io client.
let client: SupabaseClient | null = null;

export function getRealtimeClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  if (!client) {
    client = createClient(url, key, {
      realtime: { params: { eventsPerSecond: 10 } },
    });
  }
  return client;
}

export interface ChannelHandlers {
  onNewMessage?: () => void;
  onTyping?: (senderId: string) => void;
  onStatus?: (subscribed: boolean) => void;
}

/**
 * Subscribe to a chat topic (e.g. `booking:<id>` or `offer:<id>`).
 * Returns an object with an unsubscribe fn and a sendTyping broadcaster.
 */
export function subscribeToChat(topic: string, handlers: ChannelHandlers) {
  const supabase = getRealtimeClient();
  if (!supabase) {
    return { unsubscribe: () => {}, sendTyping: () => {} };
  }

  const channel: RealtimeChannel = supabase.channel(topic, {
    config: { broadcast: { self: false } },
  });

  channel
    .on('broadcast', { event: 'newMessage' }, () => handlers.onNewMessage?.())
    .on('broadcast', { event: 'userTyping' }, (msg) =>
      handlers.onTyping?.((msg.payload as { senderId?: string })?.senderId ?? '')
    )
    .subscribe((status) => handlers.onStatus?.(status === 'SUBSCRIBED'));

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
    sendTyping: (senderId: string) => {
      channel.send({ type: 'broadcast', event: 'userTyping', payload: { senderId } });
    },
  };
}
