import { io, Socket } from 'socket.io-client';
import { api, ApiRequestError } from './api';

let socket: Socket | null = null;
let sessionEnded = false;
let sessionRecovery: Promise<void> | null = null;
let lastRecoveryAt: number | null = null;
const RECOVERY_COOLDOWN_MS = 60_000;
const sessionListeners = new Set<() => void>();

export const isSocketSessionEnded = () => sessionEnded;
export const subscribeSocketSession = (listener: () => void) => {
    sessionListeners.add(listener);
    return () => { sessionListeners.delete(listener); };
};

const setSessionEnded = (ended: boolean) => {
    if (sessionEnded === ended) return;
    sessionEnded = ended;
    sessionListeners.forEach(listener => listener());
};

export const getSocket = () => {
    if (!socket) {
        const apiUrl = (typeof process !== 'undefined' && process.env ? process.env.NEXT_PUBLIC_API_URL : '') || 'http://localhost:4000/api/v1';
        const defaultWsUrl = apiUrl.replace('/api/v1', '/ws');
        const url = (typeof process !== 'undefined' && process.env ? process.env.NEXT_PUBLIC_WS_URL : '') || defaultWsUrl;

        socket = io(url, {
            withCredentials: true,
            transports: ['polling', 'websocket'],
            autoConnect: false,
        });

        socket.on('connect', () => {
            // eslint-disable-next-line no-console
            console.log('[WS] Connected to', url, 'id:', socket?.id);
        });

        // Socket.IO's transport connect fires before the backend's asynchronous
        // JWT and session checks. Only this server acknowledgement proves the
        // replacement connection was accepted and may reset the retry guard.
        socket.on('session:ready', () => {
            lastRecoveryAt = null;
            setSessionEnded(false);
        });

        socket.on('connect_error', (err) => {
            // eslint-disable-next-line no-console
            console.error('[WS] Connect error:', err.message);
        });

        socket.on('disconnect', (reason) => {
            // The server validates the JWT captured at the original handshake. An
            // HTTP refresh may have renewed its HttpOnly cookie in the meantime.
            // Check the current HTTP session once before treating this as revocation.
            if (reason === 'io server disconnect' && !sessionRecovery) {
                const now = Date.now();
                if (lastRecoveryAt !== null && now - lastRecoveryAt < RECOVERY_COOLDOWN_MS) {
                    setSessionEnded(true);
                    return;
                }
                lastRecoveryAt = now;
                sessionRecovery = api.auth.me().then(
                    () => {
                        sessionRecovery = null;
                        socket?.connect();
                    },
                    (error: unknown) => {
                        sessionRecovery = null;
                        if (socket?.connected) return;
                        if (error instanceof ApiRequestError && error.code === 'SESSION_EXPIRED') {
                            setSessionEnded(true);
                        } else {
                            // Transport failures are not evidence that credentials were revoked.
                            socket?.connect();
                        }
                    },
                );
            }
            // eslint-disable-next-line no-console
            console.warn('[WS] Disconnected:', reason);
        });
    }
    return socket;
};
