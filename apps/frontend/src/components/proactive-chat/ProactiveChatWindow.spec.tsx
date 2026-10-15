import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProactiveChatWindow } from './ProactiveChatWindow';

const mocks = vi.hoisted(() => ({
    getMessages: vi.fn(),
    sendMessage: vi.fn(),
    convertToTicket: vi.fn(),
    endSession: vi.fn(),
    getSocket: vi.fn(),
    connect: vi.fn(),
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    toastInfo: vi.fn(),
    toastSuccess: vi.fn(),
    toastError: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
    api: {
        proactiveChat: {
            getMessages: mocks.getMessages,
            sendMessage: mocks.sendMessage,
            convertToTicket: mocks.convertToTicket,
            endSession: mocks.endSession,
        },
    },
}));

vi.mock('@/lib/socket', () => ({
    getSocket: mocks.getSocket,
}));

vi.mock('sonner', () => ({
    toast: {
        info: mocks.toastInfo,
        success: mocks.toastSuccess,
        error: mocks.toastError,
    },
}));

type SocketHandler = (payload: Record<string, unknown>) => void;

const history = [
    {
        id: 'message-1',
        sessionId: 'session-1',
        senderId: 'user-1',
        content: 'Benim mesajım',
        createdAt: '2026-10-14T08:00:00.000Z',
    },
    {
        id: 'message-2',
        sessionId: 'session-1',
        senderId: 'agent-1',
        content: 'Destek yanıtı',
        createdAt: '2026-10-14T08:01:00.000Z',
    },
];

