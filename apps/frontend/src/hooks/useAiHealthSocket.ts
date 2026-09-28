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
        const socket = getSocket();

        const connect = () => {
            if (!mountedRef.current) return;
            socket.connect();
        };

        const handleConnect = () => {
            if (!mountedRef.current) return;
            setConnectionState('connected');
        };

        const handleDisconnect = () => {
            if (!mountedRef.current) return;
            setConnectionState('disconnected');
        };

        const handleConnectError = () => {
            if (!mountedRef.current) return;
            setConnectionState('error');
        };

        const handleFallback = (payload: AiHealthEvent) => {
            if (!mountedRef.current) return;
            addEvent({ ...payload, eventType: 'FALLBACK' });
        };

        const handleError = (payload: AiHealthEvent) => {
            if (!mountedRef.current) return;
            addEvent({ ...payload, eventType: 'ERROR' });
        };

        const handleTimeout = (payload: AiHealthEvent) => {
            if (!mountedRef.current) return;
            addEvent({ ...payload, eventType: 'TIMEOUT' });
        };

        const handleInfo = (payload: AiHealthEvent) => {
            if (!mountedRef.current) return;
            addEvent({ ...payload, eventType: 'INFO' });
        };

        socket.off('connect', handleConnect).on('connect', handleConnect);
        socket.off('disconnect', handleDisconnect).on('disconnect', handleDisconnect);
        socket.off('connect_error', handleConnectError).on('connect_error', handleConnectError);
        socket.off('system:ai_fallback', handleFallback).on('system:ai_fallback', handleFallback);
        socket.off('ai_health:error', handleError).on('ai_health:error', handleError);
        socket.off('ai_health:timeout', handleTimeout).on('ai_health:timeout', handleTimeout);
        socket.off('ai_health:info', handleInfo).on('ai_health:info', handleInfo);

        connect();

        return () => {
            mountedRef.current = false;
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('connect_error', handleConnectError);
            socket.off('system:ai_fallback', handleFallback);
            socket.off('ai_health:error', handleError);
            socket.off('ai_health:timeout', handleTimeout);
            socket.off('ai_health:info', handleInfo);
        };
    }, [addEvent]);

    return { events, connectionState, stats, addEvent };
}
