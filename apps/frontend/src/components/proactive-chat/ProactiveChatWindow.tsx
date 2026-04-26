'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { getSocket } from '@/lib/socket';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, X, Ticket, PhoneOff } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
    id: string;
    sessionId: string;
    senderId: string;
    content: string;
    createdAt: string;
}

interface ProactiveChatWindowProps {
    sessionId: string;
    currentUserId: string;
    isAgent?: boolean;
    otherPartyName?: string;
    otherPartyAvatar?: string;
    onClose?: () => void;
}

export function ProactiveChatWindow({
    sessionId,
    currentUserId,
    isAgent = false,
    otherPartyName = 'Kullanıcı',
    otherPartyAvatar,
    onClose,
}: ProactiveChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [loading, setLoading] = useState(false);
    const [converting, setConverting] = useState(false);
    const [ending, setEnding] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // 11.2 Load message history
    useEffect(() => {
        api.proactiveChat.getMessages(sessionId)
            .then((msgs) => {
                setMessages(msgs);
                setTimeout(scrollToBottom, 100);
            })
            .catch((err: any) => {
                if (process.env.NODE_ENV === 'development') {
                    console.error('[ProactiveChatWindow] Failed to load messages:', err);
                }
            });
    }, [sessionId, scrollToBottom]);

    // 11.3 Join session room and listen for WS events
    // 11.5 proactive_chat:typing listener
    // 11.6 proactive_chat:ended listener
    useEffect(() => {
        try {
            const socket = getSocket();
            socket.connect();
            socket.emit('proactive_chat:join', sessionId);

            // 11.3 Append new messages to list
            const handleMessage = (data: any) => {
                if (data.sessionId !== sessionId) return;
                const newMsg: Message = {
                    id: data.messageId,
                    sessionId: data.sessionId,
                    senderId: data.senderId,
                    content: data.content,
                    createdAt: data.createdAt,
                };
                setMessages((prev) => [...prev, newMsg]);
                setTimeout(scrollToBottom, 50);
            };

            // 11.5 Typing indicator listener
            const handleTyping = (data: any) => {
                if (data.sessionId !== sessionId) return;
                if (data.userId === currentUserId) return;
                setIsTyping(data.isTyping);
            };

            // 11.6 Session ended: switch to read-only, show notification
            const handleEnded = (data: any) => {
                if (data.sessionId !== sessionId) return;
                setIsReadOnly(true);
                toast.info('Chat oturumu sona erdi');
            };

            socket.on('proactive_chat:message', handleMessage);
            socket.on('proactive_chat:typing', handleTyping);
            socket.on('proactive_chat:ended', handleEnded);

            return () => {
                socket.emit('proactive_chat:leave', sessionId);
                socket.off('proactive_chat:message', handleMessage);
                socket.off('proactive_chat:typing', handleTyping);
                socket.off('proactive_chat:ended', handleEnded);
            };
        } catch (err) {
            if (process.env.NODE_ENV === 'development') {
                console.warn('[ProactiveChatWindow] Socket init failed:', err);
            }
        }
    }, [sessionId, currentUserId, scrollToBottom]);

    // 11.4 Send message
    const handleSend = async () => {
        const content = input.trim();
        if (!content || isReadOnly || loading) return;

        setLoading(true);
        setInput('');
        try {
            const msg = await api.proactiveChat.sendMessage(sessionId, content);
            setMessages((prev) => [...prev, msg]);
            setTimeout(scrollToBottom, 50);
        } catch (err: any) {
            toast.error(err.message || 'Mesaj gönderilemedi');
            setInput(content); // restore on error
        } finally {
            setLoading(false);
        }
    };

    // 11.5 Send typing event on input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);

        try {
            const socket = getSocket();
            socket.emit('proactive_chat:typing', { sessionId, isTyping: true });

            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('proactive_chat:typing', { sessionId, isTyping: false });
            }, 2000);
        } catch {
            // Socket not available — graceful degradation
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // 11.7 Convert to ticket (agent only)
    const handleConvert = async () => {
        setConverting(true);
        try {
            const ticket = await api.proactiveChat.convertToTicket(sessionId);
            toast.success(`Ticket oluşturuldu: ${ticket.ticketNumber}`);
        } catch (err: any) {
            toast.error(err.message || 'Ticket oluşturulamadı');
        } finally {
            setConverting(false);
        }
    };

    // 11.8 End session (agent only)
    const handleEnd = async () => {
        setEnding(true);
        try {
            await api.proactiveChat.endSession(sessionId);
            setIsReadOnly(true);
            onClose?.();
        } catch (err: any) {
            toast.error(err.message || 'Oturum sonlandırılamadı');
        } finally {
            setEnding(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[520px] rounded-2xl border border-white/10 bg-background/95 backdrop-blur-sm shadow-2xl shadow-black/20 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <Avatar className="h-8 w-8 border border-white/10">
                    <AvatarImage src={otherPartyAvatar} alt={otherPartyName} />
                    <AvatarFallback className="bg-blue-500/20 text-blue-400 text-xs font-bold">
                        {otherPartyName?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{otherPartyName}</p>
                    {isReadOnly && (
                        <p className="text-xs text-muted-foreground">Oturum sona erdi</p>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    {/* 11.7 Ticket'a Dönüştür — agent only */}
                    {isAgent && !isReadOnly && (
                        <>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleConvert}
                                disabled={converting}
                                className="h-7 px-2 text-xs text-muted-foreground hover:text-white"
                                title="Ticket'a Dönüştür"
                            >
                                <Ticket className="h-3.5 w-3.5" />
                            </Button>
                            {/* 11.8 Sonlandır — agent only */}
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleEnd}
                                disabled={ending}
                                className="h-7 px-2 text-xs text-red-400 hover:text-red-300"
                                title="Sonlandır"
                            >
                                <PhoneOff className="h-3.5 w-3.5" />
                            </Button>
                        </>
                    )}
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={onClose}
                        className="h-7 px-2 text-muted-foreground hover:text-white"
                    >
                        <X className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-xs text-muted-foreground">Henüz mesaj yok</p>
                    </div>
                )}
                {messages.map((msg) => {
                    const isMine = msg.senderId === currentUserId;
                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                                    isMine
                                        ? 'bg-blue-500 text-white rounded-br-sm'
                                        : 'bg-white/5 text-white rounded-bl-sm'
                                }`}
                            >
                                <p className="break-words">{msg.content}</p>
                                <p className={`text-[10px] mt-1 ${isMine ? 'text-blue-200' : 'text-muted-foreground'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                {/* 11.5 Typing indicator */}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 rounded-2xl rounded-bl-sm px-3 py-2">
                            <div className="flex gap-1 items-center h-4">
                                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* 11.4 Input — hidden in read-only mode (11.6) */}
            {!isReadOnly ? (
                <div className="flex items-center gap-2 px-3 py-3 border-t border-white/5">
                    <input
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Mesaj yaz..."
                        disabled={loading}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                    />
                    <Button
                        size="sm"
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className="h-9 w-9 p-0 bg-blue-500 hover:bg-blue-600 rounded-xl"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div className="px-4 py-3 border-t border-white/5 text-center">
                    <p className="text-xs text-muted-foreground">Bu oturum sona erdi. Mesaj gönderemezsiniz.</p>
                </div>
            )}
        </div>
    );
}
