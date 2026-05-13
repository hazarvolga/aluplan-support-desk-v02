import { io, Socket, Manager } from 'socket.io-client';

let socket: Socket | null = null;

function getAuthToken(): string {
    if (typeof document === 'undefined') return '';
    return document.cookie.split('; ').find(row => row.trim().startsWith('alu_at='))?.split('=')[1] || '';
}

export const getSocket = () => {
    if (!socket) {
        const apiUrl = (typeof process !== 'undefined' && process.env ? process.env.NEXT_PUBLIC_API_URL : '') || 'http://localhost:4000/api/v1';
        const defaultWsUrl = apiUrl.replace('/api/v1', '/ws');
        const url = (typeof process !== 'undefined' && process.env ? process.env.NEXT_PUBLIC_WS_URL : '') || defaultWsUrl;

        socket = io(url, {
            withCredentials: true,
            transports: ['websocket'],
            autoConnect: false,
            auth: {
                token: getAuthToken(),
            },
        });

        // Intercept connection to inject fresh token before every connect
        const manager = (socket as any).io;
        manager.on('open', () => {
            const token = getAuthToken();
            if (token) {
                (socket as any).auth = { token };
                // Force reconnect with new token
                socket?.disconnect();
                socket?.connect();
            }
        });
    }
    return socket;
};