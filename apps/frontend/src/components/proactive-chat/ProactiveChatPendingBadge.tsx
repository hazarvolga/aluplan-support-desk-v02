'use client';

import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';
import { Button } from '@/components/ui/button';
import { Clock, X } from 'lucide-react';
import { toast } from 'sonner';

interface ProactiveChatPendingBadgeProps {
    sessionId: string;
    customerName: string;
    onAccepted?: (sessionId: string) => void;
    onClose?: () => void;
}

export function ProactiveChatPendingBadge({
    sessionId,
    customerName,
    onAccepted,
    onClose,
}: ProactiveChatPendingBadgeProps) {
    const [elapsed, setElapsed] = useState(0);
    const [visible, setVisible] = useState(true);

    // Elapsed time counter
    useEffect(() => {
        const interval = setInterval(() => {
            setElapsed((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // WS event listeners
    useEffect(() => {
        try {
            const socket = getSocket();
            socket.connect();

            const handleAccepted = (data: { sessionId: string; acceptedAt: string }) => {
                if (data.sessionId !== sessionId) return;
                setVisible(false);
                onAccepted?.(sessionId);
            };

            const handleDeclined = (data: { sessionId: string }) => {
                if (data.sessionId !== sessionId) return;
                toast.info(`${customerName} chat davetini reddetti`);
                setVisible(false);
                onClose?.();
            };

            const handleMissed = (data: { sessionId: string }) => {
                if (data.sessionId !== sessionId) return;
                toast.warning(`${customerName} chat davetini yanıtlamadı (zaman aşımı)`);
                setVisible(false);
                onClose?.();
            };

            socket.on('proactive_chat:accepted', handleAccepted);
            socket.on('proactive_chat:declined', handleDeclined);
            socket.on('proactive_chat:missed', handleMissed);

            return () => {
                socket.off('proactive_chat:accepted', handleAccepted);
                socket.off('proactive_chat:declined', handleDeclined);
                socket.off('proactive_chat:missed', handleMissed);
            };
        } catch (err) {
            if (process.env.NODE_ENV === 'development') {
                console.warn('[ProactiveChatPendingBadge] Socket init failed:', err);
            }
        }
    }, [sessionId, customerName, onAccepted, onClose]);

    if (!visible) return null;

    const formatElapsed = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return m > 0 ? `${m}d ${s}s` : `${s}s`;
    };

    return (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 backdrop-blur-sm">
            <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse flex-shrink-0" />
                <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{customerName}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatElapsed(elapsed)} bekleniyor</span>
                    </div>
                </div>
            </div>
            <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                    setVisible(false);
                    onClose?.();
                }}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-white flex-shrink-0"
            >
                <X className="h-3.5 w-3.5" />
            </Button>
        </div>
    );
}
