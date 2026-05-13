import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = () => {
    if (!socket) {
        const apiUrl = (typeof process !== 'undefined' && process.env ? process.env.NEXT_PUBLIC_API_URL : '') || 'http://localhost:4000/api/v1';
        const defaultWsUrl = apiUrl.replace('/api/v1', '/ws');
        const url = (typeof process !== 'undefined' && process.env ? process.env.NEXT_PUBLIC_WS_URL : '') || defaultWsUrl;

        socket = io(url, {
            withCredentials: true,
            transports: ['websocket'],
            autoConnect: false,
        });

        socket.on('connect', () => {
            // eslint-disable-next-line no-console
            console.log('[WS] Connected to', url, 'id:', socket?.id);
        });

        socket.on('connect_error', (err) => {
            // eslint-disable-next-line no-console
            console.error('[WS] Connect error:', err.message);
        });

        socket.on('disconnect', (reason) => {
            // eslint-disable-next-line no-console
            console.warn('[WS] Disconnected:', reason);
        });
    }
    return socket;
};