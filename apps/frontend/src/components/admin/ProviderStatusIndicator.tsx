import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { Server, CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

type ProviderHealth = {
    name: string;
    status: 'healthy' | 'degraded' | 'down' | 'unknown';
    lastHeartbeat?: Date | null;
    latencyMs?: number | null;
};

type HealthStatusResponse = {
    status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
    chatProvider: string;
    embedProvider: string;
    circuitBreaker: { open: boolean; openUntil: number | null; failureCount: number };
    providers: Record<string, { available: boolean; message: string }>;
};

export function ProviderStatusIndicator() {
    const t = useTranslations('admin.ai_health.dashboard');
    const [health, setHealth] = useState<HealthStatusResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

    const fetchHealth = async () => {
        try {
            setLoading(true);
            const data = await api.ai.getHealthStatus();
            setHealth(data);
            setLastRefresh(new Date());
        } catch {
            // silent fail — dashboard shows fallback state
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();
        const interval = setInterval(fetchHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'HEALTHY': return <CheckCircle className="h-4 w-4 text-emerald-400" />;
            case 'DEGRADED': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
            case 'DOWN': return <XCircle className="h-4 w-4 text-red-400" />;
            default: return <Server className="h-4 w-4 text-muted-foreground" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'HEALTHY': return t('status.healthy');
            case 'DEGRADED': return t('status.degraded');
            case 'DOWN': return t('status.down');
            default: return t('status.unknown');
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    };

    const primaryProvider = health?.chatProvider || 'gemini';
    const embedProvider = health?.embedProvider || 'gemini';

    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                {getStatusIcon(health?.status || 'DOWN')}
                <div className="flex flex-col">
                    <span className="text-xs font-semibold">{getStatusLabel(health?.status || 'DOWN')}</span>
                    <span className="text-[9px] text-muted-foreground font-mono">
                        {t('status.chat')}: {primaryProvider} | {t('status.embed')}: {embedProvider}
                    </span>
                </div>
            </div>

            {health?.circuitBreaker?.open && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-orange-500/10 border border-orange-500/30">
                    <AlertTriangle className="h-3 w-3 text-orange-400" />
                    <span className="text-[10px] font-semibold text-orange-400">
                        {t('status.circuit_open')} ({health.circuitBreaker.failureCount})
                    </span>
                </div>
            )}

            {lastRefresh && (
                <span className="text-[9px] text-muted-foreground/50 font-mono">
                    {t('status.last_check')}: {formatTime(lastRefresh)}
                </span>
            )}

            <button
                onClick={fetchHealth}
                disabled={loading}
                className="p-1 rounded hover:bg-muted/50 transition-colors"
                title={t('status.refresh')}
            >
                <RefreshCw className={`h-3 w-3 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
            </button>
        </div>
    );
}
