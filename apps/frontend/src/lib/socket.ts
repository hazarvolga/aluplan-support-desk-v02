import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = () => {
    if (!socket) {
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        const url = (typeof process !== 'undefined' && process.env ? process.env.NEXT_PUBLIC_WS_URL : '') || 'http://localhost:4000/ws';

        socket = io(url, {
            auth: { token },
            transports: ['websocket'],
            autoConnect: false,
        });
    }
    return socket;
};
