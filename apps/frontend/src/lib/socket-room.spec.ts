import { describe, expect, it, vi } from 'vitest';
import type { Socket } from 'socket.io-client';
import { subscribeTicketRoom } from './socket-room';

describe('ticket room subscriptions', () => {
    it('joins immediately if connected and rejoins after reconnect, leaving only its own room on cleanup', () => {
        const socket = { connected: true, on: vi.fn(), off: vi.fn(), emit: vi.fn(), disconnect: vi.fn() };
        const cleanup = subscribeTicketRoom(socket as unknown as Socket, 'ticket-1');
        expect(socket.emit).toHaveBeenCalledWith('ticket:join', 'ticket-1');
        const onConnect = socket.on.mock.calls[0][1];
        onConnect();
        expect(socket.emit.mock.calls.filter(([event]) => event === 'ticket:join')).toHaveLength(2);
        cleanup();
        expect(socket.off).toHaveBeenCalledWith('connect', onConnect);
        expect(socket.emit).toHaveBeenLastCalledWith('ticket:leave', 'ticket-1');
        expect(socket.disconnect).not.toHaveBeenCalled();
    });

    it('does not queue stale join/leave events while disconnected', () => {
        const socket = { connected: false, on: vi.fn(), off: vi.fn(), emit: vi.fn() };
        const cleanup = subscribeTicketRoom(socket as unknown as Socket, 'ticket-1');
        cleanup();
        expect(socket.emit).not.toHaveBeenCalled();
    });
});
