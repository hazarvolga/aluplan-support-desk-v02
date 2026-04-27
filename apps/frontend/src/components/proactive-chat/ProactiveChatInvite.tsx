'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { getSocket } from '@/lib/socket';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface IncomingPayload {
    sessionId: string;
    agentId: string;
    agentName: string;
    agentAvatar?: string;
    createdAt: string;
}

interface ProactiveChatInviteProps {
    onAccepted?: (sessionId: string) => void;
}

const BROADCAST_CHANNEL = 'proactive_chat_invite';
const STORAGE_KEY = 'proactive_chat_active_invite';
const TIMEOUT_SECONDS = 120;

export function ProactiveChatInvite({ onAccepted }: ProactiveChatInviteProps) {
    const [invite, setInvite] = useState<IncomingPayload | null>(null);
    const [countdown, setCountdown] = useState(TIMEOUT_SECONDS);
    const [loading, setLoading] = useState<'accept' | 'decline' | null>(null);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);
    const channelRef = useRef<BroadcastChannel | null>(null);

    const clearInvite = useCallback(() => {
        setInvite(null);
        setCountdown(TIMEOUT_SECONDS);
        if (countdownRef.current) clearInterval(countdownRef.current);
        localStorage.removeItem(STORAGE_KEY);
        channelRef.current?.postMessage({ type: 'INVITE_CLEARED' });
    }, []);

    const startCountdown = useCallback(() => {
        if (countdownRef.current) clearInterval(countdownRef.current);
        setCountdown(TIMEOUT_SECONDS);
        countdownRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInvite();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [clearInvite]);

    useEffect(() => {
        try {
            channelRef.current = new BroadcastChannel(BROADCAST_CHANNEL);
        } catch {
            // BroadcastChannel not supported
        }
        return () => {
            channelRef.current?.close();
        };
    }, []);

    // Multi-tab sync & initial cleanup
    useEffect(() => {
        // Clear any old session locks on mount to prevent deadlocks
        localStorage.removeItem(STORAGE_KEY);

        // Listen for channel messages
        const channel = channelRef.current;
        if (!channel) return;

        const handleChannelMessage = (event: MessageEvent) => {
            if (event.data.type === 'INVITE_CLAIMED') {
                setInvite(null);
                if (countdownRef.current) clearInterval(countdownRef.current);
            } else if (event.data.type === 'INVITE_CLEARED') {
                setInvite(null);
                if (countdownRef.current) clearInterval(countdownRef.current);
            }
        };

        channel.addEventListener('message', handleChannelMessage);
        return () => {
            channel.removeEventListener('message', handleChannelMessage);
            localStorage.removeItem(STORAGE_KEY); // Cleanup on full unmount
        };
    }, []);

    useEffect(() => {
        let isSubscribed = true;

        try {
            const socket = getSocket();
            if (!socket.connected) socket.connect();

            const handleIncoming = (payload: IncomingPayload) => {
                if (!isSubscribed) return;

                // Multi-tab: check if another tab is already handling a session
                const existing = localStorage.getItem(STORAGE_KEY);
                if (existing) return;

                setInvite(payload);
                startCountdown();

                // Block other tabs from showing this invite
                localStorage.setItem(STORAGE_KEY, payload.sessionId);
                channelRef.current?.postMessage({ type: 'INVITE_CLAIMED', sessionId: payload.sessionId });
            };

            const handleMissed = (payload: { sessionId: string }) => {
                if (!isSubscribed) return;
                if (invite?.sessionId === payload.sessionId) {
                    clearInvite();
                }
            };

            socket.on('proactive_chat:incoming', handleIncoming);
            socket.on('proactive_chat:missed', handleMissed);

            // Persistent Recovery: Check for active sessions on mount
            const recoverSession = async () => {
                try {
                    const sessions = await api.proactiveChat.listSessions();
                    const pending = sessions.find(s => s.status === 'PENDING');
                    if (pending && isSubscribed) {
                        handleIncoming({
                            sessionId: pending.id,
                            agentId: pending.agentId,
                            agentName: pending.agent?.fullName || 'Agent',
                            agentAvatar: pending.agent?.avatarUrl,
                            createdAt: pending.createdAt,
                        });
                    }
                } catch (err) {
                    console.error('[ProactiveChatInvite] Recovery error:', err);
                }
            };

            recoverSession();

            return () => {
                isSubscribed = false;
                socket.off('proactive_chat:incoming', handleIncoming);
                socket.off('proactive_chat:missed', handleMissed);
            };
        } catch (err) {
            console.error('[ProactiveChatInvite] Socket error:', err);
        }
    }, [invite?.sessionId, startCountdown, clearInvite]);

    const handleAccept = async () => {
        if (!invite) return;
        setLoading('accept');
        try {
            await api.proactiveChat.acceptSession(invite.sessionId);
            clearInvite();
            onAccepted?.(invite.sessionId);
        } catch (err: any) {
            toast.error(err.message || 'Chat kabul edilemedi');
        } finally {
            setLoading(null);
        }
    };

    const handleDecline = async () => {
        if (!invite) return;
        setLoading('decline');
        try {
            await api.proactiveChat.declineSession(invite.sessionId);
            clearInvite();
        } catch (err: any) {
            toast.error(err.message || 'Chat reddedilemedi');
        } finally {
            setLoading(null);
        }
    };

    if (!invite) return null;

    const progress = (countdown / TIMEOUT_SECONDS) * 100;

    return (
        <div
            data-testid="proactive-chat-invite"
            className="fixed bottom-6 right-6 z-50 w-80 rounded-2xl border border-white/10 bg-background/95 backdrop-blur-sm shadow-2xl shadow-black/20 overflow-hidden"
        >
            {/* Countdown progress bar */}
            <div className="h-1 bg-white/5">
                <div
                    className="h-full bg-blue-500 transition-all duration-1000 ease-linear"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="p-4">
                <div className="flex items-start gap-3 mb-4">
                    <div className="relative">
                        <Avatar className="h-10 w-10 border border-white/10">
                            <AvatarImage src={invite.agentAvatar} alt={invite.agentName} />
                            <AvatarFallback className="bg-blue-500/20 text-blue-400 text-sm font-bold">
                                {invite.agentName?.charAt(0)?.toUpperCase() || 'A'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                            Destek Talebi
                        </p>
                        <p className="text-sm font-semibold text-white truncate">
                            {invite.agentName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Sizinle chat başlatmak istiyor
                        </p>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                        <span className={countdown <= 30 ? 'text-red-400' : 'text-muted-foreground'}>
                            {countdown}s
                        </span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        data-testid="accept-chat-button"
                        onClick={handleAccept}
                        disabled={loading !== null}
                        className="flex-1 h-9 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold uppercase tracking-widest"
                    >
                        {loading === 'accept' ? (
                            <span className="animate-pulse">...</span>
                        ) : (
                            <>
                                <Phone className="mr-1.5 h-3.5 w-3.5" />
                                Kabul Et
                            </>
                        )}
                    </Button>
                    <Button
                        data-testid="decline-chat-button"
                        onClick={handleDecline}
                        disabled={loading !== null}
                        variant="outline"
                        className="flex-1 h-9 border-white/10 text-muted-foreground hover:text-white text-xs font-bold uppercase tracking-widest"
                    >
                        {loading === 'decline' ? (
                            <span className="animate-pulse">...</span>
                        ) : (
                            <>
                                <X className="mr-1.5 h-3.5 w-3.5" />
                                Reddet
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