describe('ProactiveChatWindow', () => {
    let handlers: Map<string, SocketHandler>;
    let scrollIntoView: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();
        handlers = new Map();
        scrollIntoView = vi.fn();
        Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
            configurable: true,
            value: scrollIntoView,
        });
        mocks.on.mockImplementation((event: string, handler: SocketHandler) => {
            handlers.set(event, handler);
        });
        mocks.getSocket.mockReturnValue({
            connect: mocks.connect,
            emit: mocks.emit,
            on: mocks.on,
            off: mocks.off,
        });
        mocks.getMessages.mockResolvedValue(history);
        mocks.sendMessage.mockResolvedValue({
            id: 'message-3',
            sessionId: 'session-1',
            senderId: 'user-1',
            content: 'Yeni mesaj',
            createdAt: '2026-10-14T08:02:00.000Z',
        });
        mocks.convertToTicket.mockResolvedValue({ ticketNumber: 'TKT-42' });
        mocks.endSession.mockResolvedValue(undefined);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllEnvs();
    });

    it('loads history, joins the session, renders both message directions and cleans up listeners', async () => {
        const { unmount } = render(
            <ProactiveChatWindow
                sessionId="session-1"
                currentUserId="user-1"
                otherPartyName="Destek Uzmanı"
            />,
        );

        expect(await screen.findByText('Benim mesajım')).toBeInTheDocument();
        expect(screen.getByText('Destek yanıtı')).toBeInTheDocument();
        expect(screen.getByText('Destek Uzmanı')).toBeInTheDocument();
        expect(mocks.getMessages).toHaveBeenCalledWith('session-1');
        expect(mocks.connect).toHaveBeenCalledTimes(1);
        expect(mocks.emit).toHaveBeenCalledWith('proactive_chat:join', 'session-1');
        expect(mocks.on).toHaveBeenCalledTimes(3);

        unmount();

        expect(mocks.emit).toHaveBeenCalledWith('proactive_chat:leave', 'session-1');
        expect(mocks.off).toHaveBeenCalledTimes(3);
    });

    it('filters socket events by session and user, appends messages, and becomes read-only when ended', async () => {
        render(<ProactiveChatWindow sessionId="session-1" currentUserId="user-1" />);
        await screen.findByText('Benim mesajım');

        act(() => {
            handlers.get('proactive_chat:message')?.({
                id: 'ignored',
                sessionId: 'other-session',
                senderId: 'agent-1',
                content: 'Görünmemeli',
                createdAt: '2026-10-14T08:03:00.000Z',
            });
            handlers.get('proactive_chat:message')?.({
                id: 'message-with-legacy-id',
                sessionId: 'session-1',
                senderId: 'agent-1',
                content: 'Eski kimlikli mesaj',
                createdAt: '2026-10-14T08:05:00.000Z',
            });
            handlers.get('proactive_chat:typing')?.({
                sessionId: 'session-1',
                userId: 'user-1',
                isTyping: true,
            });
        });
        expect(screen.queryByText('Görünmemeli')).not.toBeInTheDocument();
        expect(screen.queryByTestId('typing-indicator')).not.toBeInTheDocument();

        act(() => {
            handlers.get('proactive_chat:message')?.({
                id: 'legacy-id',
                messageId: 'message-from-socket',
                sessionId: 'session-1',
                senderId: 'agent-1',
                content: 'Socket mesajı',
                createdAt: '2026-10-14T08:04:00.000Z',
            });
            handlers.get('proactive_chat:typing')?.({
                sessionId: 'session-1',
                userId: 'agent-1',
                isTyping: true,
            });
        });
        expect(screen.getByText('Socket mesajı')).toBeInTheDocument();
        expect(screen.getByText('Eski kimlikli mesaj')).toBeInTheDocument();
        expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();

        act(() => {
            handlers.get('proactive_chat:typing')?.({
                sessionId: 'session-1',
                userId: 'agent-1',
                isTyping: false,
            });
        });
        expect(screen.queryByTestId('typing-indicator')).not.toBeInTheDocument();

        act(() => {
            handlers.get('proactive_chat:ended')?.({ sessionId: 'other-session' });
        });
        expect(screen.getByTestId('chat-message-input')).toBeInTheDocument();

        act(() => {
            handlers.get('proactive_chat:ended')?.({ sessionId: 'session-1' });
        });
        expect(screen.queryByTestId('chat-message-input')).not.toBeInTheDocument();
        expect(screen.getByText('Bu oturum sona erdi. Mesaj gönderemezsiniz.')).toBeInTheDocument();
        expect(mocks.toastInfo).toHaveBeenCalledWith('Chat oturumu sona erdi');
    });

    it('emits typing state, sends trimmed messages with Enter, and closes when requested', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const onClose = vi.fn();
        render(
            <ProactiveChatWindow
                sessionId="session-1"
                currentUserId="user-1"
                onClose={onClose}
            />,
        );

        await screen.findByText('Benim mesajım');
        const input = screen.getByTestId('chat-message-input');
        fireEvent.change(input, { target: { value: '  Yeni mesaj  ' } });
        expect(mocks.emit).toHaveBeenCalledWith('proactive_chat:typing', {
            sessionId: 'session-1',
            isTyping: true,
        });

        fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });
        await waitFor(() => expect(mocks.sendMessage).toHaveBeenCalledWith('session-1', 'Yeni mesaj'));
        expect(await screen.findByText('Yeni mesaj')).toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(2000);
        });
        expect(mocks.emit).toHaveBeenCalledWith('proactive_chat:typing', {
            sessionId: 'session-1',
            isTyping: false,
        });

        const closeButton = document.querySelector('.lucide-x')?.closest('button');
        expect(closeButton).not.toBeNull();
        fireEvent.click(closeButton!);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('restores the draft and reports the server error when sending fails', async () => {
        mocks.sendMessage.mockRejectedValueOnce(new Error('Gönderim reddedildi'));
        render(<ProactiveChatWindow sessionId="session-1" currentUserId="user-1" />);
        await screen.findByText('Benim mesajım');

        const input = screen.getByTestId('chat-message-input');
        fireEvent.change(input, { target: { value: '  Korunan taslak  ' } });
        fireEvent.click(screen.getByTestId('chat-send-button'));

        await waitFor(() => expect(mocks.toastError).toHaveBeenCalledWith('Gönderim reddedildi'));
        expect(input).toHaveValue('Korunan taslak');
    });

    it('converts an agent session to a ticket and ends it successfully', async () => {
        const onClose = vi.fn();
        render(
            <ProactiveChatWindow
                sessionId="session-1"
                currentUserId="agent-1"
                isAgent
                onClose={onClose}
            />,
        );
        await screen.findByText('Destek yanıtı');

        fireEvent.click(screen.getByTestId('convert-to-ticket-button'));
        await waitFor(() => expect(mocks.convertToTicket).toHaveBeenCalledWith('session-1'));
        expect(mocks.toastSuccess).toHaveBeenCalledWith('Ticket oluşturuldu: TKT-42');

        fireEvent.click(screen.getByTestId('end-chat-button'));
        await waitFor(() => expect(mocks.endSession).toHaveBeenCalledWith('session-1'));
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(screen.getByText('Bu oturum sona erdi. Mesaj gönderemezsiniz.')).toBeInTheDocument();
    });

    it('reports non-Error action failures with safe fallback messages', async () => {
        mocks.convertToTicket.mockRejectedValueOnce('convert failed');
        mocks.endSession.mockRejectedValueOnce('end failed');
        render(
            <ProactiveChatWindow sessionId="session-1" currentUserId="agent-1" isAgent />,
        );
        await screen.findByText('Destek yanıtı');

        fireEvent.click(screen.getByTestId('convert-to-ticket-button'));
        await waitFor(() => expect(mocks.toastError).toHaveBeenCalledWith('Ticket oluşturulamadı'));

        fireEvent.click(screen.getByTestId('end-chat-button'));
        await waitFor(() => expect(mocks.toastError).toHaveBeenCalledWith('Oturum sonlandırılamadı'));
        expect(screen.getByTestId('chat-message-input')).toBeInTheDocument();
    });

    it('reports Error instances from agent actions without losing the active session', async () => {
        mocks.convertToTicket.mockRejectedValueOnce(new Error('Dönüşüm reddedildi'));
        mocks.endSession.mockRejectedValueOnce(new Error('Kapatma reddedildi'));
        render(
            <ProactiveChatWindow
                sessionId="session-1"
                currentUserId="agent-1"
                isAgent
                otherPartyName=""
            />,
        );
        await screen.findByText('Destek yanıtı');
        expect(screen.getByText('U')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('convert-to-ticket-button'));
        await waitFor(() => expect(mocks.toastError).toHaveBeenCalledWith('Dönüşüm reddedildi'));

        fireEvent.click(screen.getByTestId('end-chat-button'));
        await waitFor(() => expect(mocks.toastError).toHaveBeenCalledWith('Kapatma reddedildi'));
        expect(screen.getByTestId('chat-message-input')).toBeInTheDocument();
    });

    it('degrades gracefully when history or socket setup is unavailable', async () => {
        vi.stubEnv('NODE_ENV', 'development');
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        mocks.getMessages.mockRejectedValueOnce(new Error('history unavailable'));
        mocks.getSocket.mockImplementation(() => {
            throw new Error('socket unavailable');
        });

        render(<ProactiveChatWindow sessionId="session-1" currentUserId="user-1" />);

        expect(await screen.findByText('Henüz mesaj yok')).toBeInTheDocument();
        const input = screen.getByTestId('chat-message-input');
        fireEvent.change(input, { target: { value: 'Socket olmadan yaz' } });
        expect(input).toHaveValue('Socket olmadan yaz');
        expect(consoleError).toHaveBeenCalledWith(
            '[ProactiveChatWindow] Failed to load messages:',
            expect.any(Error),
        );
        expect(consoleWarn).toHaveBeenCalledWith(
            '[ProactiveChatWindow] Socket init failed:',
            expect.any(Error),
        );
        consoleError.mockRestore();
        consoleWarn.mockRestore();
    });
});
