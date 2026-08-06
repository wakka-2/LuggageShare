import 'react-native-url-polyfill/auto';
import { createClient, type SupabaseClient, type RealtimeChannel } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Singleton Supabase client used for realtime only (no auth/db). Subscribes to
// broadcast channels the API pushes new-message events to, and sends ephemeral
// typing events client-to-client. Replaces the old Socket.io client.
//
// Config comes from EXPO_PUBLIC_* env vars, falling back to app.json `extra`.
// The publishable key is client-safe by design (same class as the web
// NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).
const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || Constants.expoConfig?.extra?.supabaseUrl || '';
const SUPABASE_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  Constants.expoConfig?.extra?.supabasePublishableKey ||
  '';

let client: SupabaseClient | null = null;

export function getRealtimeClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
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
