import { beforeEach, describe, expect, it, vi } from 'vitest';

const mock = vi.hoisted(() => ({
    handlers: new Map<string, (...args: unknown[]) => void>(),
    connect: vi.fn(),
    me: vi.fn(),
}));
vi.mock('./api', () => ({
    api: { auth: { me: mock.me } },
    ApiRequestError: class extends Error {
        constructor(message: string, public readonly code: string) { super(message); }
    },
}));
vi.mock('socket.io-client', () => ({
    io: () => ({
        on: (event: string, handler: (...args: unknown[]) => void) => mock.handlers.set(event, handler),
        connect: mock.connect,
    }),
}));

describe('shared socket session lifecycle', () => {
    beforeEach(() => {
        vi.resetModules();
        mock.handlers.clear();
        mock.connect.mockReset();
        mock.me.mockReset();
    });

    it('revalidates an existing HTTP session before reconnecting after server disconnect', async () => {
        mock.me.mockResolvedValue({ id: 'user-1' });
        const socketModule = await import('./socket');
        socketModule.getSocket();
        const changed = vi.fn();
        const unsubscribe = socketModule.subscribeSocketSession(changed);
        mock.handlers.get('disconnect')!('io server disconnect');
        await vi.waitFor(() => expect(mock.connect).toHaveBeenCalledTimes(1));
        expect(mock.me).toHaveBeenCalledTimes(1);
        expect(socketModule.isSocketSessionEnded()).toBe(false);
        expect(changed).not.toHaveBeenCalled();
        unsubscribe();
    });

    it('shows the ended notice only when HTTP session revalidation fails', async () => {
        const { ApiRequestError } = await import('./api');
        mock.me.mockRejectedValue(new ApiRequestError('Session expired', 'SESSION_EXPIRED'));
        const socketModule = await import('./socket');
        socketModule.getSocket();
        mock.handlers.get('disconnect')!('io server disconnect');
        await vi.waitFor(() => expect(socketModule.isSocketSessionEnded()).toBe(true));
        expect(mock.connect).not.toHaveBeenCalled();
        expect(socketModule.isSocketSessionEnded()).toBe(true);
        mock.handlers.get('connect')!();
        expect(socketModule.isSocketSessionEnded()).toBe(true);
        mock.handlers.get('session:ready')!();
        expect(socketModule.isSocketSessionEnded()).toBe(false);
    });

    it('does not report a logout when HTTP session validation hits a network outage', async () => {
        const { ApiRequestError } = await import('./api');
        mock.me.mockRejectedValue(new ApiRequestError('Backend unavailable', 'BACKEND_UNAVAILABLE'));
        const socketModule = await import('./socket');
        socketModule.getSocket();
        mock.handlers.get('disconnect')!('io server disconnect');
        await vi.waitFor(() => expect(mock.connect).toHaveBeenCalledTimes(1));
        expect(socketModule.isSocketSessionEnded()).toBe(false);
    });

    it('runs only one revalidation for concurrent server disconnect events', async () => {
        let finish!: (value: { id: string }) => void;
        mock.me.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
        const socketModule = await import('./socket');
        socketModule.getSocket();
        mock.handlers.get('disconnect')!('io server disconnect');
        mock.handlers.get('disconnect')!('io server disconnect');
        expect(mock.me).toHaveBeenCalledTimes(1);
        finish({ id: 'user-1' });
        await vi.waitFor(() => expect(mock.connect).toHaveBeenCalledTimes(1));
    });

    it('does not loop when the server immediately rejects a reconnect', async () => {
        mock.me.mockResolvedValue({ id: 'user-1' });
        const socketModule = await import('./socket');
        socketModule.getSocket();
        mock.handlers.get('disconnect')!('io server disconnect');
        await vi.waitFor(() => expect(mock.connect).toHaveBeenCalledTimes(1));
        mock.handlers.get('disconnect')!('io server disconnect');
        expect(mock.me).toHaveBeenCalledTimes(1);
        expect(mock.connect).toHaveBeenCalledTimes(1);
        expect(socketModule.isSocketSessionEnded()).toBe(true);
    });

    it('records an immediate server rejection before recovery cleanup completes', async () => {
        mock.me.mockResolvedValue({ id: 'user-1' });
        mock.connect.mockImplementation(() => {
            mock.handlers.get('disconnect')!('io server disconnect');
        });
        const socketModule = await import('./socket');
        socketModule.getSocket();
        mock.handlers.get('disconnect')!('io server disconnect');
        await vi.waitFor(() => expect(mock.connect).toHaveBeenCalledTimes(1));
        expect(mock.me).toHaveBeenCalledTimes(1);
        expect(socketModule.isSocketSessionEnded()).toBe(true);
    });

    it('does not treat a transport connection as accepted before server authentication completes', async () => {
        let now = 1_000;
        vi.spyOn(Date, 'now').mockImplementation(() => now);
        mock.me.mockResolvedValue({ id: 'user-1' });
        const socketModule = await import('./socket');
        socketModule.getSocket();
        mock.handlers.get('disconnect')!('io server disconnect');
        await vi.waitFor(() => expect(mock.connect).toHaveBeenCalledTimes(1));
        mock.handlers.get('connect')!();
        now += 2_000;
        mock.handlers.get('disconnect')!('io server disconnect');
        expect(mock.me).toHaveBeenCalledTimes(1);
        expect(mock.connect).toHaveBeenCalledTimes(1);
        expect(socketModule.isSocketSessionEnded()).toBe(true);
        vi.restoreAllMocks();
    });

    it('allows another valid session recovery after server authentication completes', async () => {
        let now = 1_000;
        vi.spyOn(Date, 'now').mockImplementation(() => now);
        mock.me.mockResolvedValue({ id: 'user-1' });
        const socketModule = await import('./socket');
        socketModule.getSocket();
        mock.handlers.get('disconnect')!('io server disconnect');
        await vi.waitFor(() => expect(mock.connect).toHaveBeenCalledTimes(1));
        mock.handlers.get('connect')!();
        mock.handlers.get('session:ready')!();
        now += 2_000;
        mock.handlers.get('disconnect')!('io server disconnect');
        await vi.waitFor(() => expect(mock.connect).toHaveBeenCalledTimes(2));
        expect(mock.me).toHaveBeenCalledTimes(2);
        expect(socketModule.isSocketSessionEnded()).toBe(false);
        vi.restoreAllMocks();
    });

    it('does not label temporary transport failure as an ended session', async () => {
        const socketModule = await import('./socket');
        socketModule.getSocket();
        mock.handlers.get('disconnect')!('transport close');
        expect(socketModule.isSocketSessionEnded()).toBe(false);
    });
});
