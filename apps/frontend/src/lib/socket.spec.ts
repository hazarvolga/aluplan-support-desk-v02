import { beforeEach, describe, expect, it, vi } from 'vitest';

const mock = vi.hoisted(() => ({
    handlers: new Map<string, (...args: any[]) => void>(),
    connect: vi.fn(),
}));
vi.mock('socket.io-client', () => ({
    io: () => ({
        on: (event: string, handler: (...args: any[]) => void) => mock.handlers.set(event, handler),
        connect: mock.connect,
    }),
}));

describe('shared socket session lifecycle', () => {
    beforeEach(() => { vi.resetModules(); mock.handlers.clear(); mock.connect.mockClear(); });

    it('reports an ended server session without reconnecting or navigating', async () => {
        const module = await import('./socket');
        module.getSocket();
        const changed = vi.fn();
        const unsubscribe = module.subscribeSocketSession(changed);
        mock.handlers.get('disconnect')!('io server disconnect');
        expect(module.isSocketSessionEnded()).toBe(true);
        expect(changed).toHaveBeenCalledTimes(1);
        expect(mock.connect).not.toHaveBeenCalled();
        unsubscribe();
    });

    it('clears the notice only after successful reconnection', async () => {
        const module = await import('./socket');
        const socket = module.getSocket();
        mock.handlers.get('disconnect')!('io server disconnect');
        socket.connect();
        expect(module.isSocketSessionEnded()).toBe(true);
        mock.handlers.get('connect')!();
        expect(module.isSocketSessionEnded()).toBe(false);
    });

    it('does not label temporary transport failure as an ended session', async () => {
        const module = await import('./socket');
        module.getSocket();
        mock.handlers.get('disconnect')!('transport close');
        expect(module.isSocketSessionEnded()).toBe(false);
    });
});
