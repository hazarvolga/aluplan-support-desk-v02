import { useEffect, useRef, useState, useCallback } from 'react';
import { getSocket } from '@/lib/socket';

export type AiHealthEvent = {
    eventType: 'FALLBACK' | 'TIMEOUT' | 'ERROR' | 'INFO';
    provider: string;
    model?: string;
    task?: string;
    errorMessage?: string;
    latencyMs?: number;
    metadata?: Record<string, any>;
    timestamp?: number;
    createdAt?: string;
    id?: string;
};

type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

export function useAiHealthSocket() {
    const [events, setEvents] = useState<AiHealthEvent[]>([]);
    const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
    const [stats, setStats] = useState<{ total: number; fallbackCount: number; errorCount: number; lastEventAt: Date | null }>({
        total: 0,
        fallbackCount: 0,
        errorCount: 0,
        lastEventAt: null,
    });
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const mountedRef = useRef(true);

    const addEvent = useCallback((event: AiHealthEvent) => {
        setEvents(prev => {
            const withTimestamp = { ...event, timestamp: event.timestamp || Date.now() };
            return [withTimestamp, ...prev].slice(0, 100);
        });
        setStats(prev => ({
            total: prev.total + 1,
            fallbackCount: prev.fallbackCount + (event.eventType === 'FALLBACK' ? 1 : 0),
            errorCount: prev.errorCount + (event.eventType === 'ERROR' ? 1 : 0),
            lastEventAt: new Date(),
        }));
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 5;

        const connect = () => {
            if (!mountedRef.current) return;

            const socket = getSocket();

            socket.connect();

            socket.on('connect', () => {
                if (!mountedRef.current) return;
                setConnectionState('connected');
                reconnectAttempts = 0;
            });

            socket.on('disconnect', (reason) => {
                if (!mountedRef.current) return;
                setConnectionState('disconnected');
                if (reason === 'io server disconnect') {
                    socket.connect();
                } else {
                    reconnectAttempts++;
                    if (reconnectAttempts <= maxReconnectAttempts) {
                        reconnectTimeoutRef.current = setTimeout(connect, Math.min(1000 * reconnectAttempts, 10000));
                    }
                }
            });

            socket.on('connect_error', () => {
                if (!mountedRef.current) return;
                setConnectionState('error');
            });

            socket.on('system:ai_fallback', (payload: AiHealthEvent) => {
                if (!mountedRef.current) return;
                addEvent({ ...payload, eventType: 'FALLBACK' });
            });

            socket.on('ai_health:error', (payload: AiHealthEvent) => {
                if (!mountedRef.current) return;
                addEvent({ ...payload, eventType: 'ERROR' });
            });

            socket.on('ai_health:timeout', (payload: AiHealthEvent) => {
                if (!mountedRef.current) return;
                addEvent({ ...payload, eventType: 'TIMEOUT' });
            });

            socket.on('ai_health:info', (payload: AiHealthEvent) => {
                if (!mountedRef.current) return;
                addEvent({ ...payload, eventType: 'INFO' });
            });
        };

        connect();

        return () => {
            mountedRef.current = false;
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            const socket = getSocket();
            socket.off('connect');
            socket.off('disconnect');
            socket.off('connect_error');
            socket.off('system:ai_fallback');
            socket.off('ai_health:error');
            socket.off('ai_health:timeout');
            socket.off('ai_health:info');
            if (!socket.connected) {
                socket.disconnect();
            }
        };
    }, [addEvent]);

    return { events, connectionState, stats, addEvent };
}