import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const TOKEN_KEY = 'auth_tokens';

let socket: Socket | null = null;

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

export function connectSocket(): Promise<void> {
  const s = getSocket();

  if (s.connected) return Promise.resolve();

  const tokensJson = localStorage.getItem(TOKEN_KEY);
  if (!tokensJson) {
    return Promise.reject(new Error('No auth tokens found'));
  }

  const tokens = JSON.parse(tokensJson);
  if (!tokens.accessToken) {
    return Promise.reject(new Error('Access token is missing'));
  }

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

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
