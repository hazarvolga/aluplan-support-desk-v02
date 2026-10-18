import { beforeEach, describe, expect, it, vi } from 'vitest';

const mock = vi.hoisted(() => ({
    handlers: new Map<string, (...args: unknown[]) => void>(),
    connect: vi.fn(),
}));
vi.mock('socket.io-client', () => ({
    io: () => ({
        on: (event: string, handler: (...args: unknown[]) => void) => mock.handlers.set(event, handler),
        connect: mock.connect,
    }),
}));

describe('shared socket session lifecycle', () => {
    beforeEach(() => { vi.resetModules(); mock.handlers.clear(); mock.connect.mockClear(); });

    it('reports an ended server session without reconnecting or navigating', async () => {
        const socketModule = await import('./socket');
        socketModule.getSocket();
        const changed = vi.fn();
        const unsubscribe = socketModule.subscribeSocketSession(changed);
        mock.handlers.get('disconnect')!('io server disconnect');
        expect(socketModule.isSocketSessionEnded()).toBe(true);
        expect(changed).toHaveBeenCalledTimes(1);
        expect(mock.connect).not.toHaveBeenCalled();
        unsubscribe();
    });

    it('clears the notice only after successful reconnection', async () => {
        const socketModule = await import('./socket');
        const socket = socketModule.getSocket();
        mock.handlers.get('disconnect')!('io server disconnect');
        socket.connect();
        expect(socketModule.isSocketSessionEnded()).toBe(true);
        mock.handlers.get('connect')!();
        expect(socketModule.isSocketSessionEnded()).toBe(false);
    });

    it('does not label temporary transport failure as an ended session', async () => {
        const socketModule = await import('./socket');
        socketModule.getSocket();
        mock.handlers.get('disconnect')!('transport close');
        expect(socketModule.isSocketSessionEnded()).toBe(false);
    });
});
