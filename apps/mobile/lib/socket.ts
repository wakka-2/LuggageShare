import { io, Socket } from 'socket.io-client';
import { tokenStorage } from '@/lib/storage';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001';
const TOKEN_KEY = 'auth_tokens';

let socket: Socket | null = null;

/**
 * Returns the singleton Socket.IO client instance.
 * Creates one lazily if it does not exist yet (autoConnect is off).
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(`${API_URL}/chat`, {
      autoConnect: false,
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });
  }
  return socket;
}

/**
 * Reads the JWT access token from SecureStore, attaches it to the
 * socket handshake auth payload, and connects.
 *
 * Resolves once the socket emits `connect`, rejects on `connect_error`.
 */
export async function connectSocket(): Promise<void> {
  const s = getSocket();

  // Already connected — nothing to do.
  if (s.connected) return;

  // Read token from secure storage.
  const tokensJson = await tokenStorage.getItem(TOKEN_KEY);
  if (!tokensJson) {
    throw new Error('No auth tokens found in storage');
  }

  const tokens = JSON.parse(tokensJson);
  if (!tokens.accessToken) {
    throw new Error('Access token is missing');
  }

  // Attach token for the server-side WsJwtGuard.
  s.auth = { token: tokens.accessToken };

  return new Promise<void>((resolve, reject) => {
    const onConnect = () => {
      cleanup();
      resolve();
    };

    const onError = (err: Error) => {
      cleanup();
      reject(err);
    };

    const cleanup = () => {
      s.off('connect', onConnect);
      s.off('connect_error', onError);
    };

    s.on('connect', onConnect);
    s.on('connect_error', onError);

    s.connect();
  });
}

/**
 * Disconnects the socket and removes the singleton reference so the
 * next `getSocket()` call creates a fresh instance.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
