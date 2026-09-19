import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAiHealthSocket } from './useAiHealthSocket';

const mock = vi.hoisted(() => ({ handlers: new Map<string, (...args: any[]) => void>(), connect: vi.fn() }));
vi.mock('@/lib/socket', () => {
    const socket = {
        connect: mock.connect,
        on: (event: string, callback: (...args: any[]) => void) => { mock.handlers.set(event, callback); return socket; },
        off: () => socket,
    };
    return { getSocket: () => socket };
});

describe('AI health connection ownership', () => {
    beforeEach(() => { mock.handlers.clear(); mock.connect.mockClear(); });
    it('does not restart a server-rejected session or compete with transport reconnection', () => {
        const { result } = renderHook(() => useAiHealthSocket());
        expect(mock.connect).toHaveBeenCalledTimes(1);
        act(() => mock.handlers.get('disconnect')!('io server disconnect'));
        expect(result.current.connectionState).toBe('disconnected');
        act(() => mock.handlers.get('disconnect')!('transport close'));
        expect(mock.connect).toHaveBeenCalledTimes(1);
    });
});
