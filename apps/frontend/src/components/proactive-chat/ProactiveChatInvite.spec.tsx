import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProactiveChatInvite } from './ProactiveChatInvite';

const mocks = vi.hoisted(() => ({
    listSessions: vi.fn(),
    acceptSession: vi.fn(),
    declineSession: vi.fn(),
    connect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
    api: {
        proactiveChat: {
            listSessions: mocks.listSessions,
            acceptSession: mocks.acceptSession,
            declineSession: mocks.declineSession,
        },
    },
}));

vi.mock('@/lib/socket', () => ({
    getSocket: () => ({
        connected: false,
        connect: mocks.connect,
        on: mocks.on,
        off: mocks.off,
    }),
}));

class BroadcastChannelStub {
    addEventListener = vi.fn();
    removeEventListener = vi.fn();
    postMessage = vi.fn();
    close = vi.fn();
}

describe('ProactiveChatInvite', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('BroadcastChannel', BroadcastChannelStub);
        mocks.listSessions.mockResolvedValue([{
            id: 'session-1',
            status: 'PENDING',
            agentId: 'agent-1',
            agent: { fullName: 'Destek Uzmanı', avatarUrl: null },
            createdAt: '2026-10-13T12:00:00.000Z',
        }]);
    });

    it('recovers a pending invite once from the authenticated API without browser persistence', async () => {
        const storageWrite = vi.spyOn(Storage.prototype, 'setItem');

        render(<ProactiveChatInvite />);

        expect(await screen.findByTestId('proactive-chat-invite')).toBeInTheDocument();
        await waitFor(() => expect(mocks.listSessions).toHaveBeenCalledTimes(1));
        expect(storageWrite).not.toHaveBeenCalled();

        storageWrite.mockRestore();
    });
});
