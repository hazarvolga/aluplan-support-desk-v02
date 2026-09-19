import type { Socket } from 'socket.io-client';

/** Maintain this page's ticket subscription without taking ownership of the shared connection. */
export function subscribeTicketRoom(socket: Socket, ticketId: string): () => void {
    const join = () => { socket.emit('ticket:join', ticketId); };
    socket.on('connect', join);
    if (socket.connected) join();
    return () => {
        socket.off('connect', join);
        if (socket.connected) socket.emit('ticket:leave', ticketId);
    };
}
