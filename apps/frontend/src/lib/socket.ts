import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!socket) {
        const apiUrl = (typeof process !== 'undefined' && process.env ? process.env.NEXT_PUBLIC_API_URL : '') || 'http://localhost:4000/api/v1';
        const defaultWsUrl = apiUrl.replace('/api/v1', '/ws');
        const url = (typeof process !== 'undefined' && process.env ? process.env.NEXT_PUBLIC_WS_URL : '') || defaultWsUrl;

        socket = io(url, {
            auth: { token },
            transports: ['websocket'],
            autoConnect: false,
        });
    } else {
        if (token) {
            socket.auth = { token };
        }
    }
    return socket;
};
