import { io, Socket } from 'socket.io-client';

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
        });

        const refreshToken = () => {
            const token = getAuthToken();
            if (token) {
                // Update opts so every new connection uses fresh token
                (socket as any).io.opts.auth = { token };
            }
        };

        // Intercept every connect attempt to inject fresh token
        socket.on('disconnect', () => refreshToken());

        // Patch connect() to inject token before handshake
        const originalConnect = socket.connect.bind(socket);
        socket.connect = () => {
            refreshToken();
            originalConnect();
        };
    }
    return socket;
};